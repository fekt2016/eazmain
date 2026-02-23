import { useState } from 'react';
import styled from 'styled-components';
import { GOOGLE_MAPS_API_KEY } from '../../shared/config/appConfig';
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaUndo,
  FaCreditCard,
  FaSpinner,
  FaMap,
} from 'react-icons/fa';
import { useGetOrderTracking } from '../../shared/hooks/useGetOrderTracking';
import { LoadingState } from '../../components/loading';

/**
 * OrderTrackingTimeline Component
 * Shows step-by-step timeline of order tracking history
 */
const OrderTrackingTimeline = ({ orderId, showLiveTracking = true }) => {
  const { data: trackingData, isLoading, error } = useGetOrderTracking(orderId, {
    refetchInterval: showLiveTracking ? 10000 : false, // Refetch every 10 seconds if live tracking enabled
  });

  const [showMap, setShowMap] = useState(false);

  if (isLoading) {
    return (
      <TimelineContainer>
        <LoadingState />
      </TimelineContainer>
    );
  }

  if (error) {
    return (
      <TimelineContainer>
        <ErrorMessage>Failed to load tracking information</ErrorMessage>
      </TimelineContainer>
    );
  }

  if (!trackingData) {
    return (
      <TimelineContainer>
        <EmptyMessage>No tracking information available</EmptyMessage>
      </TimelineContainer>
    );
  }

  const { currentStatus, trackingHistory = [], driverLocation } = trackingData;

  // Status configuration
  const statusConfig = {
    pending_payment: {
      icon: FaCreditCard,
      label: 'Pending Payment',
      color: '#f39c12',
      bgColor: '#fff3cd',
      message: 'Waiting for payment confirmation',
    },
    processing: {
      icon: FaSpinner,
      label: 'Processing',
      color: '#3498db',
      bgColor: '#d1ecf1',
      message: 'Your order is being processed',
    },
    confirmed: {
      icon: FaCheckCircle,
      label: 'Confirmed',
      color: '#2ecc71',
      bgColor: '#d4edda',
      message: 'Order confirmed and ready for preparation',
    },
    preparing: {
      icon: FaBox,
      label: 'Preparing',
      color: '#9b59b6',
      bgColor: '#e7d4f8',
      message: 'Your order is being prepared',
    },
    ready_for_dispatch: {
      icon: FaTruck,
      label: 'Ready for Dispatch',
      color: '#e67e22',
      bgColor: '#ffe5d0',
      message: 'Order is ready and waiting for pickup',
    },
    out_for_delivery: {
      icon: FaTruck,
      label: 'Out for Delivery',
      color: '#3498db',
      bgColor: '#d1ecf1',
      message: 'Rider is on the way',
    },
    delivered: {
      icon: FaCheckCircle,
      label: 'Delivered',
      color: '#2ecc71',
      bgColor: '#d4edda',
      message: 'Package delivered successfully',
    },
    cancelled: {
      icon: FaTimesCircle,
      label: 'Cancelled',
      color: '#e74c3c',
      bgColor: '#f8d7da',
      message: 'Order has been cancelled',
    },
    refunded: {
      icon: FaUndo,
      label: 'Refunded',
      color: '#95a5a6',
      bgColor: '#e9ecef',
      message: 'Order has been refunded',
    },
  };

  // Get current status config
  const currentStatusConfig = statusConfig[currentStatus] || statusConfig.pending_payment;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if driver location is recent (within last 5 minutes)
  const isDriverLocationActive =
    driverLocation?.lastUpdated &&
    new Date() - new Date(driverLocation.lastUpdated) < 5 * 60 * 1000;

  return (
    <TimelineContainer>
      <TimelineHeader>
        <CurrentStatusBadge
          color={currentStatusConfig.color}
          bgColor={currentStatusConfig.bgColor}
        >
          <currentStatusConfig.icon />
          <div>
            <StatusLabel>{currentStatusConfig.label}</StatusLabel>
            <StatusMessage>{currentStatusConfig.message}</StatusMessage>
          </div>
        </CurrentStatusBadge>

        {driverLocation && isDriverLocationActive && showLiveTracking && (
          <LiveTrackingButton onClick={() => setShowMap(!showMap)}>
            <FaMap />
            {showMap ? 'Hide' : 'Track Driver Live'}
          </LiveTrackingButton>
        )}
      </TimelineHeader>

      {showMap && driverLocation && (
        <MapContainer>
          <iframe
            width="100%"
            height="300"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY || ''}&q=${driverLocation.lat},${driverLocation.lng}&zoom=15`}
            allowFullScreen
            title="Driver Location"
          />
          <MapInfo>
            <FaMapMarkerAlt />
            <span>
              Last updated: {formatTimestamp(driverLocation.lastUpdated)}
            </span>
          </MapInfo>
        </MapContainer>
      )}

      <TimelineTitle>Tracking History</TimelineTitle>
      <Timeline>
        {trackingHistory.length === 0 ? (
          <EmptyTimeline>
            <FaClock size={32} color="#ccc" />
            <p>No tracking history available yet</p>
          </EmptyTimeline>
        ) : (
          trackingHistory.map((entry, index) => {
            const config = statusConfig[entry.status] || statusConfig.pending_payment;
            const Icon = config.icon;
            const isLast = index === trackingHistory.length - 1;
            const isCurrent = entry.status === currentStatus;

            return (
              <TimelineItem key={index} isCurrent={isCurrent}>
                <TimelineIcon color={config.color} bgColor={config.bgColor} isCurrent={isCurrent}>
                  <Icon />
                </TimelineIcon>
                <TimelineContent>
                  <TimelineStatus>{config.label}</TimelineStatus>
                  {entry.message && <TimelineMessage>{entry.message}</TimelineMessage>}
                  {entry.location && (
                    <TimelineLocation>
                      <FaMapMarkerAlt />
                      {entry.location}
                    </TimelineLocation>
                  )}
                  <TimelineTime>{formatTimestamp(entry.timestamp)}</TimelineTime>
                  {entry.updatedBy && (
                    <TimelineUpdatedBy>
                      Updated by: {entry.updatedBy.name || entry.updatedBy.email || 'System'}
                    </TimelineUpdatedBy>
                  )}
                </TimelineContent>
                {!isLast && <TimelineLine />}
              </TimelineItem>
            );
          })
        )}
      </Timeline>
    </TimelineContainer>
  );
};

export default OrderTrackingTimeline;

// Styled Components
const TimelineContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CurrentStatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${(props) => props.bgColor};
  color: ${(props) => props.color};
  border-radius: 12px;
  border: 2px solid ${(props) => props.color};
  flex: 1;
  min-width: 250px;

  svg {
    font-size: 2rem;
  }
`;

const StatusLabel = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const StatusMessage = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const LiveTrackingButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3a0ca3;
    transform: translateY(-1px);
  }
`;

const MapContainer = styled.div`
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const MapInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  color: #666;
  font-size: 0.85rem;
`;

const TimelineTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 2rem;
  padding-left: 3rem;
  opacity: ${(props) => (props.isCurrent ? 1 : 0.7)};
  transform: ${(props) => (props.isCurrent ? 'scale(1.02)' : 'scale(1)')};
  transition: all 0.3s;
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -1.5rem;
  top: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${(props) => props.bgColor};
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 3px solid ${(props) => (props.isCurrent ? props.color : '#e0e0e0')};
  box-shadow: ${(props) =>
    props.isCurrent ? `0 0 0 4px ${props.bgColor}` : 'none'};
  z-index: 2;
`;

const TimelineContent = styled.div`
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border-left: 3px solid ${(props) => props.color || '#e0e0e0'};
`;

const TimelineStatus = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const TimelineMessage = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const TimelineLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4361ee;
  margin-bottom: 0.5rem;
`;

const TimelineTime = styled.div`
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const TimelineUpdatedBy = styled.div`
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: -0.5rem;
  top: 3rem;
  width: 2px;
  height: calc(100% + 1rem);
  background: #e0e0e0;
`;

const EmptyTimeline = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;

  p {
    margin-top: 1rem;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #e74c3c;
  background: #f8d7da;
  border-radius: 8px;
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #999;
`;

