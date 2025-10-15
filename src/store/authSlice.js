import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/api";

const initialState = {
  isLoggedIn: false,
  adminUser: null,
  error: null,
  loading: false,
};

// Async thunk for login
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.adminLogin(credentials);
      return {
        user: { username: credentials.username, role: "admin" },
        token: response.token,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async thunk for logout
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiService.adminLogout();
      return true;
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      return true;
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setInitialAuthState: (state) => {
      // Check if user is already logged in (token exists)
      const token = localStorage.getItem("adminToken");
      if (token) {
        state.isLoggedIn = true;
        state.adminUser = { username: "mahadev", role: "admin" };
        apiService.setToken(token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.adminUser = action.payload.user;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.adminUser = null;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.adminUser = null;
        state.error = null;
      });
  },
});

export const { clearError, setInitialAuthState } = authSlice.actions;

// Selectors
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAdminUser = (state) => state.auth.adminUser;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
