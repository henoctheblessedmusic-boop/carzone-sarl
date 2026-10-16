# Onboarding Guide: CARZONE SARL Ops (Cotonou)

## Overview
Plateforme interne pour CARZONE SARL (Cotonou) : gestion concession (leads → stock → closing) et écosystème bornes électriques (installateurs, abonnements kWh, paiements borne).

## Tech Stack
| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Framework | Next.js 15 App Router |
| Database | Prisma + SQLite (prod: PostgreSQL) |
| Auth | Cookie session + bcrypt |
| Currency | XOF / fr-BJ |

## Key Entry Points
- Login: `/login`
- Dashboard: `/dashboard`
- Stock: `/vehicles`
- Pipeline: `/opportunities`
- Devis/Factures: `/quotes`, `/invoices`
- Bornes: `/installers`, `/charge-requests`, `/charging`, `/terminal`
- Atelier / Import / Location / Flotte: `/workshop`, `/imports`, `/rentals`, `/fleet`

## Demo accounts
All passwords: `carzone2026`
- `igor@carzone.bj` — DG
- `basile@carzone.bj` — Compta
- `jennifer@carzone.bj` — Commercial
- `installateur@volthome.bj` — Installateur

## Sites
- Showroom & Siège : Zone Maro-Militaire, Gbèdomidji, Cotonou
- Atelier SAV : En attente de confirmation de localisation dédiée

## Fiscalité (e-MECeF)
Guide compte développeur DGI sandbox (enregistrement, JWT, URLs test/prod) : [`docs/DGI-EMECEF-COMPTE-DEVELOPPEUR-SANDBOX.md`](./DGI-EMECEF-COMPTE-DEVELOPPEUR-SANDBOX.md)
