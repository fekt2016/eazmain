# Buyer App (saiisaiweb) – Unused Code Report

Summary of unused files that were **verified** (no imports found anywhere) and **deleted**.

---

## Deleted (unused)

| File | Verification |
|------|--------------|
| `src/features/auth/SignupPage.refactored.jsx` | Backup/refactor file, never imported. |
| `src/features/auth/SignupPage.jsx.backup` | Backup file, never imported. |
| `src/shared/services/api.js.backup` | Backup file, never imported. |
| `src/features/SupportPage.jsx` | Was imported in MainRoutes but no route used `<SupportPage />`; support path uses `CustomerSupportPage`. Removed lazy import and deleted file. |
| `src/shared/components/DealsSection.jsx` | No imports in codebase. |
| `src/shared/components/HeroSlider.jsx` | No imports in codebase. |
| `src/shared/components/TopSellers.jsx` | No imports in codebase. |
| `src/shared/components/bestSellers/BestSellerCard.jsx` | BestSellersPage uses `BestSellerSellerCard` and `BestSellersGrid`; this component was never imported. |
| `src/pages/Home.jsx` | Home route uses `features/products/HomePage.jsx`; no reference to `pages/Home.jsx`. |

**Also:** Removed the unused `SupportPage` lazy import from `src/routes/MainRoutes.jsx`.

---

## Not deleted (kept)

- **`src/data/ads/mockAds.js`** – Used in tests (e.g. `HomePage.test.jsx`). Kept.
- **Other components** under `bestSellers/` (e.g. `BestSellersGrid`, `BestSellerSellerCard`, `BestSellersHero`, etc.) – **In use** by `pages/best-sellers/BestSellersPage.jsx`. Kept.
- **Partners, Press, CustomerSupportPage** – All used in routes. Kept.

Only files with **zero** references (and backup/refactor files) were removed.
