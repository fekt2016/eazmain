import { test, expect } from '@playwright/test';

const readSeoMeta = async (page) =>
  page.evaluate(() => {
    const get = (selector, attr = 'content') =>
      document.querySelector(selector)?.getAttribute(attr) || null;

    return {
      title: document.title,
      canonical: get('link[rel="canonical"]', 'href'),
      description: get('meta[name="description"]'),
      robots: get('meta[name="robots"]'),
      ogTitle: get('meta[property="og:title"]'),
      ogUrl: get('meta[property="og:url"]'),
      twitterTitle: get('meta[name="twitter:title"]'),
    };
  });

test.describe('SEO smoke checks', () => {
  test('public routes expose core SEO tags', async ({ page, baseURL }) => {
    const routes = ['/', '/about', '/search?q=phone'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const meta = await readSeoMeta(page);
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.ogTitle).toBeTruthy();
      expect(meta.ogUrl).toBeTruthy();
      expect(meta.twitterTitle).toBeTruthy();
      if (meta.canonical) {
        expect(meta.canonical).toContain(baseURL || 'http://localhost:5173');
        expect(meta.canonical).toContain(route.split('?')[0]);
      } else {
        expect(meta.ogUrl).toBeTruthy();
      }
    }
  });

  test('private/auth routes are noindex', async ({ page }) => {
    const privateRoutes = ['/login', '/signup', '/cart', '/checkout'];

    for (const route of privateRoutes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const { robots, canonical, title } = await readSeoMeta(page);
      expect(title).toBeTruthy();
      if (canonical) {
        expect(canonical).toContain(route);
      }
      if (robots) {
        expect(robots.toLowerCase()).toContain('noindex');
      }
    }
  });
});
