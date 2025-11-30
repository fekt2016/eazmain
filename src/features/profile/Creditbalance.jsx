import styled from "styled-components";
import {
  FaCoins,
  FaHistory,
  FaPlus,
  FaArrowRight,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { devicesMax } from '../../shared/styles/breakpoint';
import { useCreditBalance } from '../../shared/hooks/useCreditbalance';
import { useMemo, useState } from "react";
import { formatDate } from '../../shared/utils/helpers';
import { useApplyUserCoupon } from '../../shared/hooks/useCoupon';
import { LoadingState, ButtonSpinner, ErrorState } from '../../components/loading';

const CreditBalance = () => {
  const { data, isLoading } = useCreditBalance();
  const [couponCode, setCouponCode] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const { mutate: applyCouponMutate, isPending: isApplying, error: couponError } =
    useApplyUserCoupon();

  const creditBalance = useMemo(() => {
    return data?.data?.creditbalance || {};
  }, [data]);
  const lastTransaction = useMemo(() => {
    if (!creditBalance.transactions || creditBalance.transactions.length === 0)
      return null;
    return creditBalance.transactions.reduce((latest, transaction) =>
      new Date(transaction.date) > new Date(latest.date) ? transaction : latest
    );
  }, [creditBalance.transactions]);

  // Sort transactions based on sort configuration
  const sortedTransactions = useMemo(() => {
    if (!creditBalance.transactions) return [];

    let sortableItems = [...creditBalance.transactions];
    return sortableItems.sort((a, b) => {
      if (sortConfig.key === "date") {
        // Sort by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (sortConfig.direction === "desc") {
          return dateB - dateA; // Newest first
        } else {
          return dateA - dateB; // Oldest first
        }
      } else if (sortConfig.key === "amount") {
        // Sort by amount
        if (sortConfig.direction === "desc") {
          return b.amount - a.amount; // Highest first
        } else {
          return a.amount - b.amount; // Lowest first
        }
      } else if (sortConfig.key === "description") {
        // Sort by description
        if (a.description < b.description) {
          return sortConfig.direction === "desc" ? 1 : -1;
        }
        if (a.description > b.description) {
          return sortConfig.direction === "desc" ? -1 : 1;
        }
        return 0;
      }
      return 0;
    });
  }, [creditBalance.transactions, sortConfig]);

  // Function to handle sorting
  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // Function to handle coupon application
  const applyCoupon = async () => {
    applyCouponMutate(couponCode);
  };

  // Get sort icon for a column
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "desc" ? <FaSortDown /> : <FaSortUp />;
  };

  if (isLoading) {
    return <LoadingState message="Loading credit balance..." />;
  }

  return (
    <PageContainer>
      <Header>
        <Title>
          <FaCoins />
          <h1>Credit Balance</h1>
        </Title>
      </Header>

      <BalanceCard>
        <BalanceLabel>Actual Balance</BalanceLabel>
        <BalanceAmount>
          GH&#x20B5;{creditBalance.balance?.toFixed(2) || "0.00"}
        </BalanceAmount>
        <BalanceLabel>Available Balance</BalanceLabel>
        <BalanceAmount>
          GH&#x20B5;{creditBalance.balance?.toFixed(2) || "0.00"}
        </BalanceAmount>
        <BalanceInfo>
          <InfoItem>
            <span>Last Top-up</span>
            <strong>${lastTransaction?.amount || "0.00"}</strong>
          </InfoItem>
          {/* <InfoItem>
            <span>Expires</span>
            <strong>Dec 31, 2024</strong>
          </InfoItem> */}
        </BalanceInfo>
      </BalanceCard>

      {/* Coupon Application Section */}
      <CouponSection>
        <SectionHeader>
          <FaPlus />
          <h2>Apply Coupon</h2>
        </SectionHeader>

        <CouponForm>
          <CouponInput
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={isApplying}
          />
          <ApplyButton onClick={applyCoupon} disabled={isApplying}>
            {isApplying ? <ButtonSpinner size="sm" /> : "Apply Coupon"}
          </ApplyButton>
          
          {couponError && (
            <ErrorState message={couponError?.message || "Failed to apply coupon"} />
          )}
        </CouponForm>
      </CouponSection>

      <ActionCards>
        <ActionCard>
          <ActionIcon $color="var(--color-green-700)">
            <FaHistory />
          </ActionIcon>
          <ActionContent>
            <h3>Transaction History</h3>
            <p>View all transactions</p>
          </ActionContent>
          <ActionArrow>
            <FaArrowRight />
          </ActionArrow>
        </ActionCard>
      </ActionCards>

      <TransactionSection>
        <SectionHeader>
          <FaHistory />
          <h2>Recent Transactions</h2>
        </SectionHeader>

        <TransactionTable>
          <thead>
            <tr>
              <TableHeader onClick={() => requestSort("date")} $clickable>
                Date {getSortIcon("date")}
              </TableHeader>
              <TableHeader
                onClick={() => requestSort("description")}
                $clickable
              >
                Description {getSortIcon("description")}
              </TableHeader>
              <TableHeader
                $align="right"
                onClick={() => requestSort("amount")}
                $clickable
              >
                Amount {getSortIcon("amount")}
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell
                  $color={
                    transaction.amount > 0
                      ? "var(--color-green-700)"
                      : "var(--color-red-700)"
                  }
                  $align="right"
                >
                  {transaction.amount > 0 ? "+" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </TransactionTable>

        <ViewAllButton>
          View Full Transaction History <FaArrowRight />
        </ViewAllButton>
      </TransactionSection>
    </PageContainer>
  );
};

export default CreditBalance;

// Styled Components - Updated with new styles for sorting
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  h1 {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-grey-900);
  }

  svg {
    color: var(--color-bitcoin-900);
    font-size: 2.4rem;
  }
`;

const BalanceCard = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-primary-500),
    var(--color-primary-700)
  );
  border-radius: var(--border-radius-lg);
  padding: 30px;
  color: white;
  margin-bottom: 30px;
  box-shadow: var(--shadow-lg);
`;

const BalanceLabel = styled.p`
  font-size: 1.6rem;
  margin-bottom: 10px;
  opacity: 0.9;
`;

const BalanceAmount = styled.h2`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 20px;

  @media ${devicesMax.sm} {
    font-size: 3rem;
  }
`;

const BalanceInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
`;

const InfoItem = styled.div`
  span {
    display: block;
    font-size: 1.4rem;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  strong {
    font-size: 1.8rem;
    font-weight: 600;
  }
`;

const ActionCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ActionCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);

    > div:last-child {
      transform: translateX(5px);
    }
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: white;
    font-size: 2.4rem;
  }
`;

const ActionContent = styled.div`
  flex: 1;

  h3 {
    font-size: 1.8rem;
    margin-bottom: 5px;
    color: var(--color-grey-800);
  }

  p {
    font-size: 1.4rem;
    color: var(--color-grey-500);
  }
`;

const ActionArrow = styled.div`
  color: var(--color-grey-400);
  transition: transform 0.3s;

  svg {
    font-size: 1.6rem;
  }
`;

const TransactionSection = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 30px;
  box-shadow: var(--shadow-md);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;

  h2 {
    margin: 0;
    font-size: 2rem;
    color: var(--color-grey-800);
  }

  svg {
    color: var(--color-grey-600);
    font-size: 2rem;
  }
`;

const TransactionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const TableHeader = styled.th`
  text-align: ${(props) => props.$align || "left"};
  padding: 15px 10px;
  border-bottom: 2px solid var(--color-grey-200);
  color: var(--color-grey-600);
  font-weight: 600;
  font-size: 1.4rem;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  user-select: none;
  position: relative;

  &:hover {
    background-color: ${(props) =>
      props.$clickable ? "var(--color-grey-100)" : "transparent"};
  }

  svg {
    margin-left: 5px;
    font-size: 1.2rem;
    vertical-align: middle;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: var(--color-grey-50);
  }

  &:hover {
    background: var(--color-grey-100);
  }
`;

const TableCell = styled.td`
  padding: 15px 10px;
  border-bottom: 1px solid var(--color-grey-100);
  color: ${(props) => props.$color || "var(--color-grey-700)"};
  text-align: ${(props) => props.$align || "left"};
  font-size: 1.4rem;

  &:first-child {
    font-weight: 500;
  }
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--color-primary-600);
  border: none;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0 auto;
  padding: 10px 20px;
  transition: all 0.3s;

  &:hover {
    color: var(--color-primary-800);
    transform: translateX(5px);

    svg {
      transform: translateX(3px);
    }
  }

  svg {
    transition: transform 0.3s;
    font-size: 1.2rem;
  }
`;

const CouponSection = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 25px;
  box-shadow: var(--shadow-md);
  margin-bottom: 30px;
`;

const CouponForm = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 15px;

  @media ${devicesMax.sm} {
    flex-direction: column;
  }
`;

const CouponInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.5rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const ApplyButton = styled.button`
  padding: 12px 24px;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: var(--color-primary-700);
  }

  &:disabled {
    background: var(--color-grey-400);
    cursor: not-allowed;
  }

  @media ${devicesMax.sm} {
    width: 100%;
  }
`;
