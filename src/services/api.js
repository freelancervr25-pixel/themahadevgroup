// API service for backend communication
import { API_CONFIG } from "../config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to handle different image types
const getProductImage = (image) => {
  // If image is null, return null (will be handled by ProductImage component)
  if (image === null) {
    return null;
  }

  // If image is empty or null, use fallback
  if (!image || image.trim() === "") {
    return "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop";
  }

  // If image is a base64 string, return as is
  if (image.startsWith("data:image/")) {
    return image;
  }

  // If image is a URL, return as is
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // If image is an emoji or short text, create a styled div representation
  // For now, we'll use a fallback image for emojis
  return "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop";
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("adminToken");
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }

  // Get auth headers
  getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Admin login
  async adminLogin(credentials) {
    const response = await this.request(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // Admin logout
  async adminLogout() {
    try {
      await this.request(API_CONFIG.ENDPOINTS.ADMIN_LOGOUT, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.setToken(null);
    }
  }

  // Verify token (optional - for checking if user is still logged in)
  async verifyToken() {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.ADMIN_VERIFY, {
        method: "GET",
      });
      return response.valid;
    } catch (error) {
      this.setToken(null);
      return false;
    }
  }

  // Load categories
  async loadCategories() {
    const response = await this.request(API_CONFIG.ENDPOINTS.LOAD_CATEGORIES, {
      method: "GET",
    });
    // Handle backend response structure: {success: true, data: [...], count: 5, message: "..."}
    return response.success ? response.data : response;
  }

  // Load products
  async loadProducts() {
    const response = await this.request(API_CONFIG.ENDPOINTS.LOAD_PRODUCTS, {
      method: "GET",
    });
    // Handle backend response structure: {success: true, data: [...], count: 5, message: "..."}
    if (response.success && response.data) {
      // Transform backend data to match frontend structure
      return response.data.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.price * 1.2, // Add 20% markup as original price
        stock: product.stock || (product.inStock ? 100 : 0), // Convert inStock to stock for frontend
        image: getProductImage(product.image),
        description: product.description,
        category: product.category,
        inStock: product.inStock,
      }));
    }
    return response;
  }

  // Load dashboard data
  async loadDashboard() {
    return await this.request(API_CONFIG.ENDPOINTS.LOAD_DASHBOARD, {
      method: "GET",
    });
  }

  // Search products
  async searchProducts(query) {
    const response = await this.request(
      `${API_CONFIG.ENDPOINTS.SEARCH_PRODUCTS}?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
      }
    );
    // Handle backend response structure: {success: true, data: [...], count: 5, message: "..."}
    if (response.success && response.data) {
      // Transform backend data to match frontend structure
      return response.data.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.price * 1.2, // Add 20% markup as original price
        stock: product.stock || (product.inStock ? 100 : 0), // Convert inStock to stock for frontend
        image: getProductImage(product.image),
        description: product.description,
        category: product.category,
        inStock: product.inStock,
      }));
    }
    return response;
  }

  // Delete category (soft delete)
  async deleteCategory(categoryId) {
    return await this.request(
      `${API_CONFIG.ENDPOINTS.DELETE_CATEGORY}/${categoryId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Restore category
  async restoreCategory(categoryId) {
    return await this.request(
      `${API_CONFIG.ENDPOINTS.RESTORE_CATEGORY}/${categoryId}/restore`,
      {
        method: "PUT",
      }
    );
  }

  // Create product
  async createProduct(productData) {
    const response = await this.request(API_CONFIG.ENDPOINTS.CREATE_PRODUCT, {
      method: "POST",
      body: JSON.stringify(productData),
    });

    // Handle backend response structure
    if (response.success && response.data) {
      // Transform the created product data to match frontend structure
      const createdProduct = response.data;
      return {
        id: createdProduct._id,
        name: createdProduct.name,
        price: createdProduct.price,
        originalPrice: createdProduct.price * 1.2, // Add 20% markup as original price
        stock: createdProduct.stock || (createdProduct.inStock ? 100 : 0), // Convert inStock to stock for frontend
        image: getProductImage(createdProduct.image),
        description: createdProduct.description,
        category: createdProduct.category,
        inStock: createdProduct.inStock,
      };
    }
    return response;
  }

  // Update product
  async updateProduct(productId, productData) {
    const response = await this.request(
      `${API_CONFIG.ENDPOINTS.UPDATE_PRODUCT}/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(productData),
      }
    );

    // Handle backend response structure
    if (response.success && response.data) {
      // Transform the updated product data to match frontend structure
      const updatedProduct = response.data;
      return {
        id: updatedProduct._id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        originalPrice: updatedProduct.price * 1.2, // Add 20% markup as original price
        stock: updatedProduct.stock || (updatedProduct.inStock ? 100 : 0), // Convert inStock to stock for frontend
        image: getProductImage(updatedProduct.image),
        description: updatedProduct.description,
        category: updatedProduct.category,
        inStock: updatedProduct.inStock,
      };
    }
    return response;
  }

  // Delete product
  async deleteProduct(productId) {
    return await this.request(
      `${API_CONFIG.ENDPOINTS.DELETE_PRODUCT}/${productId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Get product by ID
  async getProductById(productId) {
    const response = await this.request(
      `${API_CONFIG.ENDPOINTS.GET_PRODUCT_BY_ID}/${productId}`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data) {
      const product = response.data;
      return {
        id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.price * 1.2,
        stock: product.stock || (product.inStock ? 100 : 0), // Convert inStock to stock for frontend
        image: getProductImage(product.image),
        description: product.description,
        category: product.category,
        inStock: product.inStock,
      };
    }
    return response;
  }

  // Load products by category
  async loadProductsByCategory(categoryName) {
    const response = await this.request(
      `${API_CONFIG.ENDPOINTS.LOAD_PRODUCTS_BY_CATEGORY}/${categoryName}`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data) {
      return response.data.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.price * 1.2,
        stock: product.stock || (product.inStock ? 100 : 0), // Convert inStock to stock for frontend
        image: getProductImage(product.image),
        description: product.description,
        category: product.category,
        inStock: product.inStock,
      }));
    }
    return response;
  }

  // Health check
  async healthCheck() {
    return await this.request(API_CONFIG.ENDPOINTS.HEALTH_CHECK, {
      method: "GET",
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
