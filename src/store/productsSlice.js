import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/api";

// No local fallback products; rely on backend-loaded data

const initialState = {
  products: [],
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
      const response = await apiService.loadHomeProducts();
      return response;
    } catch (error) {
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

// Async thunk for deleting category (soft delete)
export const deleteCategoryAsync = createAsyncThunk(
  "products/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteCategory(categoryId);
      return { categoryId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for restoring category
export const restoreCategoryAsync = createAsyncThunk(
  "products/restoreCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await apiService.restoreCategory(categoryId);
      return { categoryId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating product
export const updateProductAsync = createAsyncThunk(
  "products/updateProduct",
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProduct(productId, productData);
      return { productId, updatedProduct: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating product
export const createProductAsync = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await apiService.createProduct(productData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting product
export const deleteProductAsync = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteProduct(productId);
      return { productId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading products by category
export const loadProductsByCategoryAsync = createAsyncThunk(
  "products/loadProductsByCategory",
  async (categoryName, { rejectWithValue }) => {
    try {
      const response = await apiService.loadProductsByCategory(categoryName);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Load admin products (requires admin login context)
export const loadAdminProductsAsync = createAsyncThunk(
  "products/loadAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.loadAdminProducts();
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
      })
      // Delete category
      .addCase(deleteCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId } = action.payload;
        // Update the category to mark as deleted
        const category = state.categories.find((cat) => cat.id === categoryId);
        if (category) {
          category.deleted = true;
          category.deletedAt = new Date().toISOString();
        }
        state.error = null;
      })
      .addCase(deleteCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore category
      .addCase(restoreCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId } = action.payload;
        // Update the category to mark as restored
        const category = state.categories.find((cat) => cat.id === categoryId);
        if (category) {
          category.deleted = false;
          category.deletedAt = null;
        }
        state.error = null;
      })
      .addCase(restoreCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, updatedProduct } = action.payload;
        // Update the product in the products array
        const index = state.products.findIndex(
          (product) => product.id === productId
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        state.error = null;
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.error = null;
      })
      .addCase(createProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { productId } = action.payload;
        state.products = state.products.filter(
          (product) => product.id !== productId
        );
        state.error = null;
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load products by category
      .addCase(loadProductsByCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProductsByCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload || state.products;
        state.error = null;
      })
      .addCase(loadProductsByCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Load admin products
    builder
      .addCase(loadAdminProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminProductsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload || state.products;
        state.error = null;
      })
      .addCase(loadAdminProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  setProducts,
  clearError,
} = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductById = (state, id) =>
  state.products.products.find((product) => product.id === id);
export const selectCategories = (state) => state.products.categories;
export const selectActiveCategories = (state) =>
  state.products.categories.filter((category) => !category.deleted);
export const selectDeletedCategories = (state) =>
  state.products.categories.filter((category) => category.deleted);
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;

export default productsSlice.reducer;
