// API Configuration
// Update this URL with your actual Vercel backend URL
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_URL || "https://your-vercel-backend.vercel.app",
  ENDPOINTS: {
    ADMIN_LOGIN: "/api/admin/login",
    ADMIN_LOGOUT: "/api/admin/logout",
    ADMIN_VERIFY: "/api/admin/verify",
  },
};
