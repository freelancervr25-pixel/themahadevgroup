# 🎆 Fireworks Store - Firecracker Cart Website

A modern, responsive firecracker shopping website with admin panel, built with React, Redux, and integrated with a Vercel backend API.

## 🚀 Features

### 🛍️ Customer Features

- **Product Browsing**: Beautiful product grid with images, pricing, and stock info
- **Shopping Cart**: Add/remove items, quantity controls, floating cart button
- **Checkout System**: Customer details form, order summary, PDF generation
- **PDF Downloads**: Full catalogue and order summary PDFs

### 🔐 Admin Features

- **Secure Login**: JWT-based authentication with your backend API
- **Product Management**: Add, edit, delete products with image upload
- **Dashboard**: Complete CRUD operations for inventory management

### 🎨 Design

- **Modern UI**: Pure CSS styling with red/gold theme
- **Responsive**: Mobile-first design that works on all devices
- **Animations**: Smooth transitions and hover effects

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Redux Toolkit
- **Routing**: React Router DOM
- **PDF Generation**: jsPDF + html2canvas
- **Styling**: Pure CSS (no frameworks)
- **Backend Integration**: REST API with JWT authentication

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd firecracker-cart
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API URL**

   Update the API URL in `src/config/api.js`:

   ```javascript
   export const API_CONFIG = {
     BASE_URL: "https://your-vercel-backend.vercel.app", // Replace with your backend URL
     // ... rest of config
   };
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Backend API Integration

The app is configured to work with your Vercel backend API:

- **Login Endpoint**: `POST /api/admin/login`
- **Logout Endpoint**: `POST /api/admin/logout`
- **Credentials**:
  - Username: `mahadev`
  - Password: `admin123`

### Environment Variables (Optional)

Create a `.env` file for custom configuration:

```env
VITE_API_URL=https://your-vercel-backend.vercel.app
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Connect your GitHub repository to Vercel
   - Vercel will auto-detect the Vite configuration
   - Deploy with the included `vercel.json` settings

3. **Update API URL**
   - After deployment, update the API URL in `src/config/api.js` to point to your production backend

## 📱 Usage

### Customer Flow

1. Browse products on the home page
2. Add items to cart
3. Click floating cart button to checkout
4. Enter customer details
5. Download order PDF

### Admin Flow

1. Navigate to Admin Login
2. Login with credentials: `mahadev` / `admin123`
3. Manage products (add, edit, delete)
4. Upload product images via URL or file

## 🎯 Key Features

- ✅ **Real Backend Integration**: JWT authentication with your Vercel API
- ✅ **PDF Generation**: Catalogue and order PDFs with images
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **State Management**: Redux Toolkit for cart and auth state
- ✅ **Image Handling**: Base64 conversion for file uploads
- ✅ **Error Handling**: Proper error messages and loading states

## 🔐 Security

- JWT token storage in localStorage
- Automatic token cleanup on logout
- Protected admin routes
- Input validation and sanitization

## 📄 File Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main page components
├── store/              # Redux store and slices
├── services/           # API service layer
├── utils/              # Utility functions (PDF generation)
├── styles/             # CSS stylesheets
└── config/             # Configuration files
```

## 🎨 Customization

### Theme Colors

Update colors in CSS files:

- Primary Red: `#d32f2f`
- Gold Accent: `#fbc02d`
- Background: `#f8f9fa`

### Adding New Features

- Products: Update `productsSlice.js`
- Cart: Modify `cartSlice.js`
- API: Extend `api.js` service

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**

   - Check if backend URL is correct in `src/config/api.js`
   - Verify backend is running and accessible

2. **PDF Generation Issues**

   - Ensure images are accessible (CORS issues)
   - Check browser console for errors

3. **Login Not Working**
   - Verify credentials: `mahadev` / `admin123`
   - Check network tab for API errors

## 📞 Support

For issues or questions:

1. Check the browser console for errors
2. Verify API endpoints are working
3. Ensure all dependencies are installed

---

**Built with ❤️ for Fireworks Store** 🎆
