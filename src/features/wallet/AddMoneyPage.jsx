import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { useInitiateTopup } from '../../shared/hooks/useWallet';
import useAuth from '../../shared/hooks/useAuth';
import { LoadingState, ErrorState } from '../../components/loading';
import { toast } from 'react-toastify';
import { devicesMax } from '../../shared/styles/breakpoint';

const AddMoneyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: initiateTopup, isPending } = useInitiateTopup();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Predefined amounts
  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalAmount = parseFloat(amount);

    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (finalAmount < 1) {
      toast.error('Minimum top-up amount is GH₵1.00');
      return;
    }

    if (finalAmount > 100000) {
      toast.error('Maximum top-up amount is GH₵100,000.00');
      return;
    }

    // Initiate Paystack payment
    initiateTopup(
      {
        amount: finalAmount,
        email: user?.email,
      },
      {
        onSuccess: (data) => {
          // Redirect to Paystack authorization URL
          if (data?.data?.authorizationUrl) {
            window.location.href = data.data.authorizationUrl;
          } else {
            toast.error('Failed to initialize payment. Please try again.');
          }
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || 'Failed to initialize payment. Please try again.'
          );
        },
      }
    );
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </BackButton>
        <Title>Add Money to Wallet</Title>
      </Header>

      <FormContainer>
        <FormCard>
          <CardHeader>
            <IconWrapper>
              <FaCreditCard />
            </IconWrapper>
            <CardTitle>Top Up Your Wallet</CardTitle>
            <CardDescription>
              Add funds to your wallet using Paystack. Your payment is secure and encrypted.
            </CardDescription>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
            <AmountSection>
              <Label>Select Amount</Label>
              <QuickAmountsGrid>
                {quickAmounts.map((quickAmount) => (
                  <QuickAmountButton
                    key={quickAmount}
                    type="button"
                    $selected={amount === quickAmount.toString()}
                    onClick={() => handleAmountSelect(quickAmount)}
                  >
                    GH₵{quickAmount.toLocaleString()}
                  </QuickAmountButton>
                ))}
              </QuickAmountsGrid>

              <Divider>
                <DividerText>OR</DividerText>
              </Divider>

              <CustomAmountInput
                type="text"
                placeholder="Enter custom amount (e.g., 250.50)"
                value={customAmount}
                onChange={handleCustomAmountChange}
                onFocus={() => setAmount('')}
              />
              <AmountHint>Minimum: GH₵1.00 | Maximum: GH₵100,000.00</AmountHint>
            </AmountSection>

            <SelectedAmountDisplay>
              <SelectedAmountLabel>Amount to Add:</SelectedAmountLabel>
              <SelectedAmountValue>
                GH₵{amount ? parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </SelectedAmountValue>
            </SelectedAmountDisplay>

            <SubmitButton type="submit" disabled={!amount || parseFloat(amount) <= 0 || isPending}>
              {isPending ? (
                <>
                  <FaSpinner className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Paystack
                  <FaCreditCard />
                </>
              )}
            </SubmitButton>
          </Form>

          <SecurityNote>
            <SecurityIcon>🔒</SecurityIcon>
            <SecurityText>
              Your payment is processed securely by Paystack. We never store your card details.
            </SecurityText>
          </SecurityNote>
        </FormCard>
      </FormContainer>
    </PageContainer>
  );
};

export default AddMoneyPage;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 2rem 1rem;

  @media ${devicesMax.sm} {
    padding: 1rem 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--color-grey-200);
  color: var(--color-grey-700);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--color-grey-100);
    transform: translateX(-3px);
  }

  svg {
    font-size: 1.6rem;
  }
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);

  @media ${devicesMax.sm} {
    font-size: 2rem;
  }
`;

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const FormCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 3rem;
  box-shadow: var(--shadow-lg);

  @media ${devicesMax.sm} {
    padding: 2rem 1.5rem;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const IconWrapper = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;

  svg {
    color: white;
    font-size: 2.4rem;
  }
`;

const CardTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const CardDescription = styled.p`
  font-size: 1.5rem;
  color: var(--color-grey-600);
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AmountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Label = styled.label`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const QuickAmountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const QuickAmountButton = styled.button`
  padding: 1.2rem;
  background: ${(props) => (props.$selected ? 'var(--color-primary-600)' : 'white')};
  color: ${(props) => (props.$selected ? 'white' : 'var(--color-grey-700)')};
  border: 2px solid ${(props) => (props.$selected ? 'var(--color-primary-600)' : 'var(--color-grey-300)')};
  border-radius: var(--border-radius-md);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--primary-700);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const Divider = styled.div`
  position: relative;
  text-align: center;
  margin: 1rem 0;
`;

const DividerText = styled.span`
  background: white;
  padding: 0 1.5rem;
  color: var(--color-grey-500);
  font-size: 1.4rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -100%;
    top: 50%;
    width: 100%;
    height: 1px;
    background: var(--color-grey-300);
  }

  &::after {
    content: '';
    position: absolute;
    right: -100%;
    top: 50%;
    width: 100%;
    height: 1px;
    background: var(--color-grey-300);
  }
`;

const CustomAmountInput = styled.input`
  padding: 1.5rem;
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: var(--primary-700);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: var(--color-grey-400);
    font-weight: 400;
  }
`;

const AmountHint = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);
  text-align: center;
`;

const SelectedAmountDisplay = styled.div`
  background: var(--color-grey-50);
  border: 2px solid var(--color-primary-200);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectedAmountLabel = styled.span`
  font-size: 1.5rem;
  color: var(--color-grey-700);
  font-weight: 500;
`;

const SelectedAmountValue = styled.span`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--primary-700);
`;

const SubmitButton = styled.button`
  padding: 1.5rem 2rem;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: var(--color-primary-700);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:disabled {
    background: var(--color-grey-400);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  svg {
    font-size: 1.4rem;
  }
`;

const SecurityNote = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--color-green-100);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SecurityIcon = styled.span`
  font-size: 2rem;
`;

const SecurityText = styled.p`
  font-size: 1.4rem;
  color: var(--color-green-700);
  line-height: 1.5;
  margin: 0;
`;

