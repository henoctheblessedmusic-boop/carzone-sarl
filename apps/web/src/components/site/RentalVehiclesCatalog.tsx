"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { CalendarDays, Car, CheckCircle2, MessageCircle, ShieldCheck, X } from "lucide-react";
import { formatXof } from "@/lib/format";
import type { SiteLocale } from "@/lib/site-prefs";
import type { TechnicalSheet } from "@/lib/tech-sheet-generator";

export type RentalPublicVehicle = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  energy: string;
  vehicleType: string | null;
  transmission: string | null;
  color: string | null;
  mileage: number;
  mainPhotoUrl: string;
  interiorPhotoUrl: string | null;
  exteriorPhotoUrl: string | null;
  rearPhotoUrl: string | null;
  seatsPhotoUrl: string | null;
  rentalDailyXof: number | null;
  rentalMonthlyXof: number | null;
  photosVerified?: boolean;
  technicalSheet: TechnicalSheet | null;
};

type RentalRequestResult = {
  reference: string;
  estimatedTotalXof: number | null;
  depositRequiredXof: number | null;
  days: number;
  vehicleLabel: string;
  whatsappUrl: string;
};

const COPY = {
  fr: {
    eyebrow: "Location de véhicule",
    intro:
      "Choisissez votre véhicule, consultez sa fiche technique et demandez votre cotation. Vous pouvez visiter le showroom ou conclure votre contrat à distance.",
    available: "véhicule(s) disponible(s)",
    empty: "Aucun véhicule disponible à la location pour le moment.",
    day: "jour",
    month: "mois",
    onRequest: "Sur devis",
    energyLabel: "Énergie",
    details: "Détails & fiche technique",
    quote: "Demander une cotation",
    gallery: "Galerie photos",
    specs: "Fiche technique",
    dimensions: "Dimensions",
    motor: "Motorisation",
    equipment: "Équipements principaux",
    safety: "Sécurité & aides à la conduite",
    requestTitle: "Demande de location",
    visit: "Visiter le showroom",
    remote: "Contrat à distance",
    name: "Nom complet",
    phone: "Téléphone / WhatsApp",
    email: "E-mail (optionnel)",
    start: "Date de début",
    days: "Nombre de jours",
    message: "Message (optionnel)",
    estimate: "Estimation",
    deposit: "Acompte de réservation (50 %)",
    submit: "Envoyer ma demande",
    submitting: "Envoi en cours...",
    success: "Demande enregistrée",
    successText: "Votre demande a été transmise. Voici votre référence :",
    whatsapp: "Envoyer sur WhatsApp",
    close: "Fermer",
    required: "Renseignez votre nom, votre téléphone, la date et le nombre de jours.",
    visitText: "Venez observer le véhicule au showroom CARZONE avant de signer.",
    remoteText: "Recevez votre devis à distance et réservez avec 50 % du montant.",
    contactHint: "Le tarif final et la disponibilité sont confirmés par notre équipe.",
  },
  en: {
    eyebrow: "Vehicle rental",
    intro:
      "Choose your vehicle, review its technical sheet and request a quote. You can visit the showroom or complete your contract remotely.",
    available: "vehicle(s) available",
    empty: "No rental vehicle is available at the moment.",
    day: "day",
    month: "month",
    onRequest: "On request",
    energyLabel: "Energy",
    details: "Details & technical sheet",
    quote: "Request a quote",
    gallery: "Photo gallery",
    specs: "Technical sheet",
    dimensions: "Dimensions",
    motor: "Powertrain",
    equipment: "Key equipment",
    safety: "Safety & driver assistance",
    requestTitle: "Rental request",
    visit: "Visit the showroom",
    remote: "Remote contract",
    name: "Full name",
    phone: "Phone / WhatsApp",
    email: "Email (optional)",
    start: "Start date",
    days: "Number of days",
    message: "Message (optional)",
    estimate: "Estimate",
    deposit: "Booking deposit (50%)",
    submit: "Send my request",
    submitting: "Sending...",
    success: "Request recorded",
    successText: "Your request has been sent. Your reference:",
    whatsapp: "Send on WhatsApp",
    close: "Close",
    required: "Please enter your name, phone, start date and number of days.",
    visitText: "Come and see the vehicle at the CARZONE showroom before signing.",
    remoteText: "Receive your quote remotely and book with 50% of the amount.",
    contactHint: "Final price and availability are confirmed by our team.",
  },
  es: {
    eyebrow: "Alquiler de vehículos",
    intro:
      "Elija su vehículo, consulte su ficha técnica y solicite una cotización. Puede visitar el showroom o formalizar su contrato a distancia.",
    available: "vehículo(s) disponible(s)",
    empty: "No hay vehículos disponibles para alquiler en este momento.",
    day: "día",
    month: "mes",
    onRequest: "A consulta",
    energyLabel: "Energía",
    details: "Detalles y ficha técnica",
    quote: "Solicitar cotización",
    gallery: "Galería de fotos",
    specs: "Ficha técnica",
    dimensions: "Dimensiones",
    motor: "Motorización",
    equipment: "Equipamiento principal",
    safety: "Seguridad y ayudas a la conducción",
    requestTitle: "Solicitud de alquiler",
    visit: "Visitar el showroom",
    remote: "Contrato a distancia",
    name: "Nombre completo",
    phone: "Teléfono / WhatsApp",
    email: "Correo electrónico (opcional)",
    start: "Fecha de inicio",
    days: "Número de días",
    message: "Mensaje (opcional)",
    estimate: "Estimación",
    deposit: "Depósito de reserva (50 %)",
    submit: "Enviar mi solicitud",
    submitting: "Enviando...",
    success: "Solicitud registrada",
    successText: "Su solicitud ha sido enviada. Su referencia:",
    whatsapp: "Enviar por WhatsApp",
    close: "Cerrar",
    required: "Indique su nombre, teléfono, fecha de inicio y número de días.",
    visitText: "Venga a ver el vehículo al showroom CARZONE antes de firmar.",
    remoteText: "Reciba su cotización a distancia y reserve con el 50 % del importe.",
    contactHint: "Nuestro equipo confirma el precio final y la disponibilidad.",
  },
  zh: {
    eyebrow: "车辆租赁",
    intro: "选择车辆，查看技术参数并申请报价。您可以到展厅看车，也可以远程签订合同。",
    available: "辆可用车辆",
    empty: "目前没有可租赁车辆。",
    day: "天",
    month: "月",
    onRequest: "面议",
    energyLabel: "能源",
    details: "详情与技术参数",
    quote: "申请报价",
    gallery: "照片图库",
    specs: "技术参数",
    dimensions: "尺寸",
    motor: "动力系统",
    equipment: "主要配置",
    safety: "安全与驾驶辅助",
    requestTitle: "租赁申请",
    visit: "参观展厅",
    remote: "远程合同",
    name: "姓名",
    phone: "电话 / WhatsApp",
    email: "邮箱（选填）",
    start: "开始日期",
    days: "租赁天数",
    message: "留言（选填）",
    estimate: "预估",
    deposit: "预订押金（50%）",
    submit: "提交申请",
    submitting: "提交中...",
    success: "申请已登记",
    successText: "您的申请已发送。参考号：",
    whatsapp: "通过 WhatsApp 发送",
    close: "关闭",
    required: "请填写姓名、电话、开始日期和租赁天数。",
    visitText: "欢迎先到 CARZONE 展厅看车后再签约。",
    remoteText: "远程接收报价，并支付 50% 金额完成预订。",
    contactHint: "最终价格与可用性由我们的团队确认。",
  },
} as const;

function photosOf(vehicle: RentalPublicVehicle) {
  return [
    { url: vehicle.mainPhotoUrl, label: "Vue principale" },
    vehicle.exteriorPhotoUrl ? { url: vehicle.exteriorPhotoUrl, label: "Extérieur" } : null,
    vehicle.interiorPhotoUrl && vehicle.photosVerified ? { url: vehicle.interiorPhotoUrl, label: "Intérieur" } : null,
    vehicle.seatsPhotoUrl && vehicle.photosVerified ? { url: vehicle.seatsPhotoUrl, label: "Sellerie" } : null,
    vehicle.rearPhotoUrl ? { url: vehicle.rearPhotoUrl, label: "Arrière" } : null,
  ].filter((photo): photo is { url: string; label: string } => Boolean(photo));
}

function titleOf(vehicle: RentalPublicVehicle) {
  return [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
}

export function RentalVehiclesCatalog({
  vehicles,
  locale,
  energyLabels,
}: {
  vehicles: RentalPublicVehicle[];
  locale: SiteLocale;
  energyLabels: Record<string, string>;
}) {
  const copy = COPY[locale] ?? COPY.fr;
  const [detailVehicle, setDetailVehicle] = useState<RentalPublicVehicle | null>(null);
  const [requestVehicle, setRequestVehicle] = useState<RentalPublicVehicle | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const energyLabelFor = (energy: string) => energyLabels[energy] ?? energy;

  return (
    <>
      <div className="site-rental-intro">
        <p>{copy.intro}</p>
        <span>{vehicles.length} {copy.available}</span>
      </div>

      {vehicles.length === 0 ? (
        <div className="site-catalog-empty">
          <p className="site-catalog-empty-title">{copy.empty}</p>
        </div>
      ) : (
        <div className="site-rental-grid">
          {vehicles.map((vehicle) => {
            const daily = vehicle.rentalDailyXof || (vehicle.rentalMonthlyXof ? Math.round(vehicle.rentalMonthlyXof / 30) : null);
            return (
              <article className="site-rental-card" key={vehicle.id}>
                <button
                  type="button"
                  className="site-rental-card-media"
                  onClick={() => {
                    setSelectedPhoto(0);
                    setDetailVehicle(vehicle);
                  }}
                  aria-label={`${copy.details} - ${titleOf(vehicle)}`}
                >
                  <Image src={vehicle.mainPhotoUrl} alt={titleOf(vehicle)} fill sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 30vw" className="site-rental-card-img" />
                  <span className="site-rental-card-badge"><Car size={13} /> {copy.gallery}</span>
                </button>
                <div className="site-rental-card-body">
                  <div className="site-rental-card-energy">
                    <span>{copy.energyLabel}</span>
                    <strong>{energyLabelFor(vehicle.energy)}</strong>
                  </div>
                  <h2 className="site-rental-card-title">{titleOf(vehicle)}</h2>
                  <div className="site-rental-card-meta">
                    {[vehicle.year, vehicle.vehicleType, vehicle.transmission].filter(Boolean).join(" · ")}
                  </div>
                  <div className="site-rental-card-price">
                    {daily ? (
                      <>
                        <strong>{formatXof(daily)}</strong>
                        <span>/ {copy.day}</span>
                      </>
                    ) : (
                      <strong>{copy.onRequest}</strong>
                    )}
                  </div>
                  <div className="site-rental-card-actions">
                    <button type="button" className="site-cta site-cta--ghost" onClick={() => { setSelectedPhoto(0); setDetailVehicle(vehicle); }}>
                      {copy.details}
                    </button>
                    <button type="button" className="site-cta site-cta--primary" onClick={() => setRequestVehicle(vehicle)}>
                      {copy.quote}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detailVehicle && (
        <div className="site-rental-modal-backdrop" onMouseDown={() => setDetailVehicle(null)}>
          <div className="site-rental-modal" role="dialog" aria-modal="true" aria-label={titleOf(detailVehicle)} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="site-rental-modal-close" onClick={() => setDetailVehicle(null)} aria-label={copy.close}>
              <X size={20} />
            </button>
            <div className="site-rental-modal-gallery">
              <div className="site-rental-modal-main">
                <Image src={photosOf(detailVehicle)[selectedPhoto]?.url || detailVehicle.mainPhotoUrl} alt={titleOf(detailVehicle)} fill sizes="(max-width: 768px) 100vw, 660px" className="site-rental-modal-img" />
              </div>
              <div className="site-rental-modal-thumbs">
                {photosOf(detailVehicle).map((photo, index) => (
                  <button key={photo.url} type="button" className={index === selectedPhoto ? "is-active" : ""} onClick={() => setSelectedPhoto(index)} aria-label={photo.label}>
                    <Image src={photo.url} alt="" fill sizes="80px" />
                  </button>
                ))}
              </div>
            </div>
            <div className="site-rental-modal-body">
              <p className="site-eyebrow">{copy.eyebrow}</p>
              <h2>{titleOf(detailVehicle)}</h2>
              <div className="site-rental-modal-price">
                {detailVehicle.rentalDailyXof ? `${formatXof(detailVehicle.rentalDailyXof)} / ${copy.day}` : detailVehicle.rentalMonthlyXof ? `${formatXof(detailVehicle.rentalMonthlyXof)} / ${copy.month}` : copy.onRequest}
              </div>
              <div className="site-rental-modal-actions">
                <button type="button" className="site-cta site-cta--primary" onClick={() => { setRequestVehicle(detailVehicle); setDetailVehicle(null); }}>
                  {copy.quote}
                </button>
                <button type="button" className="site-cta site-cta--ghost" onClick={() => { setRequestVehicle(detailVehicle); setDetailVehicle(null); }}>
                  {copy.visit}
                </button>
              </div>

              {detailVehicle.technicalSheet && (
                <div className="site-rental-sheet">
                  <h3>{copy.specs}</h3>
                  <div className="site-rental-sheet-grid">
                    <div>
                      <span>{copy.energyLabel}</span>
                      <strong>{energyLabelFor(detailVehicle.energy)}</strong>
                      <small>
                        {[
                          detailVehicle.technicalSheet.motorisation.fuelType,
                          detailVehicle.technicalSheet.motorisation.rangeKm ? `Autonomie ${detailVehicle.technicalSheet.motorisation.rangeKm}` : null,
                        ].filter(Boolean).join(" · ")}
                      </small>
                    </div>
                    <div><span>{copy.dimensions}</span><strong>{detailVehicle.technicalSheet.dimensions.lengthWidthHeight} mm</strong><small>Empattement {detailVehicle.technicalSheet.dimensions.wheelbase} mm · {detailVehicle.technicalSheet.dimensions.seats} places</small></div>
                    <div><span>{copy.motor}</span><strong>{detailVehicle.technicalSheet.motorisation.displacementOrMotor}</strong><small>{detailVehicle.technicalSheet.motorisation.maxPower} · {detailVehicle.technicalSheet.motorisation.transmission}</small></div>
                  </div>
                  <h4>{copy.equipment}</h4>
                  <ul>{detailVehicle.technicalSheet.equipementConfort.slice(0, 6).map((item) => <li key={item}><CheckCircle2 size={14} /> {item}</li>)}</ul>
                  <h4>{copy.safety}</h4>
                  <ul>{detailVehicle.technicalSheet.securite.slice(0, 6).map((item) => <li key={item}><ShieldCheck size={14} /> {item}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {requestVehicle && (
        <RentalRequestModal
          vehicle={requestVehicle}
          copy={copy}
          onClose={() => setRequestVehicle(null)}
        />
      )}
    </>
  );
}

function RentalRequestModal({
  vehicle,
  copy,
  onClose,
}: {
  vehicle: RentalPublicVehicle;
  copy: (typeof COPY)[keyof typeof COPY];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState("1");
  const [mode, setMode] = useState<"VISITE_SHOWROOM" | "CONTRAT_A_DISTANCE">("VISITE_SHOWROOM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RentalRequestResult | null>(null);

  const dailyRate = vehicle.rentalDailyXof || (vehicle.rentalMonthlyXof ? Math.round(vehicle.rentalMonthlyXof / 30) : null);
  const estimate = useMemo(() => {
    const count = Math.max(1, Number(days) || 1);
    return dailyRate ? dailyRate * count : null;
  }, [dailyRate, days]);
  const deposit = estimate ? Math.round(estimate * 0.5) : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || phone.trim().length < 6 || !startDate || Number(days) < 1) {
      setError(copy.required);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/public/rental-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          customerName: name,
          phone,
          email,
          startDate,
          days: Number(days),
          mode,
          message,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la demande.");
      setResult(data as RentalRequestResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la demande.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site-rental-modal-backdrop" onMouseDown={onClose}>
      <div className="site-rental-modal site-rental-request-modal" role="dialog" aria-modal="true" aria-label={copy.requestTitle} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="site-rental-modal-close" onClick={onClose} aria-label={copy.close}><X size={20} /></button>
        <div className="site-rental-request-head">
          <p className="site-eyebrow">{copy.quote}</p>
          <h2>{titleOf(vehicle)}</h2>
        </div>

        {result ? (
          <div className="site-rental-request-success">
            <CheckCircle2 size={36} />
            <h3>{copy.success}</h3>
            <p>{copy.successText} <strong>{result.reference}</strong></p>
            <div className="site-rental-request-summary">
              <span>{copy.estimate} : <strong>{result.estimatedTotalXof ? formatXof(result.estimatedTotalXof) : copy.onRequest}</strong></span>
              <span>{copy.deposit} : <strong>{result.depositRequiredXof ? formatXof(result.depositRequiredXof) : copy.onRequest}</strong></span>
            </div>
            <a className="site-cta site-cta--primary" href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> {copy.whatsapp}
            </a>
            <button type="button" className="site-cta site-cta--ghost" onClick={onClose}>{copy.close}</button>
          </div>
        ) : (
          <form className="site-rental-request-form" onSubmit={submit}>
            <div className="site-rental-request-modes">
              <button type="button" className={mode === "VISITE_SHOWROOM" ? "is-active" : ""} onClick={() => setMode("VISITE_SHOWROOM")}>
                <Car size={16} /> {copy.visit}
              </button>
              <button type="button" className={mode === "CONTRAT_A_DISTANCE" ? "is-active" : ""} onClick={() => setMode("CONTRAT_A_DISTANCE")}>
                <CalendarDays size={16} /> {copy.remote}
              </button>
            </div>
            <p className="site-rental-request-help">{mode === "VISITE_SHOWROOM" ? copy.visitText : copy.remoteText}</p>
            <div className="site-rental-request-grid">
              <label>{copy.name}<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
              <label>{copy.phone}<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" required /></label>
              <label>{copy.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>{copy.start}<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
              <label>{copy.days}<input type="number" min="1" max="365" value={days} onChange={(event) => setDays(event.target.value)} required /></label>
              <label className="site-rental-request-message">{copy.message}<textarea rows={2} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
            </div>
            <div className="site-rental-request-estimate">
              <div><span>{copy.estimate}</span><strong>{estimate ? formatXof(estimate) : copy.onRequest}</strong></div>
              <div><span>{copy.deposit}</span><strong>{deposit ? formatXof(deposit) : copy.onRequest}</strong></div>
            </div>
            <p className="site-rental-request-help">{copy.contactHint}</p>
            {error && <p className="site-rental-request-error">{error}</p>}
            <button type="submit" className="site-cta site-cta--primary" disabled={submitting}>
              {submitting ? copy.submitting : copy.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
