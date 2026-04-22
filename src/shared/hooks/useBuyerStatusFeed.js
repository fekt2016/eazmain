import { useQuery } from '@tanstack/react-query';
import buyerStatusApi from '../services/buyerStatusApi';

function filterBuyerStatusGroups(groups) {
  const now = new Date();
  return (groups || [])
    .map((g) => ({
      ...g,
      statuses: (g.statuses || []).filter((s) => {
        if (typeof s?.videoUrl !== 'string' || !s.videoUrl.trim()) return false;
        if (s.expiresAt && new Date(s.expiresAt) <= now) return false;
        return true;
      }),
    }))
    .filter((g) => (g.statuses || []).length > 0);
}

export function useBuyerStatusFeed() {
  return useQuery({
    queryKey: ['buyer-status-feed'],
    queryFn: async () => {
      const raw = await buyerStatusApi.getBuyerStatusFeed();
      return filterBuyerStatusGroups(raw);
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
