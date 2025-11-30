import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaTruck,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import {
  useCreateAddressWithZone,
} from '../../shared/hooks/useAddress';
import {
  useUpdateOrderAddressAndRecalculate,
  usePayShippingDifference,
} from '../../shared/hooks/useOrder';
import { useCalculateShipping } from '../../shared/hooks/useShippingCalculation';
import { useShippingCalculator } from '../../shared/hooks/useShippingCalculator';
import { detectZone } from '../../shared/utils/zoneDetection';
import { WAREHOUSE_LOCATION } from '../../shared/config/warehouseConfig';
import { ButtonSpinner } from '../../components/loading';
import { PrimaryButton, SecondaryButton } from '../../shared/components/ui/Buttons';

/**
 * EditOrderModal Component
 * Allows buyer to change shipping address and method, with recalculation
 */
const EditOrderModal = ({ isOpen, onClose, order, onSuccess }) => {
  // State management
  const [step, setStep] = useState('form'); // 'form' | 'payment'
  const [shippingType, setShippingType] = useState('standard');
  const [recalculatedFee, setRecalculatedFee] = useState(null);
  const [recalculatedEstimate, setRecalculatedEstimate] = useState('');
  const [recalculatedZone, setRecalculatedZone] = useState(null);
  const [recalculatedDistanceKm, setRecalculatedDistanceKm] = useState(null);
  const [feeBreakdown, setFeeBreakdown] = useState(null);
  const [isFragile, setIsFragile] = useState(false);
  const [additionalPaymentRequired, setAdditionalPaymentRequired] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [zone, setZone] = useState('C');

  // Form state for address
  const [formData, setFormData] = useState({
    streetAddress: '',
    city: '',
    area: '',
    region: 'greater accra',
    district: '',
    fullName: '',
    contactPhone: '',
    landmark: '',
    coordinates: null, // { lat, lng } - for distance-based calculation
  });

  // Hooks
  const { mutate: createAddress, isPending: addressSaved } = useCreateAddressWithZone();
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrderAddressAndRecalculate();
  const { mutate: payDifference, isPending: paymentProcessing } = usePayShippingDifference();
  const { mutate: calculateShipping, isPending: calculatingShipping } = useCalculateShipping();
  const { mutate: calculateNewShipping, isPending: calculatingNewShipping } = useShippingCalculator();

  // Set initial values
  useEffect(() => {
    if (order) {
      if (order.shippingType) {
        setShippingType(order.shippingType);
      }
      // Pre-fill form with current shipping address if available
      if (order.shippingAddress && typeof order.shippingAddress === 'object') {
        setFormData({
          streetAddress: order.shippingAddress.streetAddress || '',
          city: order.shippingAddress.city || '',
          area: order.shippingAddress.area || order.shippingAddress.town || '',
          region: order.shippingAddress.region || 'greater accra',
          district: order.shippingAddress.district || '',
          fullName: order.shippingAddress.fullName || '',
          contactPhone: order.shippingAddress.contactPhone || '',
          landmark: order.shippingAddress.landmark || '',
          coordinates: order.shippingAddress.coordinates || 
                      (order.shippingAddress.latitude && order.shippingAddress.longitude 
                        ? { lat: order.shippingAddress.latitude, lng: order.shippingAddress.longitude }
                        : null),
        });
      }
    }
  }, [order]);

  // Recalculate shipping fee using distance-based ShippingRate system
  const recalculateShippingFee = useCallback((weightOverride = null) => {
    if (!formData.city || !formData.region) return;

    const weight = weightOverride || order?.weight || 0.5;
    
    // Use distance-based calculation if coordinates are available
    // IMPORTANT: Origin is always the fixed warehouse - backend handles this automatically
    // Only pass destination coordinates or address string
    if (formData.coordinates && formData.coordinates.lat && formData.coordinates.lng) {
      // Build destination address string for geocoding if needed
      const addressParts = [
        formData.streetAddress,
        formData.area,
        formData.city,
        formData.region,
        'Ghana'
      ].filter(Boolean);
      const destinationAddress = addressParts.join(', ');
      
      calculateNewShipping(
        {
          weight,
          type: shippingType,
          destination: {
            lat: formData.coordinates.lat,
            lng: formData.coordinates.lng,
          },
          destinationAddress, // Also pass address string for backend geocoding validation
        },
        {
          onSuccess: (response) => {
            const fee = response?.shippingFee;
            const estimate = response?.estimatedDays || '';
            const zone = response?.zone;
            const distanceKm = response?.distanceKm;
            const breakdown = response?.breakdown;
            
            if (fee !== undefined && fee !== null) {
              setRecalculatedFee(fee);
              setRecalculatedEstimate(estimate);
              setRecalculatedZone(zone);
              setRecalculatedDistanceKm(distanceKm);
              setFeeBreakdown(breakdown);
              setZone(zone || 'C');
            }
          },
          onError: (error) => {
            console.error('Failed to calculate shipping with distance-based system:', error);
            // Fallback to zone-based calculation
            const detectedZone = detectZone(formData.region, formData.city);
            setZone(detectedZone);
            calculateNewShipping(
              {
                weight,
                shippingType,
                zone: detectedZone,
              },
              {
                onSuccess: (fallbackResponse) => {
                  const fee = fallbackResponse?.shippingFee;
                  const estimate = fallbackResponse?.estimatedDays || '';
                  if (fee !== undefined && fee !== null) {
                    setRecalculatedFee(fee);
                    setRecalculatedEstimate(estimate);
                  }
                },
              }
            );
          },
        }
      );
    } else {
      // Fallback to zone-based calculation if no coordinates
      const detectedZone = detectZone(formData.region, formData.city);
      setZone(detectedZone);
      
      calculateNewShipping(
        {
          weight,
          shippingType,
          zone: detectedZone,
        },
        {
          onSuccess: (response) => {
            const fee = response?.shippingFee;
            const estimate = response?.estimatedDays || '';
            
            if (fee !== undefined && fee !== null) {
              setRecalculatedFee(fee);
              setRecalculatedEstimate(estimate);
            }
          },
          onError: (error) => {
            console.error('Failed to calculate shipping:', error);
          },
        }
      );
    }
  }, [formData.city, formData.region, formData.coordinates, shippingType, order?.weight, calculateNewShipping]);

  // Auto-recalculate shipping when zone or shipping type changes
  useEffect(() => {
    if (formData.city && formData.streetAddress) {
      const weight = order?.weight || 0.5;
      recalculateShippingFee(weight);
    }
  }, [zone, shippingType, formData.city, formData.streetAddress, order?.weight, recalculateShippingFee]);

  // Check if order is editable
  const isOrderEditable = () => {
    if (!order?.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  const canEdit = isOrderEditable();

  // Determine shipping zone based on city and region
  const determineZone = (city, region) => {
    const cityUpper = city?.toUpperCase() || '';
    const regionUpper = region?.toUpperCase() || '';

    // Zone A: Accra core areas
    if (
      cityUpper === 'ACCRA' &&
      (cityUpper.includes('OSU') ||
        cityUpper.includes('EAST LEGON') ||
        cityUpper.includes('LABONE') ||
        cityUpper.includes('CANTONMENTS') ||
        cityUpper.includes('AIRPORT'))
    ) {
      return 'A';
    }

    // Zone B: Greater Accra outskirts and nearby cities
    if (
      regionUpper.includes('GREATER ACCRA') ||
      cityUpper === 'TEMA' ||
      cityUpper === 'KASOA' ||
      cityUpper === 'MADINA' ||
      cityUpper === 'ADENTA'
    ) {
      return 'B';
    }

    // Zone C: All other regions
    return 'C';
  };

  // Handle zone change when city or region changes
  const handleCityOrRegionChange = (field, value) => {
    handleInputChange(field, value);
    
    // Update zone based on city/region
    if (field === 'city' || field === 'region') {
      const newCity = field === 'city' ? value : formData.city;
      const newRegion = field === 'region' ? value : formData.region;
      const newZone = determineZone(newCity, newRegion);
      setZone(newZone);
      
      // Recalculate shipping if order weight exists
      if (order?.weight) {
        calculateShipping(
          {
            weight: order.weight,
            shippingType,
            zone: newZone,
            orderTime: new Date().toISOString(),
          },
          {
            onSuccess: (response) => {
              const fee = response.shippingFee || response.data?.shippingFee;
              const estimate = response.deliveryEstimate || response.data?.deliveryEstimate;
              if (fee !== undefined) {
                setRecalculatedFee(fee);
                setRecalculatedEstimate(estimate || '');
              }
            },
            onError: (error) => {
              console.error('Failed to calculate shipping:', error);
            },
          }
        );
      }
    }
  };

  // Handle shipping type change
  const handleShippingTypeChange = (type) => {
    setShippingType(type);
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.streetAddress || !formData.city || !formData.fullName || !formData.contactPhone) {
      alert('Please fill in all required fields');
      return;
    }

    // First, create the address
    createAddress(
      {
        ...formData,
        region: formData.region.toLowerCase(),
        country: 'Ghana',
      },
      {
        onSuccess: async (data) => {
          const newAddress = data.data.address;
          const addressId = newAddress._id;

          // Then update the order with new address and recalculate
          updateOrder(
            {
              orderId: order._id,
              addressId,
              shippingType,
            },
            {
              onSuccess: (orderData) => {
                const result = orderData.data;

                if (result.requiresAdditionalPayment) {
                  setAdditionalPaymentRequired(true);
                  setPaymentData({
                    additionalAmount: result.additionalAmount,
                    oldShippingFee: result.oldShippingFee,
                    newShippingFee: result.newShippingFee,
                  });
                  setStep('payment');
                } else {
                  // Success - no additional payment needed
                  if (onSuccess) {
                    onSuccess(orderData);
                  }
                  onClose();
                }
              },
              onError: (error) => {
                alert(error?.response?.data?.message || 'Failed to update order');
              },
            }
          );
        },
        onError: (error) => {
          alert(error?.response?.data?.message || 'Failed to create address');
        },
      }
    );
  };

  // Handle pay additional amount
  const handlePayAdditional = () => {
    payDifference(order._id, {
      onSuccess: (data) => {
        // Redirect to payment URL
        window.location.href = data.data.authorizationUrl;
      },
      onError: (error) => {
        alert(error?.response?.data?.message || 'Failed to initialize payment');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaMapMarkerAlt />
            Edit Shipping Address & Method
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {!canEdit ? (
            <WarningMessage>
              <FaExclamationTriangle />
              <div>
                <strong>Order cannot be edited</strong>
                <p>
                  Orders can only be edited within 24 hours of placement. This order was placed{' '}
                  {order?.createdAt
                    ? `${Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60))} hours ago`
                    : 'more than 24 hours ago'}
                  .
                </p>
              </div>
            </WarningMessage>
          ) : step === 'form' ? (
            <Form onSubmit={handleSubmit}>
              {/* SECTION 1: Address Information Form */}
              <FormSection>
                <FormTitle>Address Information</FormTitle>
                
                <FormGroup>
                  <FormLabel>Full Name *</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Contact Phone *</FormLabel>
                  <FormInput
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    required
                    placeholder="0244123456"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Street Address *</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    required
                    placeholder="Enter street address"
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <FormLabel>City *</FormLabel>
                    <FormSelect
                      value={formData.city}
                      onChange={(e) => handleCityOrRegionChange('city', e.target.value)}
                      required
                    >
                      <option value="">Select City</option>
                      <option value="ACCRA">Accra</option>
                      <option value="TEMA">Tema</option>
                      <option value="KASOA">Kasoa</option>
                      <option value="KUMASI">Kumasi</option>
                      <option value="TAKORADI">Takoradi</option>
                      <option value="CAPE COAST">Cape Coast</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Neighborhood/Area (e.g., Osu, East Legon, Labone, Nima)</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Enter neighborhood/area"
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <FormLabel>Region</FormLabel>
                    <FormSelect
                      value={formData.region}
                      onChange={(e) => handleCityOrRegionChange('region', e.target.value)}
                    >
                      <option value="greater accra">Greater Accra</option>
                      <option value="ashanti">Ashanti</option>
                      <option value="western">Western</option>
                      <option value="central">Central</option>
                      <option value="eastern">Eastern</option>
                      <option value="volta">Volta</option>
                      <option value="northern">Northern</option>
                      <option value="upper east">Upper East</option>
                      <option value="upper west">Upper West</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>District (Optional)</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="Enter district"
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <FormLabel>Landmark (Optional)</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => handleInputChange('landmark', e.target.value)}
                    placeholder="Near a landmark or building"
                  />
                </FormGroup>
              </FormSection>

              {/* SECTION 3: Shipping Method Selection */}
              <FormSection>
                <FormTitle>Shipping Method</FormTitle>
                <ShippingOptions>
                  <ShippingTypeCard
                    $selected={shippingType === 'standard'}
                    onClick={() => handleShippingTypeChange('standard')}
                  >
                    <RadioInput
                      type="radio"
                      name="shippingType"
                      checked={shippingType === 'standard'}
                      onChange={() => handleShippingTypeChange('standard')}
                    />
                    <ShippingCardContent>
                      <ShippingCardHeader>
                        <FaClock />
                        <span>Standard Delivery</span>
                      </ShippingCardHeader>
                      <ShippingCardDetails>
                        {recalculatedFee && shippingType === 'standard' ? (
                          <>
                            <ShippingPrice>GH₵{recalculatedFee.toFixed(2)}</ShippingPrice>
                            <ShippingEstimate>{recalculatedEstimate || '1-3 Business Days'}</ShippingEstimate>
                          </>
                        ) : calculatingShipping ? (
                          <CalculatingText>
                            <ButtonSpinner size="sm" />
                            Calculating...
                          </CalculatingText>
                        ) : (
                          <CalculatingText>Select to see price</CalculatingText>
                        )}
                      </ShippingCardDetails>
                    </ShippingCardContent>
                  </ShippingTypeCard>

                  <ShippingTypeCard
                    $selected={shippingType === 'same_day'}
                    onClick={() => handleShippingTypeChange('same_day')}
                  >
                    <RadioInput
                      type="radio"
                      name="shippingType"
                      checked={shippingType === 'same_day'}
                      onChange={() => handleShippingTypeChange('same_day')}
                    />
                    <ShippingCardContent>
                      <ShippingCardHeader>
                        <FaTruck />
                        <span>Same-Day Delivery</span>
                      </ShippingCardHeader>
                      <ShippingCardDetails>
                        {recalculatedFee && shippingType === 'same_day' ? (
                          <>
                            <ShippingPrice>GH₵{recalculatedFee.toFixed(2)}</ShippingPrice>
                            <ShippingEstimate>{recalculatedEstimate || 'Arrives Today'}</ShippingEstimate>
                          </>
                        ) : calculatingShipping ? (
                          <CalculatingText>
                            <ButtonSpinner size="sm" />
                            Calculating...
                          </CalculatingText>
                        ) : (
                          <CalculatingText>Select to see price</CalculatingText>
                        )}
                      </ShippingCardDetails>
                    </ShippingCardContent>
                  </ShippingTypeCard>
                </ShippingOptions>

                {recalculatedFee && (
                  <ShippingFeeDisplay>
                    <InfoMessage>
                      <FaInfoCircle />
                      <span>
                        Shipping fee calculated: <strong>GH₵{recalculatedFee.toFixed(2)}</strong> for{' '}
                        {zone === 'A' ? 'Zone A (Same City)' : zone === 'B' ? 'Zone B (Nearby City)' : 'Zone C (Nationwide)'}
                      </span>
                    </InfoMessage>
                  </ShippingFeeDisplay>
                )}
              </FormSection>

              {/* SECTION 4: Actions */}
              <FormActions>
                <SecondaryButton type="button" onClick={onClose} disabled={isUpdating || addressSaved}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={
                    isUpdating ||
                    addressSaved ||
                    !formData.streetAddress ||
                    !formData.city ||
                    !formData.fullName ||
                    !formData.contactPhone ||
                    calculatingShipping
                  }
                >
                  {isUpdating || addressSaved ? (
                    <>
                      <ButtonSpinner size="sm" />
                      {addressSaved ? 'Saving Address...' : 'Updating Order...'}
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </PrimaryButton>
              </FormActions>
            </Form>
          ) : step === 'payment' && additionalPaymentRequired ? (
            <PaymentSection>
              <FormTitle>Additional Payment Required</FormTitle>
              <PaymentInfo>
                <InfoBox>
                  <FaInfoCircle />
                  <div>
                    <strong>Your new address increases the shipping cost.</strong>
                    <PaymentDetails>
                      <DetailRow>
                        <span>Old Shipping Fee:</span>
                        <span>GH₵{paymentData?.oldShippingFee?.toFixed(2) || '0.00'}</span>
                      </DetailRow>
                      <DetailRow>
                        <span>New Shipping Fee:</span>
                        <span>GH₵{paymentData?.newShippingFee?.toFixed(2) || '0.00'}</span>
                      </DetailRow>
                      <DetailRow $total>
                        <span>Additional Amount:</span>
                        <span>GH₵{paymentData?.additionalAmount?.toFixed(2) || '0.00'}</span>
                      </DetailRow>
                    </PaymentDetails>
                  </div>
                </InfoBox>
              </PaymentInfo>
            </PaymentSection>
          ) : null}
        </ModalBody>

        {step === 'payment' && additionalPaymentRequired && (
          <ModalFooter>
            <SecondaryButton onClick={() => setStep('form')} disabled={paymentProcessing}>
              Back
            </SecondaryButton>
            <PrimaryButton onClick={handlePayAdditional} disabled={paymentProcessing}>
              {paymentProcessing ? (
                <>
                  <ButtonSpinner size="sm" />
                  Processing...
                </>
              ) : (
                `Pay GH₵${paymentData?.additionalAmount?.toFixed(2) || '0.00'} Now`
              )}
            </PrimaryButton>
          </ModalFooter>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditOrderModal;

// ────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;

  svg {
    color: var(--color-primary-500);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-grey-600);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-grey-900);
  }
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
`;

const WarningMessage = styled.div`
  background: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);

  svg {
    color: var(--color-yellow-600);
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  strong {
    display: block;
    color: var(--color-yellow-800);
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--color-yellow-700);
    margin: 0;
    font-size: var(--font-size-sm);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);

  &:last-of-type {
    border-bottom: none;
  }
`;

const FormTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary-100);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const FormLabel = styled.label`
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const FormInput = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const FormSelect = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
`;


const ShippingOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ShippingTypeCard = styled.div`
  border: 2px solid
    ${(props) => (props.$selected ? 'var(--color-primary-500)' : 'var(--color-grey-200)')};
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$selected ? 'var(--color-primary-50)' : 'var(--color-white-0)'};

  &:hover {
    border-color: ${(props) =>
      props.$selected ? 'var(--color-primary-500)' : 'var(--color-primary-300)'};
    background: ${(props) =>
      props.$selected ? 'var(--color-primary-50)' : 'var(--color-grey-50)'};
  }
`;

const RadioInput = styled.input`
  display: none;
`;

const ShippingCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const ShippingCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-size: var(--font-size-md);
`;

const ShippingCardDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
`;

const ShippingPrice = styled.span`
  font-weight: var(--font-semibold);
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
`;

const ShippingEstimate = styled.span`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
`;

const CalculatingText = styled.span`
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const ShippingFeeDisplay = styled.div`
  margin-top: var(--spacing-md);
`;

const InfoMessage = styled.div`
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-blue-700);
  font-size: var(--font-size-sm);

  svg {
    color: var(--color-blue-600);
    flex-shrink: 0;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
`;

const PaymentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const PaymentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const InfoBox = styled.div`
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);

  svg {
    color: var(--color-blue-600);
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  strong {
    display: block;
    color: var(--color-blue-800);
    margin-bottom: var(--spacing-md);
  }
`;

const PaymentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  ${(props) =>
    props.$total &&
    `
    border-top: 1px solid var(--color-blue-200);
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-md);
    font-weight: var(--font-semibold);
    font-size: var(--font-size-md);
  `}
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
`;
