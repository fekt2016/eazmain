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
import { useWalletBalance, useWalletTransactions } from '../../shared/hooks/useWallet';
import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../shared/utils/helpers';
import { useApplyUserCoupon } from '../../shared/hooks/useCoupon';
import { LoadingState, ButtonSpinner, ErrorState } from '../../components/loading';
import { PATHS } from '../../routes/routePaths';

const CreditBalance = () => {
  const navigate = useNavigate();
  const { data: walletData, isLoading: isBalanceLoading } = useWalletBalance();
  const [couponCode, setCouponCode] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const limit = 10;

  const { data: transactionsData, isLoading: isTransactionsLoading } = useWalletTransactions({
    page,
    limit,
    type: typeFilter,
    sortBy,
    sortOrder,
  });

  const { mutate: applyCouponMutate, isPending: isApplying, error: couponError } =
    useApplyUserCoupon();

  const wallet = useMemo(() => {
    return walletData?.data?.wallet || { balance: 0, availableBalance: 0 };
  }, [walletData]);

  const transactions = useMemo(() => {
    return transactionsData?.data?.transactions || [];
  }, [transactionsData]);

  const pagination = useMemo(() => {
    return transactionsData?.pagination || { page: 1, pages: 1, total: 0 };
  }, [transactionsData]);

  const isLoading = isBalanceLoading || isTransactionsLoading;

  // Function to handle sorting
  const requestSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  // Function to handle coupon application
  const applyCoupon = async () => {
    applyCouponMutate(couponCode);
  };

  // Get sort icon for a column
  const getSortIcon = (key) => {
    if (sortBy !== key) return <FaSort />;
    return sortOrder === "desc" ? <FaSortDown /> : <FaSortUp />;
  };

  // Get transaction type color
  const getTransactionColor = (type) => {
    if (type.startsWith('CREDIT_')) {
      return 'var(--color-green-700)';
    } else if (type === 'CREDIT_REFUND') {
      return 'var(--color-blue-700)';
    } else {
      return 'var(--color-red-700)';
    }
  };

  // Get transaction type label
  const getTransactionTypeLabel = (type) => {
    const labels = {
      'CREDIT_TOPUP': 'Top-up',
      'DEBIT_ORDER': 'Order Payment',
      'CREDIT_REFUND': 'Refund',
      'DEBIT_ADJUSTMENT': 'Adjustment (Debit)',
      'CREDIT_ADJUSTMENT': 'Adjustment (Credit)',
    };
    return labels[type] || type;
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
        <BalanceLabel>Available Balance</BalanceLabel>
        <BalanceAmount>
          GH&#x20B5;{(wallet.availableBalance ?? wallet.balance ?? 0).toFixed(2)}
        </BalanceAmount>
        <BalanceInfo>
          <InfoItem>
            <span>Currency</span>
            <strong>{wallet.currency || 'GHS'}</strong>
          </InfoItem>
          <InfoItem>
            <span>Total Transactions</span>
            <strong>{pagination.total || 0}</strong>
          </InfoItem>
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
        <ActionCard onClick={() => navigate(PATHS.WALLET_ADD_MONEY)}>
          <ActionIcon $color="var(--color-primary-600)">
            <FaPlus />
          </ActionIcon>
          <ActionContent>
            <h3>Add Money</h3>
            <p>Top up your wallet via Paystack</p>
          </ActionContent>
          <ActionArrow>
            <FaArrowRight />
          </ActionArrow>
        </ActionCard>
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

        {/* Filter buttons */}
        <FilterButtons>
          <FilterButton
            $active={typeFilter === null}
            onClick={() => setTypeFilter(null)}
          >
            All
          </FilterButton>
          <FilterButton
            $active={typeFilter === 'CREDIT_TOPUP'}
            onClick={() => setTypeFilter('CREDIT_TOPUP')}
          >
            Top-ups
          </FilterButton>
          <FilterButton
            $active={typeFilter === 'DEBIT_ORDER'}
            onClick={() => setTypeFilter('DEBIT_ORDER')}
          >
            Orders
          </FilterButton>
          <FilterButton
            $active={typeFilter === 'CREDIT_REFUND'}
            onClick={() => setTypeFilter('CREDIT_REFUND')}
          >
            Refunds
          </FilterButton>
        </FilterButtons>

        <TransactionTable>
          <thead>
            <tr>
              <TableHeader onClick={() => requestSort("createdAt")} $clickable>
                Date {getSortIcon("createdAt")}
              </TableHeader>
              <TableHeader
                onClick={() => requestSort("type")}
                $clickable
              >
                Type {getSortIcon("type")}
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
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} $align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>
                    <TypeBadge $color={getTransactionColor(transaction.type)}>
                      {getTransactionTypeLabel(transaction.type)}
                    </TypeBadge>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell
                    $color={getTransactionColor(transaction.type)}
                    $align="right"
                  >
                    {transaction.amount > 0 ? "+" : ""}GH₵
                    {Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </TransactionTable>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </PaginationButton>
            <PageInfo>
              Page {pagination.page} of {pagination.pages}
            </PageInfo>
            <PaginationButton
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
            >
              Next
            </PaginationButton>
          </PaginationContainer>
        )}
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
  color: var(--primary-700);
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

const FilterButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: ${(props) => (props.$active ? 'var(--color-primary-600)' : 'white')};
  color: ${(props) => (props.$active ? 'white' : 'var(--color-grey-700)')};
  border: 1px solid ${(props) => (props.$active ? 'var(--color-primary-600)' : 'var(--color-grey-300)')};
  border-radius: var(--border-radius-md);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${(props) => (props.$active ? 'var(--color-primary-700)' : 'var(--color-grey-100)')};
  }
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: ${(props) => props.$color}20;
  color: ${(props) => props.$color};
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  font-weight: 600;
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-grey-200);
`;

const PaginationButton = styled.button`
  padding: 10px 20px;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: var(--color-primary-700);
  }

  &:disabled {
    background: var(--color-grey-400);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PageInfo = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;
