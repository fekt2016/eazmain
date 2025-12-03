import { useQuery } from "@tanstack/react-query";
import useProduct from "./useProduct";
import { useEazShop } from "./useEazShop";
import { useMemo } from "react";
import { hasProductDiscount, getProductDiscountPercentage } from '../utils/productHelpers';

/**
 * Hook to fetch deals (discounted products)
 * Combines regular products and EazShop products, filters for discounted items only
 */
export const useGetDeals = (options = {}) => {
  const { 
    sort = "default", 
    category = null, 
    minPrice = null,
    maxPrice = null,
    page = 1, 
    limit = 20 
  } = options;

  // Get all products
  const { getProducts } = useProduct();
  const { data: productsData, isLoading: isProductsLoading, error: productsError } = getProducts;

  // Get EazShop products
  const { useGetEazShopProducts } = useEazShop();
  const { data: eazshopProductsData, isLoading: isEazShopLoading, error: eazShopError } = useGetEazShopProducts();

  // Process and combine products
  const deals = useMemo(() => {
    // Get all products
    const allProducts = productsData?.results || [];
    const activeProducts = allProducts.filter(p => p.status === 'active');

    // Get EazShop products
    let eazshopProducts = [];
    if (eazshopProductsData) {
      if (Array.isArray(eazshopProductsData)) {
        eazshopProducts = eazshopProductsData;
      } else if (eazshopProductsData?.products) {
        eazshopProducts = eazshopProductsData.products;
      } else if (eazshopProductsData?.data?.products) {
        eazshopProducts = eazshopProductsData.data.products;
      }
    }

    // Combine products (avoid duplicates)
    let combinedProducts = [...activeProducts];
    eazshopProducts.forEach(eazProduct => {
      if (!combinedProducts.find(p => p._id === eazProduct._id)) {
        combinedProducts.push(eazProduct);
      }
    });

    // Filter for discounted products only
    let discountedProducts = combinedProducts.filter(product => {
      return hasProductDiscount(product);
    });

    // Filter by category if provided
    if (category) {
      discountedProducts = discountedProducts.filter(p => {
        const categoryId = p.category?._id || p.category?.id || p.category;
        const productCategoryId = p.categoryId || p.category_id;
        const parentCategoryId = p.parentCategory?._id || p.parentCategory?.id || p.parentCategory;
        const subCategoryId = p.subCategory?._id || p.subCategory?.id || p.subCategory;
        const productSubCategoryId = p.subCategoryId || p.subCategory_id;
        
        const categoryStr = String(category);
        const catIdStr = categoryId ? String(categoryId) : null;
        const prodCatIdStr = productCategoryId ? String(productCategoryId) : null;
        const parentCatIdStr = parentCategoryId ? String(parentCategoryId) : null;
        const subCatIdStr = subCategoryId ? String(subCategoryId) : null;
        const prodSubCatIdStr = productSubCategoryId ? String(productSubCategoryId) : null;
        
        return (
          catIdStr === categoryStr || 
          prodCatIdStr === categoryStr || 
          parentCatIdStr === categoryStr || 
          subCatIdStr === categoryStr || 
          prodSubCatIdStr === categoryStr
        );
      });
    }

    // Filter by price range if provided
    if (minPrice !== null || maxPrice !== null) {
      discountedProducts = discountedProducts.filter(p => {
        const price = p.price || p.defaultPrice || p.minPrice || 0;
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      });
    }

    // Sort products
    let sorted = [...discountedProducts];
    switch (sort) {
      case "price-low":
        sorted = sorted.sort((a, b) => {
          const aPrice = a.price || a.defaultPrice || a.minPrice || 0;
          const bPrice = b.price || b.defaultPrice || b.minPrice || 0;
          return aPrice - bPrice;
        });
        break;
      case "price-high":
        sorted = sorted.sort((a, b) => {
          const aPrice = a.price || a.defaultPrice || a.minPrice || 0;
          const bPrice = b.price || b.defaultPrice || b.minPrice || 0;
          return bPrice - aPrice;
        });
        break;
      case "discount-high":
        sorted = sorted.sort((a, b) => {
          const aDiscount = getProductDiscountPercentage(a);
          const bDiscount = getProductDiscountPercentage(b);
          return bDiscount - aDiscount;
        });
        break;
      case "default":
      default:
        // Sort by discount percentage (highest first) as default
        sorted = sorted.sort((a, b) => {
          const aDiscount = getProductDiscountPercentage(a);
          const bDiscount = getProductDiscountPercentage(b);
          return bDiscount - aDiscount;
        });
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = sorted.slice(startIndex, endIndex);

    return {
      products: paginated,
      total: sorted.length,
      page,
      limit,
      totalPages: Math.ceil(sorted.length / limit),
    };
  }, [productsData, eazshopProductsData, sort, category, minPrice, maxPrice, page, limit]);

  return {
    data: deals,
    isLoading: isProductsLoading || isEazShopLoading,
    error: productsError || eazShopError,
  };
};

export default useGetDeals;

