import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  FaHome,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaCity,
  FaGlobe,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaStar,
  FaRegStar,
  FaLocationArrow,
  FaCheckCircle,
  FaCompass,
  FaMapPin,
  FaSearchLocation
} from "react-icons/fa";

// Import your React Query hooks
import {
  useGetUserAddress,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  useSetDefaultAddress,
} from '../../shared/hooks/useAddress';
import Button from '../../shared/components/Button';
import { ErrorState, ShimmerAddressCards } from '../../components/loading';
import locationApi from '../../shared/services/locationApi';
import { useModal } from '../../shared/hooks/useModal';
import logger from '../../shared/utils/logger';
import { sanitizeText, sanitizeAddress, sanitizePhone } from '../../shared/utils/sanitize';
import NeighborhoodAutocomplete from '../../shared/components/NeighborhoodAutocomplete';

export default function AddressPage() {
  const navigate = useNavigate();

  // React Query hooks
  const {
    data: addressData,
    isLoading,
    isError,
    refetch,
  } = useGetUserAddress();
  // Address data loaded

  const savedAddresses = useMemo(
    () => addressData?.data?.data?.addresses || [],
    [addressData]
  );

  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress();

  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isDigitalAddressLoading, setIsDigitalAddressLoading] = useState(false);
  const [digitalAddressError, setDigitalAddressError] = useState(null);
  const { showDanger } = useModal();
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    contactPhone: "",
    streetAddress: "",
    area: "",
    landmark: "",
    city: "",
    region: "",
    country: "Ghana",
    additionalInformation: "",
    digitalAddress: "",
    isDefault: false,
  });


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear digital address error when user starts typing
    if (name === "digitalAddress" && digitalAddressError) {
      setDigitalAddressError("");
    }

    // Convert input values to lowercase (except special fields)
    let processedValue = value;

    if (type !== "checkbox" && type !== "tel") {
      // Fields that should be uppercase (only digitalAddress)
      if (name === "digitalAddress") {
        processedValue = value.toUpperCase();
      }
      // Fields that should be lowercase
      else if (["fullName", "streetAddress", "area", "landmark", "city", "region", "country", "additionalInformation"].includes(name)) {
        processedValue = value.toLowerCase();
      }
      // contactPhone and other fields remain as typed
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));
  };

  // Validate Ghana digital address format
  const validateDigitalAddress = (address) => {
    if (!address) return true; // Digital address is optional

    const cleaned = address.replace(/[^A-Z0-9]/g, "");
    return /^[A-Z]{2}\d{7}$/.test(cleaned);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Call backend reverse geocoding endpoint (avoids CSP violations and uses Google Maps API)
          const reverseGeocodeResponse = await locationApi.reverseGeocode(latitude, longitude);
          const addressData = reverseGeocodeResponse?.data || reverseGeocodeResponse;

          if (!addressData) {
            throw new Error("No address data received from server");
          }

          let digitalAddress = "";
          try {
            const digitalAddressResponse = await locationApi.convertCoordinatesToDigitalAddress(latitude, longitude);
            const digitalAddressData = digitalAddressResponse?.data || digitalAddressResponse;
            digitalAddress = digitalAddressData?.digitalAddress || "";
          } catch (digitalError) {
            logger.warn("Failed to convert coordinates to GhanaPost GPS digital address:", digitalError);
            const latSuffix = Math.floor((Math.abs(latitude) % 1) * 10000);
            const lngPrefix = Math.abs(Math.floor(longitude));
            digitalAddress = `GA-${String(lngPrefix).padStart(3, "0")}-${String(latSuffix).padStart(4, "0")}`;
          }

          // Extract address components
          const extractedStreet = (addressData.street || addressData.streetAddress || "").trim();
          const extractedTown = (addressData.town || addressData.neighborhood || addressData.area || "").trim();
          const extractedCityRaw = addressData.city || "";
          const extractedCityUppercase = extractedCityRaw ? extractedCityRaw.toUpperCase().trim() : "";
          const extractedRegion = addressData.region
            ? addressData.region.toLowerCase().trim()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            : "";

          // Update form with location data
          setFormData((prev) => ({
            ...prev,
            streetAddress: prev.streetAddress || extractedStreet,
            area: prev.area || extractedTown,
            landmark: prev.landmark || "",
            city: prev.city || extractedCityUppercase,
            region: prev.region || extractedRegion,
            country: addressData.country || "Ghana",
            digitalAddress: prev.digitalAddress || digitalAddress,
          }));
        } catch (error) {
          logger.error("Reverse geocoding error:", error);

          if (error.response?.status === 400 || error.response?.status === 404) {
            setLocationError("Address not found for this location. Please enter manually.");
          } else {
            setLocationError("Failed to get address details. Please enter manually.");
          }
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        // Downgrade from error to warn since this is a common, expected failure
        logger.warn("Geolocation warning:", error.message || error);

        let errorMessage = "Location access denied. Please enable location services.";
        const errorMsgStr = error.message ? error.message.toLowerCase() : "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            if (errorMsgStr.includes("kclerrorlocationunknown")) {
              errorMessage = "Safari cannot detect location (CoreLocation Error). Please enter address manually.";
            } else {
              errorMessage = "Location information is unavailable. Please enter your address manually.";
            }
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            if (errorMsgStr.includes("kclerrorlocationunknown")) {
              errorMessage = "Safari cannot detect location (CoreLocation Error). Please enter address manually.";
            } else {
              errorMessage = "Failed to get your location. Please enter address manually.";
            }
            break;
        }

        setLocationError(errorMessage);
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // Validate digital address
    if (
      formData.country === "Ghana" &&
      !validateDigitalAddress(formData.digitalAddress)
    ) {
      setDigitalAddressError("Please use format: GA-123-4567");
      return;
    }

    // Prepare data with lowercase string fields
    // SECURITY: Sanitize all address inputs
    const dataToSend = {
      ...formData,
      // SECURITY: Sanitize all text inputs
      fullName: sanitizeText(formData.fullName || "", 100).toLowerCase(),
      streetAddress: sanitizeAddress(formData.streetAddress || "").toLowerCase(),
      area: sanitizeText(formData.area || "", 100).toLowerCase(),
      landmark: sanitizeText(formData.landmark || "", 100).toLowerCase(),
      city: sanitizeText(formData.city || "", 50).toLowerCase(),
      region: sanitizeText(formData.region || "", 50).toLowerCase(),
      country: sanitizeText(formData.country || "Ghana", 50).toLowerCase(),
      additionalInformation: sanitizeText(formData.additionalInformation || "", 500).toLowerCase(),
      // SECURITY: Sanitize digital address (uppercase, alphanumeric only)
      digitalAddress: (formData.digitalAddress || "").replace(/[^A-Z0-9]/g, '').toUpperCase().substring(0, 9),
      // SECURITY: Sanitize phone number
      contactPhone: sanitizePhone(formData.contactPhone || ""),
      // Keep boolean as is
      isDefault: formData.isDefault,
    };

    if (editingAddress) {
      const addressId = editingAddress.id || editingAddress._id;
      updateAddress(
        { id: addressId, data: dataToSend },
        {
          onSuccess: () => {
            resetForm();
            refetch();
          },
          onError: (error) => {
            logger.error("Error updating address:", error);
          },
        }
      );
    } else {
      createAddress(dataToSend, {
        onSuccess: () => {
          resetForm();
          refetch();
        },
        onError: (error) => {
          logger.error("Error creating address:", error);
        },
      });
    }
  };

  const handleEditAddress = (address) => {
    // Editing address
    // Use address.id or address._id (handle both formats)
    const addressId = address.id || address._id;

    // Populate form with address data - preserve original casing for display
    // The form will convert to lowercase as user types, but we show original values initially
    setFormData({
      id: addressId,
      fullName: address.fullName || "",
      contactPhone: address.contactPhone || "",
      streetAddress: address.streetAddress || "",
      area: address.area || "",
      landmark: address.landmark || "",
      city: address.city || "",
      region: address.region || "",
      country: address.country || "Ghana",
      additionalInformation: address.additionalInformation || "",
      digitalAddress: address.digitalAddress || "",
      isDefault: address.isDefault || false,
    });

    // Store the full address object with normalized id
    setEditingAddress({ ...address, id: addressId });
    setShowForm(true);
  };

  const handleDeleteAddress = (id) => {
    showDanger({
      title: "Delete Address?",
      message: "Are you sure you want to delete this address?",
      onConfirm: () => {
        deleteAddress(id, {
          onError: (error) => {
            logger.error("Error deleting address:", error);
          },
        });
      }
    });
  };

  const handleSetDefault = (id) => {
    setDefaultAddress(id, {
      onSuccess: () => refetch(),
      onError: (error) => {
        logger.error("Error setting default address:", error);
      },
    });
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      contactPhone: "",
      streetAddress: "",
      area: "",
      landmark: "",
      city: "",
      region: "",
      country: "Ghana",
      additionalInformation: "",
      digitalAddress: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setShowForm(false);
    setDigitalAddressError("");
    setLocationError("");
  };

  if (isLoading) {
    return (
      <PageContainer style={{ padding: '24px 16px' }}>
        <ShimmerAddressCards />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Error loading addresses"
        message="Please try again."
        action={<RetryButton onClick={() => refetch()}>Retry</RetryButton>}
      />
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <BackButton onClick={() => navigate(-1)}>
              <FaArrowLeft />
              Back to Profile
            </BackButton>
            <Title>Shipping Addresses</Title>
            <Subtitle>Manage your delivery locations and preferences</Subtitle>
          </TitleSection>

          <StatsCard>
            <StatItem>
              <StatValue>{savedAddresses.length}</StatValue>
              <StatLabel>Saved Addresses</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>
                {savedAddresses.filter(addr => addr.isDefault).length}
              </StatValue>
              <StatLabel>Default</StatLabel>
            </StatItem>
          </StatsCard>
        </HeaderContent>
      </HeaderSection>

      <ContentWrapper>
        {showForm ? (
          <FormSection>
            <FormHeader>
              <FormTitle>
                <FaMapMarkerAlt />
                {editingAddress ? "Edit Address" : "Add New Address"}
              </FormTitle>
              <FormDescription>
                {editingAddress
                  ? "Update your address details below"
                  : "Fill in your complete address for accurate delivery"
                }
              </FormDescription>
            </FormHeader>

            <Form onSubmit={handleSaveAddress}>
              <FormGrid>
                <FormGroup>
                  <Label>
                    <FaUser />
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    disabled={isCreating || isUpdating}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaPhone />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                    disabled={isCreating || isUpdating}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaMapPin />
                    Street Address
                  </Label>
                  <Input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="House number, street name"
                    required
                    disabled={isCreating || isUpdating}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaMapPin />
                    Neighborhood/Area *
                  </Label>
                  <NeighborhoodAutocomplete
                    value={formData.area}
                    city={formData.city}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, area: value }));
                    }}
                    onCitySelect={(city) => {
                      setFormData((prev) => ({ ...prev, city }));
                    }}
                    placeholder="Search for your neighborhood..."
                    disabled={isCreating || isUpdating}
                    required
                  />
                  <HelpText>
                    Search your neighborhood — city will be auto-filled
                  </HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaCompass />
                    Landmark (Optional)
                  </Label>
                  <Input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Near Osu Castle (optional)"
                    disabled={isCreating || isUpdating}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaCompass />
                    Digital Address
                    <LocationButton
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isFetchingLocation || formData.country !== "Ghana"}
                    >
                      <FaSearchLocation />
                      {isFetchingLocation ? "Detecting..." : "Auto-detect"}
                    </LocationButton>
                  </Label>
                  <Input
                    type="text"
                    name="digitalAddress"
                    value={formData.digitalAddress}
                    onChange={handleInputChange}
                    placeholder="GA-123-4567"
                    disabled={isCreating || isUpdating || formData.country !== "Ghana"}
                  />
                  {digitalAddressError && (
                    <ErrorText>{digitalAddressError}</ErrorText>
                  )}
                  {locationError && <ErrorText>{locationError}</ErrorText>}
                  <HelpText>
                    {formData.country === "Ghana"
                      ? "Format: GA-123-4567 (Ghana Post GPS)"
                      : "Digital address only available for Ghana"}
                  </HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaCity />
                    City
                  </Label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                    disabled={isCreating || isUpdating}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaGlobe />
                    Region
                  </Label>
                  <Input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Region/State/Province"
                    required
                    disabled={isCreating || isUpdating}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaGlobe />
                    Country
                  </Label>
                  <Select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={isCreating || isUpdating}
                  >
                    <option value="Ghana">Ghana</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label>Additional Information</Label>
                <Textarea
                  name="additionalInformation"
                  value={formData.additionalInformation}
                  onChange={handleInputChange}
                  placeholder="Apartment number, floor, landmarks, delivery instructions..."
                  disabled={isCreating || isUpdating}
                  rows={3}
                />
              </FormGroup>

              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  id="isDefault"
                  disabled={isCreating || isUpdating}
                />
                <CheckboxLabel htmlFor="isDefault">
                  <FaCheckCircle />
                  Set as default shipping address
                </CheckboxLabel>
              </CheckboxGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isCreating || isUpdating}
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </ButtonGroup>
            </Form>
          </FormSection>
        ) : (
          <AddAddressSection>
            <AddAddressCard onClick={() => setShowForm(true)}>
              <AddIcon>
                <FaPlus />
              </AddIcon>
              <AddContent>
                <AddTitle>Add New Address</AddTitle>
                <AddDescription>Create a new delivery address</AddDescription>
              </AddContent>
            </AddAddressCard>
          </AddAddressSection>
        )}

        <AddressListSection>
          <SectionHeader>
            <SectionTitle>
              <FaHome />
              Your Addresses
              <CountBadge>{savedAddresses.length}</CountBadge>
            </SectionTitle>
            <SectionDescription>
              Manage your saved delivery addresses
            </SectionDescription>
          </SectionHeader>

          {savedAddresses.length > 0 ? (
            <AddressGrid>
              {savedAddresses.map((address) => (
                <AddressCard key={address.id || address._id || `address-${address.streetAddress}-${address.city}`} $isDefault={address.isDefault}>
                  {address.isDefault && (
                    <DefaultBadge>
                      <FaStar />
                      Default Address
                    </DefaultBadge>
                  )}

                  <AddressHeader>
                    <AddressInfo>
                      <AddressName>{address.fullName}</AddressName>
                      <AddressPhone>{address.contactPhone}</AddressPhone>
                    </AddressInfo>
                    <ActionButtons>
                      <SetDefaultButton
                        onClick={() => handleSetDefault(address.id || address._id)}
                        title={address.isDefault ? "Default address" : "Set as default"}
                        disabled={isSettingDefault || address.isDefault}
                        $isDefault={address.isDefault}
                      >
                        {address.isDefault ? <FaStar /> : <FaRegStar />}
                        {address.isDefault ? "Default" : "Set Default"}
                      </SetDefaultButton>
                      <EditButton
                        onClick={() => handleEditAddress(address)}
                        title="Edit address"
                      >
                        <FaEdit />
                        Edit
                      </EditButton>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteAddress(address.id || address._id)}
                        loading={isDeleting}
                        ariaLabel="Delete address"
                        title="Delete address"
                      >
                        <FaTrash />
                        Delete
                      </Button>
                    </ActionButtons>
                  </AddressHeader>

                  <AddressDetails>
                    <AddressLine>{address.streetAddress}</AddressLine>
                    {address.area && (
                      <AddressLine>
                        <AreaLabel>Area/Town:</AreaLabel> {address.area}
                      </AddressLine>
                    )}
                    {address.landmark && (
                      <AddressLine>
                        <LandmarkLabel>Landmark:</LandmarkLabel> {address.landmark}
                      </AddressLine>
                    )}
                    {address.digitalAddress && (
                      <DigitalAddress>
                        <FaMapMarkerAlt />
                        {address.digitalAddress}
                      </DigitalAddress>
                    )}
                    <LocationLine>
                      {address.city}, {address.region}, {address.country}
                    </LocationLine>
                    {address.additionalInformation && (
                      <AdditionalInfo>
                        {address.additionalInformation}
                      </AdditionalInfo>
                    )}
                  </AddressDetails>
                </AddressCard>
              ))}
            </AddressGrid>
          ) : (
            <EmptyState>
              <EmptyIllustration>
                <FaMapMarkerAlt />
              </EmptyIllustration>
              <EmptyContent>
                <EmptyTitle>No addresses saved</EmptyTitle>
                <EmptyMessage>
                  Add your first address to make checkout faster and easier
                </EmptyMessage>
                <AddButton onClick={() => setShowForm(true)}>
                  <FaPlus />
                  Add Your First Address
                </AddButton>
              </EmptyContent>
            </EmptyState>
          )}
        </AddressListSection>
      </ContentWrapper>
    </PageContainer>
  );
};

// Modern Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9f7f4;
  font-family: "Inter", sans-serif;

  @media (max-width: 768px) {
    padding: 1.6rem;
  }
`;

/* ── Banner ─────────────────── */
const HeaderSection = styled.section`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  overflow: hidden;
  padding: 2.5rem 2rem;
  margin-bottom: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(212,136,42,0.15) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.85);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;

  &:hover {
    background: rgba(212,136,42,0.2);
    border-color: rgba(212,136,42,0.4);
    color: #D4882A;
  }

  svg {
    font-size: 0.82rem;
  }
`;

const Title = styled.h1`
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.2rem;
`;

const Subtitle = styled.p`
  font-size: 0.88rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
`;

const StatsCard = styled.div`
  display: flex;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(212,136,42,0.25);
  border-radius: 14px;
  padding: 1rem 1.5rem;
  backdrop-filter: blur(6px);
  gap: 0;
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1.2rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: #D4882A;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.72rem;
  color: rgba(255,255,255,0.6);
  margin-top: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatDivider = styled.div`
  width: 1px;
  background: rgba(255,255,255,0.15);
  margin: 0.4rem 0;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;

const FormSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  padding: 3.2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 768px) {
    padding: 2.4rem;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 3.2rem;
`;

const FormTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a1f2e;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 0.8rem;

  svg {
    color: #D4882A;
  }
`;

const FormDescription = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--color-grey-800);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;

  svg {
    color: var(--color-grey-500);
    font-size: 1.4rem;
  }
`;

const Input = styled.input`
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 12px;
  font-size: 1.4rem;
  transition: all 0.2s;
  background: var(--color-white-0);

  &:focus {
    outline: none;
    border-color: #D4882A;
    box-shadow: 0 0 0 3px rgba(212, 136, 42, 0.15);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 12px;
  font-size: 1.4rem;
  background: var(--color-white-0);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #D4882A;
    box-shadow: 0 0 0 3px rgba(212, 136, 42, 0.15);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 12px;
  font-size: 1.4rem;
  resize: vertical;
  transition: all 0.2s;
  background: var(--color-white-0);

  &:focus {
    outline: none;
    border-color: #D4882A;
    box-shadow: 0 0 0 3px rgba(212, 136, 42, 0.15);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const LocationButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(212, 136, 42, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #B8711F 0%, #D4882A 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 136, 42, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.6rem;
  background: var(--color-grey-50);
  border-radius: 12px;
  border: 1px solid var(--color-grey-200);
`;

const Checkbox = styled.input`
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;
  color: var(--color-grey-700);
  cursor: pointer;

  svg {
    color: #D4882A;
  }

  &:has(input:disabled) {
    cursor: not-allowed;
    color: var(--color-grey-500);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.6rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StyledButton = styled.button`
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(StyledButton)`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;

const CancelButton = styled(StyledButton)`
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);

  &:hover:not(:disabled) {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }
`;

const AddAddressSection = styled.section``;

const AddAddressCard = styled.div`
  background: var(--color-white-0);
  border: 2px dashed #f0c070;
  border-radius: 20px;
  padding: 3.2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;

  &:hover {
    background: #fff7ed;
    border-color: #D4882A;
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(212, 136, 42, 0.15);
  }
`;

const AddIcon = styled.div`
  width: 6rem;
  height: 6rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.4rem;
  box-shadow: 0 4px 12px rgba(212, 136, 42, 0.35);
`;

const AddContent = styled.div``;

const AddTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
`;

const AddDescription = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const AddressListSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  padding: 3.2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 768px) {
    padding: 2.4rem;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 3.2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a1f2e;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 0.8rem;

  svg {
    color: #D4882A;
  }
`;

const SectionDescription = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const CountBadge = styled.span`
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: white;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-size: 1.4rem;
  font-weight: 600;
  margin-left: 1.2rem;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2.4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddressCard = styled.div`
  border: 2px solid ${props => props.$isDefault ? '#D4882A' : '#f0e8d8'};
  border-radius: 20px;
  padding: 2.4rem;
  position: relative;
  transition: all 0.3s;
  background: ${props => props.$isDefault ? '#fff7ed' : 'var(--color-white-0)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(212, 136, 42, 0.12);
    border-color: #D4882A;
  }
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(212, 136, 42, 0.35);
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-bottom: 1.6rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid #f0e8d8;
`;

const AddressInfo = styled.div`
  flex: 1;
`;

const AddressName = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
`;

const AddressPhone = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-300);
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SetDefaultButton = styled(ActionButton)`
  color: ${props => props.$isDefault ? 'var(--color-yellow-500)' : 'var(--color-grey-600)'};
  border-color: ${props => props.$isDefault ? 'var(--color-yellow-300)' : 'var(--color-grey-300)'};

  &:hover:not(:disabled) {
    color: var(--color-yellow-500);
    border-color: var(--color-yellow-300);
  }
`;

const EditButton = styled(ActionButton)`
  &:hover:not(:disabled) {
    color: #D4882A;
    border-color: #D4882A;
    background: #fff7ed;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover:not(:disabled) {
    color: var(--color-red-600);
    border-color: var(--color-red-300);
  }
`;

const AddressDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const AddressLine = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-800);
  font-weight: 500;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const AreaLabel = styled.span`
  font-weight: 600;
  color: var(--primary-700);
  font-size: 1.3rem;
`;

const LandmarkLabel = styled.span`
  font-weight: 600;
  color: var(--color-grey-600);
  font-size: 1.3rem;
`;

const DigitalAddress = styled.p`
  font-size: 1.3rem;
  color: var(--primary-700);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  svg {
    font-size: 1.2rem;
  }
`;

const LocationLine = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const AdditionalInfo = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);
  font-style: italic;
  padding-top: 1.2rem;
  border-top: 1px dashed var(--color-grey-300);
  margin-top: 0.8rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6.4rem 2.4rem;
  text-align: center;
`;

const EmptyIllustration = styled.div`
  width: 12rem;
  height: 12rem;
  background: linear-gradient(135deg, var(--color-grey-100) 0%, var(--color-grey-200) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.8rem;
  color: var(--color-grey-400);
  margin-bottom: 2.4rem;
`;

const EmptyContent = styled.div`
  max-width: 40rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  margin-bottom: 3.2rem;
  line-height: 1.5;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: white;
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(212, 136, 42, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(212, 136, 42, 0.4);
    background: linear-gradient(135deg, #B8711F 0%, #D4882A 100%);
  }
`;

const ErrorText = styled.span`
  color: var(--color-red-600);
  font-size: 1.2rem;
  margin-top: 0.4rem;
  display: block;
`;

const HelpText = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  margin-top: 0.4rem;
  display: block;
`;

const RetryButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(212, 136, 42, 0.3);

  &:hover {
    background: linear-gradient(135deg, #B8711F 0%, #D4882A 100%);
    transform: translateY(-1px);
  }
`;