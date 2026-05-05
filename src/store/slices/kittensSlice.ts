import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import type {
  KittensState,
  KittenResponse,
  AddKittenResponse,
} from "../../types";
import type { AxiosError } from "axios";

const initialState: KittensState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchKittens = createAsyncThunk(
  "kittens/fetchKittens",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<KittenResponse>("/cats/kittens");
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch kittens",
      );
    }
  },
);

export const updateKitten = createAsyncThunk(
  "kittens/updateKitten",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put<AddKittenResponse>(
        `/cats/kitten/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update kitten",
      );
    }
  },
);
export const addKitten = createAsyncThunk(
  "kittens/addKitten",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post<AddKittenResponse>(
        `/cats/kitten`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update kitten",
      );
    }
  },
);

export const deleteKitten = createAsyncThunk(
  "kittens/deleteKitten",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cats/kitten/${id}`);
      return id;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete kitten",
      );
    }
  },
);

const kittensSlice = createSlice({
  name: "kittens",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKittens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKittens.fulfilled, (state, action) => {
        console.log("er");

        state.isLoading = false;

        state.items = action.payload.data;
      })
      .addCase(fetchKittens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addKitten.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
      })
      .addCase(updateKitten.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (k) => k._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
      })
      .addCase(deleteKitten.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (kitten) => kitten._id !== action.payload,
        );
      });
  },
});

export default kittensSlice.reducer;
