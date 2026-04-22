import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import promoApi from '../services/promoApi';

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.promos)) return payload.promos;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const useActivePromos = (params = {}) =>
  useQuery({
    queryKey: ['buyer-promos-active', params],
    queryFn: () => promoApi.getActivePromos(params),
    staleTime: 60 * 1000,
  });

export const usePromo = (promoId) =>
  useQuery({
    queryKey: ['buyer-promo', promoId],
    queryFn: () => promoApi.getPromoById(promoId),
    enabled: Boolean(promoId),
  });

export const usePromoProducts = (promoId, params = {}) =>
  useQuery({
    queryKey: ['buyer-promo-products', promoId, params],
    queryFn: () => promoApi.getPromoProducts(promoId, params),
    enabled: Boolean(promoId),
  });

export const useActivePromoCards = () => {
  const query = useActivePromos({ limit: 10 });
  const promos = useMemo(() => extractList(query.data), [query.data]);
  return {
    ...query,
    promos,
  };
};

export const promoSelectors = {
  extractList,
};
