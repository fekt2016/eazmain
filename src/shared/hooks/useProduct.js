import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from '../services/productApi';
import logger from '../utils/logger';
// import api from "../services/api"';

const useProduct = () => {
  const queryClient = useQueryClient();

  // Get all products (optional params: { limit, page, sort } for products page to get more items)
  const getProducts = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        return await productService.getAllProducts({ limit: 100 });
      } catch (error) {
        logger.error("Failed to fetch products:", error);
        throw new Error("Failed to load products");
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Get single product by ID
  const useGetProductById = (id) =>
    useQuery({
      queryKey: ["products", id],
      queryFn: async () => {
        if (!id) return null;
        try {
          const res = await productService.getProductById(id);

          return res.data;
        } catch (error) {
          logger.error(`Failed to fetch product ${id}:`, error);
          throw new Error(`Failed to load product: ${error.message}`);
        }
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
      retry: 2,
    });

  // Get all products by seller
  const useGetAllProductBySeller = (sellerId) => {
    logger.log(" product hooksellerId", sellerId);
    return useQuery({
      queryKey: ["products", sellerId],
      queryFn: async () => {
        if (!sellerId) return null;
        try {
          return await productService.getAllProductsBySeller(sellerId);
        } catch (error) {
          throw new Error(`Failed to load seller products: ${error.message}`);
        }
      },
      enabled: !!sellerId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };
  const useGetAllPublicProductBySeller = (sellerId) => {
    return useQuery({
      queryKey: ["products", sellerId],
      queryFn: async () => {
        if (!sellerId) {
          console.log("⚠️ [useGetAllPublicProductBySeller] No sellerId provided");
          return [];
        }
        try {
          console.log("🔍 [useGetAllPublicProductBySeller] Fetching products for seller:", sellerId);
          const response = await productService.getAllPublicProductsBySeller(
            sellerId
          );

          console.log("🔍 [useGetAllPublicProductBySeller] Response received:", response);
          console.log("🔍 [useGetAllPublicProductBySeller] response.data:", response.data);
          console.log("🔍 [useGetAllPublicProductBySeller] response.data?.products:", response.data?.products);
          console.log("🔍 [useGetAllPublicProductBySeller] response.products:", response.products);
          console.log("🔍 [useGetAllPublicProductBySeller] Is array?", Array.isArray(response));
          console.log("🔍 [useGetAllPublicProductBySeller] response.status:", response.status);

          // Handle different response structures
          // Backend returns: { status: 'success', data: { products: [...] } }
          // API service returns response.data which is: { status: 'success', data: { products: [...] } }
          // So we need: response.data.products
          if (response.data?.products && Array.isArray(response.data.products)) {
            console.log("✅ [useGetAllPublicProductBySeller] Found products at response.data.products:", response.data.products.length);
            return response.data.products;
          }
          // Fallback: check nested structure (in case Axios wraps it differently)
          if (response.data?.data?.products && Array.isArray(response.data.data.products)) {
            console.log("✅ [useGetAllPublicProductBySeller] Found products at response.data.data.products:", response.data.data.products.length);
            return response.data.data.products;
          }
          // Direct products property
          if (response.products && Array.isArray(response.products)) {
            console.log("✅ [useGetAllPublicProductBySeller] Found products at response.products:", response.products.length);
            return response.products;
          }
          // If response is already an array
          if (Array.isArray(response)) {
            console.log("✅ [useGetAllPublicProductBySeller] Response is array:", response.length);
            return response;
          }
          console.warn("⚠️ [useGetAllPublicProductBySeller] Could not extract products array from response");
          console.warn("⚠️ [useGetAllPublicProductBySeller] Response structure:", JSON.stringify(response, null, 2));
          return [];
        } catch (error) {
          logger.error("Error fetching products:", error);
          console.error("❌ [useGetAllPublicProductBySeller] Error:", error);
          return [];
        }
      },
      enabled: !!sellerId,
      staleTime: 1000 * 60 * 2, // 2 minutes
      // Add retry logic
      retry: (failureCount, error) => {
        if (error.message.includes("404")) return false;
        return failureCount < 2;
      },
    });
  };
  // Create product mutation
  const createProduct = useMutation({
    mutationFn: (formData) => productService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries(["product"]);
      logger.log("product updated successfully!!!");
    },
  });
  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.getQueryData(["product"]);
      logger.log("product deleted successfully!!!");
    },
  });

  const getProductCountByCategory = useQuery({
    queryKey: ["productCountByCategory"],
    queryFn: () => productService.getProductCountByCategory(),
    onSuccess: () => {
      queryClient.invalidateQueries(["productCountByCategory"]);
      logger.log("product count by category updated successfully!!!");
    },
  });

  const useSimilarProduct = (categoryId, currentProductId) => {
    return useQuery({
      queryKey: ["similarProducts", categoryId, currentProductId],
      queryFn: async () => {
        try {
          if (!categoryId || !currentProductId) return null;
          const res = await productService.getSimilarProducts(
            categoryId,
            currentProductId
          );
          return res.data.filter((product) => product.id !== currentProductId);
          // return await productService.getSimilarProducts();
        } catch (error) {
          throw new Error(`Failed to load similar products: ${error.message}`);
        }
      },
      enabled: !!categoryId && !!currentProductId,
    });
  };
  const useGetProductsByCategory = (categoryId, params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (key === "subcategories" && Array.isArray(value)) {
        // Send as comma-separated string
        queryParams.set(key, value.join(","));
      } else if (value !== undefined && value !== null) {
        queryParams.set(key, value);
      }
    });

    return useQuery({
      queryKey: ["products", params],
      queryFn: async () => {
        if (!categoryId) return null;
        try {
          return await productService.getProductsByCategory(
            categoryId,
            queryParams
          );
        } catch (error) {
          throw new Error(
            `Failed to load products by category: ${error.message}`
          );
        }
      },
      enabled: !!categoryId,
    });
  };

  return {
    getProducts,
    useGetProductById,
    useGetProductsByCategory,
    useGetAllProductBySeller,
    useGetAllPublicProductBySeller,
    getProductCountByCategory,
    useSimilarProduct,
    createProduct: {
      mutate: createProduct.mutate,
      isPending: createProduct.isPending,
      error: createProduct.error,
    },
    updateProduct: {
      mutate: updateProduct.mutate,
      isPending: updateProduct.isPending,
      error: updateProduct.error,
    },
    deleteProduct: {
      mutate: deleteProduct.mutate,
      isLoading: deleteProduct.isPending,
      error: deleteProduct.error,
    },
  };
};

export default useProduct;
