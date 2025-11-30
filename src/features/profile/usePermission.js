// usePermission.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import permissionApi from '../../shared/services/permissionApi';

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: permissionApi.getPermissions,
    onError: (error) => console.error("Error fetching permissions:", error),
  });
};

// Email Preferences
export const useUpdateEmailPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs) => {
      console.log("prefs", prefs);
      const response = await permissionApi.updateEmailPrefs(prefs);
      console.log("response", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Email prefs updated successfully", data);
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => console.error("Error updating email prefs:", error),
  });
};

// SMS Preferences
export const useUpdateSMSPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (smsPrefs) => {
      console.log("smsPrefs", smsPrefs);
      const response = await permissionApi.updateSMSPrefs(smsPrefs);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => console.error("Error updating SMS prefs:", error),
  });
};

// Data Sharing
export const useUpdateDataSharing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dataShare) => {
      console.log("dataShare", dataShare);
      const response = await permissionApi.updateDataSharing(dataShare);
      return response;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => console.error("Error updating data sharing:", error),
  });
};

// Location Access
export const useUpdateLocationAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (level) => {
      const response = await permissionApi.updateLocationAccess(level);
      return response;
    },
    onSuccess: () => {
      console.log("Location access updated successfully");
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => console.error("Error updating location access:", error),
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
      console.log("Social sharing updated successfully");
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) => console.error("Error updating social sharing:", error),
  });
};

// Account Visibility
export const useUpdateAccountVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (level) => {
      const response = permissionApi.updateAccountVisibility(level);
      return response;
    },
    onSuccess: () => {
      console.log("Account visibility updated successfully");
      queryClient.invalidateQueries(["permissions"]);
    },
    onError: (error) =>
      console.error("Error updating account visibility:", error),
  });
};

// Data Download
export const useRequestDataDownload = () => {
  return useMutation({
    mutationFn: () => {
      const response = permissionApi.requestDataDownload();
      return response;
    },
    onError: (error) => console.error("Error requesting data download:", error),
  });
};

// Account Deletion
export const useScheduleAccountDeletion = () => {
  return useMutation({
    mutationFn: async ({ password, reason }) => {
      const response = await permissionApi.scheduleAccountDeletion({
        password,
        reason,
      });
      return response;
    },
    onSuccess: () => {
      console.log("Account deletion scheduled successfully");
    },
    onError: (error) =>
      console.error("Error scheduling account deletion:", error),
  });
};
export const useCancelAccountDeletion = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await permissionApi.cancelAccountDeletion();
      return response;
    },
    onSuccess: () => {
      console.log("Account deletion canceled successfully");
    },
    onError: (error) =>
      console.error("Error canceling account deletion:", error),
  });
};
