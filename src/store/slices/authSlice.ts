import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../api/axiosInstance";
import type { AuthState, LoginRequest, LoginResponse } from "../../types";

const initialState: AuthState = {
  user: null,
  token: "",
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>(
        "/auth/signin",
        credentials,
      );
      const { user, accessToken } = response.data;
      return { user, token: accessToken };
    } catch (error) {
      const defaultMessage = "Login failed";

      const axiosLikeError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosLikeError.response?.data?.message || defaultMessage,
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
