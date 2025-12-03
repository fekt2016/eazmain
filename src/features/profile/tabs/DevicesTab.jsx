import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ContentCard,
  CardTitle,
  CardDescription,
  Button,
} from "../components/TabPanelContainer";
import { ButtonSpinner, LoadingState, ErrorState } from "../../../components/loading";
import api from "../../../shared/services/api";
import { FaMobileAlt, FaDesktop, FaTablet, FaTrash } from "react-icons/fa";
import styled from "styled-components";
import { toast } from "react-toastify";

const DevicesTab = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["deviceSessions"],
    queryFn: async () => {
      const response = await api.get("/sessions/my-devices");
      return response.data;
    },
  });

  const logoutDevice = useMutation({
    mutationFn: async (deviceId) => {
      const response = await api.delete(`/sessions/logout-device/${deviceId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deviceSessions"]);
      toast.success("Device logged out successfully");
    },
    onError: () => {
      toast.error("Failed to logout device");
    },
  });

  const logoutOthers = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/sessions/logout-others");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deviceSessions"]);
      toast.success("All other devices logged out");
    },
    onError: () => {
      toast.error("Failed to logout other devices");
    },
  });

  const devices = data?.data?.sessions || data?.sessions || [];

  if (isLoading) return <LoadingState message="Loading devices..." />;
  if (error) return <ErrorState message="Failed to load devices" />;

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case "mobile":
        return <FaMobileAlt />;
      case "tablet":
        return <FaTablet />;
      case "desktop":
        return <FaDesktop />;
      default:
        return <FaDesktop />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ContentCard>
      <CardHeader>
        <div>
          <CardTitle>Active Devices</CardTitle>
          <CardDescription>
            Manage devices that are currently signed in to your account.
          </CardDescription>
        </div>
        {devices.length > 1 && (
          <Button
            variant="danger"
            onClick={() => logoutOthers.mutate()}
            disabled={logoutOthers.isPending}
          >
            {logoutOthers.isPending ? (
              <>
                <ButtonSpinner size="sm" /> Logging out...
              </>
            ) : (
              "Logout All Others"
            )}
          </Button>
        )}
      </CardHeader>

      {devices.length === 0 ? (
        <EmptyState>
          <p>No active devices found.</p>
        </EmptyState>
      ) : (
        <DevicesList>
          {devices.map((device) => (
            <DeviceCard key={device.deviceId}>
              <DeviceInfo>
                <DeviceIcon>{getDeviceIcon(device.deviceType)}</DeviceIcon>
                <DeviceDetails>
                  <DeviceName>
                    {device.deviceType || "Unknown"} Device
                  </DeviceName>
                  <DeviceMeta>
                    <span>{device.userAgent || "Unknown browser"}</span>
                    <span>•</span>
                    <span>{device.location || "Unknown location"}</span>
                  </DeviceMeta>
                  <DeviceTime>
                    Last active: {formatDate(device.lastActivity)}
                  </DeviceTime>
                </DeviceDetails>
              </DeviceInfo>
              <DeviceActions>
                {device.isActive && (
                  <ActiveBadge>Active</ActiveBadge>
                )}
                <ActionButton
                  variant="danger"
                  onClick={() => logoutDevice.mutate(device.deviceId)}
                  disabled={logoutDevice.isPending}
                >
                  <FaTrash />
                </ActionButton>
              </DeviceActions>
            </DeviceCard>
          ))}
        </DevicesList>
      )}
    </ContentCard>
  );
};

export default DevicesTab;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-lg);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-md);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-light);
`;

const DevicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const DeviceCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-light);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
`;

const DeviceIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-size: 20px;
`;

const DeviceDetails = styled.div`
  flex: 1;
`;

const DeviceName = styled.h3`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-xs) 0;
`;

const DeviceMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 var(--space-xs) 0;
`;

const DeviceTime = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: var(--color-text-light);
  margin: 0;
`;

const DeviceActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const ActiveBadge = styled.span`
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-success);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionButton = styled.button`
  padding: var(--space-sm);
  border: none;
  border-radius: 6px;
  background: ${(props) =>
    props.variant === "danger" ? "var(--color-danger)" : "var(--color-bg-light)"};
  color: ${(props) =>
    props.variant === "danger" ? "white" : "var(--color-text-dark)"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#DC2626" : "var(--color-border)"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

