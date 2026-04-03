import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useDynamicPageTitle from '@/shared/hooks/useDynamicPageTitle';

function TestHarness({ config }) {
  useDynamicPageTitle(config);
  return null;
}

const renderWithRoute = (route, config) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <TestHarness config={config} />
    </MemoryRouter>
  );

describe('useDynamicPageTitle', () => {
  beforeEach(() => {
    document.title = 'Default Title';
    document
      .querySelectorAll('meta[name="robots"], link[rel="canonical"]')
      .forEach((tag) => tag.remove());
  });

  test('sets title, canonical, and social tags', async () => {
    renderWithRoute('/search?q=phone', {
      title: 'Search Results - Saiisai',
      description: 'Find products matching your search.',
    });

    await waitFor(() => {
      expect(document.title).toBe('Search Results - Saiisai');
    });

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical.getAttribute('href')).toContain('/search?q=phone');

    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('Search Results - Saiisai');
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute('content')
    ).toBe('Search Results - Saiisai');
  });

  test('adds noindex/nofollow for private route defaults', async () => {
    renderWithRoute('/checkout', {
      title: 'Checkout - Saiisai',
    });

    await waitFor(() => {
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeTruthy();
      expect(robots.getAttribute('content')).toContain('noindex');
      expect(robots.getAttribute('content')).toContain('nofollow');
    });
  });
});
