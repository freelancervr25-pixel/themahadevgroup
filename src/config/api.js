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
  },
};
