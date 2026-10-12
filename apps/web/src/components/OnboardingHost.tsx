"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Role } from "@/lib/roles";
import { ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";
import { localizedOnboardingSteps, roleLabel } from "@/lib/i18n";
import { useMessages } from "@/components/PrefsProvider";

export function OnboardingHost({ role, userName }: { role: Role; userName: string }) {
  const messages = useMessages();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const steps = useMemo(() => localizedOnboardingSteps(role, messages), [role, messages]);
  const storageDoneKey = `${ONBOARDING_STORAGE_KEY}-steps-${role}`;

  useEffect(() => {
    try {
      const d = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      const s = localStorage.getItem(storageDoneKey);
      setOpen(d !== "1");
      if (s) setDone(JSON.parse(s) as Record<string, boolean>);
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, [storageDoneKey]);

  function persistDone(next: Record<string, boolean>) {
    setDone(next);
    try {
      localStorage.setItem(storageDoneKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function reopen() {
    setOpen(true);
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (!ready) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="ox-btn ox-onboarding-fab no-print"
        onClick={reopen}
        title={messages.onboarding.fabTitle}
      >
        {messages.onboarding.fab}
      </button>
    );
  }

  const completed = steps.filter((s) => done[s.id]).length;

  return (
    <div className="ox-glass ox-onboarding no-print" role="dialog" aria-label={messages.onboarding.dialogAria}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div>
          <strong style={{ color: "var(--gold)" }}>{messages.onboarding.title}</strong>
          <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
            {userName} · {roleLabel(messages, role)} · {completed}/{steps.length}
          </div>
        </div>
        <button
          type="button"
          className="ox-btn ox-btn-ghost ox-btn-sm"
          onClick={dismiss}
          title={messages.onboarding.hideTitle}
        >
          {messages.onboarding.hide}
        </button>
      </div>
      <p style={{ margin: "0 0 0.6rem", fontSize: "0.82rem", opacity: 0.75 }}>
        {messages.onboarding.intro}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`ox-check-item${done[step.id] ? " done" : ""}`}
            title={step.hint}
            onClick={() => persistDone({ ...done, [step.id]: true })}
          >
            <input
              type="checkbox"
              checked={!!done[step.id]}
              readOnly
              style={{ marginTop: 3 }}
            />
            <span>
              <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{step.label}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>{step.hint}</div>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
