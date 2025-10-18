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
    // Endpoint: use proxy in dev to avoid CORS, absolute in prod
    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/login";

    // Send exact JSON structure required by backend
    const payload = {
      data: {
        username: credentials.username,
        password: credentials.password,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Login failed");
    }

    // Only proceed if error is "False" and we have required fields
    if (String(data?.error).toLowerCase() !== "false") {
      throw new Error(data?.message || "Login failed");
    }

    if (!data?.admin_token || !data?.admin_data?.id) {
      throw new Error(
        "Invalid login response: missing admin_token or admin_data"
      );
    }

    // Store the admin token and data
    this.setToken(data.admin_token);
    try {
      localStorage.setItem(
        "adminUsername",
        data.admin_data.username || credentials.username
      );
      localStorage.setItem("adminId", String(data.admin_data.id));
      localStorage.setItem("adminAuthToken", String(data.admin_token));
    } catch {}

    return { success: true, token: data.admin_token, raw: data };
  }

  // Load admin products (requires admin_id and authtoken from login)
  async loadAdminProducts() {
    const adminId = localStorage.getItem("adminId");
    const adminToken = localStorage.getItem("adminAuthToken");
    if (!adminId || !adminToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/load_product";

    const body = {
      data: {
        admin_id: adminId,
        authtoken: adminToken,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Failed to load products");
    }

    // Some APIs return error flag as string
    if (data?.error && String(data.error).toLowerCase() !== "false") {
      throw new Error(data?.message || "Failed to load products");
    }

    const products = data?.products || data?.data || [];
    // Normalize shape for frontend (preserve base64 images)
    return products.map((p) => ({
      id:
        p.id ||
        p._id ||
        p.product_id ||
        p.sku ||
        Math.random().toString(36).slice(2),
      name: p.name || p.product_name || "Unnamed",
      price: Number(p.current_price ?? p.price ?? p.sale_price ?? 0),
      originalPrice: Number(
        p.original_price ??
          p.mrp ??
          (p.current_price
            ? p.current_price * 1.2
            : p.price
            ? p.price * 1.2
            : 0)
      ),
      stock: Number(p.stock ?? p.quantity ?? (p.inStock ? 100 : 0) ?? 0),
      // If it's base64 (data:image/...), keep as is
      image:
        typeof p.image === "string" && p.image.startsWith("data:image/")
          ? p.image
          : getProductImage(p.image || p.image_url || p.thumbnail || null),
      description: p.description || p.short_description || "",
      category: p.category || p.category_name || "general",
      status: p.status || "active",
      inStock:
        p.inStock !== undefined
          ? !!p.inStock
          : Number(p.stock ?? p.quantity ?? 0) > 0,
    }));
  }

  // Load active products for Home (public, no auth)
  async loadHomeProducts() {
    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/home_products";

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: {} }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Failed to load products");
    }
    if (
      typeof data?.error !== "undefined" &&
      String(data.error).toLowerCase() !== "false"
    ) {
      throw new Error(data?.message || "Failed to load products");
    }

    const products = data?.products || [];
    return products.map((p) => ({
      id: p.id || Math.random().toString(36).slice(2),
      name: p.name || "Unnamed",
      price: Number(p.current_price ?? p.price ?? 0),
      originalPrice: Number(
        p.original_price ?? (p.current_price ? p.current_price * 1.2 : 0)
      ),
      stock: Number(p.stock ?? 0),
      image:
        typeof p.image === "string" && p.image.startsWith("data:image/")
          ? p.image
          : getProductImage(p.image || null),
      description: p.description || "",
      category: p.category || "general",
      inStock: Number(p.stock ?? 0) > 0,
    }));
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
      // Clear all localStorage data
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUsername");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminAuthToken");

      // Clear any other potential localStorage items
      localStorage.removeItem("safetyAccepted");

      // Clear the token in the service
      this.setToken(null);

      // Reload the page to ensure clean state
      window.location.reload();
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

  // Create product (new PHP API)
  async createProduct(productData) {
    const adminId = localStorage.getItem("adminId");
    const adminToken = localStorage.getItem("adminAuthToken");
    if (!adminId || !adminToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint = import.meta.env?.DEV
      ? "/mahadev/add_product"
      : "https://themahadevgroupv2back.onrender.com/api/mahadev/add_product";

    // Map frontend fields to backend expected keys
    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminToken,
        name: productData.name,
        category: productData.category,
        current_price: Number(productData.price ?? 0),
        original_price: Number(
          productData.originalPrice ?? productData.price ?? 0
        ),
        stock: Number(productData.stock ?? 0),
        status: productData.status || "active",
        image: productData.image ?? null, // base64 or null
        description: productData.description || "",
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      // Use a simple request to avoid CORS preflight (no custom headers)
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Failed to create product");
    }

    if (data?.error && String(data.error).toLowerCase() !== "false") {
      throw new Error(data?.message || "Failed to create product");
    }

    // Construct a product object for our frontend
    return {
      id: Math.random().toString(36).slice(2),
      name: productData.name,
      price: Number(productData.price ?? 0),
      originalPrice: Number(
        productData.originalPrice ?? productData.price ?? 0
      ),
      stock: Number(productData.stock ?? 0),
      image: getProductImage(productData.image ?? null),
      description: productData.description || "",
      category: productData.category,
      inStock: Number(productData.stock ?? 0) > 0,
    };
  }

  // Update product (new PHP API)
  async updateProduct(productId, productData) {
    const adminId = localStorage.getItem("adminId");
    const adminToken = localStorage.getItem("adminAuthToken");
    if (!adminId || !adminToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/edit_product";

    // Build payload; only include image if explicitly provided (base64 or null means remove not supported here)
    const data = {
      id: productId,
      name: productData.name,
      category: productData.category,
      current_price: Number(productData.price ?? 0),
      original_price: Number(
        productData.originalPrice ?? productData.price ?? 0
      ),
      stock: Number(productData.stock ?? 0),
      description: productData.description || "",
    };
    if (typeof productData.image !== "undefined") {
      data.image = productData.image; // send base64 when provided
    }

    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminToken,
        ...data,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const response = await resp.json();
    if (!resp.ok) {
      throw new Error(response?.message || "Failed to update product");
    }
    if (response?.error && String(response.error).toLowerCase() !== "false") {
      throw new Error(response?.message || "Failed to update product");
    }

    // Return normalized product for frontend
    return {
      id: productId,
      name: data.name,
      price: data.current_price,
      originalPrice: data.original_price,
      stock: data.stock,
      image:
        typeof data.image === "string" && data.image.startsWith("data:image/")
          ? data.image
          : getProductImage(productData.image ?? null),
      description: data.description,
      category: data.category,
      inStock: Number(data.stock) > 0,
    };
  }

  // Delete product (soft delete via PHP API)
  async deleteProduct(productId) {
    const adminId = localStorage.getItem("adminId");
    const adminToken = localStorage.getItem("adminAuthToken");
    if (!adminId || !adminToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/delete_product";
    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminToken,
        id: productId,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const response = await resp.json();
    if (!resp.ok) {
      throw new Error(response?.message || "Failed to delete product");
    }
    if (response?.error && String(response.error).toLowerCase() !== "false") {
      throw new Error(response?.message || "Failed to delete product");
    }
    return { success: true, deletedId: productId };
  }

  // Create order (public endpoint)
  async createOrder({ userName, userMobile, couponCode, cartItems }) {
    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/create_order";

    // Send raw JSON with { data: {...} } so PHP can read $_POST['data'] after json_decode
    const payload = {
      data: {
        user_name: userName,
        user_mobile: userMobile,
        coupon_code: couponCode || "",
        cart_items: (cartItems || []).map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          qty: Number(item.quantity || item.qty || 1),
        })),
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Failed to create order");
    }
    if (String(data?.error).toLowerCase() !== "false") {
      throw new Error(data?.message || "Failed to create order");
    }
    return data.order_summary || data.data || data;
  }

  // Load orders for admin
  async loadOrders() {
    const adminId = localStorage.getItem("adminId");
    const adminAuthToken = localStorage.getItem("adminAuthToken");

    if (!adminId || !adminAuthToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/load_orders";
    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminAuthToken,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Failed to load orders");
    }
    if (String(data?.error).toLowerCase() !== "false") {
      if ((data?.message || "").toLowerCase() === "logout") {
        throw new Error("Logout");
      }
      throw new Error(data?.message || "Failed to load orders");
    }
    // Support response with summary
    if (Array.isArray(data.orders)) {
      return { orders: data.orders, summary: data.summary || null };
    }
    return data.orders || [];
  }

  // Accept order (admin)
  async acceptOrder(orderId) {
    const adminId = localStorage.getItem("adminId");
    const adminAuthToken = localStorage.getItem("adminAuthToken");

    if (!adminId || !adminAuthToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/accept_order";
    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminAuthToken,
        order_id: orderId,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data?.message || "Failed to accept order");
    }

    if (String(data?.error).toLowerCase() !== "false") {
      if ((data?.message || "").toLowerCase() === "logout") {
        throw new Error("Logout");
      }
      // Attach details array if present
      const err = new Error(data?.message || "Failed to accept order");
      err.details = data?.details || [];
      throw err;
    }

    return { orderId: data?.order_id, message: data?.message };
  }

  // Reject order (admin)
  async rejectOrder(orderId) {
    const adminId = localStorage.getItem("adminId");
    const adminAuthToken = localStorage.getItem("adminAuthToken");

    if (!adminId || !adminAuthToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/reject_order";
    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminAuthToken,
        order_id: orderId,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data?.message || "Failed to reject order");
    }

    if (String(data?.error).toLowerCase() !== "false") {
      if ((data?.message || "").toLowerCase() === "logout") {
        throw new Error("Logout");
      }
      throw new Error(data?.message || "Failed to reject order");
    }

    return { orderId: data?.order_id, message: data?.message };
  }

  // Mark order as paid (status 3)
  async markOrderPaid(orderId) {
    const adminId = localStorage.getItem("adminId");
    const adminAuthToken = localStorage.getItem("adminAuthToken");

    if (!adminId || !adminAuthToken) {
      throw new Error("Missing admin credentials. Please login again.");
    }

    const endpoint =
      "https://themahadevgroupv2back.onrender.com/api/mahadev/paid_order";
    const payload = {
      data: {
        admin_id: adminId,
        authtoken: adminAuthToken,
        order_id: orderId,
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data?.message || "Failed to mark order as paid");
    }

    if (String(data?.error).toLowerCase() !== "false") {
      if ((data?.message || "").toLowerCase() === "logout") {
        throw new Error("Logout");
      }
      throw new Error(data?.message || "Failed to mark order as paid");
    }

    return { orderId: data?.order_id, message: data?.message };
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
