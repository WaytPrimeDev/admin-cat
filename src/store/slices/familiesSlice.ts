import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import type {
  AddFamilyResponse,
  FamiliesState,
  GetFamilyResponse,
  UpdateFamilyRequest,
} from "../../types";
import type { FamilyFormValues } from "../../validation/familySchema";
import type { AxiosError } from "axios";

const initialState: FamiliesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchFamilies = createAsyncThunk(
  "families/fetchFamilies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<GetFamilyResponse>("/families");
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch families",
      );
    }
  },
);
export const createFamily = createAsyncThunk(
  "families/createFamily",
  async (familyData: FamilyFormValues, { rejectWithValue }) => {
    try {
      const response = await api.post<AddFamilyResponse>(
        `/families`,
        familyData,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update family",
      );
    }
  },
);
export const updateFamily = createAsyncThunk(
  "families/updateFamily",
  async (
    { id, data }: { id: string; data: UpdateFamilyRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch<AddFamilyResponse>(
        `/families/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update family",
      );
    }
  },
);

export const deleteFamily = createAsyncThunk(
  "families/deleteFamily",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/families/${id}`);
      return id;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete family",
      );
    }
  },
);

const familiesSlice = createSlice({
  name: "families",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamilies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFamilies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchFamilies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createFamily.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
      })
      .addCase(updateFamily.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (f) => f._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
      })
      .addCase(deleteFamily.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (family) => family._id !== action.payload,
        );
      });
  },
});

export default familiesSlice.reducer;
