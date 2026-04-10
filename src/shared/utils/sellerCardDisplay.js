/**
 * Shared seller card UI helpers (homepage featured sellers, sellers list, etc.)
 */

export function hasUsableSellerAvatar(avatar) {
  if (avatar == null) return false;
  if (typeof avatar === 'string') return Boolean(String(avatar).trim());
  if (typeof avatar === 'object') {
    const u =
      avatar.url ||
      avatar.secure_url ||
      avatar.public_id ||
      avatar.publicId ||
      avatar.src ||
      avatar.image;
    return Boolean(u && String(u).trim());
  }
  return false;
}

export function getShopInitials(name) {
  if (!name || typeof name !== 'string') return 'S';
  const t = name.trim();
  if (!t) return 'S';
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return t.slice(0, 2).toUpperCase();
}
