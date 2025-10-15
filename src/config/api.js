// API Configuration
const getBaseURL = () => {
  // In development, use proxy (relative URLs)
  if (import.meta.env.DEV) {
    return '';
  }
  // In production, use full URL
  return import.meta.env.VITE_API_URL || "https://express-js-on-vercel-lovat-eight.vercel.app";
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  ENDPOINTS: {
    // Admin endpoints
    ADMIN_LOGIN: "/api/admin/login",
    ADMIN_LOGOUT: "/api/admin/logout",
    ADMIN_VERIFY: "/api/admin/verify",
    
    // Data loading endpoints
    LOAD_CATEGORIES: "/api/load/categories",
    LOAD_PRODUCTS: "/api/load/products",
    LOAD_DASHBOARD: "/api/load/dashboard",
    SEARCH_PRODUCTS: "/api/load/search",
    
    // Category management endpoints
    DELETE_CATEGORY: "/api/categories",
    RESTORE_CATEGORY: "/api/categories",
    
    // Product management endpoints
    CREATE_PRODUCT: "/api/products",
    UPDATE_PRODUCT: "/api/products",
    DELETE_PRODUCT: "/api/products",
    GET_PRODUCT_BY_ID: "/api/products",
    
    // Category management endpoints (additional)
    GET_CATEGORIES: "/api/categories",
    GET_CATEGORY_BY_ID: "/api/categories",
    CREATE_CATEGORY: "/api/categories",
    UPDATE_CATEGORY: "/api/categories",
    
    // Additional load endpoints
    LOAD_PRODUCTS_BY_CATEGORY: "/api/load/products-by-category",
    
    // System endpoints
    HEALTH_CHECK: "/api/health",
  },
};
