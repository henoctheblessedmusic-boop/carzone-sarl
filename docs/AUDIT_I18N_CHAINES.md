# Audit i18n & humanisation — chaînes visibles (approx.)

> Étape 0 (aucune modification de code). Comptage heuristique : littéraux de chaîne de 12+ caractères avec 3+ mots + texte JSX. Volume approximatif, hors fichiers factuels.

## Synthèse

| Indicateur | Valeur |
|---|---|
| Fichiers avec texte visible | 131 |
| Chaînes UI approximatives | 10735 |
| Fichiers factuels exclus de l'humanisation | 6 (1014 chaînes : specs véhicules, matrice atelier, prompts IA) |
| Dictionnaires i18n existants | fr.ts, en.ts (2 langues, ~160 clés) — zh absent |
| Fichiers branchés sur l'i18n | 6 (AppShell, login, OnboardingHost, PrefsProvider, layout, lib/i18n) |

## Volume par groupe

| Groupe | Chaînes | Fichiers |
|---|---|---|
| components | 2604 | 25 |
| app/quotes | 945 | 6 |
| app/hr | 724 | 4 |
| app/invoices | 704 | 7 |
| app/chat | 676 | 5 |
| lib | 616 | 21 |
| app/workshop | 538 | 5 |
| app/clients | 522 | 4 |
| app/parts | 470 | 3 |
| app/vehicles | 381 | 4 |
| app/users | 351 | 3 |
| app/expenses | 343 | 3 |
| app/api | 246 | 15 |
| app/presentation | 189 | 2 |
| app/services | 179 | 3 |
| app/dashboard | 174 | 1 |
| app/charge-requests | 169 | 1 |
| app/mailbox | 164 | 3 |
| app/terminal | 159 | 1 |
| app/leads | 142 | 3 |
| app/catalog | 93 | 1 |
| app/imports | 57 | 1 |
| app/opportunities | 52 | 1 |
| app/charging | 50 | 1 |
| app/login | 43 | 2 |
| app/fleet | 42 | 1 |
| app/rentals | 42 | 1 |
| app/installers | 28 | 1 |
| middleware.ts | 25 | 1 |
| app | 7 | 2 |

## Détail par fichier

| Fichier | Chaînes (approx.) |
|---|---|
| components/PublicShowcase.tsx | 587 |
| app/hr/HRView.tsx | 466 |
| app/workshop/WorkshopView.tsx | 427 |
| app/parts/PartsView.tsx | 399 |
| app/quotes/QuoteCreator.tsx | 369 |
| app/chat/ChatView.tsx | 346 |
| app/expenses/ExpensesView.tsx | 326 |
| app/clients/ClientsView.tsx | 320 |
| app/vehicles/VehiclesView.tsx | 319 |
| app/users/UsersView.tsx | 295 |
| app/invoices/InvoicesView.tsx | 230 |
| components/workshop/WorkshopTabletModal.tsx | 225 |
| app/quotes/QuotesView.tsx | 218 |
| components/GlobalCallManager.tsx | 211 |
| app/quotes/QuoteEditorModal.tsx | 201 |
| components/DevicePermissionsSetup.tsx | 197 |
| app/hr/components/PayrollTab.tsx | 195 |
| lib/onboarding.ts | 188 |
| app/presentation/PresentationClient.tsx | 187 |
| components/ExecutiveDashboardCharts.tsx | 178 |
| app/dashboard/page.tsx | 174 |
| components/VehicleTechSheetPrint.tsx | 174 |
| app/charge-requests/page.tsx | 169 |
| app/invoices/[id]/print/page.tsx | 166 |
| app/clients/[id]/page.tsx | 162 |
| app/terminal/page.tsx | 159 |
| app/services/ServicesView.tsx | 157 |
| app/chat/components/ConferenceRoomView.tsx | 154 |
| app/chat/components/CallHistoryView.tsx | 151 |
| components/workshop/FicheInterventionPrint.tsx | 144 |
| app/mailbox/MailboxView.tsx | 143 |
| components/workshop/FicheEntretienSystematiquePrint.tsx | 138 |
| app/invoices/FinancialBilanTab.tsx | 133 |
| components/HelpCenterModal.tsx | 128 |
| app/leads/LeadsView.tsx | 114 |
| lib/excel-workshop.ts | 112 |
| app/quotes/[id]/print/page.tsx | 99 |
| app/catalog/page.tsx | 93 |
| components/TechSheetActionBar.tsx | 87 |
| app/invoices/PaymentModal.tsx | 80 |
| app/workshop/actions.ts | 74 |
| components/DashboardActivityChart.tsx | 73 |
| components/OnboardingHost.tsx | 73 |
| components/AppShellClient.tsx | 66 |
| components/AdminNotificationsBell.tsx | 65 |
| app/invoices/payments/[id]/receipt/page.tsx | 61 |
| app/parts/actions.ts | 61 |
| app/api/calls/route.ts | 59 |
| app/imports/page.tsx | 57 |
| app/vehicles/actions.ts | 55 |
| components/ChangePasswordModal.tsx | 55 |
| app/opportunities/page.tsx | 52 |
| app/users/actions.ts | 52 |
| components/TechSheetAIActions.tsx | 52 |
| app/charging/page.tsx | 50 |
| app/quotes/actions.ts | 49 |
| app/hr/actions.ts | 47 |
| app/fleet/page.tsx | 42 |
| app/rentals/page.tsx | 42 |
| lib/brand-logos.tsx | 42 |
| app/clients/actions.ts | 37 |
| app/api/vapi/webhook/route.ts | 36 |
| components/PrefsControls.tsx | 34 |
| lib/role-service.ts | 34 |
| lib/permissions-config.ts | 33 |
| app/login/LoginFeedback.tsx | 31 |
| app/api/calls/conference/route.ts | 29 |
| app/invoices/actions.ts | 29 |
| lib/cgv.ts | 29 |
| app/installers/page.tsx | 28 |
| app/api/reports/financial-excel/route.ts | 26 |
| app/leads/actions.ts | 26 |
| components/BrandModelSelect.tsx | 25 |
| lib/number-to-words-fr.ts | 25 |
| middleware.ts | 25 |
| components/StickyNav.tsx | 24 |
| lib/dashboard-analytics.ts | 24 |
| app/api/auth/login/route.ts | 23 |
| lib/auth.ts | 23 |
| app/chat/actions.ts | 22 |
| app/services/actions.ts | 20 |
| app/mailbox/actions.ts | 19 |
| lib/dgi-emecef.ts | 18 |
| components/PrefsProvider.tsx | 17 |
| app/hr/page.tsx | 16 |
| app/workshop/page.tsx | 16 |
| components/CarzoneLogo.tsx | 16 |
| lib/prefs.ts | 16 |
| app/expenses/actions.ts | 15 |
| components/ui.tsx | 15 |
| lib/rate-limiter.ts | 15 |
| lib/roles.ts | 14 |
| components/AppShell.tsx | 13 |
| app/login/page.tsx | 12 |
| app/api/ai/settings/route.ts | 11 |
| app/workshop/[id]/fiche-entretien/page.tsx | 11 |
| lib/quote-discount.ts | 11 |
| app/api/public/lead/route.ts | 10 |
| app/api/terminal/pay/route.ts | 10 |
| app/parts/page.tsx | 10 |
| app/workshop/[id]/fiche-intervention/page.tsx | 10 |
| lib/i18n/index.ts | 10 |
| app/api/ai/tech-sheet/route.ts | 9 |
| app/quotes/page.tsx | 9 |
| app/api/notifications/route.ts | 8 |
| app/api/workshop/export/route.ts | 7 |
| lib/format.ts | 7 |
| lib/require-user.ts | 7 |
| app/api/chat/unread/route.ts | 6 |
| app/api/workshop/template/route.ts | 6 |
| app/vehicles/page.tsx | 6 |
| app/invoices/page.tsx | 5 |
| app/page.tsx | 5 |
| components/RootPrefs.tsx | 5 |
| app/api/terminal/meta/route.ts | 4 |
| app/users/page.tsx | 4 |
| app/chat/page.tsx | 3 |
| app/clients/page.tsx | 3 |
| lib/conference-rooms.ts | 3 |
| app/api/auth/logout/route.ts | 2 |
| app/expenses/page.tsx | 2 |
| app/layout.tsx | 2 |
| app/leads/page.tsx | 2 |
| app/mailbox/page.tsx | 2 |
| app/presentation/page.tsx | 2 |
| app/services/page.tsx | 2 |
| components/PrintButton.tsx | 2 |
| lib/billing.ts | 2 |
| lib/i18n/server.ts | 2 |
| app/vehicles/[id]/fiche-technique/page.tsx | 1 |
| lib/prisma.ts | 1 |

## Fichiers factuels à NE PAS humaniser/traduire

- $(@{Count=730; File=lib/vehicle-catalog-specs.ts}.File) — 730 chaînes factuelles (specs, références) : fidélité exigée, aucune réécriture.
- $(@{Count=82; File=lib/tech-sheet-generator.ts}.File) — 82 chaînes factuelles (specs, références) : fidélité exigée, aucune réécriture.
- $(@{Count=73; File=lib/i18n/messages/fr.ts}.File) — 73 chaînes factuelles (specs, références) : fidélité exigée, aucune réécriture.
- $(@{Count=69; File=lib/i18n/messages/en.ts}.File) — 69 chaînes factuelles (specs, références) : fidélité exigée, aucune réécriture.
- $(@{Count=47; File=lib/openai-tech-sheet.ts}.File) — 47 chaînes factuelles (specs, références) : fidélité exigée, aucune réécriture.
- $(@{Count=13; File=lib/workshop-checklist-data.ts}.File) — 13 chaînes factuelles (specs, références) : fidélité exigée, aucune réécriture.
