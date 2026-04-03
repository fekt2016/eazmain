# Saiisaiweb SEO QA Checklist

Use this checklist after SEO changes to confirm route metadata is working.

## Quick Setup

1. Start app in dev mode.
2. Open Chrome DevTools on each route.
3. In Console, run:

```js
(() => {
  const read = (sel, attr = 'content') =>
    document.querySelector(sel)?.getAttribute(attr) || null;
  return {
    title: document.title,
    canonical: read('link[rel="canonical"]', 'href'),
    description: read('meta[name="description"]'),
    robots: read('meta[name="robots"]'),
    ogTitle: read('meta[property="og:title"]'),
    ogUrl: read('meta[property="og:url"]'),
    twitterTitle: read('meta[name="twitter:title"]'),
  };
})();
```

## Public Routes (should be indexable)

- `/`
  - robots: `null` (or no noindex)
  - canonical ends with `/`
- `/products`
  - title includes `Products`
- `/products/<id>`
  - title is product-related (fallback may be home until product-specific SEO is injected)
- `/categories/<id>`
  - title is category-related (or valid fallback)
- `/sellers/<id>`
  - title is seller/shop-related (or valid fallback)
- `/search?q=phone`
  - title includes `Search Results for "phone"`
  - canonical includes `?q=phone`
- `/about`, `/contact`, `/help`, `/blog`
  - title and description match page intent

## Private/Auth Routes (should be noindex)

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/cart`
- `/checkout`
- `/order-confirmation`
- `/orders`
- `/orders/<id>`
- `/profile`
- `/profile/addresses`
- `/profile/payment-methods`
- `/wishlist`
- `/notifications`
- `/support`

Expected:
- robots includes `noindex` (and optionally `nofollow`)
- canonical points to current route

## Edge Route Checks

- `/register` should behave like `/signup`.
- `/product/<id>` should behave like `/products/<id>`.
- `/category/<id>` should behave like `/categories/<id>`.
- `/seller/<id>` should behave like `/sellers/<id>`.
- Unknown route should render not found page SEO safely.

## Regression Signals

If any of these happen, SEO mapping likely regressed:

- Title stays the same across route changes.
- Canonical remains on previous route.
- Private pages lack `noindex`.
- Search route does not reflect query in title/canonical.
- OG/Twitter title does not match current route title.
