"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type NavItem = { href: string; label: string; roles: string[] | null };

const MAX_STRETCH = 52;
const RESISTANCE = 0.42;
const RELEASE_MS = 340;
const WHEEL_IDLE_MS = 100;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Map unbounded pull (px) → capped stretch with diminishing returns. */
function stretchFromPull(pull: number): number {
  if (pull === 0) return 0;
  const sign = pull < 0 ? -1 : 1;
  const abs = Math.abs(pull) * RESISTANCE;
  return sign * Math.min(MAX_STRETCH, MAX_STRETCH * (1 - Math.exp(-abs / MAX_STRETCH)));
}

function atTop(el: HTMLElement): boolean {
  return el.scrollTop <= 0;
}

function atBottom(el: HTMLElement): boolean {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
}

export function StickyNav({
  items,
  ariaLabel,
  onNavigate,
}: {
  items: NavItem[];
  ariaLabel?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const stretchRef = useRef<HTMLDivElement>(null);
  const pullRef = useRef(0);
  const releasingRef = useRef(false);
  const wheelIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchBasePull = useRef(0);
  const touchEdge = useRef<"top" | "bottom" | null>(null);

  const paint = useCallback((pull: number, animate: boolean) => {
    const node = stretchRef.current;
    if (!node) return;

    pullRef.current = pull;
    const y = stretchFromPull(pull);

    node.style.transition = animate
      ? `transform ${RELEASE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : "none";
    node.style.transformOrigin = y <= 0 ? "center bottom" : "center top";

    if (y === 0) {
      node.style.transform = "none";
      return;
    }

    const scale = 1 + Math.min(0.014, (Math.abs(y) / MAX_STRETCH) * 0.014);
    node.style.transform = `translateY(${y.toFixed(2)}px) scaleY(${scale.toFixed(4)})`;
  }, []);

  const release = useCallback(() => {
    if (prefersReducedMotion() || pullRef.current === 0) {
      paint(0, false);
      releasingRef.current = false;
      return;
    }
    releasingRef.current = true;
    paint(0, true);
    window.setTimeout(() => {
      releasingRef.current = false;
    }, RELEASE_MS + 30);
  }, [paint]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const scheduleRelease = () => {
      if (wheelIdleTimer.current) clearTimeout(wheelIdleTimer.current);
      wheelIdleTimer.current = setTimeout(() => release(), WHEEL_IDLE_MS);
    };

    const onWheel = (e: WheelEvent) => {
      if (prefersReducedMotion() || releasingRef.current) return;

      const pullingTop = atTop(scrollEl) && e.deltaY < 0;
      const pullingBottom = atBottom(scrollEl) && e.deltaY > 0;
      const stretched = pullRef.current !== 0;

      if (!pullingTop && !pullingBottom) {
        if (!stretched) return;
        // Unwind stretch when wheel turns back toward content
        e.preventDefault();
        const next = pullRef.current - e.deltaY;
        if ((pullRef.current > 0 && next <= 0) || (pullRef.current < 0 && next >= 0)) {
          release();
          return;
        }
        paint(next, false);
        scheduleRelease();
        return;
      }

      e.preventDefault();
      // Top overscroll → positive Y; bottom → negative Y
      const next = pullRef.current - e.deltaY;
      paint(pullingTop ? Math.max(0, next) : Math.min(0, next), false);
      scheduleRelease();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (prefersReducedMotion() || e.touches.length !== 1) return;
      touchStartY.current = e.touches[0].clientY;
      touchBasePull.current = pullRef.current;
      touchEdge.current = null;
      if (wheelIdleTimer.current) clearTimeout(wheelIdleTimer.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (prefersReducedMotion() || touchStartY.current == null || e.touches.length !== 1) {
        return;
      }

      const delta = e.touches[0].clientY - touchStartY.current;

      if (!touchEdge.current) {
        if (atTop(scrollEl) && delta > 0) touchEdge.current = "top";
        else if (atBottom(scrollEl) && delta < 0) touchEdge.current = "bottom";
        else return;
      }

      e.preventDefault();
      const next = touchBasePull.current + delta;
      if (touchEdge.current === "top") {
        if (next <= 0) paint(0, false);
        else paint(next, false);
      } else {
        if (next >= 0) paint(0, false);
        else paint(next, false);
      }
    };

    const onTouchEnd = () => {
      touchStartY.current = null;
      touchEdge.current = null;
      if (pullRef.current !== 0) release();
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
    scrollEl.addEventListener("touchend", onTouchEnd);
    scrollEl.addEventListener("touchcancel", onTouchEnd);

    return () => {
      scrollEl.removeEventListener("wheel", onWheel);
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchmove", onTouchMove);
      scrollEl.removeEventListener("touchend", onTouchEnd);
      scrollEl.removeEventListener("touchcancel", onTouchEnd);
      if (wheelIdleTimer.current) clearTimeout(wheelIdleTimer.current);
    };
  }, [paint, release]);

  return (
    <nav ref={scrollRef} className="ox-nav" aria-label={ariaLabel ?? "Navigation"}>
      <div ref={stretchRef} className="ox-nav-stretch">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ox-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (onNavigate) onNavigate();
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
