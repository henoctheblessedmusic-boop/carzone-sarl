"use client";

import { usePrefs } from "@/components/PrefsProvider";
import { sharedCopy } from "@/lib/i18n/messages/shared";

export function PrintButton() {
  const { locale } = usePrefs();
  const copy = sharedCopy[locale];

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="ox-btn"
      title={copy.print.title}
    >
      {copy.print.label}
    </button>
  );
}
