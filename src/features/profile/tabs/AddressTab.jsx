import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ContentCard,
  CardTitle,
  CardDescription,
  Button,
} from "../components/TabPanelContainer";
import { ButtonSpinner, LoadingState, ErrorState } from "../../../components/loading";
import addressApi from "../../../shared/services/addressApi";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import styled from "styled-components";

const AddressTab = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getUserAddresses(),
  });

  const addresses = data?.data?.data?.addresses || [];

  if (isLoading) return <LoadingState message="Loading addresses..." />;
  if (error) return <ErrorState message="Failed to load addresses" />;

  return (
    <ContentCard>
      <CardHeader>
        <div>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>
            Manage your delivery addresses for faster checkout.
          </CardDescription>
        </div>
        <Button variant="primary">
          <FaPlus /> Add New Address
        </Button>
      </CardHeader>

      {addresses.length === 0 ? (
        <EmptyState>
          <p>No addresses saved yet.</p>
          <Button variant="primary">
            <FaPlus /> Add Your First Address
          </Button>
        </EmptyState>
      ) : (
        <AddressList>
          {addresses.map((address) => (
            <AddressCard key={address._id}>
              <AddressContent>
                <AddressName>{address.name || "Home"}</AddressName>
                <AddressText>{address.street}</AddressText>
                <AddressText>
                  {address.city}, {address.region} {address.postalCode}
                </AddressText>
                {address.isDefault && <DefaultBadge>Default</DefaultBadge>}
              </AddressContent>
              <AddressActions>
                <ActionButton>
                  <FaEdit />
                </ActionButton>
                <ActionButton variant="danger">
                  <FaTrash />
                </ActionButton>
              </AddressActions>
            </AddressCard>
          ))}
        </AddressList>
      )}
    </ContentCard>
  );
};

export default AddressTab;

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

  p {
    margin-bottom: var(--space-md);
  }
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const AddressCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-light);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const AddressContent = styled.div`
  flex: 1;
`;

const AddressName = styled.h3`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-xs) 0;
`;

const AddressText = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 var(--space-xs) 0;
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-success);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-top: var(--space-xs);
`;

const AddressActions = styled.div`
  display: flex;
  gap: var(--space-sm);
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
`;

