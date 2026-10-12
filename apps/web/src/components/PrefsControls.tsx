"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun, Languages } from "lucide-react";
import { usePrefs } from "@/components/PrefsProvider";
import type { ThemePref } from "@/lib/prefs";
import { LOCALES } from "@/lib/prefs";

type MenuKind = "theme" | "lang" | null;

type MenuCoords = { top: number; right: number };

function ThemeIcon({ pref }: { pref: ThemePref }) {
  if (pref === "light") return <Sun size={16} strokeWidth={2} aria-hidden />;
  if (pref === "dark") return <Moon size={16} strokeWidth={2} aria-hidden />;
  return <Monitor size={16} strokeWidth={2} aria-hidden />;
}

function useMenuPosition(open: boolean, triggerRef: RefObject<HTMLButtonElement | null>) {
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  const update = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }, [triggerRef]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update]);

  return coords;
}

export function PrefsControls({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const { themePref, setThemePref, locale, setLocale, messages } = usePrefs();
  const [openMenu, setOpenMenu] = useState<MenuKind>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const themeCoords = useMenuPosition(openMenu === "theme", themeBtnRef);
  const langCoords = useMenuPosition(openMenu === "lang", langBtnRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openMenu) return;

    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      const inRoot = rootRef.current?.contains(target);
      const inTheme = themeMenuRef.current?.contains(target);
      const inLang = langMenuRef.current?.contains(target);
      if (!inRoot && !inTheme && !inLang) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const themes: ThemePref[] = ["light", "dark", "auto"];

  const themeDropdown =
    mounted && openMenu === "theme" && themeCoords
      ? createPortal(
          <div
            ref={themeMenuRef}
            className="ox-prefs-dropdown"
            role="menu"
            style={{ top: themeCoords.top, right: themeCoords.right }}
          >
            {themes.map((pref) => (
              <button
                key={pref}
                type="button"
                role="menuitemradio"
                aria-checked={themePref === pref}
                className={`ox-prefs-item${themePref === pref ? " is-active" : ""}`}
                onClick={() => {
                  setThemePref(pref);
                  setOpenMenu(null);
                }}
              >
                <ThemeIcon pref={pref} />
                <span>{messages.theme[pref]}</span>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  const langDropdown =
    mounted && openMenu === "lang" && langCoords
      ? createPortal(
          <div
            ref={langMenuRef}
            className="ox-prefs-dropdown"
            role="menu"
            style={{ top: langCoords.top, right: langCoords.right }}
          >
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={locale === code}
                className={`ox-prefs-item${locale === code ? " is-active" : ""}`}
                onClick={() => {
                  setLocale(code);
                  setOpenMenu(null);
                  router.refresh();
                }}
              >
                <span className="ox-prefs-lang-code">{code.toUpperCase()}</span>
                <span>{messages.lang[code]}</span>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className="ox-prefs"
      style={{ display: "flex", alignItems: "center", gap: compact ? 4 : 6 }}
    >
      <div className="ox-prefs-menu">
        <button
          ref={themeBtnRef}
          type="button"
          className="ox-prefs-btn"
          aria-haspopup="menu"
          aria-expanded={openMenu === "theme"}
          aria-label={messages.theme.menuAria}
          title={messages.theme.label}
          onClick={() => setOpenMenu((m) => (m === "theme" ? null : "theme"))}
        >
          <ThemeIcon pref={themePref} />
        </button>
        {themeDropdown}
      </div>

      <div className="ox-prefs-menu">
        <button
          ref={langBtnRef}
          type="button"
          className="ox-prefs-btn"
          aria-haspopup="menu"
          aria-expanded={openMenu === "lang"}
          aria-label={messages.lang.menuAria}
          title={messages.lang.label}
          onClick={() => setOpenMenu((m) => (m === "lang" ? null : "lang"))}
        >
          <Languages size={16} strokeWidth={2} aria-hidden />
          <span className="ox-prefs-lang-code">{locale.toUpperCase()}</span>
        </button>
        {langDropdown}
      </div>
    </div>
  );
}
