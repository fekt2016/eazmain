/**
 * TaxBreakdown Component
 * Displays Ghana GRA tax breakdown for VAT-inclusive pricing
 */

import React from 'react';
import styled from 'styled-components';
import { FaInfoCircle } from 'react-icons/fa';

const TaxContainer = styled.div`
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const TaxTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
`;

const TaxRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-200);
  }
`;

const TaxLabel = styled.span`
  color: var(--color-grey-600);
`;

const TaxValue = styled.span`
  font-weight: 500;
  color: var(--color-grey-800);
`;

const TaxTotal = styled(TaxRow)`
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-sm);
  border-top: 2px solid var(--color-grey-300);
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-grey-900);
`;

const InfoText = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: var(--color-blue-50);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-blue-700);
  line-height: 1.4;
`;

/**
 * TaxBreakdown Component
 * @param {Object} props
 * @param {Number} props.vatInclusivePrice - Price that includes 15% VAT
 * @param {Number} props.quantity - Quantity (default: 1)
 * @param {Boolean} props.showInfo - Show info text (default: true)
 * @param {Boolean} props.compact - Compact display (default: false)
 */
export default function TaxBreakdown({
  vatInclusivePrice = 0,
  quantity = 1,
  showInfo = true,
  compact = false,
}) {
  // Calculate tax breakdown
  const basePrice = vatInclusivePrice / 1.15;
  const vat = basePrice * 0.125;
  const nhil = basePrice * 0.025;
  const getfund = basePrice * 0.025;
  const covidLevy = basePrice * 0.01;
  const totalTax = vat + nhil + getfund + covidLevy;
  const grandTotal = vatInclusivePrice + covidLevy;

  // Round to 2 decimal places
  const format = (val) => Math.round(val * 100) / 100;

  // Calculate totals for quantity
  const itemBasePrice = format(basePrice * quantity);
  const itemVAT = format(vat * quantity);
  const itemNHIL = format(nhil * quantity);
  const itemGETFund = format(getfund * quantity);
  const itemCovidLevy = format(covidLevy * quantity);
  const itemTotalTax = format(totalTax * quantity);
  const itemVATInclusive = format(vatInclusivePrice * quantity);
  const itemGrandTotal = format(grandTotal * quantity);

  if (compact) {
    return (
      <TaxContainer>
        <TaxRow>
          <TaxLabel>Base Price:</TaxLabel>
          <TaxValue>GH₵{itemBasePrice.toFixed(2)}</TaxValue>
        </TaxRow>
        <TaxRow>
          <TaxLabel>Total Tax:</TaxLabel>
          <TaxValue>GH₵{itemTotalTax.toFixed(2)}</TaxValue>
        </TaxRow>
        <TaxTotal>
          <span>Grand Total:</span>
          <span>GH₵{itemGrandTotal.toFixed(2)}</span>
        </TaxTotal>
      </TaxContainer>
    );
  }

  return (
    <TaxContainer>
      <TaxTitle>
        <FaInfoCircle />
        Tax Breakdown (Ghana GRA)
      </TaxTitle>
      
      <TaxRow>
        <TaxLabel>Product Price (VAT inclusive):</TaxLabel>
        <TaxValue>GH₵{itemVATInclusive.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>Base Price (before VAT):</TaxLabel>
        <TaxValue>GH₵{itemBasePrice.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>VAT (12.5%):</TaxLabel>
        <TaxValue>GH₵{itemVAT.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>NHIL (2.5%):</TaxLabel>
        <TaxValue>GH₵{itemNHIL.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>GETFund (2.5%):</TaxLabel>
        <TaxValue>GH₵{itemGETFund.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>COVID Levy (1%):</TaxLabel>
        <TaxValue>GH₵{itemCovidLevy.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>Total Tax:</TaxLabel>
        <TaxValue>GH₵{itemTotalTax.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxTotal>
        <span>Grand Total:</span>
        <span>GH₵{itemGrandTotal.toFixed(2)}</span>
      </TaxTotal>
      
      {showInfo && (
        <InfoText>
          <strong>Note:</strong> Prices include 15% VAT (VAT + NHIL + GETFund). 
          COVID levy (1%) is added separately as required by Ghana Revenue Authority.
        </InfoText>
      )}
    </TaxContainer>
  );
}

/**
 * OrderTaxBreakdown Component
 * For displaying tax breakdown in order details
 */
export function OrderTaxBreakdown({ order }) {
  if (!order) return null;

  const totalBasePrice = order.totalBasePrice || 0;
  const totalVAT = order.totalVAT || 0;
  const totalNHIL = order.totalNHIL || 0;
  const totalGETFund = order.totalGETFund || 0;
  const totalCovidLevy = order.totalCovidLevy || 0;
  const totalTax = order.totalTax || 0;
  const grandTotal = order.totalPrice || 0;

  return (
    <TaxContainer>
      <TaxTitle>
        <FaInfoCircle />
        Tax Breakdown (Ghana GRA)
      </TaxTitle>
      
      <TaxRow>
        <TaxLabel>Subtotal (VAT inclusive):</TaxLabel>
        <TaxValue>GH₵{(order.subtotal || 0).toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>Base Price (before VAT):</TaxLabel>
        <TaxValue>GH₵{totalBasePrice.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>VAT (12.5%):</TaxLabel>
        <TaxValue>GH₵{totalVAT.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>NHIL (2.5%):</TaxLabel>
        <TaxValue>GH₵{totalNHIL.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>GETFund (2.5%):</TaxLabel>
        <TaxValue>GH₵{totalGETFund.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>COVID Levy (1%):</TaxLabel>
        <TaxValue>GH₵{totalCovidLevy.toFixed(2)} <span style={{ fontSize: '0.85em', color: '#666' }}>(tracked, not charged to customer)</span></TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>Shipping:</TaxLabel>
        <TaxValue>GH₵{(order.shippingCost || 0).toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxRow>
        <TaxLabel>Total Tax:</TaxLabel>
        <TaxValue>GH₵{totalTax.toFixed(2)}</TaxValue>
      </TaxRow>
      
      <TaxTotal>
        <span>Grand Total:</span>
        <span>GH₵{grandTotal.toFixed(2)}</span>
      </TaxTotal>
      
      <InfoText>
        <strong>Note:</strong> Prices include 15% VAT (VAT + NHIL + GETFund). 
        COVID levy (1%) is tracked for seller withdrawal deduction but is NOT charged to customers.
      </InfoText>
    </TaxContainer>
  );
}

