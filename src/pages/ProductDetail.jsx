import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  FaShoppingCart,
  FaHeart,
  FaChevronLeft,
  FaCheck,
  FaComments,
} from "react-icons/fa";
import useProduct from "../hooks/useProduct.js";
import SimilarProducts from "../components/SimilarProduct.jsx";
import StarRating from "../components/StarRating.jsx";
import { useCartActions } from "../hooks/useCart.js";
import useAnalytics from "../hooks/useAnalytics.js";
import { getOrCreateSessionId } from "../utils/sessionUtils.js";
import { useAddHistoryItem } from "../hooks/useBrowserhistory.js";

const ProductDetailPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const addHistoryItem = useAddHistoryItem();

  const { useGetProductById } = useProduct();
  const { data: productData, isLoading, error } = useGetProductById(id);
  const { addToCart } = useCartActions();
  const hasRecordedView = useRef(false);
  const hasRecordedHistory = useRef(false);

  const { recordProductView } = useAnalytics();

  const product = useMemo(() => {
    return productData?.data?.data;
  }, [productData]);

  // Record browsing history (FIXED)
  useEffect(() => {
    if (product && !hasRecordedHistory.current) {
      hasRecordedHistory.current = true;

      addHistoryItem.mutate({
        type: "product",
        itemId: product._id,
        itemData: {
          name: product.name,
          image: product.images?.[0] || "",
          price: product.defaultPrice,
          currency: product.currency || "GHS", // Add currency field with fallback
          category: product.parentCategory?.name || "Uncategorized",
          seller: product.seller?.name || "Unknown Seller",
        },
      });
    }
  }, [product, addHistoryItem]);

  useEffect(() => {
    if (!hasRecordedView.current) {
      hasRecordedView.current = true;
      const sessionId = getOrCreateSessionId();
      recordProductView.mutate({ productId: id, sessionId });
    }
  }, [id, recordProductView]);

  const variants = useMemo(() => {
    return product?.variants || [];
  }, [product]);

  // Get all unique attributes from variants
  const attributeKeys = useMemo(() => {
    const keys = new Set();
    variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [variants]);

  // Initialize selected attributes with first in-stock variant
  useEffect(() => {
    if (variants.length > 0) {
      const initialAttributes = {};
      const inStockVariant = variants.find((v) => v.stock > 0) || variants[0];

      inStockVariant.attributes.forEach((attr) => {
        initialAttributes[attr.key] = attr.value;
      });

      setSelectedAttributes(initialAttributes);
      setSelectedVariant(inStockVariant);
    }
  }, [variants]);

  // Update selected variant when attributes change
  useEffect(() => {
    if (Object.keys(selectedAttributes).length > 0) {
      const matchingVariant = variants.find((variant) => {
        // Check if variant has all selected attributes
        return Object.entries(selectedAttributes).every(([key, value]) => {
          return variant.attributes.some(
            (attr) => attr.key === key && attr.value === value
          );
        });
      });

      setSelectedVariant(matchingVariant);
    }
  }, [selectedAttributes, variants]);

  // Update quantity if it exceeds selected variant stock
  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(selectedVariant.stock > 0 ? selectedVariant.stock : 1);
    }
  }, [selectedVariant, quantity]);

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, selectedVariant?.stock || 1));
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      product,
      quantity,
      variant: selectedVariant._id,
    });
  };

  const handleAttributeChange = (attribute, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attribute]: value,
    }));
  };

  // Function to check if a value represents a valid color
  const isColorValue = (value) => {
    const colorNames = [
      "black",
      "silver",
      "gray",
      "white",
      "maroon",
      "red",
      "purple",
      "fuchsia",
      "green",
      "lime",
      "olive",
      "yellow",
      "navy",
      "blue",
      "teal",
      "aqua",
      "orange",
    ];

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    const isNamedColor = colorNames.includes(value.toLowerCase());
    const isHexColor = hexRegex.test(value);

    return isNamedColor || isHexColor;
  };

  if (isLoading) return <Loading>Loading product details...</Loading>;
  if (error) return <Error>{error.message}</Error>;
  if (!product) return <Error>Product not found</Error>;

  // Get current display values based on selected variant
  const displayPrice = selectedVariant?.price || product.defaultPrice;
  const displaySku = selectedVariant?.sku || product.sku;

  const variantStock = selectedVariant?.stock;

  const reviewCount = product.ratingsQuantity || 0;
  const averageRating = product.ratingsAverage || 0;
  const reviews = product.reviews || [];

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back
        </BackButton>
        <PageTitle>{product.name}</PageTitle>
      </Header>

      <ProductContainer>
        <ProductGallery>
          <MainImage>
            <img
              src={
                product.images && product.images.length > 0
                  ? product.images[selectedImage]
                  : product.imageCover
              }
              alt={product.name}
            />
          </MainImage>

          {product.images && product.images.length > 1 && (
            <Thumbnails>
              {product.images.map((img, index) => (
                <Thumbnail
                  key={index}
                  $active={index === selectedImage}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                  />
                </Thumbnail>
              ))}
            </Thumbnails>
          )}
        </ProductGallery>

        <ProductInfo>
          <ProductHeader>
            <ProductName>{product.name}</ProductName>
            <ProductMeta>
              <Rating>
                <StarRating rating={averageRating} />
                <RatingValue>{averageRating.toFixed(1)}</RatingValue>
                {reviewCount > 0 && (
                  <ReviewsLink to={(`/product/${id}/reviews`, {})}>
                    <FaComments /> {reviewCount} reviews
                  </ReviewsLink>
                )}
              </Rating>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                }}
              >
                <SKU>SKU: {displaySku || "N/A"}</SKU>
                <SKU>Stock: {variantStock}</SKU>
              </div>
            </ProductMeta>
          </ProductHeader>

          <Price>GH₵{displayPrice.toFixed(2)}</Price>

          {/* Attribute-based variant selection */}
          {attributeKeys.length > 0 && (
            <AttributeSelector>
              {attributeKeys.map((attribute) => {
                // Get unique values for this attribute across all variants
                const values = [
                  ...new Set(
                    variants
                      .map(
                        (v) =>
                          v.attributes.find((a) => a.key === attribute)?.value
                      )
                      .filter(Boolean)
                  ),
                ];

                return (
                  <AttributeGroup key={attribute}>
                    <AttributeLabel>{attribute}:</AttributeLabel>
                    <AttributeOptions>
                      {values.map((value) => {
                        console.log();
                        const isColor = attribute
                          .toLowerCase()
                          .includes("color");
                        const showAsColor = isColor && isColorValue(value);

                        // Find stock for this specific attribute value combination
                        const variantStock =
                          variants.find((variant) => {
                            return (
                              variant.attributes.some(
                                (attr) =>
                                  attr.key === attribute && attr.value === value
                              ) &&
                              Object.entries(selectedAttributes)
                                .filter(([key]) => key !== attribute)
                                .every(([key, val]) =>
                                  variant.attributes.some(
                                    (attr) =>
                                      attr.key === key && attr.value === val
                                  )
                                )
                            );
                          })?.stock || 0;

                        const isOutOfStock = variantStock <= 0;

                        return (
                          <RadioButton
                            key={`${attribute}-${value}`}
                            $active={selectedAttributes[attribute] === value}
                            // $disabled={isOutOfStock}
                            $isColor={showAsColor}
                            $colorValue={showAsColor ? value : null}
                            onClick={() =>
                              // !isOutOfStock &&
                              handleAttributeChange(attribute, value)
                            }
                          >
                            {showAsColor ? (
                              <ColorSwatch $color={value}>
                                {selectedAttributes[attribute] === value && (
                                  <Checkmark>
                                    <FaCheck />
                                  </Checkmark>
                                )}
                                {isOutOfStock && (
                                  <SoldOutOverlay></SoldOutOverlay>
                                )}
                              </ColorSwatch>
                            ) : (
                              <RadioLabel>
                                {value}
                                {selectedAttributes[attribute] === value && (
                                  <RadioCheckmark>
                                    <FaCheck />
                                  </RadioCheckmark>
                                )}
                                {isOutOfStock && (
                                  <SoldOutOverlay></SoldOutOverlay>
                                )}
                              </RadioLabel>
                            )}
                          </RadioButton>
                        );
                      })}
                    </AttributeOptions>
                  </AttributeGroup>
                );
              })}
            </AttributeSelector>
          )}

          <ProductDescription>
            <h3>Description</h3>
            <p>{product.description || "No description available"}</p>
          </ProductDescription>

          <Actions>
            <Quantity>
              <QtyButton onClick={decrementQuantity} disabled={quantity <= 1}>
                -
              </QtyButton>
              <QtyInput
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(
                      1,
                      Math.min(parseInt(e.target.value) || 1, variantStock)
                    )
                  )
                }
                min="1"
                max={variantStock}
              />
              <QtyButton
                onClick={incrementQuantity}
                disabled={quantity >= variantStock}
              >
                +
              </QtyButton>
            </Quantity>
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={variantStock <= 0 || !selectedVariant}
            >
              <FaShoppingCart />
              {product.totalStock || variantStock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </AddToCartButton>
            <WishlistButton>
              <FaHeart />
            </WishlistButton>
          </Actions>

          <ProductDetails>
            <DetailItem>
              <DetailLabel>Category:</DetailLabel>
              <DetailValue>
                {typeof product.parentCategory === "object"
                  ? product.parentCategory.name
                  : product.parentCategory?.name || "N/A"}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Brand:</DetailLabel>
              <DetailValue>{product.brand || "N/A"}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Stock:</DetailLabel>
              <DetailValue>
                {product.totalStock > 0
                  ? `In Stock (${product.totalStock} available)`
                  : "Out of Stock"}
              </DetailValue>
            </DetailItem>
          </ProductDetails>

          {product.seller && (
            <SellerInfo>
              <h3>Sold by</h3>
              <Seller>
                <SellerImage>
                  <img
                    src={
                      product.seller.avatar || "https://via.placeholder.com/50"
                    }
                    alt={product.seller.name}
                  />
                </SellerImage>
                <SellerName>
                  <SellerPage to={`/seller/${product.seller._id}`}>
                    {product.seller.shopName}
                  </SellerPage>
                </SellerName>
                <Loc>{product.seller.location}</Loc>
              </Seller>
            </SellerInfo>
          )}
        </ProductInfo>
      </ProductContainer>

      <ReviewsSection>
        <SectionHeader>
          <h3>Customer Reviews</h3>
          {reviewCount > 0 && (
            <WriteReviewLink to={`/product/${id}/reviews`}>
              see all
            </WriteReviewLink>
          )}
        </SectionHeader>

        {reviewCount > 0 ? (
          <>
            <ReviewsSummary>
              <RatingValue>{averageRating.toFixed(1)} out of 5</RatingValue>
              <ViewAllLink to={`/product/${id}/reviews`}>
                View all {reviewCount} reviews
              </ViewAllLink>
            </ReviewsSummary>
            {reviewCount > 0 && (
              <RatingDistribution>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter((r) => {
                    return r.rating === stars;
                  }).length;
                  const percentage = (count / reviewCount) * 100;

                  return (
                    <RatingRow key={stars}>
                      <StarCount>{stars} stars</StarCount>
                      <RatingBar>
                        <RatingFill $percentage={percentage} />
                      </RatingBar>
                      <RatingPercentage>
                        {percentage.toFixed(0)}%
                      </RatingPercentage>
                      <ReviewCount>({count})</ReviewCount>
                    </RatingRow>
                  );
                })}
              </RatingDistribution>
            )}

            <ReviewList>
              {reviews.slice(0, 5).map((review) => (
                <ReviewItem key={review._id}>
                  <ReviewHeader>
                    <ReviewerName>
                      {review.user?.name || "Anonymous"}
                    </ReviewerName>
                    <ReviewRating>
                      <StarRating rating={review.rating} />
                    </ReviewRating>
                    <ReviewDate>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </ReviewDate>
                  </ReviewHeader>
                  <ReviewTitle>{review.title}</ReviewTitle>
                  <ReviewComment>{review.comment}</ReviewComment>
                </ReviewItem>
              ))}
            </ReviewList>
          </>
        ) : (
          <NoReviews>
            No reviews yet.
            <Link to={`/product/${id}/reviews`}>Be the first!</Link>
          </NoReviews>
        )}
      </ReviewsSection>

      {/* Similar Products Section */}
      {product.category && (
        <SimilarProductsSection>
          <SectionTitle>You May Also Like</SectionTitle>
          <SimilarProducts
            categoryId={product.category.id}
            currentProductId={product.id}
          />
        </SimilarProductsSection>
      )}
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  padding: 20px 5%;
  background-color: #f8f9fc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
`;
const SellerPage = styled(Link)`
  color: red;
  text-transform: lowercase;
  &:first-letter {
    color: blue;
    text-transform: uppercase;
  }
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
`;

const ProductContainer = styled.div`
  display: flex;
  gap: 40px;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProductGallery = styled.div`
  flex: 1;
`;

const MainImage = styled.div`
  height: 500px;
  background: #f8f9fc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  overflow: hidden;

  img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    height: 300px;
  }
`;
const Loc = styled.span``;

const Thumbnails = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  background: #f8f9fc;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid ${(props) => (props.$active ? "#4e73df" : "transparent")};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: #4e73df;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductHeader = styled.div`
  margin-bottom: 20px;
`;

const ProductName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #2e3a59;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
`;

const RatingValue = styled.span`
  font-size: 14px;
  color: #858796;
  margin-left: 8px;
`;

const ReviewsLink = styled(Link)`
  display: flex;
  align-items: center;
  margin-left: 15px;
  color: #4e73df;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #2e59d9;
    text-decoration: underline;
  }

  svg {
    margin-right: 5px;
  }
`;
// Styled Components for Rating Bar
const RatingDistribution = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const StarCount = styled.div`
  width: 70px;
  font-size: 14px;
  color: #2e3a59;
`;

const RatingBar = styled.div`
  flex: 1;
  height: 8px;
  background-color: #eaecf4;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 10px;
`;

const RatingFill = styled.div`
  height: 100%;
  background-color: #ffc107;
  width: ${(props) => props.$percentage}%;
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const RatingPercentage = styled.div`
  width: 40px;
  font-size: 14px;
  color: #2e3a59;
  text-align: right;
`;

const ReviewCount = styled.div`
  width: 50px;
  font-size: 14px;
  color: #858796;
  margin-left: 5px;
`;

const SKU = styled.span`
  font-size: 14px;
  color: #858796;
`;

const Price = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #4e73df;
  margin-bottom: 25px;
`;

const ProductDescription = styled.div`
  margin-bottom: 30px;

  h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #2e3a59;
  }

  p {
    line-height: 1.8;
    color: #4d4d4d;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const Quantity = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #eaecf4;
  border-radius: 5px;
  overflow: hidden;
`;

const QtyInput = styled.input`
  width: 50px;
  height: 40px;
  border: none;
  text-align: center;
  font-size: 16px;
  border-left: 1px solid #eaecf4;
  border-right: 1px solid #eaecf4;

  &:focus {
    outline: none;
  }
`;

const WishlistButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f8f9fc;
  border: 1px solid #eaecf4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #ff6b6b;
    color: white;
    border-color: #ff6b6b;
  }

  svg {
    font-size: 20px;
  }
`;

const ProductDetails = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fc;
  border-radius: 10px;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  width: 100px;
  color: #2e3a59;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #4d4d4d;
`;

const SellerInfo = styled.div`
  padding: 20px;
  background: #f8f9fc;
  border-radius: 10px;

  h3 {
    margin-bottom: 15px;
    color: #2e3a59;
    font-size: 18px;
  }
`;

const Seller = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SellerImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SellerName = styled.div`
  font-weight: 600;
  color: #2e3a59;
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #4e73df;
`;

const Error = styled.div`
  text-align: center;
  padding: 40px;
  color: #e74a3b;
  font-weight: bold;
`;

const AttributeSelector = styled.div`
  margin-bottom: 25px;
`;

const AttributeGroup = styled.div`
  margin-bottom: 15px;
`;

const AttributeLabel = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #2e3a59;
`;

const AttributeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const RadioButton = styled.button`
  position: relative;
  height: 40px;
  min-width: 40px;
  border: 2px solid
    ${(props) =>
      props.$active ? "#4e73df" : props.$disabled ? "#e0e0e0" : "#eaecf4"};
  background: ${(props) =>
    props.$active
      ? props.$isColor
        ? "transparent"
        : "rgba(78, 115, 223, 0.1)"
      : props.$disabled
      ? "#f9f9f9"
      : "white"};
  border-radius: 50%;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
  overflow: hidden;
  opacity: ${(props) => (props.$disabled ? 0.7 : 1)};

  &:hover:not(:disabled) {
    border-color: ${(props) => (props.$active ? "#4e73df" : "#aab7cf")};
  }

  // For non-color radio buttons
  ${(props) =>
    !props.$isColor &&
    css`
      width: auto;
      min-width: 60px;
      height: 40px;
      border-radius: 20px;
      padding: 0 15px;
    `}
`;

const ColorSwatch = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Checkmark = styled.span`
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const RadioLabel = styled.span`
  font-size: 14px;
  color: ${(props) => (props.$disabled ? "#b0b0b0" : "#2e3a59")};
  position: relative;
  padding-right: 20px;
`;

const RadioCheckmark = styled.span`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #4e73df;
  font-size: 12px;
  background: rgba(78, 115, 223, 0.1);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QtyButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  font-size: 18px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  color: ${(props) => (props.disabled ? "#b0b0b0" : "inherit")};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #eaecf4;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${(props) => (props.disabled ? "#b0b0b0" : "#4e73df")};
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background: ${(props) => (props.disabled ? "#b0b0b0" : "#2e59d9")};
  }
`;

const ReviewsSection = styled.div`
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  h3 {
    margin: 0;
    font-size: 18px;
  }
`;

const WriteReviewLink = styled(Link)`
  color: #4e73df;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ReviewsSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const ViewAllLink = styled(Link)`
  color: #4e73df;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NoReviews = styled.div`
  color: #6c757d;
  padding: 20px 0;
  text-align: center;

  a {
    color: #4e73df;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SoldOutOverlay = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px;
  z-index: 2;
`;

const SimilarProductsSection = styled.div`
  margin: 40px 0;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #2e3a59;
  padding-bottom: 10px;
  border-bottom: 2px solid #eaecf4;
`;

const ReviewList = styled.div`
  margin-top: 20px;
`;

const ReviewItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eaecf4;
  &:last-child {
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
  gap: 15px;
`;

const ReviewerName = styled.div`
  font-weight: 600;
  color: #2e3a59;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
`;

const ReviewDate = styled.div`
  font-size: 14px;
  color: #858796;
`;

const ReviewTitle = styled.h4`
  margin: 5px 0 10px;
  font-size: 16px;
  color: #2e3a59;
`;

const ReviewComment = styled.p`
  line-height: 1.6;
  color: #4d4d4d;
  margin: 0;
`;

export default ProductDetailPage;
