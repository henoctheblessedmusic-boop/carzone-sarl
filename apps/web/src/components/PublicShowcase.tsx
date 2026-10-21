"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Fuel,
  Gauge,
  ShieldCheck,
  Wrench,
  Zap,
  CheckCircle2,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronRight,
  X,
  Send,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  Award,
  Ship,
  Anchor,
} from "lucide-react";
import { OFFICIAL_VEHICLE_CATALOG, ModelCatalogEntry } from "@/lib/vehicle-catalog-specs";
import { CarzoneLogo } from "@/components/CarzoneLogo";

export interface ShowcaseVehicle extends ModelCatalogEntry {
  dbId?: string;
  stockStatus: "SHOWROOM" | "AU_PORT" | "EN_TRANSIT" | "COMMANDE" | "SUR_COMMANDE_USINE";
  priceXof?: number | null;
  etaDate?: string | null;
  vin?: string | null;
  color?: string | null;
  shippingOriginPort?: string | null;
}

interface PublicShowcaseProps {
  session?: {
    id: string;
    fullName: string;
    role: string;
    email: string;
  } | null;
  liveDbVehicles?: any[];
}

const CATEGORIES = [
  { id: "ALL", label: "Tous les Véhicules" },
  { id: "VEDETTES", label: "🔥 Nouveautés 2026 & Flashy" },
  { id: "SUV", label: "SUV & Crossovers" },
  { id: "PICKUP", label: "Pick-up 4x4" },
  { id: "BERLINE", label: "Berlines de Luxe" },
  { id: "ELECTRIQUE", label: "Électrique & Hybride (VE)" },
];

const AVAILABILITY_FILTERS = [
  { id: "ALL", label: "Toutes Disponibilités" },
  { id: "SHOWROOM", label: "🟢 En Stock Showroom" },
  { id: "TRANSIT", label: "🚢 En Arrivage / Au Port" },
  { id: "COMMANDE", label: "🏭 Commandes d'Usine" },
];

function formatPriceXof(price?: number | null): string {
  if (!price || price <= 0) return "Sur cotation usine";
  return `${price.toLocaleString("fr-FR")} FCFA`;
}

function formatEtaDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * AUTOMATISATION DU CLASSEMENT COMMERCIAL CARZONE
 * Calcule dynamiquement le score d'attractivité pour ordonner automatiquement les véhicules :
 * 1. Année du véhicule (Nouveautés 2026 en priorité absolue, puis 2025, 2024...)
 * 2. Modèles Vedettes / Flashy / High-Tech (Starship 7 PHEV, Jetour T2 i-DM, Changan UNI-K, Prado, etc.)
 * 3. Disponibilité du stock (En Showroom ou en Arrivage prioritaire sur commande sans stock)
 * 4. Prix et fraîcheur de l'entrée en stock
 * Les véhicules plus anciens ou d'entrée de gamme descendent automatiquement vers le bas.
 */
export function getVehicleAttractivenessScore(v: ShowcaseVehicle): number {
  let score = 0;

  // 1. Année du véhicule (Nouveautés 2026 & 2027 en tête absolue)
  const year = Number(v.year) || 2024;
  if (year >= 2026) score += 6000;
  else if (year === 2025) score += 3500;
  else if (year === 2024) score += 1200;
  else score += 300; // Les stocks plus anciens descendent tout en bas

  // 2. Modèles Phares / Flashy / Attirants (Piliers esthétiques et technologiques)
  const text = `${v.brand} ${v.model} ${v.variant || ""}`.toUpperCase();
  const isFlashy =
    text.includes("STARSHIP") ||
    text.includes("T2") ||
    text.includes("UNI-K") ||
    text.includes("PRADO") ||
    text.includes("DASHING") ||
    text.includes("T5 EVO") ||
    text.includes("B40") ||
    text.includes("RICH 7") ||
    text.includes("SEAL") ||
    text.includes("YANGWANG") ||
    text.includes("X55");

  if (isFlashy) {
    score += 2800;
  }

  // 3. Technologies d'avenir (PHEV, Hybrides rechargeables et 100% Électriques)
  if (v.energy === "HYBRIDE" || v.energy === "ELECTRIQUE" || text.includes("PHEV") || text.includes("REHEV")) {
    score += 1000;
  }

  // 4. Statut de stock : Disponibilité immédiate et transit prioritaire
  if (v.stockStatus === "SHOWROOM") score += 1600;
  else if (v.stockStatus === "EN_TRANSIT") score += 1400;
  else if (v.stockStatus === "AU_PORT") score += 1500;
  else if (v.stockStatus === "COMMANDE") score += 800;
  else score += 100;

  // 5. Présence d'un prix officiel chiffré
  if (v.priceXof && v.priceXof > 0) {
    score += 500;
  }

  return score;
}


export function PublicShowcase({ session, liveDbVehicles = [] }: PublicShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [detailVehicle, setDetailVehicle] = useState<ShowcaseVehicle | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [quoteVehicle, setQuoteVehicle] = useState<ShowcaseVehicle | null>(null);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  // Quote form state
  const [formData, setFormData] = useState({
    contactName: "",
    phone: "",
    email: "",
    city: "Cotonou",
    paymentType: "Comptant",
    notes: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Merge live DB vehicles with the official catalog
  const allVehicles: ShowcaseVehicle[] = useMemo(() => {
    const list: ShowcaseVehicle[] = [];
    const matchedCatalogTitles = new Set<string>();

    if (liveDbVehicles && liveDbVehicles.length > 0) {
      liveDbVehicles.forEach((dbV) => {
        // Normaliser les chaînes
        const dbBrand = String(dbV.brand || "").trim().toUpperCase();
        const dbModel = String(dbV.model || "").trim().toUpperCase();

        const catMatch = OFFICIAL_VEHICLE_CATALOG.find(
          (c) =>
            c.brand.toUpperCase() === dbBrand &&
            (c.model.toUpperCase().includes(dbModel) || dbModel.includes(c.model.toUpperCase()))
        );

        let stockStatus: ShowcaseVehicle["stockStatus"] = "SHOWROOM";
        if (dbV.status === "AU_PORT") stockStatus = "AU_PORT";
        else if (dbV.status === "EN_TRANSIT") stockStatus = "EN_TRANSIT";
        else if (dbV.status === "COMMANDE" || dbV.status === "EN_PRODUCTION") stockStatus = "COMMANDE";
        else if (dbV.status === "EN_STOCK" || dbV.status === "EN_MAGASIN") stockStatus = "SHOWROOM";

        if (catMatch) {
          matchedCatalogTitles.add(catMatch.title);
          list.push({
            ...catMatch,
            dbId: dbV.id,
            title: `${dbV.brand} ${dbV.model}${dbV.variant ? ` · ${dbV.variant}` : ""}`,
            stockStatus,
            priceXof: dbV.priceXof,
            etaDate: dbV.etaDate,
            vin: dbV.vin,
            color: dbV.color,
            shippingOriginPort: dbV.shippingOriginPort,
          });
        } else {
          // Fallback avec photos par défaut
          list.push({
            brand: dbV.brand,
            model: dbV.model,
            variant: dbV.variant || "Modèle Neuf",
            category: (dbV.vehicleType as any) || "SUV",
            year: dbV.year || 2026,
            energy: (dbV.energy as any) || "ESSENCE",
            title: `${dbV.brand} ${dbV.model}`,
            photos: {
              mainPhotoUrl: dbV.mainPhotoUrl || "/images/vehicles/cs75-main.jpg",
              interiorPhotoUrl: dbV.interiorPhotoUrl || "/images/vehicles/cs75-interior.jpg",
              exteriorPhotoUrl: dbV.exteriorPhotoUrl || "/images/vehicles/cs75-exterior.jpg",
              rearPhotoUrl: dbV.rearPhotoUrl || "/images/vehicles/cs75-rear.jpg",
            },
            dimensions: {
              lengthWidthHeight: "Standard",
              wheelbase: "Standard",
              doors: 5,
              seats: 5,
              tankOrBattery: "Standard",
            },
            motorisation: {
              displacementOrMotor: dbV.energy,
              cylinders: "4 en ligne",
              transmission: dbV.transmission || "Automatique",
              fuelType: dbV.energy,
              maxPower: "Puissance d'usine certifiée",
              maxTorque: "Couple optimisé",
            },
            equipementConfort: ["Climatisation automatique", "Écran tactile haute définition", "Sellerie grand confort"],
            exterieur: ["Projecteurs Full LED", "Jantes aluminium", "Lignes aérodynamiques"],
            securite: ["Airbags frontaux & latéraux", "Système ESP Bosch", "Caméra de recul"],
            dbId: dbV.id,
            stockStatus,
            priceXof: dbV.priceXof,
            etaDate: dbV.etaDate,
            vin: dbV.vin,
            color: dbV.color,
            shippingOriginPort: dbV.shippingOriginPort,
          });
        }
      });
    }

    // Ajouter les autres véhicules du catalogue d'usine comme "SUR_COMMANDE_USINE"
    OFFICIAL_VEHICLE_CATALOG.forEach((catEntry) => {
      if (!matchedCatalogTitles.has(catEntry.title)) {
        list.push({
          ...catEntry,
          stockStatus: "SUR_COMMANDE_USINE",
          priceXof: null,
          etaDate: null,
        });
      }
    });

    return list;
  }, [liveDbVehicles]);

  // Unique brands list
  const brands = useMemo(() => {
    const list = Array.from(new Set(allVehicles.map((v) => v.brand))).sort();
    return ["ALL", ...list];
  }, [allVehicles]);

  // Filtered and automatically ranked vehicles
  const filteredVehicles = useMemo(() => {
    const matched = allVehicles.filter((v) => {
      // 1. Category filter
      if (selectedCategory === "VEDETTES") {
        const isFlashyOrRecent = (v.year && v.year >= 2026) || getVehicleAttractivenessScore(v) >= 8000;
        if (!isFlashyOrRecent) return false;
      }
      if (selectedCategory === "SUV" && v.category !== "SUV") return false;
      if (selectedCategory === "PICKUP" && v.category !== "PICKUP") return false;
      if (selectedCategory === "BERLINE" && v.category !== "BERLINE") return false;
      if (
        selectedCategory === "ELECTRIQUE" &&
        v.energy !== "ELECTRIQUE" &&
        v.energy !== "HYBRIDE" &&
        v.category !== "ELECTRIQUE"
      ) {
        return false;
      }

      // 2. Availability filter
      if (selectedAvailability === "SHOWROOM" && v.stockStatus !== "SHOWROOM") return false;
      if (
        selectedAvailability === "TRANSIT" &&
        v.stockStatus !== "EN_TRANSIT" &&
        v.stockStatus !== "AU_PORT"
      ) {
        return false;
      }
      if (
        selectedAvailability === "COMMANDE" &&
        v.stockStatus !== "COMMANDE" &&
        v.stockStatus !== "SUR_COMMANDE_USINE"
      ) {
        return false;
      }

      // 3. Brand filter
      if (selectedBrand !== "ALL" && v.brand !== selectedBrand) return false;

      // 4. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchBrand = v.brand.toLowerCase().includes(q);
        const matchModel = v.model.toLowerCase().includes(q);
        const matchVariant = v.variant.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchModel && !matchVariant) return false;
      }

      return true;
    });

    // CLASSEMENT AUTOMATISÉ DYNAMIQUE :
    // Les véhicules récents (2026, puis 2025), les modèles phares les plus flashy et le stock réel
    // sont TOUJOURS placés en tête de vitrine. Les qualités standards et modèles anciens descendent en bas.
    return matched.sort((a, b) => {
      const scoreA = getVehicleAttractivenessScore(a);
      const scoreB = getVehicleAttractivenessScore(b);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return (b.priceXof || 0) - (a.priceXof || 0);
    });
  }, [allVehicles, selectedCategory, selectedBrand, selectedAvailability, searchQuery]);

  // Handle Quote Submit
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName || (!formData.phone && !formData.email)) {
      setFormError("Veuillez renseigner votre nom et au moins un contact (téléphone ou email).");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: formData.contactName,
          phone: formData.phone,
          email: formData.email,
          vehicleInterest: quoteVehicle
            ? `${quoteVehicle.title} [Statut: ${quoteVehicle.stockStatus}${quoteVehicle.etaDate ? ` - Arrivage: ${formatEtaDate(quoteVehicle.etaDate)}` : ""}]`
            : "Catalogue Général CARZONE",
          energyPref: quoteVehicle ? quoteVehicle.energy : undefined,
          notes: `Statut stock: ${quoteVehicle?.stockStatus || "Général"} · Mode paiement: ${formData.paymentType} · Ville: ${formData.city} · Notes: ${formData.notes || "Aucune"}`,
          source:
            quoteVehicle?.stockStatus === "EN_TRANSIT"
              ? "reservation_transit"
              : quoteVehicle?.stockStatus === "SHOWROOM"
              ? "cotation_showroom"
              : "commande_usine",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setFormSuccess(true);
    } catch (err: any) {
      setFormError(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const getWhatsAppLink = (vehicle?: ShowcaseVehicle | null) => {
    const phone = "2290192616161";
    let text = "";
    if (vehicle) {
      if (vehicle.stockStatus === "EN_TRANSIT") {
        text = `Bonjour CARZONE Bénin, je souhaite réserver le modèle ${vehicle.title} actuellement en transit vers Cotonou${vehicle.etaDate ? ` (Arrivage prévu le ${formatEtaDate(vehicle.etaDate)})` : ""}. Pouvez-vous me transmettre la facture proforma officielle ?`;
      } else if (vehicle.stockStatus === "AU_PORT") {
        text = `Bonjour CARZONE Bénin, je suis intéressé par le modèle ${vehicle.title} actuellement au Port de Cotonou en dédouanement. Quand sera-t-il prêt au Showroom ?`;
      } else if (vehicle.stockStatus === "SHOWROOM") {
        text = `Bonjour CARZONE Bénin, je souhaite acheter le modèle ${vehicle.title} disponible au showroom de Cotonou. Pouvez-vous me confirmer le prix (${formatPriceXof(vehicle.priceXof)}) et la disponibilité d'essai ?`;
      } else {
        text = `Bonjour CARZONE Bénin, je souhaite configurer et commander d'usine le modèle ${vehicle.title}. Pouvez-vous me transmettre la fiche technique et le devis usine ?`;
      }
    } else {
      text = "Bonjour CARZONE Bénin, je souhaite échanger avec un conseiller commercial concernant vos véhicules neufs disponibles au showroom de Cotonou.";
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Extract photos for detail view
  const detailPhotos = useMemo(() => {
    if (!detailVehicle) return [];
    const p = detailVehicle.photos;
    const list = [p.mainPhotoUrl];
    if (p.interiorPhotoUrl && p.interiorPhotoUrl !== p.mainPhotoUrl) list.push(p.interiorPhotoUrl);
    if (p.interiorSeatsPhotoUrl && !list.includes(p.interiorSeatsPhotoUrl)) list.push(p.interiorSeatsPhotoUrl);
    if (p.exteriorPhotoUrl && !list.includes(p.exteriorPhotoUrl)) list.push(p.exteriorPhotoUrl);
    if (p.rearPhotoUrl && !list.includes(p.rearPhotoUrl)) list.push(p.rearPhotoUrl);
    return list;
  }, [detailVehicle]);

  return (
    <div className="cz-public-root">
      {/* 1. TOP ANNOUNCEMENT & SESSION BAR */}
      <div style={{ background: "#0b1622", borderBottom: "1px solid rgba(160,210,230,0.1)", padding: "0.45rem 1rem", fontSize: "0.82rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#94a3b8" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={13} color="#e11d48" /> Showroom Maro-Militaire, Gbèdomidji, Cotonou
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={13} color="#f59e0b" /> Lun - Ven : 8h00 - 18h30 | Sam : 8h30 - 15h00
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
            <a href="tel:+2290192616161" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Phone size={13} color="#10b981" /> +229 01 92 61 61 61
            </a>
            {session ? (
              <Link
                href="/dashboard"
                style={{
                  background: "rgba(225,29,72,0.15)",
                  color: "#f43f5e",
                  border: "1px solid rgba(225,29,72,0.35)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Lock size={12} /> Dashboard ({session.fullName})
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontWeight: 600,
                }}
              >
                <Lock size={12} /> Espace Collaborateur
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION NAVBAR */}
      <header className="cz-nav-glass">
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <CarzoneLogo size="md" />
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
            <a href="#showroom" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 600, fontSize: "0.92rem", transition: "color 0.2s" }}>
              Stock & Arrivages
            </a>
            <a href="#sur-mesure" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 600, fontSize: "0.92rem", transition: "color 0.2s" }}>
              Commande Usine
            </a>
            <a href="#services" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 600, fontSize: "0.92rem", transition: "color 0.2s" }}>
              Atelier SAV & Pièces
            </a>
            <a href="#recharge" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 600, fontSize: "0.92rem", transition: "color 0.2s" }}>
              Bornes & VE
            </a>
            <a href="#contact" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 600, fontSize: "0.92rem", transition: "color 0.2s" }}>
              Showroom & Accès
            </a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <button
              onClick={() => {
                setQuoteVehicle(null);
                setFormSuccess(false);
                setCatalogModalOpen(true);
              }}
              className="cz-btn-outline"
              style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
            >
              <FileText size={15} color="#f59e0b" /> Devis Express
            </button>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="cz-btn-whatsapp"
              style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
            >
              <MessageSquare size={15} /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO & SHOWROOM HEADER COMPACT */}
      <section className="cz-hero-bg">
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* LIGNE DE TITRE & ACTIONS RAPIDES */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.2rem", marginBottom: "1.3rem" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "rgba(225, 29, 72, 0.12)",
                  border: "1px solid rgba(225, 29, 72, 0.35)",
                  color: "#fb7185",
                  padding: "0.22rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  marginBottom: "0.45rem",
                  textTransform: "uppercase",
                }}
              >
                <Sparkles size={12} color="#f59e0b" /> Concessionnaire Officiel Multimarques · Stock Live & Arrivages Cotonou
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                L&apos;Excellence Automobile{" "}
                <span style={{ background: "linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  au Cœur de Cotonou
                </span>
              </h1>
            </div>

            {/* RECHERCHE & DEMANDE DE COTATION */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ position: "relative", minWidth: 260 }}>
                <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Rechercher par modèle, marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cz-input"
                  style={{ paddingLeft: "2.4rem", paddingRight: "1rem", height: "40px", fontSize: "0.88rem" }}
                />
              </div>

              <button
                onClick={() => {
                  setQuoteVehicle(null);
                  setFormSuccess(false);
                  setCatalogModalOpen(true);
                }}
                className="cz-btn-primary"
                style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", height: "40px" }}
              >
                <FileText size={15} color="#fff" /> Devis Express en 1 Clic
              </button>
            </div>
          </div>

          {/* FILTRE DISPONIBILITÉ STOCK (SHOWROOM / TRANSIT / COMMANDE) */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "0.65rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginRight: "0.3rem" }}>
              Disponibilité :
            </span>
            {AVAILABILITY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedAvailability(f.id)}
                className={`cz-pill ${selectedAvailability === f.id ? "active" : ""}`}
                style={{ padding: "0.4rem 0.95rem", fontSize: "0.8rem" }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* CATÉGORIES DE VÉHICULES */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "0.65rem" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`cz-pill ${selectedCategory === cat.id ? "active" : ""}`}
                style={{ padding: "0.42rem 0.95rem", fontSize: "0.8rem" }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* SÉLECTEUR DE MARQUES */}
          <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginRight: "0.3rem" }}>
              Marque :
            </span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`cz-pill ${selectedBrand === b ? "active" : ""}`}
                style={{ padding: "0.26rem 0.65rem", fontSize: "0.73rem" }}
              >
                {b === "ALL" ? "Toutes" : b}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SHOWROOM & GRILLE DE VÉHICULES (DIRECTEMENT VISIBLE) */}
      <section id="showroom" style={{ maxWidth: 1280, margin: "0 auto", padding: "1.25rem 1.25rem 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.8rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(225,29,72,0.15)", border: "1px solid rgba(225,29,72,0.35)", borderRadius: "20px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 800, color: "#f43f5e", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Sparkles size={13} color="#f43f5e" /> Ordonnancement Automatique Intelligent
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              Collection Véhicules Neufs & Arrivages Prioritaires
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0.35rem 0 0" }}>
              Les modèles 2026 les plus récents, technologiques et prestigieux sont automatiquement propulsés en avant.
            </p>
          </div>

          <div style={{ background: "rgba(14,26,38,0.7)", border: "1px solid rgba(160,210,230,0.18)", borderRadius: "10px", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Car size={16} color="#f59e0b" />
            <span style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 600 }}>
              <strong style={{ color: "#fff", fontSize: "1rem", fontWeight: 800 }}>{filteredVehicles.length}</strong> modèles disponibles
            </span>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="cz-card-glass" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <Car size={48} color="#64748b" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>Aucun véhicule ne correspond à ces critères</h3>
            <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Modifiez vos filtres ou effectuez une commande spéciale d&apos;usine.</p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedBrand("ALL");
                setSelectedAvailability("ALL");
                setSearchQuery("");
              }}
              className="cz-btn-outline"
              style={{ marginTop: "1.5rem" }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "1.8rem",
            }}
          >
            {filteredVehicles.map((vehicle, idx) => {
              const formattedPrice = formatPriceXof(vehicle.priceXof);
              const eta = formatEtaDate(vehicle.etaDate);

              return (
                <div
                  key={`${vehicle.brand}-${vehicle.model}-${idx}`}
                  className="cz-card-glass"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  {/* PHOTO CONTAINER */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 240,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#08121a",
                    }}
                    onClick={() => {
                      setDetailVehicle(vehicle);
                      setSelectedPhotoIndex(0);
                    }}
                  >
                    <Image
                      src={vehicle.photos.mainPhotoUrl}
                      alt={vehicle.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{
                        objectFit: "cover",
                        transition: "transform 0.4s cubic-bezier(0.2,0.8,0.2,1)",
                      }}
                      className="hover:scale-105"
                    />

                    {/* TOP BADGES : STATUS + ENERGY */}
                    <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", right: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                        {vehicle.year && vehicle.year >= 2026 ? (
                          <span className="cz-badge-flagship">
                            <Sparkles size={11} /> NOUVEAUTÉ 2026
                          </span>
                        ) : getVehicleAttractivenessScore(vehicle) >= 8000 ? (
                          <span
                            className="cz-badge-flagship"
                            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)" }}
                          >
                            <Sparkles size={11} /> MODÈLE PHARE
                          </span>
                        ) : null}

                        {vehicle.stockStatus === "SHOWROOM" && (
                          <span className="cz-badge-status stock">
                            <CheckCircle2 size={12} /> EN STOCK SHOWROOM
                          </span>
                        )}
                        {vehicle.stockStatus === "EN_TRANSIT" && (
                          <span className="cz-badge-status transit">
                            <Ship size={12} /> {eta ? `ARRIVAGE : ${eta}` : "EN TRANSIT"}
                          </span>
                        )}
                        {vehicle.stockStatus === "AU_PORT" && (
                          <span className="cz-badge-status port">
                            <Anchor size={12} /> AU PORT (DÉDOUANEMENT)
                          </span>
                        )}
                        {vehicle.stockStatus === "COMMANDE" && (
                          <span className="cz-badge-status commande">
                            <Clock size={12} /> COMMANDÉ USINE
                          </span>
                        )}
                        {vehicle.stockStatus === "SUR_COMMANDE_USINE" && (
                          <span className="cz-badge-status usine">
                            <Sparkles size={12} /> SUR COMMANDE USINE
                          </span>
                        )}
                      </div>

                      {/* ENERGY BADGE */}
                      <span
                        className={`cz-badge-energy ${
                          vehicle.energy === "ELECTRIQUE"
                            ? "electrique"
                            : vehicle.energy === "HYBRIDE"
                            ? "hybride"
                            : vehicle.energy === "DIESEL"
                            ? "diesel"
                            : "essence"
                        }`}
                      >
                        <Fuel size={11} /> {vehicle.energy}
                      </span>
                    </div>

                    {/* CLICK TO VIEW HINT */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        right: "0.75rem",
                        background: "rgba(6,14,22,0.75)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(160,210,230,0.2)",
                        color: "#e2e8f0",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Sparkles size={12} color="#f59e0b" /> Galerie 360° & Fiche
                    </div>
                  </div>

                  {/* DETAILS CONTAINER */}
                  <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {vehicle.brand}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                        {vehicle.year} · {vehicle.category}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "#ffffff",
                        marginBottom: "0.3rem",
                        lineHeight: 1.25,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setDetailVehicle(vehicle);
                        setSelectedPhotoIndex(0);
                      }}
                    >
                      {vehicle.model}
                    </h3>

                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.9rem", minHeight: "2rem" }}>
                      {vehicle.variant}
                    </p>

                    {/* PRIX ET INFORMATION DE LIVRAISON */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.65rem 0.85rem",
                        background: "rgba(6,15,24,0.7)",
                        borderRadius: "8px",
                        border: "1px solid rgba(160,210,230,0.1)",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                          {vehicle.priceXof ? "Tarif Officiel" : "Disponibilité"}
                        </div>
                        <div style={{ fontSize: "1.15rem", fontWeight: 900, color: vehicle.priceXof ? "#f59e0b" : "#cbd5e1" }}>
                          {formattedPrice}
                        </div>
                      </div>

                      {vehicle.stockStatus === "EN_TRANSIT" && eta && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 700 }}>ARRIVAGE PRÉVU</div>
                          <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 800 }}>{eta}</div>
                        </div>
                      )}
                      {vehicle.stockStatus === "SHOWROOM" && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 700 }}>LIVRAISON</div>
                          <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 800 }}>Immédiate 24/48h</div>
                        </div>
                      )}
                    </div>

                    {/* QUICK SPECS PILLS */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.5rem",
                        marginBottom: "1.2rem",
                        padding: "0.65rem 0.75rem",
                        background: "rgba(6,15,24,0.4)",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        color: "#cbd5e1",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Gauge size={14} color="#f59e0b" />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {vehicle.motorisation.maxPower.split("(")[1]?.replace(")", "") || vehicle.motorisation.maxPower}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <SlidersHorizontal size={14} color="#38bdf8" />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {vehicle.motorisation.transmission.includes("Auto") ? "Automatique" : "Manuelle"}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS BAR */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "auto" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                        <button
                          onClick={() => {
                            setDetailVehicle(vehicle);
                            setSelectedPhotoIndex(0);
                          }}
                          className="cz-btn-outline"
                          style={{ padding: "0.65rem 0.8rem", fontSize: "0.82rem" }}
                        >
                          Fiche & Photos
                        </button>
                        <button
                          onClick={() => {
                            setQuoteVehicle(vehicle);
                            setFormSuccess(false);
                            setCatalogModalOpen(true);
                          }}
                          className="cz-btn-primary"
                          style={{ padding: "0.65rem 0.8rem", fontSize: "0.82rem" }}
                        >
                          {vehicle.stockStatus === "EN_TRANSIT"
                            ? "Réserver avant arrivage"
                            : vehicle.stockStatus === "AU_PORT"
                            ? "Bloquer réservation"
                            : "Cotation 1 Clic"}
                        </button>
                      </div>

                      <a
                        href={getWhatsAppLink(vehicle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cz-btn-whatsapp"
                        style={{ padding: "0.65rem 1rem", fontSize: "0.82rem", width: "100%" }}
                      >
                        <MessageSquare size={14} /> Échanger sur WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. COMMANDE SUR-MESURE D'USINE */}
      <section id="sur-mesure" style={{ background: "#07121b", borderTop: "1px solid rgba(160,210,230,0.1)", borderBottom: "1px solid rgba(160,210,230,0.1)", padding: "5rem 1.25rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f59e0b", fontWeight: 700, fontSize: "0.88rem", textTransform: "uppercase" }}>
              <Sparkles size={16} /> Exclusivité CARZONE Bénin
            </div>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#fff", marginTop: "0.4rem", lineHeight: 1.15 }}>
              Commande Personnalisée <br />
              <span style={{ color: "#e11d48" }}>Directe d&apos;Usine</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, marginTop: "1rem" }}>
              Vous avez une configuration précise en tête ? CARZONE assure l&apos;importation directe depuis les usines constructeurs (Chine, Dubaï, Europe, Japon).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <strong style={{ color: "#fff" }}>Choix intégral des finitions :</strong>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Teintes de carrosserie exclusives, intérieurs cuir Nappa bicolore, toits panoramiques, jantes sur-mesure.</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <strong style={{ color: "#fff" }}>Logistique & Transit maritime sécurisé :</strong>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Suivi en temps réel de votre conteneur avec traçabilité complète de l&apos;usine jusqu&apos;au Port Autonome de Cotonou.</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <strong style={{ color: "#fff" }}>Livraison Clé en Main :</strong>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Dédouanement, formalités administratives, immatriculation Bénin et préparation esthétique showroom inclus.</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "2.5rem" }}>
              <button
                onClick={() => {
                  setQuoteVehicle(null);
                  setFormData((prev) => ({ ...prev, notes: "Demande de commande personnalisée sur-mesure d'usine" }));
                  setFormSuccess(false);
                  setCatalogModalOpen(true);
                }}
                className="cz-btn-primary"
                style={{ padding: "0.9rem 1.8rem" }}
              >
                Configurer une Commande Usine <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="cz-card-glass" style={{ padding: "2.5rem", position: "relative" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>
              Demande Rapide de Personnalisation
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Indiquez le véhicule et vos options souhaitées. Un spécialiste import CARZONE vous contacte sous 2 heures avec le devis usine détaillé.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="cz-btn-whatsapp"
                style={{ width: "100%", padding: "0.9rem" }}
              >
                <MessageSquare size={18} /> Discuter de votre projet sur WhatsApp
              </a>
              <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>ou appelez notre direction des ventes :</div>
              <a
                href="tel:+2290192616161"
                className="cz-btn-outline"
                style={{ width: "100%", padding: "0.9rem" }}
              >
                <Phone size={18} color="#f59e0b" /> +229 01 92 61 61 61
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ATELIER SAV, PIÈCES ET SERVICES */}
      <section id="services" style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.25rem" }}>
        <div style={{ textAlign: "center", maxWidth: 750, margin: "0 auto 3.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", color: "#e11d48", fontWeight: 700, fontSize: "0.88rem", textTransform: "uppercase" }}>
            <Wrench size={16} /> Excellence Technique
          </div>
          <h2 style={{ fontSize: "2.3rem", fontWeight: 900, color: "#fff", marginTop: "0.3rem" }}>
            Atelier SAV Certifié & Pièces d&apos;Origine
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1rem", marginTop: "0.8rem" }}>
            Notre engagement ne s&apos;arrête pas à la vente. CARZONE dispose d&apos;un atelier ultra-moderne équipé des dernières valises de diagnostic constructeur.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.8rem" }}>
          <div className="cz-card-glass" style={{ padding: "2rem" }}>
            <div style={{ width: 50, height: 50, borderRadius: "12px", background: "rgba(225,29,72,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Gauge size={26} color="#e11d48" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.6rem" }}>
              Diagnostic Électronique Haute Précision
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Bancs de test électroniques certifiés multimarques pour la détection et la mise à jour des calculateurs, systèmes hybrides et batteries.
            </p>
          </div>

          <div className="cz-card-glass" style={{ padding: "2rem" }}>
            <div style={{ width: 50, height: 50, borderRadius: "12px", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Award size={26} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.6rem" }}>
              Magasin Pièces de Rechange d&apos;Origine
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Stock permanent de pièces d&apos;origine garanties constructeur : filtres, plaquettes de frein, suspensions, optiques et accessoires officiels.
            </p>
          </div>

          <div className="cz-card-glass" style={{ padding: "2rem" }}>
            <div style={{ width: 50, height: 50, borderRadius: "12px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <ShieldCheck size={26} color="#10b981" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.6rem" }}>
              Contrats d&apos;Entretien & Suivi Flotte
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Formules sur-mesure pour les entreprises et particuliers : vidange rapide, révision périodique garantie et assistance routière 24/7 au Bénin.
            </p>
          </div>
        </div>
      </section>

      {/* 7. MOBILITÉ ÉLECTRIQUE & BORNES DE RECHARGE */}
      <section id="recharge" style={{ background: "linear-gradient(180deg, #07131f 0%, #060d14 100%)", padding: "5rem 1.25rem", borderTop: "1px solid rgba(160,210,230,0.1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#34d399", fontWeight: 700, fontSize: "0.88rem", textTransform: "uppercase" }}>
              <Zap size={16} /> Transition Énergétique & Mobilité Verte
            </div>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 900, color: "#fff", marginTop: "0.4rem", lineHeight: 1.2 }}>
              Solutions de Recharge <br />
              <span style={{ color: "#34d399" }}>Véhicules Électriques (VE)</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, marginTop: "1rem" }}>
              Pionnier de la mobilité électrique à Cotonou, CARZONE propose une gamme complète de bornes intelligentes AC/DC (7kW à 120kW ultra-rapides) pour résidences, hôtels et entreprises.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1.75rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "#e2e8f0" }}>
                <CheckCircle2 size={18} color="#34d399" /> Bornes de recharge à domicile (Wallbox 7kW à 22kW)
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "#e2e8f0" }}>
                <CheckCircle2 size={18} color="#34d399" /> Superchargeurs DC rapides pour flottes et parkings publics
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "#e2e8f0" }}>
                <CheckCircle2 size={18} color="#34d399" /> Installation électrique certifiée par des techniciens habilités
              </div>
            </div>

            <div style={{ marginTop: "2.5rem" }}>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="cz-btn-whatsapp"
                style={{ padding: "0.85rem 1.8rem" }}
              >
                <Zap size={16} /> Demander une Étude d&apos;Installation Borne
              </a>
            </div>
          </div>

          <div className="cz-card-glass" style={{ padding: "2.5rem", border: "1px solid rgba(52,211,153,0.3)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
              Le Réseau de Recharge CARZONE à Cotonou
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Rechargez votre véhicule 100% électrique ou hybride rechargeable (BYD, Geely Galaxy, etc.) directement au Showroom Carzone en moins de 35 minutes.
            </p>

            <div style={{ background: "rgba(6,15,24,0.7)", borderRadius: "12px", padding: "1.25rem", border: "1px solid rgba(160,210,230,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>Station Carzone Maro-Militaire</span>
                <span style={{ color: "#34d399", fontSize: "0.78rem", fontWeight: 800, background: "rgba(52,211,153,0.15)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>EN LIGNE</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Connecteurs Combo CCS2 & Type 2 compatibles avec toutes les marques.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT & SHOWROOM LOCALISATION */}
      <section id="contact" style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e11d48", fontWeight: 700, fontSize: "0.88rem", textTransform: "uppercase" }}>
              <MapPin size={16} /> Nous Rendre Visite
            </div>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 900, color: "#fff", marginTop: "0.4rem" }}>
              Showroom & Direction Générale
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, marginTop: "0.8rem" }}>
              Venez découvrir nos véhicules en conditions réelles et réaliser un essai sur route dans notre showroom de prestige à Cotonou.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "2rem" }}>
              <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: "10px", background: "rgba(225,29,72,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={20} color="#e11d48" />
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>Adresse du Showroom :</strong>
                  <div style={{ color: "#94a3b8", fontSize: "0.92rem", marginTop: "0.2rem" }}>
                    Zone Maro-Militaire, Quartier Gbèdomidji, Cotonou, République du Bénin
                  </div>
                  <a
                    href="https://maps.app.goo.gl/ie79JAW6ri2km8Qx8?g_st=ac"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#38bdf8", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.35rem" }}
                  >
                    Ouvrir dans Google Maps <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: "10px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={20} color="#10b981" />
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>Lignes Téléphoniques Officielles :</strong>
                  <div style={{ color: "#94a3b8", fontSize: "0.92rem", marginTop: "0.2rem" }}>
                    +229 01 92 61 61 61 / +229 01 63 70 00 00 / +229 01 92 62 62 62
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: "10px", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mail size={20} color="#f59e0b" />
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>Courriers Électroniques :</strong>
                  <div style={{ color: "#94a3b8", fontSize: "0.92rem", marginTop: "0.2rem" }}>
                    contact@topcarzone.com / direction@topcarzone.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT DIRECT FORM */}
          <div className="cz-card-glass" style={{ padding: "2.5rem" }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.4rem" }}>
              Écrivez-nous Directement
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              Notre équipe commerciale vous répond sous quelques minutes.
            </p>

            <form onSubmit={handleQuoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="cz-label">Votre Nom et Prénoms *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : M. KOUASSI Jean"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="cz-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="cz-label">Téléphone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="cz-input"
                  />
                </div>
                <div>
                  <label className="cz-label">Email Professionnel</label>
                  <input
                    type="email"
                    placeholder="jean@domaine.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="cz-input"
                  />
                </div>
              </div>

              <div>
                <label className="cz-label">Votre Message ou Véhicule recherché</label>
                <textarea
                  rows={3}
                  placeholder="Précisez le véhicule ou votre besoin..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="cz-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              {formError && (
                <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "0.6rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                  {formError}
                </div>
              )}

              {formSuccess ? (
                <div style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                  <CheckCircle2 size={24} color="#10b981" style={{ margin: "0 auto 0.4rem" }} />
                  <strong>Message bien transmis !</strong>
                  <div style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>L&apos;équipe commerciale CARZONE vous contacte dans les plus brefs délais.</div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="cz-btn-primary"
                  style={{ width: "100%", padding: "0.85rem" }}
                >
                  {formSubmitting ? "Envoi en cours..." : "Envoyer ma Demande"} <Send size={16} />
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer style={{ background: "#04080e", borderTop: "1px solid rgba(160,210,230,0.1)", padding: "4rem 1.25rem 2rem", color: "#64748b", fontSize: "0.88rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2.5rem", marginBottom: "3rem" }}>
          <div>
            <CarzoneLogo size="md" />
            <p style={{ marginTop: "1rem", lineHeight: 1.6, color: "#94a3b8" }}>
              CARZONE SARL — Concessionnaire automobile multimarques de premier plan en République du Bénin. Vente, atelier SAV, pièces d&apos;origine et recharge électrique.
            </p>
            <div style={{ marginTop: "1rem", fontSize: "0.78rem" }}>
              RCCM : RB/COT/23 B 34567 · IFU : 0202314589201
            </div>
          </div>

          <div>
            <strong style={{ color: "#fff", display: "block", marginBottom: "1rem", textTransform: "uppercase", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
              Nos Marques Partenaires
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span>Changan Automobile</span>
              <span>Jetour Auto</span>
              <span>Geely Auto & Galaxy</span>
              <span>BYD (Build Your Dreams)</span>
              <span>BAIC Motor</span>
              <span>Forthing / Dongfeng</span>
              <span>Toyota</span>
            </div>
          </div>

          <div>
            <strong style={{ color: "#fff", display: "block", marginBottom: "1rem", textTransform: "uppercase", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
              Navigation Rapide
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a href="#showroom" style={{ color: "#94a3b8", textDecoration: "none" }}>Stock Showroom & Arrivages</a>
              <a href="#sur-mesure" style={{ color: "#94a3b8", textDecoration: "none" }}>Commande Spéciale d&apos;Usine</a>
              <a href="#services" style={{ color: "#94a3b8", textDecoration: "none" }}>Atelier SAV & Diagnostics</a>
              <a href="#recharge" style={{ color: "#94a3b8", textDecoration: "none" }}>Solutions de Recharge VE</a>
              <Link href="/login" style={{ color: "#e11d48", textDecoration: "none", fontWeight: 700 }}>Espace Collaborateur (Connexion)</Link>
            </div>
          </div>

          <div>
            <strong style={{ color: "#fff", display: "block", marginBottom: "1rem", textTransform: "uppercase", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
              Contact Immédiat
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <span>Showroom : Gbèdomidji, Cotonou</span>
              <span>Tél : +229 01 92 61 61 61</span>
              <span>Email : contact@topcarzone.com</span>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#34d399", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.5rem" }}
              >
                <MessageSquare size={14} /> WhatsApp Assistance 24/7
              </a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <div>© {new Date().getFullYear()} CARZONE SARL. Tous droits réservés. Cotonou, Bénin.</div>
          <div>Plateforme Officielle reliée au Système d&apos;Information & Stock Central CARZONE.</div>
        </div>
      </footer>

      {/* 10. FLOATING WHATSAPP PILL BUTTON */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="cz-floating-whatsapp"
        title="Discuter directement avec un conseiller commercial"
      >
        <span className="cz-online-dot" />
        <MessageSquare size={18} />
        <span>Conseiller en ligne</span>
      </a>

      {/* 11. MODAL : DETAIL & 360° INSPECTION DU VÉHICULE */}
      {detailVehicle && (
        <div className="cz-modal-backdrop" onClick={() => setDetailVehicle(null)}>
          <div
            className="cz-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 950 }}
          >
            {/* MODAL HEADER */}
            <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid rgba(160,210,230,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#07111b" }}>
              <div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {detailVehicle.brand} · {detailVehicle.category}
                  </span>
                  {detailVehicle.stockStatus === "SHOWROOM" && (
                    <span className="cz-badge-status stock"><CheckCircle2 size={11} /> EN STOCK SHOWROOM</span>
                  )}
                  {detailVehicle.stockStatus === "EN_TRANSIT" && (
                    <span className="cz-badge-status transit"><Ship size={11} /> EN TRANSIT</span>
                  )}
                  {detailVehicle.stockStatus === "AU_PORT" && (
                    <span className="cz-badge-status port"><Anchor size={11} /> AU PORT</span>
                  )}
                  {detailVehicle.stockStatus === "COMMANDE" && (
                    <span className="cz-badge-status commande"><Clock size={11} /> COMMANDÉ</span>
                  )}
                </div>

                <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#fff", margin: 0 }}>
                  {detailVehicle.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailVehicle(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: "1.75rem", overflowY: "auto" }}>
              {/* EN-TÊTE STATUT DU VÉHICULE & DISPONIBILITÉ */}
              <div
                style={{
                  background: detailVehicle.stockStatus === "EN_TRANSIT"
                    ? "rgba(14,165,233,0.12)"
                    : detailVehicle.stockStatus === "SHOWROOM"
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(245,158,11,0.12)",
                  border: detailVehicle.stockStatus === "EN_TRANSIT"
                    ? "1px solid rgba(14,165,233,0.3)"
                    : detailVehicle.stockStatus === "SHOWROOM"
                    ? "1px solid rgba(16,185,129,0.3)"
                    : "1px solid rgba(245,158,11,0.3)",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.85rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase" }}>
                    Situation du Véhicule
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginTop: "0.2rem" }}>
                    {detailVehicle.stockStatus === "SHOWROOM" && "🟢 Disponible immédiatement au Showroom de Gbèdomidji (Cotonou)"}
                    {detailVehicle.stockStatus === "EN_TRANSIT" && `🚢 En transit maritime vers Cotonou${detailVehicle.etaDate ? ` · Arrivage prévu le ${formatEtaDate(detailVehicle.etaDate)}` : ""}`}
                    {detailVehicle.stockStatus === "AU_PORT" && "⚓ Arrivé au Port Autonome de Cotonou · Dédouanement en cours"}
                    {detailVehicle.stockStatus === "COMMANDE" && "🏭 Commandé d'usine · En cours d'assemblage constructeur"}
                    {detailVehicle.stockStatus === "SUR_COMMANDE_USINE" && "✨ Disponible sur commande directe usine (Délai : 4 à 6 semaines)"}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Tarif Officiel</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#f59e0b" }}>
                    {formatPriceXof(detailVehicle.priceXof)}
                  </div>
                </div>
              </div>

              {/* MAIN ACTIVE PHOTO */}
              <div style={{ position: "relative", width: "100%", height: 380, borderRadius: "14px", overflow: "hidden", background: "#050b11", marginBottom: "1rem" }}>
                <Image
                  src={detailPhotos[selectedPhotoIndex] || detailVehicle.photos.mainPhotoUrl}
                  alt={detailVehicle.title}
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* THUMBNAIL GALLERY */}
              {detailPhotos.length > 1 && (
                <div style={{ display: "flex", gap: "0.6rem", overflowX: "auto", marginBottom: "1.8rem" }}>
                  {detailPhotos.map((photoUrl, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setSelectedPhotoIndex(pIdx)}
                      style={{
                        position: "relative",
                        width: 80,
                        height: 55,
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: selectedPhotoIndex === pIdx ? "2px solid #e11d48" : "1px solid rgba(160,210,230,0.2)",
                        cursor: "pointer",
                        background: "#08121a",
                        flexShrink: 0,
                      }}
                    >
                      <Image src={photoUrl} alt="Vignette" fill unoptimized style={{ objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}

              {/* TECHNICAL SPECIFICATIONS GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="cz-card-glass" style={{ padding: "1.25rem" }}>
                  <strong style={{ color: "#e11d48", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                    <Gauge size={16} /> Motorisation & Performance
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
                    <div><span style={{ color: "#64748b" }}>Moteur :</span> <strong style={{ color: "#fff" }}>{detailVehicle.motorisation.displacementOrMotor}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Puissance :</span> <strong style={{ color: "#fff" }}>{detailVehicle.motorisation.maxPower}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Couple max :</span> <strong style={{ color: "#fff" }}>{detailVehicle.motorisation.maxTorque}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Transmission :</span> <strong style={{ color: "#fff" }}>{detailVehicle.motorisation.transmission}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Énergie :</span> <strong style={{ color: "#fff" }}>{detailVehicle.motorisation.fuelType}</strong></div>
                  </div>
                </div>

                <div className="cz-card-glass" style={{ padding: "1.25rem" }}>
                  <strong style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                    <SlidersHorizontal size={16} /> Dimensions & Habitabilité
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
                    <div><span style={{ color: "#64748b" }}>L x l x h (mm) :</span> <strong style={{ color: "#fff" }}>{detailVehicle.dimensions.lengthWidthHeight}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Empattement :</span> <strong style={{ color: "#fff" }}>{detailVehicle.dimensions.wheelbase} mm</strong></div>
                    <div><span style={{ color: "#64748b" }}>Places assises :</span> <strong style={{ color: "#fff" }}>{detailVehicle.dimensions.seats} places</strong></div>
                    <div><span style={{ color: "#64748b" }}>Portes :</span> <strong style={{ color: "#fff" }}>{detailVehicle.dimensions.doors} portes</strong></div>
                    <div><span style={{ color: "#64748b" }}>Réservoir/Batterie :</span> <strong style={{ color: "#fff" }}>{detailVehicle.dimensions.tankOrBattery}</strong></div>
                  </div>
                </div>
              </div>

              {/* COMFORT & SAFETY LISTS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={16} color="#f59e0b" /> Équipements de Confort & Technologie
                  </h4>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {detailVehicle.equipementConfort.map((item, iIdx) => (
                      <li key={iIdx} style={{ marginBottom: "0.3rem" }}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ShieldCheck size={16} color="#10b981" /> Sécurité & Aides à la Conduite (ADAS)
                  </h4>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {detailVehicle.securite.map((item, sIdx) => (
                      <li key={sIdx} style={{ marginBottom: "0.3rem" }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER WITH INSTANT ACTION BAR */}
            <div style={{ padding: "1.25rem 1.75rem", borderTop: "1px solid rgba(160,210,230,0.12)", background: "#07111b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                Garantie constructeur officielle incluse · Véhicule neuf 0 km
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="cz-btn-outline"
                  style={{ padding: "0.75rem 1.1rem", fontSize: "0.88rem" }}
                  title="Imprimer ou enregistrer en PDF la fiche technique officielle"
                >
                  <FileText size={16} color="#f59e0b" /> Fiche Technique (PDF)
                </button>
                <a
                  href={getWhatsAppLink(detailVehicle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cz-btn-whatsapp"
                  style={{ padding: "0.75rem 1.25rem", fontSize: "0.88rem" }}
                >
                  <MessageSquare size={16} /> WhatsApp Direct
                </a>
                <button
                  onClick={() => {
                    setQuoteVehicle(detailVehicle);
                    setDetailVehicle(null);
                    setFormSuccess(false);
                    setCatalogModalOpen(true);
                  }}
                  className="cz-btn-primary"
                  style={{ padding: "0.75rem 1.4rem", fontSize: "0.88rem" }}
                >
                  {detailVehicle.stockStatus === "EN_TRANSIT"
                    ? "Réserver avant arrivage"
                    : detailVehicle.stockStatus === "AU_PORT"
                    ? "Bloquer réservation"
                    : "Demander une Cotation Immédiate"} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL : DEMANDE DE COTATION OU RÉSERVATION */}
      {catalogModalOpen && (
        <div className="cz-modal-backdrop" onClick={() => setCatalogModalOpen(false)}>
          <div
            className="cz-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 550 }}
          >
            {/* HEADER */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(160,210,230,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#07111b" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {quoteVehicle?.stockStatus === "EN_TRANSIT"
                    ? "Réservation Anticipée en Transit"
                    : quoteVehicle?.stockStatus === "SHOWROOM"
                    ? "Devis Proforma Showroom"
                    : "Cotation & Commande Véhicule"}
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#fff", margin: "0.2rem 0 0" }}>
                  {quoteVehicle ? quoteVehicle.title : "Demande de Devis & Catalogue CARZONE"}
                </h3>
              </div>
              <button
                onClick={() => setCatalogModalOpen(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* FORM OR SUCCESS BODY */}
            <div style={{ padding: "1.75rem" }}>
              {formSuccess ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                    {quoteVehicle?.stockStatus === "EN_TRANSIT"
                      ? "Votre demande de réservation a été enregistrée !"
                      : "Votre demande de cotation a été transmise !"}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
                    Notre équipe commerciale prépare votre cotation chiffrée avec les délais de livraison showroom. Un conseiller va vous joindre très rapidement.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "2rem" }}>
                    <a
                      href={getWhatsAppLink(quoteVehicle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cz-btn-whatsapp"
                      style={{ width: "100%", padding: "0.85rem" }}
                    >
                      <MessageSquare size={16} /> Accélérer mon dossier sur WhatsApp
                    </a>
                    <button
                      onClick={() => setCatalogModalOpen(false)}
                      className="cz-btn-outline"
                      style={{ width: "100%", padding: "0.75rem" }}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {quoteVehicle && (
                    <div style={{ background: "rgba(6,15,24,0.7)", padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(160,210,230,0.15)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{ position: "relative", width: 64, height: 48, borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                          <Image src={quoteVehicle.photos.mainPhotoUrl} alt={quoteVehicle.title} fill unoptimized style={{ objectFit: "cover" }} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff" }}>{quoteVehicle.title}</div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#f59e0b" }}>
                            {formatPriceXof(quoteVehicle.priceXof)}
                          </div>
                        </div>
                      </div>

                      {/* NOTICE PROFESSIONNELLE SUR LA SITUATION DU VÉHICULE */}
                      {quoteVehicle.stockStatus === "EN_TRANSIT" && (
                        <div style={{ marginTop: "0.65rem", padding: "0.55rem 0.75rem", background: "rgba(14,165,233,0.15)", borderRadius: "6px", border: "1px solid rgba(14,165,233,0.3)", fontSize: "0.78rem", color: "#38bdf8", lineHeight: 1.4 }}>
                          🚢 <strong>Véhicule en cours d&apos;acheminement maritime :</strong> Arrivage estimé au Port de Cotonou le <strong>{formatEtaDate(quoteVehicle.etaDate)}</strong>. En remplissant ce formulaire, vous recevez la proforma pour bloquer votre réservation prioritaire.
                        </div>
                      )}
                      {quoteVehicle.stockStatus === "SHOWROOM" && (
                        <div style={{ marginTop: "0.65rem", padding: "0.55rem 0.75rem", background: "rgba(16,185,129,0.15)", borderRadius: "6px", border: "1px solid rgba(16,185,129,0.3)", fontSize: "0.78rem", color: "#34d399", lineHeight: 1.4 }}>
                          🟢 <strong>Disponible immédiatement :</strong> Ce véhicule est présent au Showroom de Gbèdomidji (Cotonou). Livraison rapide sous 24h à 48h.
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="cz-label">Nom et Prénoms / Société *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : M. ADEOTI Paul"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="cz-input"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div>
                      <label className="cz-label">Téléphone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+229 97 00 00 00"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="cz-input"
                      />
                    </div>
                    <div>
                      <label className="cz-label">Email</label>
                      <input
                        type="email"
                        placeholder="paul@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="cz-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div>
                      <label className="cz-label">Type d&apos;Acquisition</label>
                      <select
                        value={formData.paymentType}
                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                        className="cz-input"
                      >
                        <option value="Comptant">Paiement Comptant</option>
                        <option value="Crédit Bancaire">Crédit Bancaire / Leasing</option>
                        <option value="Flotte Entreprise">Flotte Société / Appel d&apos;offres</option>
                      </select>
                    </div>
                    <div>
                      <label className="cz-label">Ville de Livraison</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="cz-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="cz-label">Précisions ou Options Souhaitées (Optionnel)</label>
                    <textarea
                      rows={2}
                      placeholder="Ex : Couleur préférée, acompte de réservation..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="cz-input"
                      style={{ resize: "none" }}
                    />
                  </div>

                  {formError && (
                    <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "0.6rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="cz-btn-primary"
                    style={{ width: "100%", padding: "0.9rem", marginTop: "0.5rem" }}
                  >
                    {formSubmitting
                      ? "Traitement en cours..."
                      : quoteVehicle?.stockStatus === "EN_TRANSIT"
                      ? "Recevoir la Proforma & Réserver"
                      : "Recevoir ma Cotation Immédiate"} <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
