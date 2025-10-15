// API Configuration
const getBaseURL = () => {
  // In development, use proxy (relative URLs)
  if (import.meta.env.DEV) {
    return "";
  }
  // In production, use full URL
  return (
    import.meta.env.VITE_API_URL || "https://simplysales.postick.co.in/mahadev"
  );
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  // Deprecated: we now call absolute endpoints directly from api.js
  ENDPOINTS: {},
};
