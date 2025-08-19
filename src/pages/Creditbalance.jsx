import styled from "styled-components";
import { FaCoins, FaHistory, FaPlus, FaArrowRight } from "react-icons/fa";
import { devicesMax } from "../styles/breakpoint";
import { useCreditBalance } from "../hooks/useCreditbalance";
import { useMemo } from "react";
import { formatDate } from "../utils/helpers";

const CreditBalance = () => {
  const { data, isLoading } = useCreditBalance();
  console.log("creditData", data);

  const creditBalance = useMemo(() => {
    return data?.data?.creditbalance;
  }, [data]);

  console.log("creditBalance", creditBalance);
  // Mock data - replace with actual data from your API
  // const creditBalance = 1250.75;
  // const transactions = [
  //   {
  //     id: 1,
  //     date: "2023-11-15",
  //     description: "Product Purchase",
  //     amount: -50.25,
  //   },
  //   { id: 2, date: "2023-11-10", description: "Credit Top-up", amount: +500 },
  //   { id: 3, date: "2023-11-05", description: "Service Fee", amount: -25.5 },
  //   { id: 4, date: "2023-10-28", description: "Referral Bonus", amount: +100 },
  //   { id: 5, date: "2023-10-20", description: "Order Refund", amount: +75.5 },
  // ];

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log("data", data);
  return (
    <PageContainer>
      <Header>
        <Title>
          <FaCoins />
          <h1>Credit Balance</h1>
        </Title>
        {/* <AddCreditButton>
          <FaPlus /> Add Credit
        </AddCreditButton>*/}
      </Header>
      <BalanceCard>
        <BalanceLabel>Available Balance</BalanceLabel>
        <BalanceAmount>
          GH&#x20B5;{creditBalance.balance.toFixed(2)}
        </BalanceAmount>
        <BalanceInfo>
          <InfoItem>
            <span>Last Top-up</span>
            <strong>$500.00</strong>
          </InfoItem>
          <InfoItem>
            <span>Expires</span>
            <strong>Dec 31, 2024</strong>
          </InfoItem>
        </BalanceInfo>
      </BalanceCard>

      <ActionCards>
        {/* <ActionCard>
           <ActionIcon $color="var(--color-primary-500)">
            <FaPlus />
          </ActionIcon>
          <ActionContent>
            <h3>Add Credit</h3>
            <p>Top up your balance</p>
          </ActionContent>
          <ActionArrow>
            <FaArrowRight />
          </ActionArrow>
        </ActionCard> */}

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
              <TableHeader>Date</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader $align="right">Amount</TableHeader>
            </tr>
          </thead>
          <tbody>
            {creditBalance.transactions.map((transaction) => (
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

// Styled Components
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

const AddCreditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  padding: 12px 24px;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);

  &:hover {
    background: var(--color-primary-700);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  @media ${devicesMax.sm} {
    padding: 10px 18px;
    font-size: 1.4rem;
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
