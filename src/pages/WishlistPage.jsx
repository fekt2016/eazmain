// src/views/pages/WishlistPage.jsx
import { useMemo } from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";

import ProductCard from "../components/ProductCard";

const WishlistPage = () => {
  const { data: wishlistData } = useWishlist();

  const wishlist = useMemo(() => {
    return wishlistData?.data?.products || [];
  }, [wishlistData]);

  return (
    <PageContainer>
      <MainContent>
        <PageHeader>
          <PageTitle>Your Wishlist</PageTitle>
          <PageSubtitle>
            {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved for
            later
          </PageSubtitle>
        </PageHeader>

        {wishlist.length === 0 ? (
          <EmptyState>
            <EmptyIcon>❤️</EmptyIcon>
            <EmptyTitle>Your wishlist is empty</EmptyTitle>
            <EmptyText>
              Save items you love by clicking the heart icon
            </EmptyText>
            <ShopButton to="/">Continue Shopping</ShopButton>
          </EmptyState>
        ) : (
          <>
            <WishlistGrid>
              {wishlist.map((product) => {
                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    showWishlistButton={false}
                    showRemoveButton={true}
                  />
                );
              })}
            </WishlistGrid>

            <ContinueShopping to="/">Continue Shopping</ContinueShopping>
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  background-color: #f8f9fc;
  min-height: 100vh;
  font-family: "Poppins", sans-serif;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #2e3a59;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #858796;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 60px 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  color: #2e3a59;
`;

const EmptyText = styled.p`
  color: #858796;
  margin-bottom: 30px;
  font-size: 16px;
`;

const ShopButton = styled(Link)`
  display: inline-block;
  background: #4e73df;
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s;

  &:hover {
    background: #2e59d9;
  }
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// const WishlistItem = styled.div`
//   background: white;
//   border-radius: 15px;
//   overflow: hidden;
//   box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
//   transition: all 0.3s;
//   position: relative;
//   border: 1px solid #eaecf4;
//   display: flex;
//   flex-direction: column;

//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
//   }
// `;

// const ProductImage = styled.div`
//   height: 200px;
//   width: 100%;
//   background: #f8f9fc;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 20px;

//   img {
//     max-height: 100%;
//     max-width: 100%;
//     object-fit: contain;
//     transition: transform 0.3s;
//   }

//   &:hover img {
//     transform: scale(1.05);
//   }
// `;

// const ProductInfo = styled.div`
//   padding: 20px;
//   flex-grow: 1;
//   display: flex;
//   flex-direction: column;
// `;

// const ProductName = styled.h3`
//   font-size: 18px;
//   font-weight: 600;
//   margin-bottom: 10px;
//   color: #2e3a59;
// `;

// const ProductPrice = styled.div`
//   font-size: 20px;
//   font-weight: 700;
//   color: #4e73df;
//   margin-top: auto;
//   margin-bottom: 15px;
// `;

// const ActionsRow = styled.div`
//   display: flex;
//   gap: 10px;
//   margin-top: 10px;
// `;

// const RemoveButton = styled.button`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
//   padding: 10px;
//   background: #f8f9fc;
//   color: #e74a3b;
//   border: 1px solid #eaecf4;
//   border-radius: 5px;
//   font-weight: 500;
//   cursor: pointer;
//   transition: all 0.3s;

//   &:hover {
//     background: #ffecec;
//     border-color: #e74a3b;
//   }

//   span {
//     font-size: 14px;
//   }
// `;

// const AddToCartButton = styled.button`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
//   padding: 10px;
//   background: #4e73df;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   font-weight: 500;
//   cursor: pointer;
//   transition: background 0.3s;

//   &:hover {
//     background: #2e59d9;
//   }

//   span {
//     font-size: 14px;
//   }
// `;

// const WishlistButton = styled.button`
//   position: absolute;
//   top: 15px;
//   right: 15px;
//   background: rgba(255, 255, 255, 0.8);
//   border: none;
//   border-radius: 50%;
//   width: 36px;
//   height: 36px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   z-index: 10;
//   transition: all 0.3s;
//   font-size: 18px;

//   &:hover {
//     background: white;
//     transform: scale(1.1);
//   }
// `;

const ContinueShopping = styled(Link)`
  display: block;
  width: max-content;
  margin: 0 auto;
  padding: 12px 30px;
  background: #f8f9fc;
  color: #4e73df;
  border: 1px solid #4e73df;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: #4e73df;
    color: white;
  }
`;

export default WishlistPage;
