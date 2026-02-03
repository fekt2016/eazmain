import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import adApi from "../services/adApi";
import logger from "../utils/logger";
import { MOCK_ADS } from "../../data/ads/mockAds";

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

  const ads = useMemo(() => {
    const list = normalizeAds(adsQuery.data);
    // Use mock ads when API returns none (e.g. no backend or empty) so homepage still shows promotions
    if (!list || list.length === 0) {
      return MOCK_ADS;
    }
    return list;
  }, [adsQuery.data]);

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
  };
};

export default useAds;
