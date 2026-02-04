import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import adApi from "../services/adApi";
import logger from "../utils/logger";

const AD_GROUP_TEMPLATE = {
  banner: [],
  popup: [],
  carousel: [],
  native: [],
};

const normalizeAds = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.ads)) return payload.ads;
  if (Array.isArray(payload.data?.ads)) return payload.data.ads;
  return [];
};

const extractPromotionKeyFromLink = (link) => {
  if (!link || typeof link !== "string") return "";
  try {
    const raw = String(link);
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const match = url.pathname.match(/\/offers\/([^/?#]+)/i);
      return match ? match[1] : "";
    }
    const match = raw.match(/\/offers\/([^/?#]+)/i);
    return match ? match[1] : "";
  } catch {
    return "";
  }
};

export const useAds = ({ enabled = true } = {}) => {
  const adsQuery = useQuery({
    queryKey: ["ads", "active"],
    queryFn: adApi.getActiveAds,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
    refetchOnWindowFocus: false,
    onError: (error) => {
      logger.error("Failed to load advertisements:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "We couldn't load promotions right now. Please try again later.",
      );
    },
  });

  const ads = useMemo(
    () => normalizeAds(adsQuery.data),
    [adsQuery.data],
  );

  const promotionDiscountMap = useMemo(() => {
    const map = {};
    ads.forEach((ad) => {
      if (!ad || typeof ad.discountPercent !== "number" || ad.discountPercent <= 0) {
        return;
      }
      const key = extractPromotionKeyFromLink(ad.link);
      if (!key) return;
      const current = map[key];
      // If multiple ads share a promotion key, keep the highest discount
      if (typeof current !== "number" || ad.discountPercent > current) {
        map[key] = ad.discountPercent;
      }
    });
    return map;
  }, [ads]);

  const groupedAds = useMemo(() => {
    const groups = {
      banner: [],
      popup: [],
      carousel: [],
      native: [],
    };

    ads.forEach((ad) => {
      const type = ad?.type || "banner";
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(ad);
    });

    return groups;
  }, [ads]);

  return {
    ...adsQuery,
    ads,
    groupedAds,
    bannerAds: groupedAds.banner || AD_GROUP_TEMPLATE.banner,
    popupAds: groupedAds.popup || AD_GROUP_TEMPLATE.popup,
    carouselAds: groupedAds.carousel || AD_GROUP_TEMPLATE.carousel,
    nativeAds: groupedAds.native || AD_GROUP_TEMPLATE.native,
    promotionDiscountMap,
  };
};

export default useAds;
