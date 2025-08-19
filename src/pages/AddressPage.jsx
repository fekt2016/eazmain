import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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
} from "react-icons/fa";

// Import your React Query hooks
import {
  useGetUserAddress,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  useSetDefaultAddress,
} from "../hooks/useAddress";

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

  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

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
    city: "",
    region: "",
    country: "Ghana",
    additionalInformation: "",
    digitalAddress: "",
    isDefault: false,
  });
  console.log("formData", formData);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear digital address error when user starts typing
    if (name === "digitalAddress" && digitalAddressError) {
      setDigitalAddressError("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    // const latPrefix = Math.abs(Math.floor(lat));
    const latSuffix = Math.floor((Math.abs(lat) % 1) * 10000);

    // Convert longitude to numbers
    const lngPrefix = Math.abs(Math.floor(lng));
    // const lngSuffix = Math.floor((Math.abs(lng) % 1) * 10000);

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

    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          id: editingAddress.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      // Reset form and refresh data
      resetForm();
      refetch();
    } catch (error) {
      console.error("Error saving address:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleEditAddress = (address) => {
    console.log("editing address", address);
    setFormData({
      id: address._id,
      fullName: address.fullName || "",
      phone: address.contactPhone || "",
      streetAddress: address.streetAddress || "",
      city: address.city || "",
      region: address.region || "",
      country: address.country || "Ghana",
      additionalInfo: address.additionalInformation || "",
      digitalAddress: address.digitalAddress || "",
      isDefault: address.isDefault || false,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      contactPhone: "",
      streetAddress: "",
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
      <LoadingContainer>
        <Spinner />
        <p>Loading your addresses...</p>
      </LoadingContainer>
    );
  }

  if (isError) {
    return (
      <ErrorContainer>
        <p>Error loading addresses. Please try again.</p>
        <RetryButton onClick={() => refetch()}>Retry</RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <ManagementContainer>
      <PageHeader>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </BackButton>
        <PageTitle>Manage Shipping Addresses</PageTitle>
        <PageDescription>
          Add, edit, or delete your saved shipping addresses
        </PageDescription>
      </PageHeader>

      <ContentWrapper>
        {showForm ? (
          <FormSection>
            <SectionHeader>
              <FaMapMarkerAlt />
              <h2>{editingAddress ? "Edit Address" : "Add New Address"}</h2>
            </SectionHeader>

            <Form onSubmit={handleSaveAddress}>
              <FormGroup>
                <Label>
                  <FaUser /> Full Name
                </Label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaPhone /> Phone Number
                </Label>
                <Input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaMapMarkerAlt /> Street Address
                </Label>
                <Input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="House number, street name"
                  required
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                />
              </FormGroup>

              {/* Digital Address Field */}
              <FormGroup>
                <Label>
                  Digital Address (Ghana only)
                  <LocationButton
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={
                      isFetchingLocation || formData.country !== "Ghana"
                    }
                  >
                    <FaLocationArrow />
                    {isFetchingLocation
                      ? "Getting Location..."
                      : "Use Current Location"}
                  </LocationButton>
                </Label>
                <Input
                  type="text"
                  name="digitalAddress"
                  value={formData.digitalAddress}
                  onChange={handleInputChange}
                  placeholder="GA-123-4567"
                  disabled={
                    createMutation.isLoading ||
                    updateMutation.isLoading ||
                    formData.country !== "Ghana"
                  }
                />
                {digitalAddressError && (
                  <ErrorText>{digitalAddressError}</ErrorText>
                )}
                {locationError && <ErrorText>{locationError}</ErrorText>}
                <HelpText>
                  {formData.country === "Ghana"
                    ? "Format: GA-123-4567 (optional)"
                    : "Only available for Ghana addresses"}
                </HelpText>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>
                    <FaCity /> City
                  </Label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                    disabled={
                      createMutation.isLoading || updateMutation.isLoading
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaGlobe /> Region
                  </Label>
                  <Input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Region/State"
                    required
                    disabled={
                      createMutation.isLoading || updateMutation.isLoading
                    }
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Country</Label>
                <Select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                >
                  <option value="Ghana">Ghana</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Other">Other</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Additional Information</Label>
                <Textarea
                  name="additionalInformation"
                  value={formData.additionalInformation}
                  onChange={handleInputChange}
                  placeholder="Apartment number, landmarks, delivery instructions, etc."
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                />
              </FormGroup>

              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  id="isDefault"
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                />
                <CheckboxLabel htmlFor="isDefault">
                  Set as default shipping address
                </CheckboxLabel>
              </CheckboxGroup>

              <ButtonGroup>
                <CancelButton
                  type="button"
                  onClick={resetForm}
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                >
                  Cancel
                </CancelButton>
                <SaveButton
                  type="submit"
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Save Address"}
                </SaveButton>
              </ButtonGroup>
            </Form>
          </FormSection>
        ) : (
          <AddAddressCard onClick={() => setShowForm(true)}>
            <FaPlus size={24} />
            <h3>Add New Address</h3>
            <p>Create a new shipping address</p>
          </AddAddressCard>
        )}

        <AddressListSection>
          <SectionHeader>
            <FaHome />
            <h2>Saved Addresses</h2>
            <CountBadge>{savedAddresses.length}</CountBadge>
          </SectionHeader>

          {savedAddresses.length > 0 ? (
            <AddressGrid>
              {savedAddresses.map((address) => (
                <AddressCard key={address.id}>
                  {address.isDefault && <DefaultBadge>Default</DefaultBadge>}
                  <AddressHeader>
                    <AddressName>{address.fullName}</AddressName>
                    <ActionButtons>
                      <SetDefaultButton
                        onClick={() => handleSetDefault(address.id)}
                        title={
                          address.isDefault
                            ? "Default address"
                            : "Set as default"
                        }
                        disabled={setDefaultMutation.isLoading}
                      >
                        {address.isDefault ? (
                          <FaStar color="#FFD700" />
                        ) : (
                          <FaRegStar />
                        )}
                      </SetDefaultButton>
                      <EditButton onClick={() => handleEditAddress(address)}>
                        <FaEdit />
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        {deleteMutation.isLoading &&
                        deleteMutation.variables === address.id ? (
                          "Deleting..."
                        ) : (
                          <FaTrash />
                        )}
                      </DeleteButton>
                    </ActionButtons>
                  </AddressHeader>

                  <AddressDetails>
                    <p>{address.streetAddress}</p>
                    {address.digitalAddress && (
                      <p>Digital Address: {address.digitalAddress}</p>
                    )}
                    <p>
                      {address.city}, {address.region}
                    </p>
                    <p>{address.country}</p>
                    <p>Phone: {address.contactPhone}</p>
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
            <NoAddresses>
              <FaMapMarkerAlt size={48} />
              <h3>No saved addresses</h3>
              <p>Add your first address to get started</p>
            </NoAddresses>
          )}
        </AddressListSection>
      </ContentWrapper>
    </ManagementContainer>
  );
};

export default AddressManagementPage;

// Styled Components
const ManagementContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #eaecf4;
  color: #4e73df;
  font-size: 16px;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 15px;

  &:hover {
    background: rgba(78, 115, 223, 0.1);
    border-color: #4e73df;
  }

  svg {
    margin-right: 8px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2e3a59;
  margin-bottom: 10px;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: #666;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const Section = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const FormSection = styled(Section)``;

const AddressListSection = styled(Section)``;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  svg {
    color: #28a745;
    font-size: 1.5rem;
  }
`;

const CountBadge = styled.span`
  background: #4e73df;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  margin-left: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
  }

  &::placeholder {
    color: #aaa;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
  }

  &::placeholder {
    color: #aaa;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
  color: #555;

  &:has(input:disabled) {
    cursor: not-allowed;
    color: #aaa;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background: #28a745;
  color: white;
  border: none;
  flex: 1;

  &:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const CancelButton = styled(Button)`
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  flex: 1;

  &:hover:not(:disabled) {
    background: #e9ecef;
  }
`;

const AddAddressCard = styled.div`
  background: white;
  border: 2px dashed #28a745;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  &:hover {
    background: #e9f5e9;
    transform: translateY(-3px);
    border-style: solid;
  }

  h3 {
    margin: 0;
    color: #28a745;
  }

  p {
    margin: 0;
    color: #666;
  }

  svg {
    color: #28a745;
  }
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AddressCard = styled.div`
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  transition: all 0.3s;

  &:hover {
    border-color: #28a745;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
`;

const DefaultBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e9f5e9;
  color: #28a745;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const AddressName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    color: #28a745;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SetDefaultButton = styled(ActionButton)`
  color: ${(props) => (props.$isDefault ? "#FFD700" : "#6c757d")};
`;

const EditButton = styled(ActionButton)``;

const DeleteButton = styled(ActionButton)`
  &:hover:not(:disabled) {
    color: #ff6b6b;
  }
`;

const AddressDetails = styled.div`
  p {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
  }
`;

const AdditionalInfo = styled.p`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
  font-style: italic;
`;

const NoAddresses = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;

  svg {
    margin-bottom: 15px;
    color: #adb5bd;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #28a745;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 10px;
  max-width: 600px;
  margin: 40px auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const RetryButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #2e59d9;
  }
`;

// New styled components
const LocationButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: 15px;
  padding: 5px 10px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #2e59d9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
`;

const HelpText = styled.span`
  color: #718096;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
`;
