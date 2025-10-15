// API service for backend communication
import { API_CONFIG } from "../config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

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
    return await this.request(API_CONFIG.ENDPOINTS.LOAD_CATEGORIES, {
      method: "GET",
    });
  }

  // Load products
  async loadProducts() {
    return await this.request(API_CONFIG.ENDPOINTS.LOAD_PRODUCTS, {
      method: "GET",
    });
  }

  // Load dashboard data
  async loadDashboard() {
    return await this.request(API_CONFIG.ENDPOINTS.LOAD_DASHBOARD, {
      method: "GET",
    });
  }

  // Search products
  async searchProducts(query) {
    return await this.request(
      `${API_CONFIG.ENDPOINTS.SEARCH_PRODUCTS}?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
      }
    );
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
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
