import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaCheck, FaTruck, FaClock, FaRocket } from 'react-icons/fa';
import { useGetShippingOptions } from '../../shared/hooks/useShipping';
import { calculateCartWeight } from '../../shared/utils/calculateCartWeight';
import { ButtonSpinner } from '../../components/loading';

/**
 * ShippingOptions Component
 * Displays shipping options with calculated fees using the new ShippingZone system
 * Based on neighborhood-based zones (A-F) with distance-based pricing
 * @param {Object} props
 * @param {Number} props.weight - Total cart weight in kg
 * @param {String} props.city - Buyer's city (Accra or Tema)
 * @param {String} props.neighborhoodName - Neighborhood name (from address landmark or streetAddress)
 * @param {Boolean} props.fragile - Whether item is fragile (default: false)
 * @param {Array} props.items - Cart items (for weight calculation if weight not provided)
 * @param {String} props.selectedShippingType - Currently selected shipping type
 * @param {Function} props.onSelect - Callback when shipping type is selected
 */
const ShippingOptions = ({
  weight,
  city,
  neighborhoodName,
  fragile = false,
  items,
  selectedShippingType,
  onSelect,
}) => {
  const [localSelected, setLocalSelected] = useState(selectedShippingType || 'standard');

  // Calculate weight if not provided - ensure minimum 0.5kg
  const calculatedWeight = items && items.length > 0 ? calculateCartWeight(items) : 0.5;
  const totalWeight = weight && weight > 0 ? weight : calculatedWeight;

  // Normalize city name (ACCRA -> Accra, TEMA -> Tema)
  const normalizedCity = city ? (city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()) : null;

  // Fetch shipping options using neighborhood-based ShippingZone system
  const {
    data: shippingData,
    isLoading,
    error,
  } = useGetShippingOptions({
    neighborhoodName,
    city: normalizedCity,
    weight: totalWeight,
    fragile: fragile || false,
    enabled: !!(neighborhoodName && normalizedCity && totalWeight > 0),
  });

  // Update local state when prop changes
  useEffect(() => {
    if (selectedShippingType) {
      setLocalSelected(selectedShippingType);
    }
  }, [selectedShippingType]);

  // When fragile or shippingData changes, automatically recalculate and update the selected option
  // Only update if we have valid data and a selected option
  useEffect(() => {
    if (shippingData?.options && localSelected && onSelect) {
      const option = shippingData.options.find((opt) => opt.type === localSelected);
      if (option && option.available) {
        // Only call onSelect if we have a valid fee to prevent unnecessary updates
        const fee = option.fee || 0;
        if (fee > 0) {
          onSelect({
            shippingType: localSelected,
            shippingFee: fee,
            deliveryEstimate: option.estimate || '',
            zone: shippingData?.zone?.name,
            distanceKm: shippingData?.distance,
            breakdown: option.breakdown,
          });
        }
      }
    }
    // onSelect is memoized with useCallback in parent, so it's safe to include
    // Only depend on the data that actually affects the calculation
  }, [fragile, shippingData?.options, localSelected, onSelect]);

  // Handle selection
  const handleSelect = (shippingType) => {
    setLocalSelected(shippingType);
    if (onSelect) {
      const option = shippingData?.options?.find((opt) => opt.type === shippingType);
      if (option && option.available) {
        onSelect({
          shippingType,
          shippingFee: option.fee || 0,
          deliveryEstimate: option.estimate || '',
          zone: shippingData?.zone?.name,
          distanceKm: shippingData?.distance,
          breakdown: option.breakdown,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <ShippingOptionsContainer>
        <LoadingContainer>
          <ButtonSpinner size="sm" />
          <LoadingText>Calculating shipping fees...</LoadingText>
        </LoadingContainer>
      </ShippingOptionsContainer>
    );
  }

  if (error) {
    return (
      <ShippingOptionsContainer>
        <ErrorContainer>
          <ErrorText>
            {error?.response?.data?.message || 'Failed to calculate shipping fees'}
          </ErrorText>
        </ErrorContainer>
      </ShippingOptionsContainer>
    );
  }

  if (!shippingData?.options || shippingData.options.length === 0) {
    return (
      <ShippingOptionsContainer>
        <ErrorContainer>
          <ErrorText>No shipping options available</ErrorText>
        </ErrorContainer>
      </ShippingOptionsContainer>
    );
  }

  const standardOption = shippingData.options.find((opt) => opt.type === 'standard');
  const sameDayOption = shippingData.options.find((opt) => opt.type === 'same_day');
  const expressOption = shippingData.options.find((opt) => opt.type === 'express');

  return (
    <ShippingOptionsContainer>
      
      {/* Standard Delivery - First Option */}
      {standardOption && (
        <ShippingOptionCard
          $selected={localSelected === 'standard'}
          onClick={() => handleSelect('standard')}
        >
          <RadioButton
            type="radio"
            name="shippingType"
            checked={localSelected === 'standard'}
            onChange={() => handleSelect('standard')}
          />
          <OptionContent>
            <OptionHeader>
              <OptionIcon $selected={localSelected === 'standard'}>
                <FaClock />
              </OptionIcon>
              <OptionInfo>
                <OptionTitle $selected={localSelected === 'standard'}>
                  Standard Delivery
                </OptionTitle>
                <OptionDescription>
                  2-3 days
                </OptionDescription>
              </OptionInfo>
              {localSelected === 'standard' && (
                <Checkmark>
                  <FaCheck />
                </Checkmark>
              )}
            </OptionHeader>
            <OptionPrice>
              GH₵{standardOption.fee?.toFixed(2) || '0.00'}
            </OptionPrice>
          </OptionContent>
        </ShippingOptionCard>
      )}

      {/* Express Shipping (Same Day) - Second Option */}
      {sameDayOption && (
        <ShippingOptionCard
          $selected={localSelected === 'same_day'}
          onClick={() => handleSelect('same_day')}
          $disabled={!sameDayOption.available}
        >
          <RadioButton
            type="radio"
            name="shippingType"
            checked={localSelected === 'same_day'}
            onChange={() => handleSelect('same_day')}
            disabled={!sameDayOption.available}
          />
          <OptionContent>
            <OptionHeader>
              <OptionIcon $selected={localSelected === 'same_day'} $express>
                <FaTruck />
              </OptionIcon>
              <OptionInfo>
                <OptionTitle $selected={localSelected === 'same_day'}>
                  Next Day Delivery
                </OptionTitle>
                <OptionDescription>
                  Arrives Tomorrow
                  {!sameDayOption.available && (
                    <UnavailableText>
                      {' '}(Unavailable after {sameDayOption.cutOff || '15:00'})
                    </UnavailableText>
                  )}
                </OptionDescription>
              </OptionInfo>
              {localSelected === 'same_day' && (
                <Checkmark>
                  <FaCheck />
                </Checkmark>
              )}
            </OptionHeader>
            <OptionPrice $express={localSelected === 'same_day'}>
              GH₵{sameDayOption.fee?.toFixed(2) || '0.00'}
            </OptionPrice>
          </OptionContent>
        </ShippingOptionCard>
      )}

      {/* Express Delivery (1-2 days) - Third Option */}
      {expressOption && (
        <ShippingOptionCard
          $selected={localSelected === 'express'}
          onClick={() => handleSelect('express')}
          $disabled={!expressOption.available}
        >
          <RadioButton
            type="radio"
            name="shippingType"
            checked={localSelected === 'express'}
            onChange={() => handleSelect('express')}
            disabled={!expressOption.available}
          />
          <OptionContent>
            <OptionHeader>
              <OptionIcon $selected={localSelected === 'express'} $express>
                <FaTruck />
              </OptionIcon>
              <OptionInfo>
                <OptionTitle $selected={localSelected === 'express'}>
                  Express Delivery
                </OptionTitle>
                <OptionDescription>
                  On its way for delivery
                </OptionDescription>
              </OptionInfo>
              {localSelected === 'express' && (
                <Checkmark>
                  <FaCheck />
                </Checkmark>
              )}
            </OptionHeader>
            <OptionPrice $express={localSelected === 'express'}>
              GH₵{expressOption.fee?.toFixed(2) || '0.00'}
            </OptionPrice>
          </OptionContent>
        </ShippingOptionCard>
      )}
    </ShippingOptionsContainer>
  );
};

export default ShippingOptions;

// ────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────

const ShippingOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const OptionsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.5rem;
`;

const ShippingOptionCard = styled.div`
  border: 2px solid
    ${(props) =>
      props.$selected
        ? 'var(--color-primary)'
        : props.$disabled
        ? 'var(--color-grey-200)'
        : 'var(--color-grey-200)'};
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$selected
      ? 'var(--color-primary-50)'
      : props.$disabled
      ? 'var(--color-grey-50)'
      : 'white'};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    border-color: ${(props) =>
      props.$disabled
        ? 'var(--color-grey-200)'
        : props.$selected
        ? 'var(--color-primary)'
        : 'var(--color-primary-300)'};
    background: ${(props) =>
      props.$disabled
        ? 'var(--color-grey-50)'
        : props.$selected
        ? 'var(--color-primary-50)'
        : 'var(--color-primary-50)'};
  }
`;

const RadioButton = styled.input`
  display: none;
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const OptionIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$selected
      ? props.$express
        ? 'var(--color-primary)'
        : 'var(--color-primary)'
      : 'var(--color-grey-100)'};
  color: ${(props) => (props.$selected ? 'white' : 'var(--color-grey-600)')};
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const OptionInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OptionTitle = styled.div`
  font-size: 1rem;
  font-weight: ${(props) => (props.$selected ? '600' : '500')};
  color: ${(props) =>
    props.$selected ? 'var(--color-primary)' : 'var(--color-grey-900)'};
`;

const OptionDescription = styled.div`
  font-size: 0.875rem;
  color: var(--color-grey-600);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const UnavailableText = styled.span`
  color: var(--color-red-600);
  font-size: 0.8rem;
`;

const OptionPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) =>
    props.$express ? 'var(--color-primary)' : 'var(--color-grey-900)'};
  text-align: right;
`;

const Checkmark = styled.span`
  color: var(--color-primary);
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
`;

const LoadingText = styled.span`
  color: var(--color-grey-600);
  font-size: 0.9rem;
`;

const ErrorContainer = styled.div`
  padding: 1rem;
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-sm);
`;

const ErrorText = styled.span`
  color: var(--color-red-700);
  font-size: 0.9rem;
`;

const SurchargeBreakdown = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SurchargeItem = styled.div`
  font-size: 0.85rem;
  color: var(--color-grey-700);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

