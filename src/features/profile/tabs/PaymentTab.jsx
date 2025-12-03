import { useState } from "react";
import {
  ContentCard,
  CardTitle,
  CardDescription,
  Button,
} from "../components/TabPanelContainer";
import { ButtonSpinner, LoadingState, ErrorState } from "../../../components/loading";
import { useGetPaymentMethods } from "../../../shared/hooks/usePaymentMethod";
import { FaPlus, FaTrash, FaCreditCard } from "react-icons/fa";
import styled from "styled-components";

const PaymentTab = () => {
  const { data, isLoading, error } = useGetPaymentMethods();
  const paymentMethods = data?.data?.paymentMethods || data?.paymentMethods || [];

  if (isLoading) return <LoadingState message="Loading payment methods..." />;
  if (error) return <ErrorState message="Failed to load payment methods" />;

  return (
    <ContentCard>
      <CardHeader>
        <div>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your saved payment methods for faster checkout.
          </CardDescription>
        </div>
        <Button variant="primary">
          <FaPlus /> Add Payment Method
        </Button>
      </CardHeader>

      {paymentMethods.length === 0 ? (
        <EmptyState>
          <FaCreditCard size={48} style={{ color: "var(--color-text-light)", marginBottom: "var(--space-md)" }} />
          <p>No payment methods saved yet.</p>
          <Button variant="primary">
            <FaPlus /> Add Your First Payment Method
          </Button>
        </EmptyState>
      ) : (
        <PaymentList>
          {paymentMethods.map((method) => (
            <PaymentCard key={method._id}>
              <PaymentContent>
                <PaymentIcon>
                  <FaCreditCard />
                </PaymentIcon>
                <PaymentInfo>
                  <PaymentType>{method.type || "Card"}</PaymentType>
                  <PaymentDetails>
                    {method.last4 ? `**** **** **** ${method.last4}` : "No details"}
                  </PaymentDetails>
                  {method.isDefault && <DefaultBadge>Default</DefaultBadge>}
                </PaymentInfo>
              </PaymentContent>
              <PaymentActions>
                <ActionButton variant="danger">
                  <FaTrash />
                </ActionButton>
              </PaymentActions>
            </PaymentCard>
          ))}
        </PaymentList>
      )}
    </ContentCard>
  );
};

export default PaymentTab;

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

const PaymentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const PaymentCard = styled.div`
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
`;

const PaymentContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
`;

const PaymentIcon = styled.div`
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

const PaymentInfo = styled.div`
  flex: 1;
`;

const PaymentType = styled.h3`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-xs) 0;
`;

const PaymentDetails = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0;
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

const PaymentActions = styled.div`
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

