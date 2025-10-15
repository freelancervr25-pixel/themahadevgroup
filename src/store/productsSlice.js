import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/api";

// Sample firecracker products (fallback)
const fallbackProducts = [
  {
    id: 1,
    name: "Red Fort Crackers",
    price: 150,
    originalPrice: 200,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
    description: "Premium red fort crackers with amazing sound effects",
  },
  {
    id: 2,
    name: "Golden Sparklers",
    price: 80,
    originalPrice: 120,
    stock: 100,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
    description: "Beautiful golden sparklers for celebrations",
  },
  {
    id: 3,
    name: "Rocket Fireworks",
    price: 200,
    originalPrice: 250,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
    description: "High-flying rocket fireworks with colorful bursts",
  },
  {
    id: 4,
    name: "Flower Pots",
    price: 120,
    originalPrice: 150,
    stock: 75,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
    description: "Colorful flower pot fireworks",
  },
  {
    id: 5,
    name: "Chakri Wheels",
    price: 90,
    originalPrice: 110,
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
    description: "Spinning chakri wheels with bright lights",
  },
  {
    id: 6,
    name: "Bomb Crackers",
    price: 180,
    originalPrice: 220,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
    description: "Loud bomb crackers for festive celebrations",
  },
];

const initialState = {
  products: fallbackProducts,
  categories: [],
  loading: false,
  error: null,
  nextId: 7,
};

// Async thunk for loading products
export const loadProductsAsync = createAsyncThunk(
  "products/loadProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.loadProducts();
      return response;
    } catch (error) {
      console.warn("Failed to load products from API, using fallback data");
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading categories
export const loadCategoriesAsync = createAsyncThunk(
  "products/loadCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.loadCategories();
      return response;
    } catch (error) {
      console.warn("Failed to load categories from API");
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for searching products
export const searchProductsAsync = createAsyncThunk(
  "products/searchProducts",
  async (query, { rejectWithValue }) => {
    try {
      const response = await apiService.searchProducts(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const newProduct = {
        ...action.payload,
        id: state.nextId,
      };
      state.products.push(newProduct);
      state.nextId += 1;
    },

    updateProduct: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.products.findIndex((product) => product.id === id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updates };
      }
    },

    deleteProduct: (state, action) => {
      const id = action.payload;
      state.products = state.products.filter((product) => product.id !== id);
    },

    setProducts: (state, action) => {
      state.products = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load products
      .addCase(loadProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProductsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload || state.products;
        state.error = null;
      })
      .addCase(loadProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep fallback products on error
      })
      // Load categories
      .addCase(loadCategoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
        state.error = null;
      })
      .addCase(loadCategoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search products
      .addCase(searchProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProductsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload || state.products;
        state.error = null;
      })
      .addCase(searchProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addProduct, updateProduct, deleteProduct, setProducts, clearError } =
  productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductById = (state, id) =>
  state.products.products.find((product) => product.id === id);
export const selectCategories = (state) => state.products.categories;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;

export default productsSlice.reducer;
