import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { spin, pulse, float, fadeIn, slideUp } from "../../shared/styles/animations";
import logger from "../../shared/utils/logger";
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
import useCategory from '../../shared/hooks/useCategory.js';
import {
  RelatedProductsCarousel,
  AlsoBoughtCarousel,
  AISimilarProducts,
} from '../../shared/components/recommendations';
import { useTrackActivity } from '../../shared/hooks/useRecommendations';
import useAuth from '../../shared/hooks/useAuth';
import StarRating from '../../shared/components/StarRating.jsx';
import { useCartActions } from '../../shared/hooks/useCart.js';
import useAnalytics from '../../shared/hooks/useAnalytics.js';
import { getOrCreateSessionId } from '../../shared/utils/sessionUtils.js';
import { useAddHistoryItem } from '../../shared/hooks/useBrowserhistory.js';
import { useToggleWishlist } from '../../shared/hooks/useWishlist.js';
import { LoadingState, ErrorState, EmptyState, ButtonSpinner } from '../../components/loading';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import {
  getProductDisplayPrice,
  getProductOriginalPrice,
  hasProductDiscount,
  getProductDiscountPercentage,
  getProductImages,
  getProductSku,
  getProductStock,
  isProductInStock,
} from '../../shared/utils/productHelpers';
import VariantNameSelector from '../../components/product/variantNameSelector/VariantNameSelector';
import VariantDetailsDisplay from '../../components/product/variantNameSelector/VariantDetailsDisplay';
import VariantColorImageGallery from '../../components/product/variantNameSelector/VariantColorImageGallery';
import VariantMainImageSwitcher from '../../components/product/variantNameSelector/VariantMainImageSwitcher';
import VariantPriceDisplay from './components/variantSelector/VariantPriceDisplay';
import { useVariantSelectionByName } from '../../shared/hooks/products/useVariantSelectionByName';
import { useVariantSelection } from '../../shared/hooks/products/useVariantSelection';
import VariantSelector from './components/VariantSelector';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
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
  logger.log("reviewsData", reviewsData);
  logger.log("reviewsLoading", reviewsLoading);
  logger.log("reviewsError", reviewsError);

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

  // Fetch category data to get all attributes (after product is defined)
  const { useCategoryById } = useCategory();
  const categoryId = product?.subCategory?._id || product?.subCategory || product?.parentCategory?._id || product?.parentCategory;
  const { data: categoryData } = useCategoryById(categoryId);
  
  // Get category attributes
  const categoryAttributes = useMemo(() => {
    if (!categoryData) return [];
    // Handle different response structures
    const category = categoryData?.data?.category || categoryData?.category || categoryData?.data || categoryData;
    return category?.attributes || [];
  }, [categoryData]);

  // SEO - Update page title and meta tags based on product data
  useDynamicPageTitle({
    title: "Product Details",
    dynamicTitle: product?.name && `Buy ${product.name} | EazShop`,
    description: product?.shortDescription || product?.description || product?.summary,
    defaultTitle: "EazShop",
    defaultDescription: "Shop the best products on EazShop",
  });

  // Wishlist hook - use product._id once product is loaded, fallback to id from params
  const productId = product?._id || id;
  const { toggleWishlist, isInWishlist, isAdding: isAddingToWishlist, isRemoving: isRemovingFromWishlist } = useToggleWishlist(productId);

  const { addToCart } = useCartActions();
  const hasRecordedView = useRef(false);
  const hasRecordedHistory = useRef(false);
  const { user } = useAuth();
  const trackActivity = useTrackActivity();

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
      
      // Track activity for recommendations
      if (productId) {
        trackActivity.mutate({
          productId,
          action: 'view',
          metadata: {
            sessionId,
            productName: product?.name,
            category: product?.parentCategory?.name,
          },
        });
      }
    }
  }, [id, productId, product, recordProductView, trackActivity]);

  // Get all variants (including inactive ones - they'll be marked as disabled)
  const variants = useMemo(() => {
    return product?.variants || [];
  }, [product]);

  // Check if variants use attributes (Color, Size, etc.) or just names
  const hasAttributeBasedVariants = useMemo(() => {
    if (!variants.length) return false;
    // Check if any variant has attributes array with multiple attributes
    return variants.some(v => 
      v.attributes && 
      Array.isArray(v.attributes) && 
      v.attributes.length > 0 &&
      v.attributes.some(attr => attr.key && attr.value)
    );
  }, [variants]);

  // Use attribute-based selection for products with attributes (Color + Size, etc.)
  const attributeVariantSelection = useVariantSelection(variants, product);
  const { 
    selectedAttributes, 
    selectedVariant: attributeSelectedVariant,
    selectAttribute,
    allAttributesSelected,
    missingAttributes,
    getVariantSummary,
  } = attributeVariantSelection;

  // Use the variant selection by name hook for simple variants (manages its own state and auto-initializes)
  const variantSelection = useVariantSelectionByName(variants, product);
  const { selectedVariant: nameSelectedVariant, handleVariantSelect } = variantSelection;

  // Use attribute-based variant if available, otherwise fall back to name-based
  const selectedVariant = hasAttributeBasedVariants ? attributeSelectedVariant : nameSelectedVariant;
  
  // CRITICAL: Maintain selectedSku state separately (SKU is the unit of commerce)
  const [selectedSku, setSelectedSku] = useState(null);
  
  // CRITICAL: Auto-select default SKU on product load (SKU is the unit of commerce)
  useEffect(() => {
    if (product?.variants?.length && !selectedVariant) {
      // Find active variant first, otherwise use first variant
      const defaultVariant = (product?.variants || []).find(v => v.status === "active") || (product?.variants || [])[0];
      
      if (defaultVariant?.sku) {
        handleVariantSelect(defaultVariant);
        setSelectedSku(defaultVariant.sku.trim().toUpperCase());
        logger.log("Auto-selected default SKU:", defaultVariant.sku);
      }
    }
  }, [product, selectedVariant, handleVariantSelect]);
  
  // CRITICAL: Sync selectedSku when selectedVariant changes
  useEffect(() => {
    if (selectedVariant?.sku) {
      setSelectedSku(selectedVariant.sku.trim().toUpperCase());
    } else if (!selectedVariant) {
      setSelectedSku(null);
    }
  }, [selectedVariant]);
  
  // Handle variant image selection (from color gallery)
  const handleVariantImageSelect = useCallback((variant) => {
    handleVariantSelect(variant);
    // CRITICAL: Set SKU when variant is selected
    if (variant?.sku) {
      setSelectedSku(variant.sku.trim().toUpperCase());
    }
  }, [handleVariantSelect]);

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
      // CRITICAL: HARD LOG before addToCart to debug SKU issues
      logger.log("[ADD_TO_CART_CLICK]", {
        productId: product?._id,
        productName: product?.name,
        selectedSku,
        selectedVariant: selectedVariant ? {
          _id: selectedVariant._id,
          sku: selectedVariant.sku,
          status: selectedVariant.status,
        } : null,
        variants: product?.variants?.map(v => ({
          id: v._id,
          sku: v.sku,
          status: v.status,
        })) || [],
        quantity,
        hasVariants: variants.length > 0,
      });
      
      // CRITICAL: Block invalid multi-variant adds - SKU is required
      if (variants.length > 1 && !selectedSku) {
        throw new Error("Please select a variant before adding to cart");
      }
      
      // CRITICAL: Use selectedSku directly - no extraction needed
      const variantSku = selectedSku || (selectedVariant?.sku ? selectedVariant.sku.trim().toUpperCase() : null);
      
      if (!variantSku && variants.length > 0) {
        logger.error("[ADD_TO_CART] SKU missing for variant product:", {
          productId: product?._id,
          productName: product?.name,
          selectedVariant,
          selectedSku,
          variants: product?.variants,
        });
        throw new Error("Variant SKU is required. Please select a variant.");
      }
      
      await addToCart({
        product,
        quantity,
        variantSku: variantSku, // Pass SKU directly - ONLY variantSku is accepted
      });
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      setIsAddingToCart(false);
      logger.error("Add to cart error:", error);
      
      // Handle SKU_REQUIRED error specifically
      if (error?.code === 'SKU_REQUIRED' || error?.message?.includes('variant')) {
        toast.error("Please select a variant before adding to cart", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (error.message) {
        toast.error(error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Handle variant selection (for name-based variants)
  const handleVariantSelectCallback = useCallback((variant) => {
    handleVariantSelect(variant);
    // CRITICAL: Set SKU when variant is selected
    if (variant?.sku) {
      setSelectedSku(variant.sku.trim().toUpperCase());
    }
  }, [handleVariantSelect]);

  // Sync SKU when attribute-based variant is selected
  useEffect(() => {
    if (hasAttributeBasedVariants && attributeSelectedVariant?.sku) {
      setSelectedSku(attributeSelectedVariant.sku.trim().toUpperCase());
    }
  }, [hasAttributeBasedVariants, attributeSelectedVariant]);

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
      logger.log("Processing reviewsData structure:", {
        hasData: !!reviewsData.data,
        dataKeys: reviewsData.data ? Object.keys(reviewsData.data) : [],
        hasDataData: !!reviewsData.data?.data,
        dataDataKeys: reviewsData.data?.data ? Object.keys(reviewsData.data.data) : [],
      });
      
      // Check if it's the wrapped response: reviewsData.data.data.reviews
      if (reviewsData.data?.data?.reviews && Array.isArray(reviewsData.data.data.reviews)) {
        logger.log("Found reviews in reviewsData.data.data.reviews:", reviewsData.data.data.reviews.length);
        return reviewsData.data.data.reviews;
      }
      // Check if reviews are directly in data: reviewsData.data.reviews
      if (reviewsData.data?.reviews && Array.isArray(reviewsData.data.reviews)) {
        logger.log("Found reviews in reviewsData.data.reviews:", reviewsData.data.reviews.length);
        return reviewsData.data.reviews;
      }
      // Check if reviews are at root level
      if (Array.isArray(reviewsData.reviews)) {
        logger.log("Found reviews in reviewsData.reviews:", reviewsData.reviews.length);
        return reviewsData.reviews;
      }
    }
    logger.log("No reviews found in reviewsData, using product.reviews");
    return product?.reviews || [];
  }, [reviewsData, product]);

  // Use utility functions for product calculations (must be before early returns)
  const displayPrice = getProductDisplayPrice(product, selectedVariant);
  const originalPrice = getProductOriginalPrice(product);
  const hasDiscount = hasProductDiscount(product, selectedVariant);
  const discountPercentage = getProductDiscountPercentage(product, selectedVariant);
  const displaySku = getProductSku(product, selectedVariant);
  
  // Get stock - use selected variant if available, otherwise calculate from all active variants
  const variantStock = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant) {
      // If variant is inactive, return 0
      if (selectedVariant.status === 'inactive') {
        return 0;
      }
      // Return variant stock
      return selectedVariant.stock || 0;
    }
    // If no variant selected, sum all active variant stocks
    if (variants.length > 0) {
      const totalStock = variants
        .filter((v) => v.status !== 'inactive')
        .reduce((sum, v) => sum + (v.stock || 0), 0);
      return totalStock;
    }
    // Fallback to product stock
    return getProductStock(product, selectedVariant);
  }, [selectedVariant, variants, product]);
  
  // Check if in stock - must have stock > 0 and variant must be active (if variant exists)
  const isInStock = useMemo(() => {
    if (!product) return false;
    if (selectedVariant) {
      // Variant must be active AND have stock > 0
      const isActive = selectedVariant.status !== 'inactive';
      const hasStock = (selectedVariant.stock || 0) > 0;
      return isActive && hasStock;
    }
    // If no variant selected, check if any active variant has stock
    if (variants.length > 0) {
      return variants.some((v) => {
        const isActive = v.status !== 'inactive';
        const hasStock = (v.stock || 0) > 0;
        return isActive && hasStock;
      });
    }
    // Fallback to product stock check
    return isProductInStock(product, selectedVariant);
  }, [selectedVariant, variants, product]);
  
  // Get product images - ModernProductGrid MUST use product.images ONLY
  // This is separate from variant images and never changes based on variant selection
  const productImages = useMemo(() => {
    if (!product) return [];
    return getProductImages(product);
  }, [product]);

  // Reset selected image to 0 when product images change
  useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(0);
    }
  }, [productImages.length]);

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
              src={productImages[selectedImage] || productImages[0]}
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
          {productImages.length > 1 && (
            <ThumbnailGallery>
              <ThumbnailScrollButton
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                disabled={selectedImage === 0}
              >
                <FaChevronLeft />
              </ThumbnailScrollButton>

              <ThumbnailList>
                {productImages.map((img, index) => (
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
                onClick={() => setSelectedImage(Math.min(productImages.length - 1, selectedImage + 1))}
                disabled={selectedImage === productImages.length - 1}
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
            <VariantPriceDisplay 
              product={product} 
              selectedVariant={selectedVariant}
              variantSelectionHook={variantSelection}
            />

            <StockAlert $inStock={isInStock}>
              <StatusIndicator $inStock={isInStock} />
              {isInStock ? (
                <span><strong>{variantStock} available</strong> - Order now!</span>
              ) : selectedVariant ? (
                <span>This variant is out of stock</span>
              ) : variants.length > 0 ? (
                <span>Please select a variant</span>
              ) : (
                <span>Currently out of stock</span>
              )}
            </StockAlert>
          </PricingCard>

          {/* Variant Selection - Use attribute-based selector if variants have attributes */}
          {variants.length > 0 && (
            <>
              {hasAttributeBasedVariants ? (
                <>
                  {/* Attribute-based Variant Selector (Color + Size, etc.) */}
                  <VariantSelector
                    variants={variants}
                    selectedAttributes={selectedAttributes}
                    onAttributeChange={selectAttribute}
                    variantSelectionHook={attributeVariantSelection}
                    categoryAttributes={categoryAttributes}
                  />

                  {/* Variant Status Display */}
                  <VariantStatusCard>
                    {selectedVariant ? (
                      isInStock ? (
                        <VariantMatched>
                          <StatusIcon $status="success">
                            <FaCheck />
                          </StatusIcon>
                          <StatusContent>
                            <StatusTitle>Variant selected: {getVariantSummary()}</StatusTitle>
                            <StatusSubtitle>{variantStock} in stock</StatusSubtitle>
                          </StatusContent>
                        </VariantMatched>
                      ) : (
                        <VariantOutOfStock>
                          <StatusIcon $status="warning">
                            <FaExclamationTriangle />
                          </StatusIcon>
                          <StatusContent>
                            <StatusTitle>This combination is out of stock</StatusTitle>
                            <StatusSubtitle>Please select a different combination</StatusSubtitle>
                          </StatusContent>
                        </VariantOutOfStock>
                      )
                    ) : allAttributesSelected ? (
                      <VariantNotAvailable>
                        <StatusIcon $status="error">
                          <FaExclamationTriangle />
                        </StatusIcon>
                        <StatusContent>
                          <StatusTitle>This combination is not available</StatusTitle>
                          <StatusSubtitle>Please select a different combination</StatusSubtitle>
                        </StatusContent>
                      </VariantNotAvailable>
                    ) : Object.keys(selectedAttributes).length > 0 ? (
                      <VariantIncomplete>
                        <StatusIcon $status="info">
                          <FaExclamationTriangle />
                        </StatusIcon>
                        <StatusContent>
                          <StatusTitle>Please select: {missingAttributes.join(', ')}</StatusTitle>
                          <StatusSubtitle>Complete your selection to see availability</StatusSubtitle>
                        </StatusContent>
                      </VariantIncomplete>
                    ) : (
                      <VariantNotSelected>
                        <StatusIcon $status="info">
                          <FaExclamationTriangle />
                        </StatusIcon>
                        <StatusContent>
                          <StatusTitle>Please select variant options</StatusTitle>
                          <StatusSubtitle>Choose your preferred combination</StatusSubtitle>
                        </StatusContent>
                      </VariantNotSelected>
                    )}
                  </VariantStatusCard>

                  {/* Variant Images Gallery - shows all variant images and allows selection */}
                  {variants.some(v => v.images && v.images.length > 0) && (
                    <VariantImagesCard>
                      <VariantImagesTitle>Variant Images</VariantImagesTitle>
                      <VariantImagesGrid>
                        {variants
                          .filter(variant => variant.images && variant.images.length > 0)
                          .flatMap((variant) => {
                            return variant.images.map((image, imgIndex) => {
                              // Find the variant that contains this image
                              const variantForImage = variants.find(v => 
                                v.images && v.images.includes(image)
                              );
                              
                              const isSelected = selectedVariant?._id === variantForImage?._id;
                              
                              return (
                                <VariantImageItem
                                  key={`${variant._id}-${imgIndex}`}
                                  $selected={isSelected}
                                  onClick={() => {
                                    if (variantForImage && variantForImage.attributes) {
                                      // Select all attributes for this variant
                                      variantForImage.attributes.forEach((attr) => {
                                        if (attr.key && attr.value) {
                                          selectAttribute(attr.key, attr.value);
                                        }
                                      });
                                    }
                                    
                                    // Also update the main image
                                    const imageIndex = productImages.findIndex(img => img === image);
                                    if (imageIndex !== -1) {
                                      setSelectedImage(imageIndex);
                                    } else if (variantForImage?.images?.[0]) {
                                      // If image is not in product images, try to find it
                                      const variantImageIndex = productImages.findIndex(img => 
                                        variantForImage.images.includes(img)
                                      );
                                      if (variantImageIndex !== -1) {
                                        setSelectedImage(variantImageIndex);
                                      }
                                    }
                                  }}
                                >
                                  <VariantImage src={image} alt={`Variant Image ${imgIndex + 1}`} />
                                  {isSelected && <VariantImageSelectedBadge>Selected</VariantImageSelectedBadge>}
                                </VariantImageItem>
                              );
                            });
                          })}
                      </VariantImagesGrid>
                    </VariantImagesCard>
                  )}

                  {/* Variant Main Image Switcher - handles image updates when variant changes */}
                  <VariantMainImageSwitcher
                    selectedVariant={selectedVariant}
                    fallbackImages={getProductImages(product)}
                    onImageChange={setSelectedImage}
                    variantSelectionHook={variantSelection}
                  />
                </>
              ) : (
                <>
                  {/* Simple Variant Name Selector (for products without attributes) */}
                  <VariantNameSelector
                    variants={variants}
                    selectedVariant={selectedVariant}
                    onSelect={handleVariantSelectCallback}
                    variantSelectionHook={variantSelection}
                  />

                  {/* Variant Color Image Gallery - shows color swatches for variants with images */}
                  <VariantColorImageGallery
                    selectedVariant={selectedVariant}
                    variants={variants}
                    onImageSelect={handleVariantImageSelect}
                    variantSelectionHook={variantSelection}
                  />

                  {/* Variant Details Display - shows attributes of selected variant */}
                  <VariantDetailsDisplay
                    selectedVariant={selectedVariant}
                    variantSelectionHook={variantSelection}
                  />

                  {/* Variant Main Image Switcher - handles image updates when variant changes */}
                  <VariantMainImageSwitcher
                    selectedVariant={selectedVariant}
                    fallbackImages={getProductImages(product)}
                    onImageChange={setSelectedImage}
                    variantSelectionHook={variantSelection}
                  />
                </>
              )}
            </>
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
                disabled={
                  !isInStock || 
                  !selectedVariant || 
                  isAddingToCart ||
                  (hasAttributeBasedVariants && allAttributesSelected && !selectedVariant) // Disable if all selected but no match
                }
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
                    {!selectedVariant 
                      ? (hasAttributeBasedVariants && allAttributesSelected 
                          ? "Not Available" 
                          : "Select Variant")
                      : isInStock 
                        ? "Add to Cart" 
                        : "Out of Stock"}
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

      {/* Recommendation Sections */}
      {productId && (
        <>
          <RelatedProductsCarousel productId={productId} limit={10} />
          <AlsoBoughtCarousel productId={productId} limit={10} />
          <AISimilarProducts productId={productId} limit={10} />
        </>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal onClick={() => setShowImageModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImage src={productImages[selectedImage] || productImages[0]} alt={product.name} />
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
            disabled={
              !isInStock || 
              !selectedVariant || 
              isAddingToCart ||
              (hasAttributeBasedVariants && allAttributesSelected && !selectedVariant)
            }
          >
            {isAddingToCart ? (
              <ButtonSpinner size="sm" />
            ) : !selectedVariant 
              ? (hasAttributeBasedVariants && allAttributesSelected 
                  ? "Not Available" 
                  : "Select Variant")
              : isInStock 
                ? "Add to Cart" 
                : "Out of Stock"}
          </StickyAddButton>
        </StickyActions>
      </StickyMobileBar>
    </ModernPageContainer>
  );
};


const ModernPageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-grey-50);
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal scroll */
  overflow-y: visible; /* Allow vertical scroll */

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 640px) {
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

  @media (max-width: 640px) {
    font-size: 1.2rem;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.4rem 0.8rem;
    font-size: 1.1rem;
    gap: 0.3rem;
  }

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

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
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

  @media (max-width: 1024px) {
    border-radius: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 640px) {
    border-radius: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: default; /* Disable zoom on mobile */
  }

  &:hover {
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    
    @media (max-width: 640px) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
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

  @media (max-width: 640px) {
    top: 1rem;
    left: 1rem;
    gap: 0.5rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    border-radius: 1.5rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    border-radius: 1.5rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    border-radius: 1.5rem;
  }
`;

const ImageActions = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;

  @media (max-width: 640px) {
    top: 1rem;
    right: 1rem;
    gap: 0.5rem;
  }
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
  min-width: 44px; /* Touch-friendly */
  min-height: 44px; /* Touch-friendly */

  @media (max-width: 640px) {
    width: 3.6rem;
    height: 3.6rem;
    min-width: 44px;
    min-height: 44px;
  }

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

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
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
  min-width: 44px; /* Touch-friendly */
  min-height: 44px; /* Touch-friendly */
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 3.6rem;
    height: 3.6rem;
    min-width: 44px;
    min-height: 44px;
  }

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
  flex-shrink: 0;

  @media (max-width: 1024px) {
    min-width: 7rem;
    height: 7rem;
  }

  @media (max-width: 640px) {
    min-width: 6rem;
    height: 6rem;
    border-radius: 1rem;
    border-width: 2px;
  }

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
  overflow-y: visible; /* Allow vertical content */
`;

const ModernProductHeader = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 1024px) {
    padding: 2rem;
    border-radius: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.2rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.4rem 1rem;
    font-size: 1rem;
    border-radius: 1.5rem;
    margin-bottom: 0.8rem;
  }
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  max-width: 100%;

  @media (max-width: 1024px) {
    font-size: 2.8rem;
  }

  @media (max-width: 640px) {
    font-size: 2rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }
`;

const ProductMetaGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 2rem;
  margin-bottom: 1.5rem;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
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
  flex-wrap: wrap;

  @media (max-width: 640px) {
    padding: 0.6rem 1.2rem;
    font-size: 1.2rem;
    gap: 0.5rem;
    border-radius: 1.5rem;
  }

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

  @media (max-width: 640px) {
    padding: 0.6rem 1.2rem;
    font-size: 1.2rem;
    border-radius: 1.5rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.6rem 1.2rem;
    font-size: 1.2rem;
    border-radius: 1.5rem;
  }
`;

const ShortDescription = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
  font-style: italic;

  @media (max-width: 1024px) {
    font-size: 1.5rem;
  }

  @media (max-width: 640px) {
    font-size: 1.4rem;
    line-height: 1.5;
  }
`;

const PricingCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 1024px) {
    padding: 2rem;
    border-radius: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.2rem;
  }
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

  @media (max-width: 1024px) {
    font-size: 4rem;
  }

  @media (max-width: 640px) {
    font-size: 3rem;
  }
`;

const OriginalPrice = styled.div`
  font-size: 2.4rem;
  color: var(--color-grey-400);
  text-decoration: line-through;

  @media (max-width: 1024px) {
    font-size: 2rem;
  }

  @media (max-width: 640px) {
    font-size: 1.6rem;
  }
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

  @media (max-width: 640px) {
    padding: 0.8rem 1.2rem;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    border-radius: 0.8rem;
  }
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

  @media (max-width: 640px) {
    padding: 1rem;
    font-size: 1.3rem;
    gap: 0.8rem;
    border-radius: 0.8rem;
    border-left-width: 3px;
  }
`;

const StatusIndicator = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: ${(props) =>
    props.$inStock ? "var(--color-green-500)" : "var(--color-red-500)"};
  animation: ${pulse} 2s infinite;
`;


const ActionsCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 1024px) {
    padding: 2rem;
    border-radius: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.2rem;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-grey-50);
  border-radius: 1.2rem;

  @media (max-width: 640px) {
    padding: 1.2rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
  }
`;

const QtyLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-700);

  @media (max-width: 640px) {
    font-size: 1.4rem;
  }
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
  min-width: 44px; /* Touch-friendly */
  min-height: 44px; /* Touch-friendly */

  @media (max-width: 640px) {
    width: 4.4rem;
    height: 4.4rem;
    font-size: 2rem;
    min-width: 44px;
    min-height: 44px;
  }

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

  @media (max-width: 640px) {
    width: 5rem;
    height: 4.4rem;
    font-size: 1.6rem;
  }
`;

const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;

  @media (max-width: 1024px) {
    gap: 0.8rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
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
  min-height: 44px; /* Touch-friendly */

  @media (max-width: 1024px) {
    padding: 1.4rem 2rem;
    font-size: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1.4rem 1.8rem;
    font-size: 1.4rem;
    border-radius: 1rem;
    gap: 0.8rem;
    min-height: 48px; /* Larger touch target on mobile */
  }

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

  @media (max-width: 640px) {
    display: flex;
    padding: 1.2rem;
    gap: 1rem;
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

  @media (max-width: 1024px) {
    gap: 1.2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
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

  @media (max-width: 640px) {
    padding: 1.2rem;
    gap: 1rem;
    border-radius: 1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 2.4rem;
    color: var(--color-primary-500);
    flex-shrink: 0;

    @media (max-width: 640px) {
      font-size: 2rem;
    }
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  strong {
    font-size: 1.4rem;
    color: var(--color-grey-800);

    @media (max-width: 640px) {
      font-size: 1.3rem;
    }
  }

  span {
    font-size: 1.2rem;
    color: var(--color-grey-600);

    @media (max-width: 640px) {
      font-size: 1.1rem;
    }
  }
`;

const SellerCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 1024px) {
    padding: 2rem;
    border-radius: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.2rem;
  }
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const TabSection = styled.div`
  background: white;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid var(--color-grey-200);

  @media (max-width: 1024px) {
    padding: 2rem;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
    padding: 1.5rem;
  }
`;

const TabTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 2rem;
  }

  @media (max-width: 640px) {
    font-size: 1.8rem;
  }
`;


const TabContent = styled.div`
  padding: 2.5rem;

  @media (max-width: 1024px) {
    padding: 2rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

const DescriptionSection = styled.div`
  max-height: ${(props) => (props.$expanded ? "none" : "20rem")};
  overflow: hidden;
  position: relative;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 640px) {
    max-height: ${(props) => (props.$expanded ? "none" : "15rem")};
  }

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
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    font-size: 1.5rem;
    line-height: 1.7;
  }

  @media (max-width: 640px) {
    font-size: 1.4rem;
    line-height: 1.6;
  }
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

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
  }
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

  @media (max-width: 1024px) {
    gap: 2.5rem;
    padding: 2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-radius: 1.2rem;
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

  @media (max-width: 1024px) {
    font-size: 4.8rem;
  }

  @media (max-width: 640px) {
    font-size: 4rem;
  }
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

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  max-width: 100%;

  @media (max-width: 640px) {
    font-size: 1.4rem;
    line-height: 1.6;
  }
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

  @media (max-width: 1024px) {
    font-size: 2.8rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
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

// Variant Status Display Components
const VariantStatusCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1.6rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    padding: 1.8rem;
    border-radius: 1.4rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.2rem;
    margin-bottom: 1.5rem;
  }
`;

const VariantMatched = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  border-radius: 1.2rem;
  border-left: 4px solid var(--color-green-500);

  @media (max-width: 640px) {
    padding: 1.2rem;
    gap: 1rem;
    border-radius: 1rem;
    border-left-width: 3px;
  }
`;

const VariantOutOfStock = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  border-radius: 1.2rem;
  border-left: 4px solid var(--color-red-500);

  @media (max-width: 640px) {
    padding: 1.2rem;
    gap: 1rem;
    border-radius: 1rem;
    border-left-width: 3px;
  }
`;

const VariantNotAvailable = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  border-radius: 1.2rem;
  border-left: 4px solid var(--color-red-500);

  @media (max-width: 640px) {
    padding: 1.2rem;
    gap: 1rem;
    border-radius: 1rem;
    border-left-width: 3px;
  }
`;

const VariantIncomplete = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 1.2rem;
  border-left: 4px solid var(--color-primary-500);

  @media (max-width: 640px) {
    padding: 1.2rem;
    gap: 1rem;
    border-radius: 1rem;
    border-left-width: 3px;
  }
`;

const VariantNotSelected = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 1.2rem;
  border-left: 4px solid var(--color-grey-400);

  @media (max-width: 640px) {
    padding: 1.2rem;
    gap: 1rem;
    border-radius: 1rem;
    border-left-width: 3px;
  }
`;

const StatusIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  background: ${(props) => {
    if (props.$status === 'success') return 'var(--color-green-500)';
    if (props.$status === 'warning') return 'var(--color-yellow-500)';
    if (props.$status === 'error') return 'var(--color-red-500)';
    return 'var(--color-primary-500)';
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 44px; /* Touch-friendly */
  min-height: 44px; /* Touch-friendly */

  @media (max-width: 640px) {
    width: 3.6rem;
    height: 3.6rem;
    font-size: 1.6rem;
    min-width: 44px;
    min-height: 44px;
  }
`;

const StatusContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatusTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);

  @media (max-width: 640px) {
    font-size: 1.4rem;
  }
`;

const StatusSubtitle = styled.div`
  font-size: 1.4rem;
  color: var(--color-grey-600);

  @media (max-width: 640px) {
    font-size: 1.2rem;
  }
`;

const VariantImagesCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1.6rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
  margin-top: 1.5rem;

  @media (max-width: 1024px) {
    padding: 1.8rem;
    border-radius: 1.4rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.2rem;
    margin-top: 1.2rem;
  }
`;

const VariantImagesTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    font-size: 1.4rem;
    margin-bottom: 1.2rem;
  }
`;

const VariantImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.8rem;
  }
`;

const VariantImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${(props) => 
    props.$selected ? "var(--color-primary-500)" : "var(--color-grey-200)"};
  transition: all 0.3s ease;
  background: white;
  box-shadow: ${(props) => 
    props.$selected 
      ? "0 4px 12px rgba(99, 102, 241, 0.3)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)"};

  &:hover {
    border-color: var(--color-primary-500);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const VariantImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VariantImageSelectedBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--color-primary-500);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

export default ProductDetailPage;