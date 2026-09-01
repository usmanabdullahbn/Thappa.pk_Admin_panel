# Thappa Web Dashboard

React + Vite + TypeScript + TailwindCSS. Single app serving both the
**Admin** and **Business** experiences behind one login screen, routed by
the `role` returned from the backend.

## What's implemented

- Login page (toggles between Business and Admin login)
- **Admin**: businesses list (search/paginate), onboard-a-business modal,
  suspend/reactivate, platform overview KPIs
- **Business**: dashboard home (30-day stamps/redemptions/members),
  Generate Stamp QR (the counter-tablet screen — Mode A), Customers list +
  detail drawer with manual stamp adjust, Redeem Code entry, Loyalty
  Settings (stamp rule + branches)
- Axios client with automatic access-token attach + silent refresh-token
  retry on 401
- React Query for data fetching/caching

## Getting started

```bash
cp .env.example .env    # point VITE_API_BASE_URL at your backend
npm install
npm run dev               # http://localhost:5173
```

Make sure the backend (`../backend`) is running first — see its README for
setup, including `npm run seed` to create the first admin login.

## Project layout

```
src/
├── api/            # axios client + React Query hooks (per module)
├── auth/            # AuthContext, ProtectedRoute (role-guarded)
├── components/        # shared UI: Table, StatCard, Button, Input
├── features/
│   ├── LoginPage.tsx
│   ├── admin/            # BusinessesListPage, PlatformOverviewPage
│   └── business/           # DashboardHomePage, GenerateQRPage,
│                              # CustomersPage, RedeemCodeEntryPage,
│                              # LoyaltyRuleSettingsPage
├── layouts/            # AdminLayout, BusinessLayout (sidebars)
├── router.tsx            # role-guarded routes via React Router
└── main.tsx
```

## Notes

- No payment/billing UI is included — that flow is owned by the sales team
  per the Technical Guide.
- The build was verified with `npx tsc --noEmit` and `npx vite build` — both
  pass clean.
