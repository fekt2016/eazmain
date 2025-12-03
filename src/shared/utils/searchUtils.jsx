import React from 'react';

/**
 * Frontend Search Utilities
 * Functions for search term highlighting and query handling
 */

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Search term to highlight
 * @returns {JSX.Element|string} - Text with highlighted terms
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;

  // Normalize search term (remove special chars, lowercase)
  const normalized = searchTerm
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (normalized.length === 0) return text;

  // Create regex pattern for all search terms
  const pattern = new RegExp(`(${normalized.map((t) => escapeRegex(t)).join('|')})`, 'gi');

  // Split text by matches
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const isMatch = normalized.some((term) =>
      part.toLowerCase().includes(term.toLowerCase()),
    );
    return isMatch ? (
      <mark key={index} style={{ backgroundColor: '#ffc400', padding: '0 2px', borderRadius: '2px' }}>
        {part}
      </mark>
    ) : (
      part
    );
  });
};

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Normalize search query for display
 * @param {string} query - Search query
 * @returns {string} - Normalized query
 */
export const normalizeSearchQuery = (query) => {
  if (!query) return '';
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

/**
 * Get search query from URL
 * @param {URLSearchParams} searchParams - URL search params
 * @returns {Object} - Parsed search query object
 */
export const parseSearchParams = (searchParams) => {
  return {
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };
};

/**
 * Build search URL from query object
 * @param {Object} query - Search query object
 * @returns {string} - URL search string
 */
export const buildSearchUrl = (query) => {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.type) params.set('type', query.type);
  if (query.category) params.set('category', query.category);
  if (query.brand) params.set('brand', query.brand);
  if (query.minPrice) params.set('minPrice', query.minPrice);
  if (query.maxPrice) params.set('maxPrice', query.maxPrice);
  if (query.rating) params.set('rating', query.rating);
  if (query.inStock) params.set('inStock', 'true');
  if (query.onSale) params.set('onSale', 'true');
  if (query.sortBy && query.sortBy !== 'relevance') params.set('sortBy', query.sortBy);
  if (query.page && query.page > 1) params.set('page', query.page.toString());
  if (query.limit && query.limit !== 20) params.set('limit', query.limit.toString());

  return params.toString();
};

