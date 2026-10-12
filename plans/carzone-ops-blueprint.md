# Blueprint — CARZONE Ops SaaS

## Objective
Replace Djaboo with CARZONE Ops DMS + EV charging modules (install quotes, subscriptions, terminal payments).

## Steps
1. **Socle** — Next.js, Prisma, auth, roles, CLAUDE.md ✅
2. **MVP concession** — CRM, stock VIN, pipeline, devis→facture, règlements ✅
3. **Bornes devis** — installateurs panel + charge install requests ✅
4. **Bornes charge** — plans, subscriptions, terminal MM/carte, charging invoices ✅
5. **Extend** — location LCD/LLD/LOA, flotte, atelier OR, import ports ✅

## Invariants
- XOF everywhere
- Role-gated navigation
- Single customer record across sales + charging
- Accepting a quote creates an invoice automatically

## Verification
```bash
cd apps/web
npm run db:reset
npm run dev
# login igor@carzone.bj / carzone2026
```
