import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notificationApi from '../../shared/services/notificationApi';
import logger from '../../shared/utils/logger';

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const response = await notificationApi.getUserSettings();
      return response;
    },
    onSuccess: () => {
      logger.log("[API] Notification settings fetched");
    },
    onError: (error) => {
      logger.error(error);
      logger.error("[API] Error fetching notification settings");
    },
    initialData: {
      email: {
        orderUpdates: true,
        promotions: true,
        priceDrops: false,
        restockAlerts: true,
        accountSecurity: true,
        newsletters: false,
      },
      push: {
        orderUpdates: true,
        promotions: false,
        priceDrops: true,
        restockAlerts: true,
        accountActivity: true,
      },
      sms: {
        orderUpdates: true,
        promotions: false,
        securityAlerts: true,
      },
      app: {
        messages: true,
        friendActivity: false,
        recommendations: true,
      },
      frequency: {
        promotions: "weekly",
        newsletters: "monthly",
      },
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
      },
    },
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ path, value }) => {
      logger.log("api path", path, "value", value);
      // Create deep copy of current settings
      const currentSettings = queryClient.getQueryData([
        "notification-settings",
      ]);
      const newSettings = JSON.parse(JSON.stringify(currentSettings));

      // Update nested property using path
      const keys = path.split(".");
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return await notificationApi.updateSettings(newSettings);
    },
    onMutate: async ({ path, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notification-settings"] });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData([
        "notification-settings",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["notification-settings"], (old) => {
        const newData = JSON.parse(JSON.stringify(old));
        const keys = path.split(".");
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });

      // Return context with previous value
      return { previousSettings };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      queryClient.setQueryData(
        ["notification-settings"],
        context.previousSettings
      );
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}

export function useResetNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationApi.resetSettings();
      return response;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notification-settings"] });
      const previousSettings = queryClient.getQueryData([
        "notification-settings",
      ]);

      // Optimistically reset to defaults
      queryClient.setQueryData(["notification-settings"], {
        email: {
          orderUpdates: true,
          promotions: true,
          priceDrops: false,
          restockAlerts: true,
          accountSecurity: true,
          newsletters: false,
        },
        push: {
          orderUpdates: true,
          promotions: false,
          priceDrops: true,
          restockAlerts: true,
          accountActivity: true,
        },
        sms: {
          orderUpdates: true,
          promotions: false,
          securityAlerts: true,
        },
        app: {
          messages: true,
          friendActivity: false,
          recommendations: true,
        },
        frequency: {
          promotions: "weekly",
          newsletters: "monthly",
        },
        quietHours: {
          enabled: false,
          startTime: "22:00",
          endTime: "08:00",
        },
      });

      return { previousSettings };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["notification-settings"],
        context.previousSettings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}
