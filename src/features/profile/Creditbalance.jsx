import styled, { keyframes } from "styled-components";
import {
  FaCoins,
  FaHistory,
  FaPlus,
  FaArrowRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaWallet,
  FaExchangeAlt,
} from "react-icons/fa";
import { devicesMax } from '../../shared/styles/breakpoint';
import { useWalletBalance, useWalletTransactions } from '../../shared/hooks/useWallet';
import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../shared/utils/helpers';
import { useApplyUserCoupon } from '../../shared/hooks/useCoupon';
import { LoadingState, ButtonSpinner, ErrorState } from '../../components/loading';
import { PATHS } from '../../routes/routePaths';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

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

  const requestSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const applyCoupon = async () => {
    applyCouponMutate(couponCode);
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) return <FaSort />;
    return sortOrder === "desc" ? <FaSortDown /> : <FaSortUp />;
  };

  const getTransactionColor = (type) => {
    if (type === 'CREDIT_REFUND') return '#2563eb';
    if (type.startsWith('CREDIT_')) return '#059669';
    return '#dc2626';
  };

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
    return (
      <PageContainer>
        <LoadingState message="Loading your wallet..." />
      </PageContainer>
    );
  }

  if (!walletData && !isBalanceLoading) {
    return (
      <PageContainer>
        <ErrorState title="Failed to Load Wallet" message="Please try again or contact support." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ── Page Banner ─────────────────────────────────── */}
      <PageBanner>
        <BannerOverlay />
        <BannerInner>
          <BannerIcon><FaWallet /></BannerIcon>
          <div>
            <BannerTitle>My Wallet</BannerTitle>
            <BannerSub>Manage your credit balance and transactions</BannerSub>
          </div>
        </BannerInner>
      </PageBanner>

      <ContentWrap>
        {/* ── Balance Hero Card ─────────────────────────── */}
        <BalanceHero>
          <HeroGlowLeft />
          <HeroDots />
          <HeroInner>
            <BalanceLabel>Available Balance</BalanceLabel>
            <BalanceAmount>
              GH₵{(wallet.availableBalance ?? wallet.balance ?? 0).toFixed(2)}
            </BalanceAmount>
            <BalanceMeta>
              <MetaPill>
                <span>Currency</span>
                <strong>{wallet.currency || 'GHS'}</strong>
              </MetaPill>
              <MetaPill>
                <span>Total Transactions</span>
                <strong>{pagination.total || 0}</strong>
              </MetaPill>
            </BalanceMeta>
          </HeroInner>
        </BalanceHero>

        {/* ── Quick Actions ─────────────────────────────── */}
        <ActionGrid>
          <ActionCard onClick={() => navigate(PATHS.WALLET_ADD_MONEY)}>
            <ActionIconCircle $gold>
              <FaPlus />
            </ActionIconCircle>
            <ActionBody>
              <ActionTitle>Add Money</ActionTitle>
              <ActionSub>Top up via Paystack</ActionSub>
            </ActionBody>
            <ActionChevron><FaArrowRight /></ActionChevron>
          </ActionCard>

          <ActionCard>
            <ActionIconCircle>
              <FaHistory />
            </ActionIconCircle>
            <ActionBody>
              <ActionTitle>Transaction History</ActionTitle>
              <ActionSub>View all past activity</ActionSub>
            </ActionBody>
            <ActionChevron><FaArrowRight /></ActionChevron>
          </ActionCard>
        </ActionGrid>

        {/* ── Apply Coupon ──────────────────────────────── */}
        <Card>
          <CardHeading>
            <FaPlus />
            <span>Apply Coupon</span>
          </CardHeading>
          <CouponRow>
            <CouponInput
              type="text"
              placeholder="Enter coupon code…"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={isApplying}
            />
            <ApplyBtn onClick={applyCoupon} disabled={isApplying || !couponCode.trim()}>
              {isApplying ? <ButtonSpinner size="sm" /> : 'Apply'}
            </ApplyBtn>
          </CouponRow>
          {couponError && (
            <CouponError>{couponError?.message || 'Failed to apply coupon.'}</CouponError>
          )}
        </Card>

        {/* ── Transaction History ───────────────────────── */}
        <Card>
          <CardHeading>
            <FaHistory />
            <span>Recent Transactions</span>
          </CardHeading>

          <FilterPills>
            {[
              { label: 'All', value: null },
              { label: 'Top-ups', value: 'CREDIT_TOPUP' },
              { label: 'Orders', value: 'DEBIT_ORDER' },
              { label: 'Refunds', value: 'CREDIT_REFUND' },
            ].map((f) => (
              <FilterPill
                key={f.label}
                $active={typeFilter === f.value}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </FilterPill>
            ))}
          </FilterPills>

          <TableWrap>
            <TxTable>
              <thead>
                <tr>
                  <TH onClick={() => requestSort("createdAt")}>Date {getSortIcon("createdAt")}</TH>
                  <TH onClick={() => requestSort("type")}>Type {getSortIcon("type")}</TH>
                  <TH onClick={() => requestSort("description")}>Description {getSortIcon("description")}</TH>
                  <TH $right onClick={() => requestSort("amount")}>Amount {getSortIcon("amount")}</TH>
                </tr>
              </thead>
              <tbody>
                {!transactions || transactions.length === 0 ? (
                  <tr>
                    <TD colSpan={4} $center>No transactions found</TD>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <TRow key={tx._id}>
                      <TD>{formatDate(tx.createdAt)}</TD>
                      <TD>
                        <TxBadge $color={getTransactionColor(tx.type)}>
                          {getTransactionTypeLabel(tx.type)}
                        </TxBadge>
                      </TD>
                      <TD>{tx.description}</TD>
                      <TD $right $color={getTransactionColor(tx.type)}>
                        {tx.amount > 0 ? '+' : ''}GH₵{Math.abs(tx.amount).toFixed(2)}
                      </TD>
                    </TRow>
                  ))
                )}
              </tbody>
            </TxTable>
          </TableWrap>

          {pagination.pages > 1 && (
            <Pagination>
              <PageBtn onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </PageBtn>
              <PageInfo>Page {pagination.page} of {pagination.pages}</PageInfo>
              <PageBtn onClick={() => setPage(page + 1)} disabled={page === pagination.pages}>
                Next
              </PageBtn>
            </Pagination>
          )}
        </Card>
      </ContentWrap>
    </PageContainer>
  );
};

export default CreditBalance;

/* ─── Styled Components ──────────────────────────────────── */

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9f7f4;
  font-family: "Inter", sans-serif;
`;

/* ── Banner ─────────────────── */
const PageBanner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  overflow: hidden;
  padding: 2.5rem 2rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(212,136,42,0.15) 0%, transparent 60%);
  pointer-events: none;
`;

const BannerInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  animation: ${fadeUp} 0.4s ease;
`;

const BannerIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(212,136,42,0.2);
  border: 2px solid rgba(212,136,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #D4882A;
  flex-shrink: 0;
`;

const BannerTitle = styled.h1`
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.2rem;
`;

const BannerSub = styled.p`
  font-size: 0.88rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
`;

/* ── Content ─────────────────── */
const ContentWrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

/* ── Balance Hero ─────────────── */
const BalanceHero = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3755 60%, #1a2035 100%);
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeUp} 0.4s ease 0.1s both;
`;

const HeroGlowLeft = styled.div`
  position: absolute;
  top: -40px;
  left: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(212,136,42,0.25), transparent 70%);
  pointer-events: none;
`;

const HeroDots = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(212,136,42,0.1) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  padding: 2.5rem 2rem;
`;

const BalanceLabel = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.65);
  margin: 0 0 0.5rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
`;

const BalanceAmount = styled.h2`
  font-size: 3.2rem;
  font-weight: 800;
  color: #D4882A;
  margin: 0 0 1.5rem;
  line-height: 1;

  @media ${devicesMax.sm} { font-size: 2.4rem; }
`;

const BalanceMeta = styled.div`
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const MetaPill = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  span {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  strong {
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
  }
`;

/* ── Action Grid ─────────────── */
const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  animation: ${fadeUp} 0.4s ease 0.15s both;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const ActionCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #f0e8d8;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #D4882A;
    box-shadow: 0 4px 16px rgba(212,136,42,0.15);
    transform: translateY(-2px);
  }
`;

const ActionIconCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $gold }) => $gold ? 'rgba(212,136,42,0.12)' : 'rgba(26,31,46,0.08)'};
  color: ${({ $gold }) => $gold ? '#D4882A' : '#1a1f2e'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const ActionBody = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1f2e;
  margin: 0 0 0.15rem;
`;

const ActionSub = styled.p`
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
`;

const ActionChevron = styled.div`
  color: #d1d5db;
  font-size: 0.85rem;
  transition: transform 0.2s;

  ${ActionCard}:hover & { transform: translateX(4px); color: #D4882A; }
`;

/* ── Generic Card ─────────────── */
const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f0e8d8;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  animation: ${fadeUp} 0.4s ease 0.2s both;
`;

const CardHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1f2e;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0e8d8;

  svg { color: #D4882A; }
`;

/* ── Coupon ─────────────────── */
const CouponRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media ${devicesMax.sm} { flex-direction: column; }
`;

const CouponInput = styled.input`
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #D4882A;
    box-shadow: 0 0 0 3px rgba(212,136,42,0.12);
  }

  &:disabled { background: #f9fafb; }
`;

const ApplyBtn = styled.button`
  padding: 0.7rem 1.5rem;
  background: ${({ disabled }) => disabled ? '#e5e7eb' : '#D4882A'};
  color: ${({ disabled }) => disabled ? '#9ca3af' : '#ffffff'};
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) { background: #B8711F; }

  @media ${devicesMax.sm} { width: 100%; }
`;

const CouponError = styled.p`
  margin-top: 0.75rem;
  font-size: 0.82rem;
  color: #dc2626;
`;

/* ── Filters ─────────────────── */
const FilterPills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const FilterPill = styled.button`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $active }) => $active ? '#D4882A' : '#f9f5ef'};
  color: ${({ $active }) => $active ? '#ffffff' : '#6b7280'};
  border: 1px solid ${({ $active }) => $active ? '#D4882A' : '#e5e7eb'};

  &:hover {
    background: ${({ $active }) => $active ? '#B8711F' : '#f0e8d8'};
    color: ${({ $active }) => $active ? '#ffffff' : '#D4882A'};
    border-color: #D4882A;
  }
`;

/* ── Transaction Table ─────────── */
const TableWrap = styled.div`
  overflow-x: auto;
  margin: 0 -0.25rem;
`;

const TxTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TH = styled.th`
  text-align: ${({ $right }) => $right ? 'right' : 'left'};
  padding: 0.75rem 0.875rem;
  background: #f9f7f4;
  border-bottom: 2px solid #f0e8d8;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  svg { margin-left: 4px; font-size: 0.65rem; vertical-align: middle; }
  &:hover { background: #f0e8d8; color: #D4882A; }
`;

const TRow = styled.tr`
  &:nth-child(even) { background: #fdf9f5; }
  &:hover { background: #fff7ed; }
`;

const TD = styled.td`
  padding: 0.875rem;
  border-bottom: 1px solid #f5f0ea;
  font-size: 0.85rem;
  color: ${({ $color }) => $color || '#374151'};
  text-align: ${({ $right }) => $right ? 'right' : $center => $center ? 'center' : 'left'};
  font-weight: ${({ $right }) => $right ? '600' : '400'};

  &:first-child { font-weight: 500; }
`;

const TxBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $color }) => $color}18;
  color: ${({ $color }) => $color};
`;

/* ── Pagination ─────────────── */
const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f0e8d8;
`;

const PageBtn = styled.button`
  padding: 0.5rem 1.25rem;
  background: ${({ disabled }) => disabled ? '#f3f4f6' : '#D4882A'};
  color: ${({ disabled }) => disabled ? '#9ca3af' : '#ffffff'};
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover:not(:disabled) { background: #B8711F; }
`;

const PageInfo = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
`;
