import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from '../../shared/utils/currentUser';
// import { useEffect } from "react";

export function useUser() {
  const { isLoading, data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => await getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!user) return "";
  return { isLoading, user };
}
