import { useQuery } from "@tanstack/react-query";
import useProduct from "./useProduct";
import { useEazShop } from "./useEazShop";
import { useMemo } from "react";

/**
 * Hook to fetch new arrivals (newest products)
 * Combines regular products and EazShop products, sorted by creation date
 */
export const useGetNewArrivals = (options = {}) => {
  const { sort = "newest", category = null, page = 1, limit = 20 } = options;

  // Get all products
  const { getProducts } = useProduct();
  const { data: productsData, isLoading: isProductsLoading, error: productsError } = getProducts;

  // Get EazShop products
  const { useGetEazShopProducts } = useEazShop();
  const { data: eazshopProductsData, isLoading: isEazShopLoading, error: eazShopError } = useGetEazShopProducts();

  // Process and combine products
  const newArrivals = useMemo(() => {
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

    // Filter by category if provided
    if (category) {
      combinedProducts = combinedProducts.filter(p => {
        // Check various possible category field structures
        const categoryId = p.category?._id || p.category?.id || p.category;
        const productCategoryId = p.categoryId || p.category_id;
        const parentCategoryId = p.parentCategory?._id || p.parentCategory?.id || p.parentCategory;
        const subCategoryId = p.subCategory?._id || p.subCategory?.id || p.subCategory;
        const productSubCategoryId = p.subCategoryId || p.subCategory_id;
        
        // Convert both to strings for comparison
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

    // Sort by newest first (default)
    let sorted = [...combinedProducts];
    switch (sort) {
      case "price-low":
        sorted = sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        sorted = sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "best-seller":
        // Sort by rating or sales count if available
        sorted = sorted.sort((a, b) => {
          const aRating = a.rating || a.averageRating || 0;
          const bRating = b.rating || b.averageRating || 0;
          return bRating - aRating;
        });
        break;
      case "newest":
      default:
        // Sort by creation date (newest first)
        sorted = sorted.sort((a, b) => {
          const aDate = new Date(a.createdAt || a.created_at || 0);
          const bDate = new Date(b.createdAt || b.created_at || 0);
          return bDate - aDate;
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
  }, [productsData, eazshopProductsData, sort, category, page, limit]);

  return {
    data: newArrivals,
    isLoading: isProductsLoading || isEazShopLoading,
    error: productsError || eazShopError,
  };
};

export default useGetNewArrivals;

