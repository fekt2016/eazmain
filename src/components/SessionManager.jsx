import React from "react";
import styled from "styled-components";
import useSessionManagement from "../hooks/useAuth";

const SessionManager = () => {
  const { sessions, isLoading, error, revokeSession } = useSessionManagement();

  if (isLoading) return <Loading>Loading sessions...</Loading>;
  if (error) return <Error>Error loading sessions: {error.message}</Error>;

  return (
    <Container>
      {sessions?.length > 0 ? (
        <SessionList>
          {sessions.map((session) => (
            <SessionItem key={session.id}>
              <SessionInfo>
                <DeviceInfo>
                  <DeviceIcon>💻</DeviceIcon>
                  <div>
                    <DeviceName>
                      {session.device || "Unknown Device"}
                    </DeviceName>
                    <SessionMeta>
                      <span>{session.location || "Unknown Location"}</span>
                      <span>•</span>
                      <span>
                        Last active:{" "}
                        {new Date(session.lastActive).toLocaleString()}
                      </span>
                    </SessionMeta>
                  </div>
                </DeviceInfo>
                {session.current ? (
                  <CurrentBadge>Current Session</CurrentBadge>
                ) : (
                  <RevokeButton
                    onClick={() => revokeSession.mutate(session.id)}
                    disabled={revokeSession.isLoading}
                  >
                    {revokeSession.isLoading ? "Revoking..." : "Revoke"}
                  </RevokeButton>
                )}
              </SessionInfo>
            </SessionItem>
          ))}
        </SessionList>
      ) : (
        <NoSessions>No active sessions found</NoSessions>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin-top: 1rem;
`;

const Loading = styled.div`
  padding: 1rem;
  text-align: center;
  color: #4a5568;
`;

const Error = styled.div`
  padding: 1rem;
  background-color: #fef2f2;
  border-radius: 6px;
  color: #e53e3e;
`;

const SessionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SessionItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SessionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
`;

const DeviceIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 1rem;
`;

const DeviceName = styled.div`
  font-weight: 500;
`;

const SessionMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
`;

const CurrentBadge = styled.span`
  padding: 0.25rem 0.75rem;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const RevokeButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #b91c1c;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #fee2e2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoSessions = styled.div`
  padding: 1rem;
  text-align: center;
  color: #718096;
  font-style: italic;
`;

export default SessionManager;
