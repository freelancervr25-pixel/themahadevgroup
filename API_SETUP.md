# 🔧 API Setup Instructions

## Quick Setup

To connect your frontend to your Vercel backend API, follow these steps:

### 1. Update API URL

Open `src/config/api.js` and replace the placeholder URL:

```javascript
export const API_CONFIG = {
  BASE_URL: "https://YOUR-VERCEL-BACKEND-URL.vercel.app", // 👈 Replace this
  ENDPOINTS: {
    ADMIN_LOGIN: "/api/admin/login",
    ADMIN_LOGOUT: "/api/admin/logout",
    ADMIN_VERIFY: "/api/admin/verify",
  },
};
```

### 2. Your Backend API Endpoints

Make sure your Vercel backend has these endpoints:

- **POST** `/api/admin/login`

  - Body: `{ "username": "mahadev", "password": "admin123" }`
  - Response: `{ "token": "jwt-token", "message": "Login successful" }`

- **POST** `/api/admin/logout`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Logout successful" }`

### 3. Test the Integration

1. Start the development server: `npm run dev`
2. Navigate to Admin Login
3. Use credentials: `mahadev` / `admin123`
4. Check browser network tab for API calls

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Connect repository to Vercel
3. Deploy automatically
4. Update API URL in production if needed

## 🔍 Troubleshooting

### API Connection Issues

- Check if your backend URL is correct
- Verify CORS settings on your backend
- Check browser console for errors

### Login Issues

- Ensure credentials match: `mahadev` / `admin123`
- Check if JWT token is being returned
- Verify token is stored in localStorage

### Build Issues

- Run `npm install` to ensure all dependencies are installed
- Check for any TypeScript/ESLint errors
- Verify all imports are correct

## 📝 Notes

- The app uses JWT tokens for authentication
- Tokens are stored in localStorage
- Admin state persists across page refreshes
- All API calls include proper error handling

---

**Ready to deploy! 🚀**
