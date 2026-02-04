import api from './api';
import logger from '../utils/logger';

export const productService = {
  getProductById: async (id) => {
    try {
      // Example implementation - replace with your actual API call
      const response = await api.get(`/product/${id}`);

      return response;
    } catch (err) {
      logger.error("Error fetching product by ID:", err);
      throw err; // Re-throw to allow calling code to handle
    }
  },

  // Additional common product service methods
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams();
    if (params.limit != null) queryString.set("limit", String(params.limit));
    if (params.page != null) queryString.set("page", String(params.page));
    if (params.sort != null) queryString.set("sort", params.sort);
     if (params.promotionKey != null) queryString.set("promotionKey", params.promotionKey);
    const url = queryString.toString() ? `/product?${queryString.toString()}` : "/product";
    const response = await api.get(url);
    return response.data;
  },

  getAllProductsBySeller: async () => {
    const response = await api.get("/seller/me/products");
    return response.data;
  },
  createProduct: async (formData) => {
    try {
      const response = await api.post("product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        const errorData = response.data?.error || response.data;
        const error = new Error(
          errorData?.message || `Request failed with status ${response.status}`
        );
        error.details = errorData?.errors;
        throw error;
      }

      return response.data;
    } catch (err) {
      logger.error("Product creation error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      const apiError = new Error(err.response?.data?.message || err.message);
      apiError.status = err.response?.status || 500;
      apiError.details = err.response?.data?.errors;
      throw apiError;
    }
  },
  updateProduct: async (id, productData) => {
    try {
      const response = await api.patch(
        `/seller/me/products/${id}`,
        productData
      );

      // Axios handles status codes differently than Fetch API
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Axios response data is in response.data
      return response.data;
    } catch (err) {
      logger.error("Error updating product:", err);
      throw err; // Re-throw for error boundary handling
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`seller/me/products/${id}`);

      if (response.status === 204 || !response.data) {
        return { success: true }; // Return dummy object
      }

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      if (
        response.status === 204 ||
        response.headers.get("Content-Length") === "0"
      ) {
        return { success: true };
      }
    } catch (err) {
      logger.error("Error deleting product:", err);
      throw err;
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      logger.error("Error searching products:", err);
      throw err;
    }
  },
  getProductCountByCategory: async () => {
    const response = await api.get("/product/category-counts");
    return response.data;
  },
  getAllPublicProductsBySeller: async (sellerId) => {
    const response = await api.get(`/product/${sellerId}/public`);
    console.log("🔍 [productApi.getAllPublicProductsBySeller] Full axios response:", response);
    console.log("🔍 [productApi.getAllPublicProductsBySeller] response.data:", response.data);
    console.log("🔍 [productApi.getAllPublicProductsBySeller] response.data.data:", response.data?.data);
    console.log("🔍 [productApi.getAllPublicProductsBySeller] response.data.data.products:", response.data?.data?.products);
    console.log("🔍 [productApi.getAllPublicProductsBySeller] response.data.data.products length:", response.data?.data?.products?.length);
    console.log("🔍 [productApi.getAllPublicProductsBySeller] response.data.data.products isArray:", Array.isArray(response.data?.data?.products));
    return response.data;
  },
  getProductsByCategory: async (categoryId, queryParams) => {
    const response = await api.get(
      `/product/category/${categoryId}?${queryParams.toString()}`
    );
    return response.data;
  },
};
