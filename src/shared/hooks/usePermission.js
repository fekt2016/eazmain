// usePermission.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import permissionApi from '../services/permissionApi';
import logger from '../utils/logger';

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await permissionApi.getPermissions();
      return response?.data?.data ?? response?.data ?? response;
    },
    onError: (error) => {
      logger.error("Error fetching permissions:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load permissions."
      );
    },
  });
};

// Email Preferences
export const useUpdateEmailPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs) => {
      logger.log("prefs", prefs);
      const response = await permissionApi.updateEmailPrefs(prefs);
      logger.log("response", response);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Email prefs updated successfully", data);
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => {
      logger.error("Error updating email prefs:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update email preferences."
      );
    },
  });
};

// SMS Preferences
export const useUpdateSMSPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (smsPrefs) => {
      logger.log("smsPrefs", smsPrefs);
      const response = await permissionApi.updateSMSPrefs(smsPrefs);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => {
      logger.error("Error updating SMS prefs:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update SMS preferences."
      );
    },
  });
};

// Data Sharing
export const useUpdateDataSharing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dataShare) => {
      logger.log("dataShare", dataShare);
      const response = await permissionApi.updateDataSharing(dataShare);
      return response;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => {
      logger.error("Error updating data sharing:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update data sharing settings."
      );
    },
  });
};

// Location Access
export const useUpdateLocationAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (level) =>
      permissionApi.updateLocationAccess(level),
    onMutate: async (level) => {
      await queryClient.cancelQueries({ queryKey: ["permissions"] });
      const previous = queryClient.getQueryData(["permissions"]);
      queryClient.setQueryData(["permissions"], (existing) => ({
        ...(existing || {}),
        locationAccess: level,
      }));
      return { previous };
    },
    onSuccess: () => {
      logger.log("Location access updated successfully");
    },
    onError: (error, _level, context) => {
      logger.error("Error updating location access:", error);
      if (context?.previous) {
        queryClient.setQueryData(["permissions"], context.previous);
      }
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update location access."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

// Social Media Sharing
export const useUpdateSocialSharing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newValue) => {
      const response = await permissionApi.updateSocialSharing(newValue);
      return response;
    },
    onSuccess: () => {
      logger.log("Social sharing updated successfully");
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => {
      logger.error("Error updating social sharing:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update social sharing preference."
      );
    },
  });
};

// Account Visibility
export const useUpdateAccountVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (level) =>
      permissionApi.updateAccountVisibility(level),
    onSuccess: () => {
      logger.log("Account visibility updated successfully");
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => {
      logger.error("Error updating account visibility:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update account visibility."
      );
    },
  });
};

// Data Download
export const useRequestDataDownload = () => {
  return useMutation({
    mutationFn: () => {
      const response = permissionApi.requestDataDownload();
      return response;
    },
    onError: (error) => {
      logger.error("Error requesting data download:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not start data export."
      );
    },
  });
};

// Account Deletion
export const useScheduleAccountDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ password, reason }) => {
      const response = await permissionApi.scheduleAccountDeletion({
        password,
        reason,
      });
      return response;
    },
    onSuccess: () => {
      logger.log("Account deletion scheduled successfully");
      queryClient.invalidateQueries(["permissions"]);
      toast.success("Account deletion scheduled. You have 30 days to cancel.");
    },
    onError: (error) => {
      logger.error("Error scheduling account deletion:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not schedule account deletion."
      );
    },
  });
};
export const useCancelAccountDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await permissionApi.cancelAccountDeletion();
      return response;
    },
    onSuccess: () => {
      logger.log("Account deletion canceled successfully");
      queryClient.invalidateQueries(["permissions"]);
      toast.success("Account deletion cancelled.");
    },
    onError: (error) => {
      logger.error("Error canceling account deletion:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not cancel account deletion."
      );
    },
  });
};
