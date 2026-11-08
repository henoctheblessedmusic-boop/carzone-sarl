"use client";

import { useEffect } from "react";

function findVisibleDialog(): HTMLElement | null {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]')
  );
  return (
    dialogs
      .slice()
      .reverse()
      .find((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      }) ?? null
  );
}

function clickCloseButton(dialog: HTMLElement): boolean {
  const selectors = [
    'button[aria-label*="fermer" i]',
    'button[aria-label*="close" i]',
    'button[title*="fermer" i]',
    'button[title*="close" i]',
  ];
  for (const selector of selectors) {
    const button = dialog.querySelector<HTMLButtonElement>(selector);
    if (button) {
      button.click();
      return true;
    }
  }

  const iconButton = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find((button) => {
    const label = button.innerText.trim().toLowerCase();
    return (
      button.querySelector(".lucide-x, .lucide-circle-x") !== null ||
      label === "x" ||
      label === "×" ||
      label === "fermer" ||
      label === "close"
    );
  });
  if (iconButton) {
    iconButton.click();
    return true;
  }

  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return false;
}

/**
 * Sur Android, Chrome gère le bouton retour pour la navigation entre pages.
 * Une modale ouverte sans changement d'URL doit toutefois être fermée avant
 * de quitter la page. Cette protection reste inactive sur les autres systèmes.
 */
export function AndroidBackGuard() {
  useEffect(() => {
    if (!/Android/i.test(navigator.userAgent)) return;

    let guardPushed = false;
    let closeTimer: number | null = null;

    const pushGuard = () => {
      if (guardPushed || !findVisibleDialog()) return;
      window.history.pushState({ ...(window.history.state || {}), carzoneDialog: true }, "");
      guardPushed = true;
    };

    const closeVisibleDialog = () => {
      const dialog = findVisibleDialog();
      if (!dialog) return;
      clickCloseButton(dialog);
    };

    const onPopState = () => {
      const dialog = findVisibleDialog();
      if (!dialog) {
        guardPushed = false;
        return;
      }

      guardPushed = false;
      closeVisibleDialog();

      window.setTimeout(() => {
        if (findVisibleDialog()) {
          window.history.pushState({ carzoneDialog: true }, "");
          guardPushed = true;
        }
      }, 0);
    };

    const observer = new MutationObserver(() => {
      if (findVisibleDialog()) {
        pushGuard();
        return;
      }

      if (guardPushed) {
        guardPushed = false;
        if (closeTimer !== null) window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
          window.history.back();
        }, 0);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "aria-hidden", "aria-modal"],
    });
    window.addEventListener("popstate", onPopState);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", onPopState);
      if (closeTimer !== null) window.clearTimeout(closeTimer);
    };
  }, []);

  return null;
}
