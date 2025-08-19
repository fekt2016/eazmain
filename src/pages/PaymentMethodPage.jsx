import styled from "styled-components";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";

import {
  useCreatePaymentMethod,
  useGetPaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "../hooks/usePaymentMethod";
import { devicesMax } from "../styles/breakpoint";

export default function PaymentMethodPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("mobile_money");
  const { mutateAsync: createPaymentMethod } = useCreatePaymentMethod();
  const { data: paymentMethodData, refetch: refetchPaymentMethods } =
    useGetPaymentMethods();
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

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // If we have digits and the first digit is not 0, prepend 0
    let formattedValue = digits;
    if (digits.length > 0 && digits[0] !== "0") {
      formattedValue = "0" + digits;
    }

    // Limit to 10 digits
    return formattedValue.substring(0, 10);
  };

  // Format phone number for API submission
  const formatPhoneForAPI = (phone) => {
    if (!phone) return "";

    // Remove formatting and convert to international format
    const cleaned = phone.replace(/\D/g, "");
    return `+233${cleaned.substring(1)}`; // Remove leading 0 and add +233
  };

  // Handle set default payment method
  const handleSetDefault = async (id) => {
    try {
      await setDefaultMethod(id);
    } catch (error) {
      console.error("Set default error:", error);
    }
  };

  // Handle delete payment method
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this payment method?")
    ) {
      try {
        await deletePaymentMethod(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleAddPaymentMethod = async (data, type) => {
    console.log(data);
    try {
      const methodData =
        type === "mobile"
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

      // Reset forms
      mobileForm.reset();
      bankForm.reset();
      setShowAddForm(false);
      refetchPaymentMethods();
    } catch (error) {
      console.error("Error adding payment method:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";

      if (type === "mobile_money") {
        mobileForm.setError("root", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        bankForm.setError("root", {
          type: "manual",
          message: errorMessage,
        });
      }
    }
  };

  // Render provider icon
  const renderProviderIcon = (method) => {
    const providerMap = {
      mobile_money: {
        MTN: { code: "MTN", color: "var(--color-yellow-700)" },
        Vodafone: { code: "VOD", color: "var(--color-red-700)" },
        AirtelTigo: { code: "AT", color: "var(--color-red-800)" },
      },
      bank_transfer: {
        code: "BANK",
        color: "var(--color-brand-600)",
      },
    };

    let displayInfo;
    if (method.type === "mobile_money") {
      displayInfo = providerMap.mobile_money[method.provider] || {
        code: method.provider.substring(0, 4),
        color: "var(--color-grey-700)",
      };
    } else {
      displayInfo = providerMap.bank_transfer;
    }

    return <BrandIcon color={displayInfo.color}>{displayInfo.code}</BrandIcon>;
  };

  return (
    <PageContainer>
      <Header>
        <Title>Payment Methods</Title>
        <Subtitle>Manage your mobile money and bank transfer options</Subtitle>
      </Header>

      {!showAddForm ? (
        <ActionSection>
          <AddButton onClick={() => setShowAddForm(true)}>
            <PlusIcon>+</PlusIcon>
            Add Payment Method
          </AddButton>
        </ActionSection>
      ) : (
        <FormContainer>
          <FormHeader>
            <FormTitle>Add Payment Method</FormTitle>
            <CloseButton
              onClick={() => {
                setShowAddForm(false);
                mobileForm.reset();
                bankForm.reset();
              }}
            >
              ×
            </CloseButton>
          </FormHeader>

          <Tabs>
            <Tab
              active={activeTab === "mobile_money"}
              onClick={() => setActiveTab("mobile_money")}
            >
              Mobile Money
            </Tab>
            <Tab
              active={activeTab === "bank_transfer"}
              onClick={() => setActiveTab("bank_transfer")}
            >
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
                      message:
                        "Enter a valid Ghanaian phone number (e.g. 0241234567)",
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
                      error={!!mobileForm.formState.errors.phone}
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
                      error={!!mobileForm.formState.errors.name}
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

              <SubmitButton type="submit">Save Mobile Money</SubmitButton>
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
                      error={!!bankForm.formState.errors.bankName}
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
                      error={!!bankForm.formState.errors.accountNumber}
                    />
                  )}
                />
                {bankForm.formState.errors.accountNumber && (
                  <Error>
                    {bankForm.formState.errors.accountNumber.message}
                  </Error>
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
                      error={!!bankForm.formState.errors.accountName}
                    />
                  )}
                />
                {bankForm.formState.errors.accountName && (
                  <Error>{bankForm.formState.errors.accountName.message}</Error>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Branch</Label>
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

              <SubmitButton type="submit">Save Bank Account</SubmitButton>
            </Form>
          )}
        </FormContainer>
      )}

      {paymentMethods.length > 0 ? (
        <MethodsList>
          {paymentMethods.map((method) => (
            <MethodItem key={method._id} isDefault={method.isDefault}>
              <MethodHeader>
                <MethodType>
                  {renderProviderIcon(method)}
                  <MethodInfo>
                    <MethodName>
                      {method.type === "mobile_money"
                        ? `${method.provider} Mobile Money`
                        : method.bankName}
                    </MethodName>
                    <MethodDetails>
                      {method.type === "mobile_money"
                        ? method.mobileNumber.replace("+233", "0")
                        : `••••${method.accountNumber.slice(-4)}`}
                      {method.type === "bank_transfer" && (
                        <span> • {method.accountName}</span>
                      )}
                    </MethodDetails>
                  </MethodInfo>
                </MethodType>
                {method.isDefault && <DefaultBadge>Default</DefaultBadge>}
              </MethodHeader>
              <MethodActions>
                {!method.isDefault && (
                  <ActionButton onClick={() => handleSetDefault(method._id)}>
                    Set as Default
                  </ActionButton>
                )}
                <DeleteButton onClick={() => handleDelete(method._id)}>
                  Remove
                </DeleteButton>
              </MethodActions>
            </MethodItem>
          ))}
        </MethodsList>
      ) : (
        <EmptyState>
          <EmptyIcon>💳</EmptyIcon>
          <EmptyTitle>No payment methods</EmptyTitle>
          <EmptyText>You haven't added any payment methods yet</EmptyText>
          <AddButton onClick={() => setShowAddForm(true)}>
            Add Payment Method
          </AddButton>
        </EmptyState>
      )}

      <SecurityInfo>
        <LockIcon>🔒</LockIcon>
        <SecurityText>
          Your payment details are securely stored and encrypted
        </SecurityText>
      </SecurityInfo>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3.2rem 2.4rem;

  @media ${devicesMax.md} {
    padding: 2.4rem 1.6rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3.2rem;
`;
const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;

  @media ${devicesMax.md} {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
`;

const ActionSection = styled.div`
  margin-bottom: 3.2rem;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  padding: 1.2rem 2rem;
  background-color: var(--color-brand-600);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

const PlusIcon = styled.span`
  font-size: 2rem;
  margin-right: 0.8rem;
  line-height: 1;
`;
const FormContainer = styled.div`
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2.4rem;
  margin-bottom: 3.2rem;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2.4rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-grey-500);
  padding: 0.4rem;

  &:hover {
    color: var(--color-grey-700);
  }
`;
const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 1.6rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${(props) =>
    props.active ? "var(--color-brand-600)" : "var(--color-grey-500)"};
  border-bottom: 2px solid
    ${(props) => (props.active ? "var(--color-brand-600)" : "transparent")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${(props) =>
      props.active ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.6rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem 1.6rem;
  border: 1px solid
    ${(props) =>
      props.error ? "var(--color-red-700)" : "var(--color-grey-300)"};
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.error ? "var(--color-red-700)" : "var(--color-brand-600)"};
    box-shadow: 0 0 0 2px
      ${(props) =>
        props.error ? "var(--color-red-100)" : "var(--color-brand-100)"};
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;
  background-color: var(--color-white-0);
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }
`;
const Error = styled.span`
  display: block;
  margin-top: 0.4rem;
  font-size: 1.2rem;
  color: var(--color-red-700);
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: var(--color-red-100);
  color: var(--color-red-700);
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  text-align: center;
`;

const Hint = styled.span`
  display: block;
  margin-top: 0.4rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 1.6rem 0 2.4rem;
`;

const Checkbox = styled.input`
  width: 1.8rem;
  height: 1.8rem;
  margin-right: 1rem;
  accent-color: var(--color-brand-600);
`;

const CheckboxLabel = styled.label`
  font-size: 1.4rem;
  color: var(--color-grey-700);
`;

const SubmitButton = styled.button`
  padding: 1.2rem;
  background-color: var(--color-brand-600);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;
const MethodsList = styled.div`
  display: grid;
  gap: 1.6rem;
`;

const MethodItem = styled.div`
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  border-left: 4px solid
    ${(props) =>
      props.isDefault ? "var(--color-brand-600)" : "var(--color-grey-300)"};
`;

const MethodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.6rem;
`;

const MethodType = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const BrandIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  background-color: ${(props) => props.color};
  color: var(--color-white-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.6rem;
`;

const MethodInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MethodName = styled.span`
  font-weight: 600;
  font-size: 1.6rem;
  color: var(--color-grey-900);
`;

const MethodDetails = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const DefaultBadge = styled.span`
  background-color: var(--color-green-100);
  color: var(--color-green-700);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  font-weight: 600;
`;

const MethodActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--color-grey-200);
`;

const ActionButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: none;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
    border-color: var(--color-grey-400);
  }
`;

const DeleteButton = styled(ActionButton)`
  color: var(--color-red-700);
  border-color: var(--color-red-300);

  &:hover {
    background-color: var(--color-red-100);
    border-color: var(--color-red-400);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4.8rem 2.4rem;
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
  margin-bottom: 3.2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4.8rem;
  margin-bottom: 1.6rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.8rem;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
  margin-bottom: 2.4rem;
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 3.2rem;
  padding: 1.6rem;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const LockIcon = styled.span`
  font-size: 1.8rem;
`;

const SecurityText = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;
