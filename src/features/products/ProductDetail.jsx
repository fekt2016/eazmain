import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { spin, pulse, float, fadeIn, slideUp } from "../../shared/styles/animations";
import {
  FaShoppingCart,
  FaHeart,
  FaChevronLeft,
  FaCheck,
  FaShare,
  FaChevronRight,
  FaChevronDown,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaEye,
  FaExpand,
  FaClock,
  FaAward,
  FaBoxOpen,
  FaStore,
  FaMapMarkerAlt,
  FaShippingFast,
  FaExclamationTriangle,
} from "react-icons/fa";
import useProduct from '../../shared/hooks/useProduct.js';
import { useGetProductReviews } from '../../shared/hooks/useReview.js';
import SimilarProducts from '../../shared/components/SimilarProduct.jsx';
import StarRating from '../../shared/components/StarRating.jsx';
import { useCartActions } from '../../shared/hooks/useCart.js';
import useAnalytics from '../../shared/hooks/useAnalytics.js';
import { getOrCreateSessionId } from '../../shared/utils/sessionUtils.js';
import { useAddHistoryItem } from '../../shared/hooks/useBrowserhistory.js';
import { useToggleWishlist } from '../../shared/hooks/useWishlist.js';
import { LoadingState, ErrorState, EmptyState, ButtonSpinner } from '../../components/loading';
import usePageTitle from '../../shared/hooks/usePageTitle';
import seoConfig from '../../shared/config/seoConfig';
import {
  isColorValue,
  getProductDisplayPrice,
  getProductOriginalPrice,
  hasProductDiscount,
  getProductDiscountPercentage,
  getProductImages,
  getProductSku,
  getProductStock,
  isProductInStock,
} from '../../shared/utils/productHelpers';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [imageZoomPosition, setImageZoomPosition] = useState({ x: 0, y: 0 });
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const imageRef = useRef(null);
  const addHistoryItem = useAddHistoryItem();

  const { useGetProductById } = useProduct();
  const { data: productData, isLoading, error } = useGetProductById(id);
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useGetProductReviews(id);
  
  // Debug logging
  console.log("reviewsData", reviewsData);
  console.log("reviewsLoading", reviewsLoading);
  console.log("reviewsError", reviewsError);

  const product = useMemo(() => {
    if (!productData) return null;
    // Handle various response structures
    // 1. Standard API response: { status: 'success', data: { product: ... } }
    if (productData.data?.product) return productData.data.product;
    // 2. Direct data response: { product: ... }
    if (productData.product) return productData.product;
    // 3. Nested data response: { data: { ... } } -> where inner data is product
    if (productData.data?.data) return productData.data.data;
    // 4. Direct product object (fallback)
    return productData.data || productData;
  }, [productData]);

  // SEO - Update page title and meta tags based on product data
  usePageTitle(product ? seoConfig.product(product) : seoConfig.home);

  // Wishlist hook - use product._id once product is loaded, fallback to id from params
  const productId = product?._id || id;
  const { toggleWishlist, isInWishlist, isAdding: isAddingToWishlist, isRemoving: isRemovingFromWishlist } = useToggleWishlist(productId);

  const { addToCart } = useCartActions();
  const hasRecordedView = useRef(false);
  const hasRecordedHistory = useRef(false);

  const { recordProductView } = useAnalytics();

  // Record browsing history
  useEffect(() => {
    if (product && !hasRecordedHistory.current) {
      hasRecordedHistory.current = true;
      addHistoryItem.mutate({
        type: "product",
        itemId: product._id,
        itemData: {
          name: product.name,
          image: product.images?.[0] || "",
          price: product?.defaultPrice || product?.price || product?.minPrice || 0,
          currency: product.currency || "GHS",
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

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, selectedVariant?.stock || 1));
  }, [selectedVariant]);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        product,
        quantity,
        variant: selectedVariant._id,
      });
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      setIsAddingToCart(false);
    }
  };

  const handleAttributeChange = useCallback((attribute, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attribute]: value,
    }));
  }, []);

  const handleImageZoom = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageZoomPosition({ x, y });
  };

  // Use utility functions for product calculations


  const reviewCount = product?.ratingsQuantity || 0;
  const averageRating = product?.ratingsAverage || 0;
  // Use reviews from the separate reviews query, fallback to product.reviews
  const reviews = useMemo(() => {
    // Handle different response structures
    // API response: { success: true, data: { count, reviews, averageRating } }
    // Axios wraps it: response.data = { success: true, data: { count, reviews, averageRating } }
    if (reviewsData) {
      console.log("Processing reviewsData structure:", {
        hasData: !!reviewsData.data,
        dataKeys: reviewsData.data ? Object.keys(reviewsData.data) : [],
        hasDataData: !!reviewsData.data?.data,
        dataDataKeys: reviewsData.data?.data ? Object.keys(reviewsData.data.data) : [],
      });
      
      // Check if it's the wrapped response: reviewsData.data.data.reviews
      if (reviewsData.data?.data?.reviews && Array.isArray(reviewsData.data.data.reviews)) {
        console.log("Found reviews in reviewsData.data.data.reviews:", reviewsData.data.data.reviews.length);
        return reviewsData.data.data.reviews;
      }
      // Check if reviews are directly in data: reviewsData.data.reviews
      if (reviewsData.data?.reviews && Array.isArray(reviewsData.data.reviews)) {
        console.log("Found reviews in reviewsData.data.reviews:", reviewsData.data.reviews.length);
        return reviewsData.data.reviews;
      }
      // Check if reviews are at root level
      if (Array.isArray(reviewsData.reviews)) {
        console.log("Found reviews in reviewsData.reviews:", reviewsData.reviews.length);
        return reviewsData.reviews;
      }
    }
    console.log("No reviews found in reviewsData, using product.reviews");
    return product?.reviews || [];
  }, [reviewsData, product]);

  if (isLoading) return <LoadingState message="Loading product..." />;
  if (error) return <ErrorState
    title="Something went wrong"
    message={error.message}
    action={
      <BackButton onClick={() => navigate(-1)}>
        <FaChevronLeft /> Go Back
      </BackButton>
    }
  />;
  if (!product) return <EmptyState
    title="Product Not Found"
    message="The product you're looking for doesn't exist."
    action={
      <BackButton onClick={() => navigate('/')}>
        <FaChevronLeft /> Continue Shopping
      </BackButton>
    }
  />;

  // Use utility functions for product calculations
  const displayPrice = getProductDisplayPrice(product, selectedVariant);
  const originalPrice = getProductOriginalPrice(product);
  const hasDiscount = hasProductDiscount(product, selectedVariant);
  const discountPercentage = getProductDiscountPercentage(product, selectedVariant);
  const displaySku = getProductSku(product, selectedVariant);
  const variantStock = getProductStock(product, selectedVariant);
  const isInStock = isProductInStock(product, selectedVariant);
  const images = getProductImages(product);

  return (
    <ModernPageContainer>
      {/* Breadcrumb */}
      <ModernBreadcrumb>
        <BreadcrumbItem onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem to="/">Home</BreadcrumbItem>
        {product.parentCategory && (
          <>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem to={`/category/${product.parentCategory.slug}`}>
              {product.parentCategory.name}
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbActive>{product.name}</BreadcrumbActive>
      </ModernBreadcrumb>

      {/* Main Product Grid */}
      <ModernProductGrid>
        {/* Image Gallery */}
        <ImageSection>
          <MainImageWrapper
            ref={imageRef}
            onMouseMove={handleImageZoom}
            onMouseEnter={() => setIsImageZoomed(true)}
            onMouseLeave={() => setIsImageZoomed(false)}
            $isZoomed={isImageZoomed}
          >
            <ModernMainImage
              src={images[selectedImage] || images[0]}
              alt={product.name}
              $zoomX={imageZoomPosition.x}
              $zoomY={imageZoomPosition.y}
              $isZoomed={isImageZoomed}
            />

            {/* Image Badges */}
            <ImageBadges>
              {hasDiscount && (
                <DiscountRibbon>
                  -{discountPercentage}% OFF
                </DiscountRibbon>
              )}
              {!isInStock && (
                <StockBadge $inStock={false}>
                  Out of Stock
                </StockBadge>
              )}
              {product.totalSold > 100 && (
                <PopularBadge>
                  <FaAward /> Popular
                </PopularBadge>
              )}
            </ImageBadges>

            {/* Image Actions */}
            <ImageActions>
              <ImageActionButton onClick={() => setShowImageModal(true)}>
                <FaExpand />
              </ImageActionButton>
              <ImageActionButton
                onClick={toggleWishlist}
                disabled={isAddingToWishlist || isRemovingFromWishlist}
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isAddingToWishlist || isRemovingFromWishlist ? (
                  <ButtonSpinner size="sm" />
                ) : (
                  <FaHeart color={isInWishlist ? "#ff6b6b" : "#fff"} />
                )}
              </ImageActionButton>
            </ImageActions>
          </MainImageWrapper>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <ThumbnailGallery>
              <ThumbnailScrollButton
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                disabled={selectedImage === 0}
              >
                <FaChevronLeft />
              </ThumbnailScrollButton>

              <ThumbnailList>
                {images.map((img, index) => (
                  <ModernThumbnail
                    key={index}
                    $active={index === selectedImage}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                    {index === selectedImage && <ThumbnailOverlay />}
                  </ModernThumbnail>
                ))}
              </ThumbnailList>

              <ThumbnailScrollButton
                onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
                disabled={selectedImage === images.length - 1}
              >
                <FaChevronRight />
              </ThumbnailScrollButton>
            </ThumbnailGallery>
          )}
        </ImageSection>

        {/* Product Info */}
        <InfoSection>
          {/* Product Header */}
          <ModernProductHeader>
            <CategoryBadge>{product.parentCategory?.name || "Category"}</CategoryBadge>
            <ModernProductTitle>{product.name}</ModernProductTitle>

            <ProductMetaGrid>
              <RatingBadge>
                <StarRating rating={averageRating} />
                <span>{averageRating.toFixed(1)}</span>
                <span>({reviewCount} reviews)</span>
              </RatingBadge>

              <ProductCode>SKU: {displaySku}</ProductCode>

              {product.totalSold > 0 && (
                <SoldCounter>
                  <FaBoxOpen />
                  {product.totalSold}+ sold
                </SoldCounter>
              )}
            </ProductMetaGrid>

            {product.shortDescription && (
              <ShortDescription>{product.shortDescription}</ShortDescription>
            )}
          </ModernProductHeader>

          {/* Pricing Section */}
          <PricingCard>
            <PriceDisplay>
              <CurrentPrice>GH₵{displayPrice > 0 ? displayPrice.toFixed(2) : '0.00'}</CurrentPrice>
              {hasDiscount && originalPrice > 0 && (
                <OriginalPrice>GH₵{originalPrice.toFixed(2)}</OriginalPrice>
              )}
            </PriceDisplay>

            {hasDiscount && originalPrice > 0 && displayPrice > 0 && (
              <SavingsAlert>
                🎉 You save GH₵{(originalPrice - displayPrice).toFixed(2)} ({discountPercentage}%)
              </SavingsAlert>
            )}

            <StockAlert $inStock={isInStock}>
              <StatusIndicator $inStock={isInStock} />
              {isInStock ? (
                <span><strong>{variantStock} available</strong> - Order now!</span>
              ) : (
                <span>Currently out of stock</span>
              )}
            </StockAlert>
          </PricingCard>

          {/* Variants Section */}
          {attributeKeys.length > 0 && (
            <VariantsCard>
              <CardTitle>Select Options</CardTitle>
              {attributeKeys.map((attribute) => {
                const values = [
                  ...new Set(
                    variants
                      .map((v) => v.attributes.find((a) => a.key === attribute)?.value)
                      .filter(Boolean)
                  ),
                ];

                const isColor = attribute.toLowerCase().includes("color");

                return (
                  <VariantGroup key={attribute}>
                    <VariantGroupLabel>
                      {attribute}
                      {selectedAttributes[attribute] && (
                        <SelectedValue>: {selectedAttributes[attribute]}</SelectedValue>
                      )}
                    </VariantGroupLabel>

                    <VariantOptionsGrid>
                      {values.map((value) => {
                        const showAsColor = isColor && isColorValue(value);
                        const variantStock = variants.find((variant) => {
                          return (
                            variant.attributes.some(
                              (attr) => attr.key === attribute && attr.value === value
                            ) &&
                            Object.entries(selectedAttributes)
                              .filter(([key]) => key !== attribute)
                              .every(([key, val]) =>
                                variant.attributes.some(
                                  (attr) => attr.key === key && attr.value === val
                                )
                              )
                          );
                        })?.stock || 0;

                        const isOutOfStock = variantStock <= 0;
                        const isLowStock = variantStock > 0 && variantStock <= 5;
                        const isSelected = selectedAttributes[attribute] === value;
                        const radioId = `${attribute}-${value}`;

                        return (
                          <RadioOptionWrapper key={radioId}>
                            <RadioInput
                              type="radio"
                              id={radioId}
                              name={attribute}
                              value={value}
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onChange={() => !isOutOfStock && handleAttributeChange(attribute, value)}
                              aria-label={`${attribute}: ${value}${isOutOfStock ? ' (Out of stock)' : isLowStock ? ` (${variantStock} left)` : ''}`}
                            />
                            <ModernVariantOption
                              htmlFor={radioId}
                              $active={isSelected}
                              $disabled={isOutOfStock}
                              $isColor={showAsColor}
                              $colorValue={showAsColor ? value : null}
                              $isLowStock={isLowStock}
                              as="label"
                            >
                              {showAsColor ? (
                                <ColorSwatchContainer>
                                  <ColorSwatch $color={value} $active={isSelected}>
                                    {isSelected && (
                                      <RadioIndicator $isColor>
                                        <FaCheck />
                                      </RadioIndicator>
                                    )}
                                  </ColorSwatch>
                                  {isOutOfStock && <OutOfStockBadge>Out</OutOfStockBadge>}
                                  {isLowStock && !isOutOfStock && (
                                    <VariantStockBadge $isLowStock>{variantStock}</VariantStockBadge>
                                  )}
                                </ColorSwatchContainer>
                              ) : (
                                <VariantContent>
                                  <VariantText $active={isSelected}>
                                    {value}
                                  </VariantText>
                                  {isSelected && (
                                    <RadioIndicator>
                                      <FaCheck />
                                    </RadioIndicator>
                                  )}
                                  {isOutOfStock && <OutOfStockBadge>Out of Stock</OutOfStockBadge>}
                                  {isLowStock && !isOutOfStock && (
                                    <VariantStockBadge $isLowStock>
                                      <FaExclamationTriangle />
                                      {variantStock} left
                                    </VariantStockBadge>
                                  )}
                                  {!isOutOfStock && !isLowStock && variantStock > 5 && (
                                    <VariantStockBadge $isLowStock={false}>
                                      {variantStock} in stock
                                    </VariantStockBadge>
                                  )}
                                </VariantContent>
                              )}
                            </ModernVariantOption>
                          </RadioOptionWrapper>
                        );
                      })}
                    </VariantOptionsGrid>
                  </VariantGroup>
                );
              })}
            </VariantsCard>
          )}

          {/* Actions Section */}
          <ActionsCard>
            <QuantitySelector>
              <QtyLabel>Quantity:</QtyLabel>
              <QtyControls>
                <QtyButton onClick={decrementQuantity} disabled={quantity <= 1}>
                  −
                </QtyButton>
                <QtyDisplay>{quantity}</QtyDisplay>
                <QtyButton
                  onClick={incrementQuantity}
                  disabled={quantity >= variantStock}
                >
                  +
                </QtyButton>
              </QtyControls>
            </QuantitySelector>

            <ActionButtonsGrid>
              <PrimaryActionButton
                onClick={handleAddToCart}
                disabled={!isInStock || !selectedVariant || isAddingToCart}
                $isAdding={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <ButtonSpinner size="sm" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    {isInStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </PrimaryActionButton>

              <SecondaryActionButton
                onClick={toggleWishlist}
                disabled={isAddingToWishlist || isRemovingFromWishlist}
                $active={isInWishlist}
              >
                {isAddingToWishlist || isRemovingFromWishlist ? (
                  <ButtonSpinner size="sm" />
                ) : (
                  <FaHeart />
                )}
                {isAddingToWishlist ? "Adding..." : isRemovingFromWishlist ? "Removing..." : isInWishlist ? "In Wishlist" : "Wishlist"}
              </SecondaryActionButton>

              <TertiaryActionButton>
                <FaShare />
                Share
              </TertiaryActionButton>
            </ActionButtonsGrid>
          </ActionsCard>

          {/* Trust & Shipping */}
          <TrustSection>
            <TrustItem>
              <FaTruck />
              <div>
                <strong>Free Shipping</strong>
                <span>On orders over GH₵200</span>
              </div>
            </TrustItem>
            <TrustItem>
              <FaShieldAlt />
              <div>
                <strong>Secure Payment</strong>
                <span>100% protected</span>
              </div>
            </TrustItem>
            <TrustItem>
              <FaUndo />
              <div>
                <strong>Easy Returns</strong>
                <span>30-day policy</span>
              </div>
            </TrustItem>
            <TrustItem>
              <FaClock />
              <div>
                <strong>Support</strong>
                <span>24/7 available</span>
              </div>
            </TrustItem>
          </TrustSection>

          {/* Seller Info */}
          {product.seller && (
            <SellerCard>
              <SellerHeader>
                <FaStore />
                <span>Sold by</span>
                {(product.isEazShopProduct || product.seller?.role === 'eazshop_store') && (
                  <EazShopBadge>
                    <FaAward />
                    <span>EazShop Official Store</span>
                  </EazShopBadge>
                )}
              </SellerHeader>
              <SellerInfo>
                <SellerAvatar>
                  <img
                    src={product.seller.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
                    alt={product.seller.name}
                  />
                </SellerAvatar>
                <SellerDetails>
                  <SellerName to={`/seller/${product.seller._id}`}>
                    {(product.isEazShopProduct || product.seller?.role === 'eazshop_store') 
                      ? "EazShop Official Store ✓" 
                      : (product.seller.shopName || product.seller.name)}
                  </SellerName>
                  <SellerStats>
                    {product.seller.rating && (
                      <SellerRating>
                        <StarRating rating={product.seller.rating} size="12px" />
                        {product.seller.rating.toFixed(1)}
                      </SellerRating>
                    )}
                    {product.seller.location && (
                      <SellerLocation>
                        <FaMapMarkerAlt />
                        {product.seller.location}
                      </SellerLocation>
                    )}
                  </SellerStats>
                </SellerDetails>
              </SellerInfo>
            </SellerCard>
          )}
        </InfoSection>
      </ModernProductGrid>

      {/* Product Details Tabs */}
      <DetailsTabs>
        <TabSection>
          <TabHeader>
            <TabTitle>Product Details</TabTitle>
          </TabHeader>
          <TabContent>
            <DescriptionSection $expanded={showFullDescription}>
              <DescriptionText>
                {product.description || "No description available."}
              </DescriptionText>
              <ShowMoreButton onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? "Show Less" : "Show More"}
                <ChevronIcon $rotated={showFullDescription}>
                  <FaChevronDown />
                </ChevronIcon>
              </ShowMoreButton>
            </DescriptionSection>

            {/* Specifications */}
            {product.specifications && (
              <SpecificationsGrid>
                {product.specifications.weight?.value && (
                  <SpecItem>
                    <SpecLabel>Weight</SpecLabel>
                    <SpecValue>
                      {product.specifications.weight.value} {product.specifications.weight.unit}
                    </SpecValue>
                  </SpecItem>
                )}
                {product.specifications.dimensions && (
                  <SpecItem>
                    <SpecLabel>Dimensions</SpecLabel>
                    <SpecValue>
                      {product.specifications.dimensions.length} × {product.specifications.dimensions.width} × {product.specifications.dimensions.height} {product.specifications.dimensions.unit}
                    </SpecValue>
                  </SpecItem>
                )}
                {product.specifications.material && product.specifications.material.length > 0 && (
                  <SpecItem>
                    <SpecLabel>Material</SpecLabel>
                    <SpecValue>
                      {product.specifications.material.map(m => m.value).join(', ')}
                    </SpecValue>
                  </SpecItem>
                )}
              </SpecificationsGrid>
            )}
          </TabContent>
        </TabSection>

        {/* Reviews Section */}
        <TabSection>
          <TabHeader>
            <TabTitle>Customer Reviews ({reviewCount})</TabTitle>
          </TabHeader>

          <TabContent>
            {reviewCount > 0 ? (
              <ModernReviewsSection>
                <ReviewsSummary>
                  <OverallRating>
                    <RatingNumber>{averageRating.toFixed(1)}</RatingNumber>
                    <RatingStars>
                      <StarRating rating={averageRating} />
                    </RatingStars>
                    <RatingText>out of 5</RatingText>
                  </OverallRating>

                  <RatingBars>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter((r) => r.rating === stars).length;
                      const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                      return (
                        <RatingBar key={stars}>
                          <StarCount>{stars} stars</StarCount>
                          <BarTrack>
                            <BarProgress $percentage={percentage} />
                          </BarTrack>
                          <BarPercentage>{percentage.toFixed(0)}%</BarPercentage>
                        </RatingBar>
                      );
                    })}
                  </RatingBars>
                </ReviewsSummary>

                <ReviewGrid>
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review._id}>
                      <ReviewHeader>
                        <ReviewerInfo>
                          <ReviewerAvatar>
                            {review.user?.name?.charAt(0) || "A"}
                          </ReviewerAvatar>
                          <div>
                            <ReviewerName>{review.user?.name || "Anonymous"}</ReviewerName>
                            <ReviewDate>
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </ReviewDate>
                          </div>
                        </ReviewerInfo>
                        <ReviewRating>
                          <StarRating rating={review.rating} size="14px" />
                        </ReviewRating>
                      </ReviewHeader>
                      {review.title && <ReviewTitle>{review.title}</ReviewTitle>}
                      <ReviewComment>{review.comment}</ReviewComment>
                    </ReviewCard>
                  ))}
                </ReviewGrid>

                {reviewCount > 2 && (
                  <ViewAllReviews to={`/product/${id}/reviews`}>
                    View all {reviewCount} reviews
                  </ViewAllReviews>
                )}
              </ModernReviewsSection>
            ) : (
              <NoReviewsState>
                <NoReviewsIcon>💬</NoReviewsIcon>
                <h3>No reviews yet</h3>
                <p>Be the first to share your thoughts!</p>
              </NoReviewsState>
            )}
          </TabContent>
        </TabSection>
      </DetailsTabs>

      {/* Similar Products */}
      {product.category && (
        <SimilarSection>
          <SectionTitle>You May Also Like</SectionTitle>
          <SimilarProducts
            categoryId={product.category.id}
            currentProductId={product.id}
          />
        </SimilarSection>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal onClick={() => setShowImageModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImage src={images[selectedImage] || images[0]} alt={product.name} />
            <CloseModal onClick={() => setShowImageModal(false)}>
              ×
            </CloseModal>
          </ModalContent>
        </ImageModal>
      )}
      {/* Sticky Mobile Add to Cart */}
      <StickyMobileBar>
        <StickyPrice>
          <span className="label">Total:</span>
          <span className="price">GH₵{(displayPrice * quantity).toFixed(2)}</span>
        </StickyPrice>
        <StickyActions>
          <StickyQtyButton onClick={decrementQuantity} disabled={quantity <= 1}>−</StickyQtyButton>
          <StickyQty>{quantity}</StickyQty>
          <StickyQtyButton onClick={incrementQuantity} disabled={quantity >= variantStock}>+</StickyQtyButton>
          <StickyAddButton
            onClick={handleAddToCart}
            disabled={!isInStock || !selectedVariant || isAddingToCart}
          >
            {isAddingToCart ? <ButtonSpinner size="sm" /> : "Add to Cart"}
          </StickyAddButton>
        </StickyActions>
      </StickyMobileBar>
    </ModernPageContainer>
  );
};

// Modern Animations
// Using fadeIn from unified animations

// Using pulse, spin, float from unified animations

// Modern Styled Components
const ModernPageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-grey-50);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 8rem; /* Space for sticky bottom bar */
  }
`;

const ModernBreadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled(Link)`
  color: var(--color-grey-600);
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.8rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    color: var(--color-primary-500);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BreadcrumbSeparator = styled.span`
  color: var(--color-grey-400);
`;

const BreadcrumbActive = styled.span`
  color: var(--color-grey-800);
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: var(--color-primary-500);
  color: white;
  border-radius: 0.8rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
`;

const ModernProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    gap: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MainImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: white;
  border-radius: 2rem;
  overflow: hidden;
  cursor: ${(props) => (props.$isZoomed ? "zoom-out" : "zoom-in")};
  transition: all 0.3s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  }
`;

const ModernMainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease-out;
  transform: ${(props) =>
    props.$isZoomed
      ? `scale(2.5) translate(${-props.$zoomX + 50}%, ${-props.$zoomY + 50}%)`
      : "scale(1)"};
  transform-origin: center center;
  will-change: transform;
`;

const ImageBadges = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;
`;

const DiscountRibbon = styled.div`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 1.4rem;
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
  animation: ${float} 3s ease-in-out infinite;
`;

const StockBadge = styled.div`
  background: ${(props) =>
    props.$inStock
      ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
      : "linear-gradient(135deg, #718096 0%, #4a5568 100%)"};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 1.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const PopularBadge = styled.div`
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.4);
`;

const ImageActions = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;
`;

const ImageActionButton = styled.button`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-grey-700);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ThumbnailGallery = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThumbnailScrollButton = styled.button`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 2px solid var(--color-grey-200);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-grey-700);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover:not(:disabled) {
    background: var(--color-primary-500);
    color: white;
    border-color: var(--color-primary-500);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ThumbnailList = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModernThumbnail = styled.div`
  position: relative;
  min-width: 8rem;
  height: 8rem;
  border-radius: 1.2rem;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid
    ${(props) => (props.$active ? "var(--color-primary-500)" : "transparent")};
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: var(--color-primary-400);
    transform: scale(1.05);
  }
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(99, 102, 241, 0.1);
  border: 2px solid var(--color-primary-500);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const ModernProductHeader = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
`;

const CategoryBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
`;

const ModernProductTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const ProductMetaGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 2rem;
  margin-bottom: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-grey-50);
  border-radius: 2rem;
  font-size: 1.4rem;

  span:last-child {
    color: var(--color-grey-600);
  }
`;

const ProductCode = styled.span`
  padding: 0.75rem 1.5rem;
  background: var(--color-grey-50);
  border-radius: 2rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const SoldCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-green-50);
  color: var(--color-green-700);
  border-radius: 2rem;
  font-size: 1.4rem;
  font-weight: 600;
`;

const ShortDescription = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
`;

const PricingCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
`;

const PriceDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const CurrentPrice = styled.div`
  font-size: 4.8rem;
  font-weight: 800;
  color: var(--color-primary-500);
  line-height: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 3.6rem;
  }
`;

const OriginalPrice = styled.div`
  font-size: 2.4rem;
  color: var(--color-grey-400);
  text-decoration: line-through;
`;

const SavingsAlert = styled.div`
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
`;

const StockAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: ${(props) =>
    props.$inStock
      ? "linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)"
      : "linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)"};
  color: ${(props) =>
    props.$inStock ? "var(--color-green-800)" : "var(--color-red-800)"};
  border-radius: 1rem;
  font-size: 1.5rem;
  border-left: 4px solid ${(props) =>
    props.$inStock ? "var(--color-green-500)" : "var(--color-red-500)"};
`;

const StatusIndicator = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: ${(props) =>
    props.$inStock ? "var(--color-green-500)" : "var(--color-red-500)"};
  animation: ${pulse} 2s infinite;
`;

const VariantsCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
`;

const CardTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 2rem;
`;

const VariantGroup = styled.div`
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const VariantGroupLabel = styled.label`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  display: block;
  margin-bottom: 1.5rem;
`;

const SelectedValue = styled.span`
  font-weight: 500;
  color: var(--color-primary-500);
`;

const VariantOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 1.2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: 0.8rem;
  }
`;

const RadioOptionWrapper = styled.div`
  position: relative;
`;

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
  
  /* Ensure radio button is accessible but visually hidden */
  &:focus-visible + label {
    outline: 3px solid var(--color-primary-200);
    outline-offset: 2px;
  }
`;

const ModernVariantOption = styled.label`
  position: relative;
  min-height: 5.6rem;
  min-width: 8rem;
  border: 2.5px solid
    ${(props) =>
    props.$active
      ? "var(--color-primary-500)"
      : props.$disabled
        ? "var(--color-grey-300)"
        : "var(--color-grey-200)"};
  background: ${(props) =>
    props.$active
      ? props.$isColor
        ? "transparent"
        : "var(--color-primary-50)"
      : props.$disabled
        ? "var(--color-grey-100)"
        : "white"};
  border-radius: ${(props) => (props.$isColor ? "50%" : "1.6rem")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$active
      ? "0 4px 16px rgba(0, 120, 204, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};
  padding: ${(props) => (props.$isColor ? "0" : "1.2rem 1.6rem")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  
  /* Ensure touch-friendly size on mobile */
  @media (max-width: 768px) {
    min-height: 5rem;
    min-width: 7rem;
    padding: ${(props) => (props.$isColor ? "0" : "1rem 1.4rem")};
  }

  &:hover {
    border-color: ${(props) =>
    props.$disabled
      ? "var(--color-grey-300)"
      : props.$active
        ? "var(--color-primary-600)"
        : "var(--color-primary-500)"};
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-3px) scale(1.02)")};
    box-shadow: ${(props) =>
    props.$disabled
      ? "0 2px 8px rgba(0, 0, 0, 0.06)"
      : props.$active
        ? "0 6px 24px rgba(0, 120, 204, 0.3)"
        : "0 6px 20px rgba(0, 0, 0, 0.12)"};
  }

  &:active {
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-1px) scale(0.98)")};
  }

  ${(props) =>
    props.$active &&
    !props.$isColor &&
    css`
      background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-brand-50) 100%);
      font-weight: 600;
    `}
`;

const ColorSwatchContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ColorSwatch = styled.div`
  width: 5.6rem;
  height: 5.6rem;
  background-color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  border: ${(props) =>
    props.$active ? "3px solid var(--color-primary-500)" : "2px solid var(--color-grey-200)"};
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 0 3px var(--color-primary-100), 0 4px 12px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    width: 5rem;
    height: 5rem;
  }
`;

const VariantContent = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
`;

const RadioIndicator = styled.span`
  position: absolute;
  top: ${(props) => (props.$isColor ? "-0.6rem" : "-0.6rem")};
  right: ${(props) => (props.$isColor ? "-0.6rem" : "-0.6rem")};
  width: 2.4rem;
  height: 2.4rem;
  background: var(--color-primary-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 120, 204, 0.4);
  animation: ${pulse} 0.3s ease-out;
`;

const VariantText = styled.span`
  font-size: 1.5rem;
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  color: ${(props) =>
    props.$active ? "var(--color-primary-700)" : "var(--color-grey-800)"};
  position: relative;
  text-align: center;
  line-height: 1.3;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const VariantStockBadge = styled.span`
  font-size: 1rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 0.8rem;
  background: ${(props) =>
    props.$isLowStock
      ? "linear-gradient(135deg, var(--color-yellow-100) 0%, var(--color-yellow-700) 100%)"
      : "var(--color-green-50)"};
  color: ${(props) =>
    props.$isLowStock ? "var(--color-yellow-700)" : "var(--color-green-700)"};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
`;

const OutOfStockBadge = styled.span`
  position: absolute;
  bottom: -0.8rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, var(--color-red-600) 0%, var(--color-red-700) 100%);
  color: white;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  z-index: 5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.3rem 0.6rem;
    bottom: -0.6rem;
  }
`;

const ActionsCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-grey-50);
  border-radius: 1.2rem;
`;

const QtyLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid var(--color-grey-200);
  border-radius: 1.2rem;
  overflow: hidden;
  background: white;
`;

const QtyButton = styled.button`
  width: 5rem;
  height: 5rem;
  border: none;
  background: var(--color-grey-50);
  font-size: 2.4rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  color: ${(props) => (props.disabled ? "var(--color-grey-400)" : "var(--color-grey-800)")};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary-500);
    color: white;
  }
`;

const QtyDisplay = styled.span`
  width: 6rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-800);
  background: white;
`;

const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BaseActionButton = styled.button`
  padding: 1.6rem 2.4rem;
  border: none;
  border-radius: 1.2rem;
  font-weight: 700;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryActionButton = styled(BaseActionButton)`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  }
`;

const SecondaryActionButton = styled(BaseActionButton)`
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
      : "var(--color-grey-100)"};
  color: ${(props) => (props.$active ? "white" : "var(--color-grey-700)")};

  &:hover:not(:disabled) {
    background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #ee5a6f 0%, #e04f5f 100%)"
      : "var(--color-grey-200)"};
  }
`;

const TertiaryActionButton = styled(BaseActionButton)`
  background: transparent;
  border: 1px solid var(--color-grey-200);
  color: var(--color-grey-700);

  &:hover:not(:disabled) {
    border-color: var(--color-primary-500);
    color: var(--color-primary-500);
    background: white;
  }
`;

const StickyMobileBar = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const StickyPrice = styled.div`
  display: flex;
  flex-direction: column;

  .label {
    font-size: 1.2rem;
    color: var(--color-grey-600);
  }

  .price {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-primary-600);
  }
`;

const StickyActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StickyQtyButton = styled.button`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  border: 1px solid var(--color-grey-300);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: var(--color-grey-700);
  
  &:disabled {
    opacity: 0.5;
    background: var(--color-grey-100);
  }
`;

const StickyQty = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
`;

const StickyAddButton = styled.button`
  background: var(--color-primary-500);
  color: white;
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.4rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:disabled {
    background: var(--color-grey-400);
    box-shadow: none;
  }
`;


const ActionSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const TrustSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 2.4rem;
    color: var(--color-primary-500);
    flex-shrink: 0;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  strong {
    font-size: 1.4rem;
    color: var(--color-grey-800);
  }

  span {
    font-size: 1.2rem;
    color: var(--color-grey-600);
  }
`;

const SellerCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SellerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);

  svg {
    color: var(--color-primary-500);
  }
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const SellerAvatar = styled.div`
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-primary-500);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SellerDetails = styled.div`
flex: 1;
`;

const SellerName = styled(Link)`
  font-weight: 700;
  font-size: 1.8rem;
  color: var(--color-primary-500);
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const SellerStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const SellerLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const EazShopBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.2rem;
  margin-left: auto;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

  svg {
    font-size: 1rem;
  }
`;

const DetailsTabs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const TabSection = styled.div`
  background: white;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
`;

const TabTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin: 0;
`;


const TabContent = styled.div`
padding: 2.5rem;
`;

const DescriptionSection = styled.div`
  max-height: ${(props) => (props.$expanded ? "none" : "20rem")};
  overflow: hidden;
  position: relative;
  margin-bottom: 2rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6rem;
    background: linear-gradient(transparent, white);
    display: ${(props) => (props.$expanded ? "none" : "block")};
  }
`;

const DescriptionText = styled.p`
  line-height: 1.8;
  color: var(--color-grey-700);
  font-size: 1.6rem;
  margin: 0;
`;

const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--color-primary-500);
  font-weight: 600;
  cursor: pointer;
  font-size: 1.4rem;
  padding: 1rem 0;
  margin: 0 auto;
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary-600);
    transform: translateY(-2px);
  }
`;

const ChevronIcon = styled.span`
  display: flex;
  align-items: center;
  transition: transform 0.3s;
  transform: ${(props) => (props.$rotated ? "rotate(180deg)" : "rotate(0)")};
`;

const SpecificationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-grey-50);
  border-radius: 1rem;
  border-left: 4px solid var(--color-primary-500);
`;

const SpecLabel = styled.div`
  font-weight: 600;
  color: var(--color-grey-700);
  font-size: 1.4rem;
`;

const SpecValue = styled.div`
  color: var(--color-grey-800);
  font-size: 1.5rem;
  font-weight: 500;
`;

const ModernReviewsSection = styled.div``;

const ReviewsSummary = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3rem;
  padding: 2.5rem;
  background: var(--color-grey-50);
  border-radius: 1.5rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const OverallRating = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const RatingNumber = styled.div`
  font-size: 5.6rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
`;

const RatingText = styled.div`
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

const RatingBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
`;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StarCount = styled.div`
  min-width: 8rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);
`;

const BarTrack = styled.div`
  flex: 1;
  height: 0.8rem;
  background: var(--color-grey-200);
  border-radius: 1rem;
  overflow: hidden;
`;

const BarProgress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-primary-400) 100%);
  width: ${(props) => props.$percentage}%;
  border-radius: 1rem;
  transition: width 1s ease;
`;

const BarPercentage = styled.div`
  min-width: 4rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);
  text-align: right;
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ReviewCard = styled.div`
  padding: 2.5rem;
  background: var(--color-grey-50);
  border-radius: 1.5rem;
  border-left: 4px solid var(--color-primary-500);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ReviewerAvatar = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.8rem;
`;

const ReviewerInfo = styled.div`
  flex: 1;
`;

const ReviewerName = styled.div`
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--color-grey-900);
  margin-bottom: 0.5rem;
`;

const ReviewDate = styled.div`
  font-size: 1.3rem;
  color: var(--color-grey-600);
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
`;

const ReviewTitle = styled.h4`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--color-grey-900);
`;

const ReviewComment = styled.p`
  line-height: 1.7;
  color: var(--color-grey-700);
  font-size: 1.5rem;
  margin: 0;
`;

const ViewAllReviews = styled(Link)`
  display: block;
  text-align: center;
  padding: 1.5rem;
  background: var(--color-primary-500);
  color: white;
  border-radius: 1rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.6rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  }
`;

const NoReviewsState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const NoReviewsIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
`;

const SimilarSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 2.5rem;
  text-align: center;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 1rem;
`;

const CloseModal = styled.button`
  position: absolute;
  top: -4rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 3rem;
  cursor: pointer;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--color-primary-300);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const ModernSpinner = styled.div`
  width: 6rem;
  height: 6rem;
  border: 3px solid var(--color-grey-200);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
`;

const ModernErrorContainer = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 4rem auto;

  h2 {
    color: var(--color-grey-800);
    margin-bottom: 1rem;
    font-size: 2.4rem;
  }

  p {
    color: var(--color-grey-600);
    margin-bottom: 3rem;
    font-size: 1.6rem;
  }
`;

const ErrorIcon = styled.div`
  font-size: 8rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 3rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: white;
  border: none;
  border-radius: 1.2rem;
  font-weight: 600;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  }
`;

export default ProductDetailPage;