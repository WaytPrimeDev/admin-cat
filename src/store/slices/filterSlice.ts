import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FilterState, MyKnownError } from "../../types";
import api from "../../api/axiosInstance";
import type { AxiosError } from "axios";

const initialState: FilterState = {
  breeds: [],
  colors: [],
  isLoading: false,
  errorColor: null,
  errorBreed: null,
};

export const fetchColors = createAsyncThunk(
  "filters/fetchColors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/filters/colors");
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch kittens",
      );
    }
  },
);

export const addColor = createAsyncThunk(
  "filters/addColor",
  async (formData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/filters/color", formData);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch kittens",
      );
    }
  },
);

export const deleteColor = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("filters/deleteColor", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/filters/color/${id}`);
    return id;
  } catch (error) {
    const err = error as AxiosError<MyKnownError>;

    return rejectWithValue(
      err.response?.data?.message || "Failed to delete color",
    );
  }
});

export const fetchBreeds = createAsyncThunk(
  "filters/fetchBreeds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/filters/breeds");
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch kittens",
      );
    }
  },
);

export const addBreed = createAsyncThunk(
  "filters/addBreed",
  async (formData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/filters/breed", formData);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch kittens",
      );
    }
  },
);

export const deleteBreed = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("filters/deleteBreed", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/filters/breed/${id}`);
    return id;
  } catch (error) {
    const err = error as AxiosError<MyKnownError>;

    return rejectWithValue(
      err.response?.data?.message || "Failed to delete breed",
    );
  }
});

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    clearError: (state) => {
      state.errorColor = null;
      state.errorBreed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending, (state) => {
        state.isLoading = true;
        state.errorColor = null;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.isLoading = false;

        state.colors = action.payload.data;
      })
      .addCase(fetchColors.rejected, (state, action) => {
        state.isLoading = false;
        state.errorColor = action.payload as string;
      })
      .addCase(addColor.fulfilled, (state, action) => {
        state.colors.push(action.payload.data);
      })
      .addCase(deleteColor.fulfilled, (state, action) => {
        state.colors = state.colors.filter(
          (color) => color._id !== action.payload,
        );
      })
      .addCase(deleteColor.rejected, (state, action) => {
        state.errorColor = action.payload ?? "An unknown error occurred";
      })
      .addCase(fetchBreeds.pending, (state) => {
        state.isLoading = true;
        state.errorBreed = null;
      })
      .addCase(fetchBreeds.fulfilled, (state, action) => {
        state.isLoading = false;

        state.breeds = action.payload.data;
      })
      .addCase(fetchBreeds.rejected, (state, action) => {
        state.isLoading = false;
        state.errorBreed = action.payload as string;
      })
      .addCase(addBreed.fulfilled, (state, action) => {
        state.breeds.push(action.payload.data);
      })
      .addCase(deleteBreed.fulfilled, (state, action) => {
        state.breeds = state.breeds.filter(
          (breed) => breed._id !== action.payload,
        );
      })
      .addCase(deleteBreed.rejected, (state, action) => {
        state.errorBreed = action.payload ?? "An unknown error occurred";
        state.isLoading = false;
      });
  },
});

export default filterSlice.reducer;
export const { clearError } = filterSlice.actions;
