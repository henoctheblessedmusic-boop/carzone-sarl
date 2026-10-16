# Project Instructions — CARZONE SARL Ops (Cotonou)

## Enterprise Identity
- **Société** : CARZONE SARL
- **Activité** : Concessionnaire Automobile Multimarques, Showroom Véhicules Neufs (Changan, Deepal, Jetour, BYD, Chery, Toyota...), Atelier SAV & Entretien rapide, Solutions de recharge VE
- **Showroom** : Zone Maro-Militaire, Quartier Gbèdomidji, Cotonou, Bénin
- **Atelier SAV** : En attente de confirmation de localisation dédiée
- **Google Maps** : https://maps.app.goo.gl/ie79JAW6ri2km8Qx8?g_st=ac
- **Téléphones** : +229 01 92 61 61 61 / +229 01 63 70 00 00 / +229 01 92 62 62 62
- **Email** : contact@topcarzone.com / direction@topcarzone.com
- **Site Web** : https://www.topcarzone.com
- **Réseaux Sociaux** : Instagram @carzone_229 · Facebook CarZone Cotonou
- **Fiscalité Bénin** : IFU 0202314589201 · RCCM RB/COT/23 B 34567 · NIM e-MECeF MCF01-CARZONE-BJ01

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Prisma + SQLite (local) — switch provider to postgresql for production
- Cookie session auth (HMAC) + bcrypt passwords
- Locale: fr-BJ (default UI), currency: XOF (FCFA)
- UI prefs: theme (`carzone-theme`) + language (`carzone-locale`) cookies

## Theme & i18n
- Theme: `dark` | `light` | `auto` via `data-theme` on `<html>`
- Palette: Racing Red (`#E11D48`), Deep Crimson (`#BE123C`), Carbon & Onyx (`#0B0F19`)
- Dictionaries: `apps/web/src/lib/i18n/messages/{fr,en}.ts`

## Build & Run
- Dev: `cd apps/web && npm run dev`
- DB reset+seed: `npm run db:reset`
- Seed logins :
  - `igor@carzone.bj` / `carzone2026` (Admin)
  - `contact@topcarzone.com` / `carzone2026` (Accueil & Showroom)
  - `direction@topcarzone.com` / `carzone2026` (DG)
  - `compta@carzone.bj` / `carzone2026` (Comptabilité)
  - `commercial@carzone.bj` / `carzone2026` (Commercial)
  - `stock@carzone.bj` / `carzone2026` (Gestionnaire Stock)
  - `atelier@carzone.bj` / `carzone2026` (Chef Atelier SAV)

## Project Structure
- `apps/web/src/app` — routes (dashboard, CRM, stock, finance, atelier SAV, bornes…)
- `apps/web/prisma` — schema + seed
- `plans/` — blueprints CARZONE
- `docs/` — documentation métier
