"use client";

import { usePrefs } from "@/components/PrefsProvider";
import { sharedCopy } from "@/lib/i18n/messages/shared";

export function PolicyPanel() {
  const { locale } = usePrefs();
  const policy = sharedCopy[locale].policy;

  return (
    <aside className="ox-callout" aria-label={policy.ariaLabel}>
      <h3>{policy.title}</h3>
      <p>
        {policy.intro.before}
        <strong>{policy.intro.order}</strong>
        {policy.intro.between}
        <strong>{policy.intro.proforma}</strong>
        {policy.intro.after}
        <strong>{policy.intro.cannot}</strong>
        {policy.intro.end}
      </p>
      <ul>
        {policy.bullets.map((bullet) => (
          <li key={bullet.lead}>
            <strong>{bullet.lead}</strong> {bullet.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
