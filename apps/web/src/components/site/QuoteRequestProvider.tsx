"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { MessageCircle, X } from "lucide-react";
import type { SiteCopy } from "@/lib/i18n/site/types";
import { SITE_PRIMARY_PHONE, whatsAppHref } from "@/lib/site-constants";
import { buildQuoteWhatsAppMessage, quoteVehicleTitle, type QuoteVehicle } from "@/lib/site-quote";

interface QuoteRequestContextValue {
  open: (vehicle?: QuoteVehicle | null) => void;
}

const QuoteRequestContext = createContext<QuoteRequestContextValue | null>(null);

export function useQuoteRequest(): QuoteRequestContextValue {
  const context = useContext(QuoteRequestContext);
  if (!context) throw new Error("useQuoteRequest must be used inside QuoteRequestProvider");
  return context;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface QuoteRequestProviderProps {
  children: ReactNode;
  copy: SiteCopy["quote"];
  statusLabels?: Record<string, string>;
  energyLabels?: Record<string, string>;
  whatsappPhone?: string;
}

export function QuoteRequestProvider({
  children,
  copy,
  statusLabels,
  energyLabels,
  whatsappPhone = SITE_PRIMARY_PHONE,
}: QuoteRequestProviderProps) {
  const [vehicle, setVehicle] = useState<QuoteVehicle | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [validationError, setValidationError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setVehicle(undefined);
    setStatus("idle");
    setValidationError(false);
  }, []);

  const open = useCallback(
    (nextVehicle?: QuoteVehicle | null) => {
      const target = nextVehicle ?? null;
      setVehicle(target);
      setStatus("idle");
      setValidationError(false);
      setMessage(
        target
          ? copy.messageDefaultVehicleTemplate.replace("{vehicle}", quoteVehicleTitle(target))
          : copy.messageDefaultGeneric,
      );
    },
    [copy.messageDefaultGeneric, copy.messageDefaultVehicleTemplate],
  );

  useEffect(() => {
    if (vehicle === undefined) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const node = dialogRef.current;
    node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [vehicle, close]);

  const whatsappMessage = buildQuoteWhatsAppMessage(copy, vehicle ?? null, { name, phone, email }, {
    statusLabels,
    energyLabels,
  });
  const whatsappLink = whatsAppHref(whatsappPhone, whatsappMessage);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setStatus("submitting");

    try {
      const response = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          vehicleInterest: vehicle ? quoteVehicleTitle(vehicle) : "Demande générale",
          energyPref: vehicle?.energy ?? "",
          notes: message.trim(),
        }),
      });
      if (!response.ok) throw new Error("quote request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <QuoteRequestContext.Provider value={{ open }}>
      {children}
      {vehicle !== undefined ? (
        <div className="site-quote-backdrop" onMouseDown={close}>
          <div
            className="site-quote-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={dialogRef}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className="site-quote-close" onClick={close}>
              <span className="site-sr-only">{copy.closeLabel}</span>
              <X aria-hidden="true" size={20} />
            </button>

            {status === "success" ? (
              <div className="site-quote-success">
                <h2 id={titleId}>{copy.successTitle}</h2>
                <p>{copy.successMessage}</p>
                <div className="site-quote-actions">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-cta site-quote-whatsapp"
                  >
                    <MessageCircle aria-hidden="true" size={18} />
                    {copy.whatsappSecondaryCta}
                  </a>
                  <button type="button" className="site-cta site-cta--secondary" onClick={close}>
                    {copy.closeLabel}
                  </button>
                </div>
              </div>
            ) : (
              <form className="site-quote-form" onSubmit={handleSubmit} noValidate>
                <h2 id={titleId}>{copy.dialogTitle}</h2>
                <p className="site-quote-subtitle">
                  {vehicle
                    ? copy.dialogSubtitleVehicle.replace("{vehicle}", quoteVehicleTitle(vehicle))
                    : copy.dialogSubtitleGeneric}
                </p>

                <div className="site-quote-grid">
                  <label className="site-form-field">
                    <span>{copy.nameLabel}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={copy.namePlaceholder}
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="site-form-field">
                    <span>{copy.phoneLabel}</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder={copy.phonePlaceholder}
                      autoComplete="tel"
                    />
                  </label>
                  <label className="site-form-field">
                    <span>{copy.emailLabel}</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={copy.emailPlaceholder}
                      autoComplete="email"
                    />
                  </label>
                </div>

                <p className="site-form-note">{copy.contactHint}</p>
                {validationError ? (
                  <p className="site-quote-error" role="alert">
                    {copy.errorValidation}
                  </p>
                ) : null}
                {status === "error" ? (
                  <p className="site-quote-error" role="alert">
                    {copy.errorGeneric}
                  </p>
                ) : null}

                <label className="site-form-field site-form-field--full">
                  <span>{copy.messageLabel}</span>
                  <textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
                </label>

                <p className="site-form-note">{copy.privacyNote}</p>

                <div className="site-quote-actions">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-cta site-quote-whatsapp"
                  >
                    <MessageCircle aria-hidden="true" size={18} />
                    {copy.whatsappSecondaryCta}
                  </a>
                  <button
                    type="submit"
                    className="site-cta site-cta--secondary"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? copy.submittingLabel : copy.submitLabel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </QuoteRequestContext.Provider>
  );
}
