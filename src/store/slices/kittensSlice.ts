import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { apiErrorMessage } from "../../utils/apiError";
import type {
  KittensState,
  KittenResponse,
  AddKittenResponse,
  DeleteKittenResponse,
} from "../../types";

const initialState: KittensState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchKittens = createAsyncThunk(
  "kittens/fetchKittens",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<KittenResponse>("/cats/kittens?page=1&perPage=100000");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось загрузить данные"),
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
      const response = await api.patch<AddKittenResponse>(
        `/cats/kitten/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось сохранить котёнка"),
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
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось сохранить котёнка"),
      );
    }
  },
);

// Возвращаем не только id, но и блок telegram из ответа:
// по нему UI решает, предупреждать ли о застрявшем посте
export const deleteKitten = createAsyncThunk(
  "kittens/deleteKitten",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<DeleteKittenResponse>(
        `/cats/kitten/${id}`,
      );
      return { id, telegram: response.data?.telegram ?? null };
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось удалить котёнка"),
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
        state.isLoading = false;

        // Базовый порядок списка — от самых новых к старым,
        // чтобы только что добавленный котёнок был в самом верху и после перезагрузки
        state.items = [...action.payload.data].sort(
          (a, b) =>
            Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? "") || 0,
        );
      })
      .addCase(fetchKittens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addKitten.fulfilled, (state, action) => {
        // Новый котёнок всегда первым в списке
        state.items.unshift(action.payload.data);
      })
      .addCase(updateKitten.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (k) => k._id === action.payload.data._id,
        );
        if (index !== -1) {
          // PATCH-ответ не содержит вычисляемого isTelegramPublished — не теряем его
          state.items[index] = { ...state.items[index], ...action.payload.data };
        }
      })
      .addCase(deleteKitten.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (kitten) => kitten._id !== action.payload.id,
        );
      });
  },
});

export default kittensSlice.reducer;
