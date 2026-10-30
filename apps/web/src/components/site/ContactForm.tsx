"use client";

import type { SiteCopy } from "@/lib/i18n/site/types";

interface ContactFormProps {
  copy: SiteCopy["contact"]["form"];
  contactEmail: string;
  whatsappHref: string;
}

export function ContactForm({ copy, contactEmail, whatsappHref }: ContactFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const mailSubject = subject || "CARZONE SARL";
    const mailBody = [
      `${copy.nameLabel}: ${name}`,
      `${copy.emailLabel}: ${email}`,
      phone ? `${copy.phoneLabel}: ${phone}` : null,
      "",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
  }

  return (
    <form className="site-contact-form" onSubmit={handleSubmit}>
      <div className="site-form-grid">
        <label className="site-form-field">
          <span>{copy.nameLabel}</span>
          <input type="text" name="name" autoComplete="name" placeholder={copy.namePlaceholder} required />
        </label>
        <label className="site-form-field">
          <span>{copy.emailLabel}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            required
          />
        </label>
        <label className="site-form-field">
          <span>{copy.phoneLabel}</span>
          <input type="tel" name="phone" autoComplete="tel" placeholder={copy.phonePlaceholder} />
        </label>
        <label className="site-form-field">
          <span>{copy.subjectLabel}</span>
          <input type="text" name="subject" placeholder={copy.subjectPlaceholder} required />
        </label>
      </div>
      <label className="site-form-field site-form-field--full">
        <span>{copy.messageLabel}</span>
        <textarea name="message" rows={5} placeholder={copy.messagePlaceholder} required />
      </label>
      <div className="site-contact-form-actions">
        <button type="submit" className="site-cta site-cta--primary">
          {copy.submitLabel}
        </button>
        <a
          href={whatsappHref}
          className="site-cta site-cta--secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.whatsappCta}
        </a>
      </div>
      <p className="site-form-note">{copy.note}</p>
    </form>
  );
}
