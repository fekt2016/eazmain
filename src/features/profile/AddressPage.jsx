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
import { LoadingState, ErrorState, ButtonSpinner } from '../../components/loading';

const AddressManagementPage = () => {
  const navigate = useNavigate();

  // React Query hooks
  const {
    data: addressData,
    isLoading,
    isError,
    refetch,
  } = useGetUserAddress();
  console.log("addressData", addressData);

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
  const [digitalAddressError, setDigitalAddressError] = useState("");
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

          // Reverse geocode to get address details
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Extract address components
          const address = data.address || {};

          // Update form with location data
          setFormData((prev) => ({
            ...prev,
            streetAddress: address.road || address.highway || "",
            area: address.neighborhood || address.sublocality || address.sublocality_level_1 || "",
            landmark: address.landmark || "",
            city:
              address.city ||
              address.town ||
              address.village ||
              address.county ||
              "",
            region: address.state || address.region || "",
            country: address.country || "Ghana",
            digitalAddress: generateGhanaDigitalAddress(latitude, longitude),
          }));
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setLocationError(
            "Failed to get address details. Please enter manually."
          );
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          "Location access denied. Please enable location services."
        );
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Generate Ghana digital address from coordinates (mock implementation)
  const generateGhanaDigitalAddress = (lat, lng) => {
    // In a real app, you would use an actual Ghana Post GPS API here
    // This is a simplified mock implementation

    // Convert latitude to letters (GA for Ghana)
    const latSuffix = Math.floor((Math.abs(lat) % 1) * 10000);

    // Convert longitude to numbers
    const lngPrefix = Math.abs(Math.floor(lng));

    // Format as GA-XXX-YYYY
    return `GA-${String(lngPrefix).padStart(3, "0")}-${String(
      latSuffix
    ).padStart(4, "0")}`;
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
    // Note: city should be uppercase, digitalAddress should be uppercase, contactPhone should remain as is
    const dataToSend = {
      ...formData,
      // Convert string fields to lowercase (except city, digitalAddress, contactPhone)
      fullName: formData.fullName ? formData.fullName.toLowerCase().trim() : "",
      streetAddress: formData.streetAddress ? formData.streetAddress.toLowerCase().trim() : "",
      area: formData.area ? formData.area.toLowerCase().trim() : "",
      landmark: formData.landmark ? formData.landmark.toLowerCase().trim() : "",
      city: formData.city ? formData.city.toLowerCase().trim() : "", // City should be lowercase
      region: formData.region ? formData.region.toLowerCase().trim() : "",
      country: formData.country ? formData.country.toLowerCase().trim() : "",
      additionalInformation: formData.additionalInformation ? formData.additionalInformation.toLowerCase().trim() : "",
      // Keep these as is (uppercase or original format)
      digitalAddress: formData.digitalAddress ? formData.digitalAddress.toUpperCase().trim() : "",
      contactPhone: formData.contactPhone ? formData.contactPhone.trim() : "", // Phone numbers should not be converted
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
            console.error("Error updating address:", error);
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
          console.error("Error creating address:", error);
        },
      });
    }
  };

  const handleEditAddress = (address) => {
    console.log("editing address", address);
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
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddress(id, {
        onError: (error) => {
          console.error("Error deleting address:", error);
        },
      });
    }
  };

  const handleSetDefault = (id) => {
    setDefaultAddress(id, {
      onSuccess: () => refetch(),
      onError: (error) => {
        console.error("Error setting default address:", error);
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
    return <LoadingState message="Loading your addresses..." />;
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
                    Area/Town *
                  </Label>
                  <Input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., Nima, Cantonments, Tema Community 1"
                    required
                    disabled={isCreating || isUpdating}
                  />
                  <HelpText>
                    Enter your neighborhood/area name (e.g., Nima, Osu, Tema Community 1)
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
                <CancelButton
                  type="button"
                  onClick={resetForm}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </CancelButton>
                <SaveButton
                  type="submit"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <ButtonSpinner size="sm" />
                  ) : editingAddress ? (
                    "Update Address"
                  ) : (
                    "Save Address"
                  )}
                </SaveButton>
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
                <AddressCard key={address.id} $isDefault={address.isDefault}>
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
                        onClick={() => handleSetDefault(address.id)}
                        title={address.isDefault ? "Default address" : "Set as default"}
                        disabled={isSettingDefault || address.isDefault}
                        $isDefault={address.isDefault}
                      >
                        {address.isDefault ? <FaStar /> : <FaRegStar />}
                      </SetDefaultButton>
                      <EditButton 
                        onClick={() => handleEditAddress(address)}
                        title="Edit address"
                      >
                        <FaEdit />
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={isDeleting}
                        title="Delete address"
                      >
                        {isDeleting ? <ButtonSpinner size="sm" /> : <FaTrash />}
                      </DeleteButton>
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

export default AddressManagementPage;

// Modern Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media (max-width: 768px) {
    padding: 1.6rem;
  }
`;

const HeaderSection = styled.section`
  margin-bottom: 3.2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--color-white-0);
  color: var(--color-primary-600);
  border: 1px solid var(--color-grey-300);
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.6rem;

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    transform: translateY(-1px);
  }

  svg {
    font-size: 1.4rem;
  }
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-grey-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
`;

const StatsCard = styled.div`
  display: flex;
  background: var(--color-white-0);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  min-width: 25rem;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1.2rem;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-primary-600);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  margin-top: 0.4rem;
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 1px;
  background: var(--color-grey-200);
  margin: 0.4rem 0;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
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
  color: var(--color-grey-900);
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 0.8rem;

  svg {
    color: var(--color-primary-500);
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
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-600);
    transform: translateY(-1px);
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
    color: var(--color-primary-500);
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

const Button = styled.button`
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

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;

const CancelButton = styled(Button)`
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
  border: 2px dashed var(--color-primary-300);
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
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15);
  }
`;

const AddIcon = styled.div`
  width: 6rem;
  height: 6rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 2.4rem;
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
  color: var(--color-grey-900);
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 0.8rem;

  svg {
    color: var(--color-primary-500);
  }
`;

const SectionDescription = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const CountBadge = styled.span`
  background: var(--color-primary-500);
  color: var(--color-white-0);
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
  background: var(--color-white-0);
  border: 2px solid ${props => 
    props.$isDefault ? 'var(--color-primary-200)' : 'var(--color-grey-200)'};
  border-radius: 20px;
  padding: 2.4rem;
  position: relative;
  transition: all 0.3s;
  background: ${props => 
    props.$isDefault ? 'var(--color-primary-50)' : 'var(--color-white-0)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => 
      props.$isDefault ? 'var(--color-primary-300)' : 'var(--color-primary-200)'};
  }
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.6rem;
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
  gap: 0.8rem;
`;

const ActionButton = styled.button`
  width: 3.2rem;
  height: 3.2rem;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-300);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s;

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
    color: var(--color-primary-600);
    border-color: var(--color-primary-300);
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
  color: var(--color-primary-600);
  font-size: 1.3rem;
`;

const LandmarkLabel = styled.span`
  font-weight: 600;
  color: var(--color-grey-600);
  font-size: 1.3rem;
`;

const DigitalAddress = styled.p`
  font-size: 1.3rem;
  color: var(--color-primary-600);
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
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
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
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }
`;