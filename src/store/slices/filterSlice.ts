import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AddBreedResponse,
  AddColorRequest,
  AddColorResponse,
  FilterState,
  GetBreedsResponse,
  GetColorsResponse,
  UpdateReferenceRequest,
} from "../../types";
import api from "../../api/axiosInstance";
import { apiErrorMessage } from "../../utils/apiError";

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
      const response = await api.get<GetColorsResponse>("/filters/colors");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось загрузить список окрасов"),
      );
    }
  },
);

// Окрас создаётся как JSON: nameUa и nameEn обязательны, поля name больше нет
export const addColor = createAsyncThunk<
  AddColorResponse,
  AddColorRequest,
  { rejectValue: string }
>("filters/addColor", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AddColorResponse>(
      "/filters/color",
      payload,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(
      apiErrorMessage(error, "Не удалось добавить окрас"),
    );
  }
});

// Правка окраса: JSON, отправляем только изменённые поля
export const updateColor = createAsyncThunk<
  AddColorResponse,
  { id: string; payload: UpdateReferenceRequest },
  { rejectValue: string }
>("filters/updateColor", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await api.patch<AddColorResponse>(
      `/filters/color/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(
      apiErrorMessage(error, "Не удалось изменить окрас"),
    );
  }
});

export const deleteColor = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("filters/deleteColor", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/filters/color/${id}`);
    return id;
  } catch (error) {

    return rejectWithValue(
      apiErrorMessage(error, "Не удалось удалить окрас"),
    );
  }
});

export const fetchBreeds = createAsyncThunk(
  "filters/fetchBreeds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<GetBreedsResponse>("/filters/breeds");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось загрузить список пород"),
      );
    }
  },
);

// Порода создаётся через multipart: названия + ровно одно фото в поле image.
// Content-Type руками не ставим — axios сам подставит boundary
export const addBreed = createAsyncThunk<
  AddBreedResponse,
  FormData,
  { rejectValue: string }
>("filters/addBreed", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post<AddBreedResponse>(
      "/filters/breed",
      formData,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(
      apiErrorMessage(error, "Не удалось добавить породу"),
    );
  }
});

/*
 * Правка породы: FormData, если меняют фото (поле image), иначе JSON.
 * Пустой file-input к FormData не прикладываем вовсе — иначе бэкенд
 * воспримет это как замену фото.
 */
export const updateBreed = createAsyncThunk<
  AddBreedResponse,
  { id: string; payload: FormData | UpdateReferenceRequest },
  { rejectValue: string }
>("filters/updateBreed", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await api.patch<AddBreedResponse>(
      `/filters/breed/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(
      apiErrorMessage(error, "Не удалось изменить породу"),
    );
  }
});

export const deleteBreed = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("filters/deleteBreed", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/filters/breed/${id}`);
    return id;
  } catch (error) {

    return rejectWithValue(
      apiErrorMessage(error, "Не удалось удалить породу"),
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
        state.errorColor = null;
      })
      .addCase(addColor.rejected, (state, action) => {
        state.errorColor = action.payload ?? "Неизвестная ошибка";
      })
      .addCase(updateColor.fulfilled, (state, action) => {
        const index = state.colors.findIndex(
          (color) => color._id === action.payload.data._id,
        );
        if (index !== -1) state.colors[index] = action.payload.data;
        state.errorColor = null;
      })
      .addCase(updateColor.rejected, (state, action) => {
        state.errorColor = action.payload ?? "Неизвестная ошибка";
      })
      .addCase(deleteColor.fulfilled, (state, action) => {
        state.colors = state.colors.filter(
          (color) => color._id !== action.payload,
        );
      })
      .addCase(deleteColor.rejected, (state, action) => {
        state.errorColor = action.payload ?? "Неизвестная ошибка";
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
        state.errorBreed = null;
      })
      .addCase(addBreed.rejected, (state, action) => {
        state.errorBreed = action.payload ?? "Неизвестная ошибка";
      })
      .addCase(updateBreed.fulfilled, (state, action) => {
        const index = state.breeds.findIndex(
          (breed) => breed._id === action.payload.data._id,
        );
        if (index !== -1) state.breeds[index] = action.payload.data;
        state.errorBreed = null;
      })
      .addCase(updateBreed.rejected, (state, action) => {
        state.errorBreed = action.payload ?? "Неизвестная ошибка";
      })
      .addCase(deleteBreed.fulfilled, (state, action) => {
        state.breeds = state.breeds.filter(
          (breed) => breed._id !== action.payload,
        );
      })
      .addCase(deleteBreed.rejected, (state, action) => {
        state.errorBreed = action.payload ?? "Неизвестная ошибка";
        state.isLoading = false;
      });
  },
});

export default filterSlice.reducer;
export const { clearError } = filterSlice.actions;
