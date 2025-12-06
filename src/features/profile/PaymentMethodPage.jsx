import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useForm, Controller } from "react-hook-form";
import { 
  FaCreditCard, 
  FaMobileAlt, 
  FaUniversity, 
  FaPlus, 
  FaCheck, 
  FaTimes,
  FaTrash,
  FaLock,
  FaShieldAlt
} from "react-icons/fa";

import {
  useCreatePaymentMethod,
  useGetPaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from '../../shared/hooks/usePaymentMethod';
import { devicesMax } from '../../shared/styles/breakpoint';
import logger from '../../shared/utils/logger';

export default function PaymentMethodPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("mobile_money");
  
  const { mutateAsync: createPaymentMethod } = useCreatePaymentMethod();
  const { data: paymentMethodData, refetch: refetchPaymentMethods } = useGetPaymentMethods();
  const { mutateAsync: deletePaymentMethod } = useDeletePaymentMethod();
  const { mutateAsync: setDefaultMethod } = useSetDefaultPaymentMethod();

  // Form hooks
  const mobileForm = useForm({
    defaultValues: {
      provider: "MTN",
      phone: "",
      name: "",
      isDefault: false,
    },
  });

  const bankForm = useForm({
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      branch: "",
      isDefault: false,
    },
  });

  const paymentMethods = useMemo(() => {
    return paymentMethodData?.data?.paymentMethods || [];
  }, [paymentMethodData]);

  // Format phone number for display
  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    let formattedValue = digits;
    if (digits.length > 0 && digits[0] !== "0") {
      formattedValue = "0" + digits;
    }
    return formattedValue.substring(0, 10);
  };

  // Format phone number for API submission
  const formatPhoneForAPI = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    return `+233${cleaned.substring(1)}`;
  };

  // Handle set default payment method
  const handleSetDefault = async (id) => {
    try {
      await setDefaultMethod(id);
    } catch (error) {
      logger.error("Set default error:", error);
    }
  };

  // Handle delete payment method
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment method?")) {
      try {
        await deletePaymentMethod(id);
      } catch (error) {
        logger.error("Delete error:", error);
      }
    }
  };

  const handleAddPaymentMethod = async (data, type) => {
    try {
      const methodData = type === "mobile"
        ? {
            type: "mobile_money",
            provider: data.provider,
            mobileNumber: formatPhoneForAPI(data.phone),
            mobileName: data.name,
            isDefault: data.isDefault || paymentMethods.length === 0,
          }
        : {
            type: "bank_transfer",
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            accountName: data.accountName,
            branch: data.branch,
            isDefault: data.isDefault || paymentMethods.length === 0,
          };

      await createPaymentMethod(methodData);
      mobileForm.reset();
      bankForm.reset();
      setShowAddForm(false);
      refetchPaymentMethods();
    } catch (error) {
      logger.error("Error adding payment method:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      const form = type === "mobile" ? mobileForm : bankForm;
      form.setError("root", { type: "manual", message: errorMessage });
    }
  };

  // Render provider icon with modern styling
  const renderProviderIcon = (method) => {
    const providerConfig = {
      mobile_money: {
        MTN: { color: "var(--color-yellow-600)", name: "MTN" },
        Vodafone: { color: "var(--color-red-600)", name: "Vodafone" },
        AirtelTigo: { color: "var(--color-red-700)", name: "AirtelTigo" },
      },
      bank_transfer: {
        color: "var(--color-primary-600)",
        name: "Bank",
      },
    };

    let config;
    if (method.type === "mobile_money") {
      config = providerConfig.mobile_money[method.provider] || {
        color: "var(--color-grey-600)",
        name: method.provider.substring(0, 3),
      };
    } else {
      config = providerConfig.bank_transfer;
    }

    return (
      <ProviderIcon $color={config.color}>
        {method.type === "mobile_money" ? <FaMobileAlt /> : <FaUniversity />}
      </ProviderIcon>
    );
  };

  const defaultMethodsCount = paymentMethods.filter(method => method.isDefault).length;
  const mobileMoneyMethods = paymentMethods.filter(method => method.type === "mobile_money").length;
  const bankMethods = paymentMethods.filter(method => method.type === "bank_transfer").length;

  return (
    <PageContainer>
      {/* Header Section */}
      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>Payment Methods</Title>
            <Subtitle>Manage your mobile money and bank transfer options</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatItem>
              <StatValue>{defaultMethodsCount}</StatValue>
              <StatLabel>Default Methods</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>{mobileMoneyMethods}</StatValue>
              <StatLabel>Mobile Money</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>{bankMethods}</StatValue>
              <StatLabel>Bank Accounts</StatLabel>
            </StatItem>
          </StatsCard>
        </HeaderContent>
      </HeaderSection>

      <ContentSection>
        {/* Add Payment Method Section */}
        {!showAddForm ? (
          <ActionSection>
            <AddButton onClick={() => setShowAddForm(true)}>
              <AddButtonIcon>
                <FaPlus />
              </AddButtonIcon>
              <AddButtonText>Add Payment Method</AddButtonText>
            </AddButton>
          </ActionSection>
        ) : (
          <FormCard>
            <FormHeader>
              <FormTitle>Add Payment Method</FormTitle>
              <CloseButton
                onClick={() => {
                  setShowAddForm(false);
                  mobileForm.reset();
                  bankForm.reset();
                }}
              >
                <FaTimes />
              </CloseButton>
            </FormHeader>

            <Tabs>
              <Tab
                $active={activeTab === "mobile_money"}
                onClick={() => setActiveTab("mobile_money")}
              >
                <FaMobileAlt />
                Mobile Money
              </Tab>
              <Tab
                $active={activeTab === "bank_transfer"}
                onClick={() => setActiveTab("bank_transfer")}
              >
                <FaUniversity />
                Bank Transfer
              </Tab>
            </Tabs>

            {activeTab === "mobile_money" ? (
              <Form
                onSubmit={mobileForm.handleSubmit((data) =>
                  handleAddPaymentMethod(data, "mobile")
                )}
              >
                {mobileForm.formState.errors.root && (
                  <ErrorMessage>
                    {mobileForm.formState.errors.root.message}
                  </ErrorMessage>
                )}

                <FormGroup>
                  <Label>Mobile Money Provider</Label>
                  <Controller
                    name="provider"
                    control={mobileForm.control}
                    render={({ field }) => (
                      <Select {...field}>
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="Vodafone">Vodafone Cash</option>
                        <option value="AirtelTigo">AirtelTigo Money</option>
                      </Select>
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone Number</Label>
                  <Controller
                    name="phone"
                    control={mobileForm.control}
                    rules={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^0\d{9}$/,
                        message: "Enter a valid Ghanaian phone number (e.g. 0241234567)",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="tel"
                        placeholder="0241234567"
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        value={field.value}
                        $error={!!mobileForm.formState.errors.phone}
                      />
                    )}
                  />
                  {mobileForm.formState.errors.phone && (
                    <Error>{mobileForm.formState.errors.phone.message}</Error>
                  )}
                  <Hint>Enter number without country code (e.g. 0241234567)</Hint>
                </FormGroup>

                <FormGroup>
                  <Label>Account Name</Label>
                  <Controller
                    name="name"
                    control={mobileForm.control}
                    rules={{ required: "Account name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        $error={!!mobileForm.formState.errors.name}
                      />
                    )}
                  />
                  {mobileForm.formState.errors.name && (
                    <Error>{mobileForm.formState.errors.name.message}</Error>
                  )}
                </FormGroup>

                <CheckboxGroup>
                  <Controller
                    name="isDefault"
                    control={mobileForm.control}
                    render={({ field }) => (
                      <Checkbox
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        id="mobileDefaultCheckbox"
                      />
                    )}
                  />
                  <CheckboxLabel htmlFor="mobileDefaultCheckbox">
                    Set as default payment method
                  </CheckboxLabel>
                </CheckboxGroup>

                <SubmitButton type="submit">
                  <FaCheck />
                  Save Mobile Money
                </SubmitButton>
              </Form>
            ) : (
              <Form
                onSubmit={bankForm.handleSubmit((data) =>
                  handleAddPaymentMethod(data, "bank_transfer")
                )}
              >
                {bankForm.formState.errors.root && (
                  <ErrorMessage>
                    {bankForm.formState.errors.root.message}
                  </ErrorMessage>
                )}
                
                <FormGroup>
                  <Label>Bank Name</Label>
                  <Controller
                    name="bankName"
                    control={bankForm.control}
                    rules={{ required: "Bank name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="Ecobank Ghana"
                        $error={!!bankForm.formState.errors.bankName}
                      />
                    )}
                  />
                  {bankForm.formState.errors.bankName && (
                    <Error>{bankForm.formState.errors.bankName.message}</Error>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Account Number</Label>
                  <Controller
                    name="accountNumber"
                    control={bankForm.control}
                    rules={{
                      required: "Account number is required",
                      pattern: {
                        value: /^\d{10,16}$/,
                        message: "Enter a valid account number (10-16 digits)",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="0241234567890"
                        $error={!!bankForm.formState.errors.accountNumber}
                      />
                    )}
                  />
                  {bankForm.formState.errors.accountNumber && (
                    <Error>{bankForm.formState.errors.accountNumber.message}</Error>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Account Name</Label>
                  <Controller
                    name="accountName"
                    control={bankForm.control}
                    rules={{ required: "Account name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        $error={!!bankForm.formState.errors.accountName}
                      />
                    )}
                  />
                  {bankForm.formState.errors.accountName && (
                    <Error>{bankForm.formState.errors.accountName.message}</Error>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Branch (Optional)</Label>
                  <Controller
                    name="branch"
                    control={bankForm.control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Accra Central" />
                    )}
                  />
                </FormGroup>

                <CheckboxGroup>
                  <Controller
                    name="isDefault"
                    control={bankForm.control}
                    render={({ field }) => (
                      <Checkbox
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        id="bankDefaultCheckbox"
                      />
                    )}
                  />
                  <CheckboxLabel htmlFor="bankDefaultCheckbox">
                    Set as default payment method
                  </CheckboxLabel>
                </CheckboxGroup>

                <SubmitButton type="submit">
                  <FaCheck />
                  Save Bank Account
                </SubmitButton>
              </Form>
            )}
          </FormCard>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length > 0 ? (
          <MethodsGrid>
            {paymentMethods.map((method) => (
              <MethodCard key={method._id} $isDefault={method.isDefault}>
                <MethodHeader>
                  <MethodInfo>
                    {renderProviderIcon(method)}
                    <MethodDetails>
                      <MethodName>
                        {method.type === "mobile_money"
                          ? `${method.provider} Mobile Money`
                          : method.bankName}
                      </MethodName>
                      <MethodNumber>
                        {method.type === "mobile_money"
                          ? method.mobileNumber.replace("+233", "0")
                          : `••••${method.accountNumber.slice(-4)}`}
                      </MethodNumber>
                      {method.type === "bank_transfer" && (
                        <MethodAccountName>{method.accountName}</MethodAccountName>
                      )}
                    </MethodDetails>
                  </MethodInfo>
                  {method.isDefault && <DefaultBadge>Default</DefaultBadge>}
                </MethodHeader>

                <MethodActions>
                  {!method.isDefault && (
                    <ActionButton onClick={() => handleSetDefault(method._id)}>
                      Set as Default
                    </ActionButton>
                  )}
                  <DeleteButton onClick={() => handleDelete(method._id)}>
                    <FaTrash />
                    Remove
                  </DeleteButton>
                </MethodActions>
              </MethodCard>
            ))}
          </MethodsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <FaCreditCard />
            </EmptyIcon>
            <EmptyTitle>No payment methods</EmptyTitle>
            <EmptyText>You haven't added any payment methods yet</EmptyText>
            <AddButton onClick={() => setShowAddForm(true)}>
              <AddButtonIcon>
                <FaPlus />
              </AddButtonIcon>
              Add Payment Method
            </AddButton>
          </EmptyState>
        )}

        {/* Security Info */}
        <SecuritySection>
          <SecurityContent>
            <SecurityIcon>
              <FaShieldAlt />
            </SecurityIcon>
            <SecurityText>
              Your payment details are securely stored and encrypted. 
              We never share your financial information with third parties.
            </SecurityText>
          </SecurityContent>
        </SecuritySection>
      </ContentSection>
    </PageContainer>
  );
}

// Modern Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media ${devicesMax.md} {
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

  @media ${devicesMax.lg} {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
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

  @media ${devicesMax.md} {
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
  min-width: 30rem;

  @media ${devicesMax.sm} {
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

const ContentSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  overflow: hidden;
`;

const ActionSection = styled.div`
  padding: 3.2rem;
  border-bottom: 1px solid var(--color-grey-100);

  @media ${devicesMax.md} {
    padding: 2.4rem;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.6rem 2.4rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: 12px;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.4);
  }

  @media ${devicesMax.sm} {
    width: 100%;
    justify-content: center;
  }
`;

const AddButtonIcon = styled.div`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddButtonText = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
`;

const FormCard = styled.div`
  padding: 3.2rem;
  border-bottom: 1px solid var(--color-grey-100);

  @media ${devicesMax.md} {
    padding: 2.4rem;
  }
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;
`;

const FormTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const CloseButton = styled.button`
  background: var(--color-grey-100);
  border: none;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-grey-200);
    color: var(--color-grey-700);
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-bottom: 2.4rem;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2rem;
  background: ${props => props.$active ? 'var(--color-primary-50)' : 'var(--color-grey-100)'};
  color: ${props => props.$active ? 'var(--color-primary-700)' : 'var(--color-grey-600)'};
  border: 2px solid ${props => props.$active ? 'var(--color-primary-200)' : 'transparent'};
  border-radius: 10px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-100)' : 'var(--color-grey-200)'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Input = styled.input`
  padding: 1.2rem 1.6rem;
  border: 2px solid ${props => props.$error ? 'var(--color-red-300)' : 'var(--color-grey-200)'};
  border-radius: 8px;
  font-size: 1.6rem;
  transition: all 0.2s ease;
  background: var(--color-white-0);

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? 'var(--color-red-500)' : 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'var(--color-red-100)' : 'var(--color-primary-100)'};
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const Select = styled.select`
  padding: 1.2rem 1.6rem;
  border: 2px solid var(--color-grey-200);
  border-radius: 8px;
  font-size: 1.6rem;
  background: var(--color-white-0);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
`;

const Error = styled.span`
  font-size: 1.2rem;
  color: var(--color-red-600);
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  padding: 1.2rem;
  background: var(--color-red-50);
  color: var(--color-red-700);
  border: 1px solid var(--color-red-200);
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 500;
`;

const Hint = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const Checkbox = styled.input`
  width: 2rem;
  height: 2rem;
  accent-color: var(--color-primary-600);
`;

const CheckboxLabel = styled.label`
  font-size: 1.4rem;
  color: var(--color-grey-700);
  font-weight: 500;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.4rem 2.4rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: 10px;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.3);
  }
`;

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2.4rem;
  padding: 3.2rem;

  @media ${devicesMax.lg} {
    grid-template-columns: 1fr;
    padding: 2.4rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const MethodCard = styled.div`
  background: var(--color-white-0);
  border: 2px solid ${props => props.$isDefault ? 'var(--color-primary-200)' : 'var(--color-grey-200)'};
  border-radius: 16px;
  padding: 2.4rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$isDefault ? 'var(--color-primary-500)' : 'transparent'};
  }

  &:hover {
    border-color: var(--color-primary-300);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const MethodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const MethodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  flex: 1;
`;

const ProviderIcon = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.$color} 0%, ${props => props.$color}99 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 2rem;
`;

const MethodDetails = styled.div`
  flex: 1;
`;

const MethodName = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
`;

const MethodNumber = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-700);
  font-weight: 500;
  margin-bottom: 0.2rem;
`;

const MethodAccountName = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const DefaultBadge = styled.span`
  background: var(--color-green-100);
  color: var(--color-green-700);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MethodActions = styled.div`
  display: flex;
  gap: 1.2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-grey-100);

  @media ${devicesMax.sm} {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 1rem 1.6rem;
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-200);
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-100);
    border-color: var(--color-primary-300);
    color: var(--color-primary-800);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: var(--color-red-50);
  color: var(--color-red-700);
  border-color: var(--color-red-200);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  &:hover {
    background: var(--color-red-100);
    border-color: var(--color-red-300);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6.4rem 3.2rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 8rem;
  height: 8rem;
  background: var(--color-grey-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-400);
  font-size: 3.2rem;
  margin-bottom: 2.4rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-800);
  margin-bottom: 1.2rem;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
  margin-bottom: 3.2rem;
  max-width: 40rem;
`;

const SecuritySection = styled.div`
  padding: 2.4rem 3.2rem;
  background: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);
`;

const SecurityContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  max-width: 60rem;
  margin: 0 auto;
`;

const SecurityIcon = styled.div`
  color: var(--color-primary-500);
  font-size: 2rem;
`;

const SecurityText = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  text-align: center;
`;