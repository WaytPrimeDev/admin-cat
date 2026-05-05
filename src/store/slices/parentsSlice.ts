import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import type {
  ParentsState,
  GetParentResponse,
  AddParentResponse,
} from "../../types";
import type { AxiosError } from "axios";

const initialState: ParentsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchParents = createAsyncThunk(
  "parents/fetchParents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<GetParentResponse>("/cats/parents");
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch parents",
      );
    }
  },
);
export const updateParent = createAsyncThunk(
  "parents/updateParent",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch<AddParentResponse>(
        `/cats/parent/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update parent",
      );
    }
  },
);

export const addParent = createAsyncThunk(
  "parents/addParent",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post<AddParentResponse>(
        `/cats/parent`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update parent",
      );
    }
  },
);

export const deleteParent = createAsyncThunk(
  "parents/deleteParent",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cats/parent/${id}`);
      return id;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete parent",
      );
    }
  },
);

const parentsSlice = createSlice({
  name: "parents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchParents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchParents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addParent.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
      })
      .addCase(updateParent.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (p) => p._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
      })
      .addCase(deleteParent.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (parent) => parent._id !== action.payload,
        );
      });
  },
});

export default parentsSlice.reducer;
