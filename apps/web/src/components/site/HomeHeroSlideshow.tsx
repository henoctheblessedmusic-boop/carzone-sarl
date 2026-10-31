"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "./Container";
import { CtaLink } from "./CtaLink";
import type { SiteCopy } from "@/lib/i18n/site/types";
import { QuoteActions } from "./QuoteActions";
import type { SiteLocale } from "@/lib/site-prefs";

export interface SlideshowVehicle {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  status: string;
  priceXof: number;
  mainPhotoUrl: string;
}

interface HomeHeroSlideshowCopy {
  eyebrow: string;
  ariaLabel: string;
  prevLabel: string;
  nextLabel: string;
  goToSlideLabel: string;
  viewVehicleCta: string;
  viewShowroomCta: string;
  priceOnRequest: string;
  emptyTitle: string;
  emptySubtitle: string;
  emptyCta: string;
}

interface HomeHeroSlideshowProps {
  vehicles: SlideshowVehicle[];
  locale: SiteLocale;
  statusLabels: Record<string, string>;
  energyLabels: Record<string, string>;
  copy: HomeHeroSlideshowCopy;
  quoteCopy: SiteCopy["quote"];
}

const AUTOPLAY_DELAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

function useReducedMotionPreference(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function vehicleTitle(vehicle: SlideshowVehicle): string {
  return [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
}

export function HomeHeroSlideshow({ vehicles, statusLabels, energyLabels, copy, quoteCopy }: HomeHeroSlideshowProps) {
  const total = vehicles.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || total <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTOPLAY_DELAY_MS);
    return () => window.clearInterval(intervalId);
  }, [isPaused, prefersReducedMotion, total]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPaused(document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;
    const deltaX = event.changedTouches[0].clientX - startX;
    if (deltaX > SWIPE_THRESHOLD_PX) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD_PX) goNext();
  }

  if (total === 0) {
    return (
      <section className="site-hero">
        <Container>
          <p className="site-eyebrow">{copy.eyebrow}</p>
          <h1 className="site-hero-title">{copy.emptyTitle}</h1>
          <p className="site-hero-subtitle">{copy.emptySubtitle}</p>
          <div className="site-hero-ctas">
            <CtaLink href="/vehicules" variant="primary">
              {copy.emptyCta}
            </CtaLink>
          </div>
        </Container>
      </section>
    );
  }

  const activeVehicle = vehicles[activeIndex];
  const title = vehicleTitle(activeVehicle);
  const energyLabel = energyLabels[activeVehicle.energy] ?? activeVehicle.energy;
  const liveText = copy.goToSlideLabel
    .replace("{current}", String(activeIndex + 1))
    .replace("{total}", String(total));

  return (
    <section
      className="site-hero-slideshow"
      aria-roledescription="carousel"
      aria-label={copy.ariaLabel}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="site-hero-slideshow-track">
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className={index === activeIndex ? "site-hero-slide is-active" : "site-hero-slide"}
            role="group"
            aria-roledescription="slide"
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={vehicle.mainPhotoUrl}
              alt={vehicleTitle(vehicle)}
              fill
              priority={index === 0}
              sizes="100vw"
              className="site-hero-slide-img"
            />
          </div>
        ))}
        <div className="site-hero-slide-overlay" aria-hidden="true" />
      </div>

      <div className="site-hero-slide-content">
        <Container>
          <p className="site-eyebrow">{copy.eyebrow}</p>
          <h1 className="site-hero-slide-title">{title}</h1>
          <div className="site-hero-slide-meta">
            <span>{[activeVehicle.year, energyLabel].filter(Boolean).join(" · ")}</span>
          </div>
          <QuoteActions
            vehicle={activeVehicle}
            copy={quoteCopy}
            statusLabels={statusLabels}
            energyLabels={energyLabels}
            variant="hero"
          />
          <p className="site-hero-slide-more">
            <CtaLink href="/vehicules" variant="ghost">
              {copy.viewShowroomCta}
            </CtaLink>
          </p>

          {total > 1 ? (
            <div className="site-hero-slide-dots" role="tablist" aria-label={copy.ariaLabel}>
              {vehicles.map((vehicle, index) => (
                <button
                  key={vehicle.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? "site-hero-slide-dot is-active" : "site-hero-slide-dot"}
                  onClick={() => goTo(index)}
                >
                  <span className="site-sr-only">
                    {copy.goToSlideLabel.replace("{current}", String(index + 1)).replace("{total}", String(total))}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </Container>
      </div>

      {total > 1 ? (
        <>
          <button type="button" className="site-hero-slide-arrow site-hero-slide-arrow--prev" onClick={goPrev}>
            <span className="site-sr-only">{copy.prevLabel}</span>
            <ChevronLeft aria-hidden="true" size={22} />
          </button>
          <button type="button" className="site-hero-slide-arrow site-hero-slide-arrow--next" onClick={goNext}>
            <span className="site-sr-only">{copy.nextLabel}</span>
            <ChevronRight aria-hidden="true" size={22} />
          </button>
        </>
      ) : null}

      <p className="site-sr-only" aria-live="polite">
        {liveText}
      </p>
    </section>
  );
}
