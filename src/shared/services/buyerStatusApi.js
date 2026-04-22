import api from './api';

/**
 * Fetch active status videos for one seller (buyer public API).
 * @param {string} sellerId
 * @returns {Promise<{ seller: object | null, statuses: array }>}
 */
export async function getBuyerStatusesBySeller(sellerId) {
  const response = await api.get(`/statuses/seller/${sellerId}`);
  const payload = response?.data?.data;
  const group = Array.isArray(payload) ? payload[0] : payload;
  return {
    seller: group?.seller ?? null,
    statuses: Array.isArray(group?.statuses) ? group.statuses : [],
  };
}

/**
 * Buyer status feed: sellers with at least one active status video.
 * @returns {Promise<Array>}
 */
export async function getBuyerStatusFeed() {
  const response = await api.get('/statuses');
  const payload = response?.data?.data;
  return Array.isArray(payload) ? payload : [];
}

const buyerStatusApi = {
  getBuyerStatusesBySeller,
  getBuyerStatusFeed,
};

export default buyerStatusApi;
