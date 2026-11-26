import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { apiErrorMessage } from "../../utils/apiError";
import type {
  KittensState,
  KittenResponse,
  AddKittenResponse,
  DeleteKittenResponse,
  DeleteKittenResult,
  Family,
  Kitten,
} from "../../types";
import { familyEmptiedBy } from "../../utils/familyCleanup";
import { deleteFamily, fetchFamilies } from "./familiesSlice";

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

/** Ровно то, что подчистка делает со стором: дотягивает семьи и удаляет одну. */
interface FamilyCleanupDeps {
  getState: () => unknown;
  loadFamilies: () => Promise<unknown>;
  removeFamily: (familyId: string) => Promise<unknown>;
}

/*
 * Часть стора, которую читает подчистка. Описана локально, чтобы слайс не
 * импортировал RootState из стора, который сам собран из слайсов.
 */
interface FamilyCleanupState {
  kittens: { items: Kitten[] };
  families: { items: Family[] };
}

/**
 * Семья существует ради помёта: когда удалён последний её котёнок, пустая
 * семья остаётся и в админке, и на сайте — удаляем её вслед за котёнком.
 *
 * Котёнка это уже не отменяет: он удалён на бэкенде, поэтому сбой здесь
 * уходит наружу предупреждением, а не ошибкой всей операции.
 */
async function removeEmptiedFamily(
  kittenId: string,
  { getState, loadFamilies, removeFamily }: FamilyCleanupDeps,
): Promise<Pick<DeleteKittenResult, "removedFamily" | "familyWarning">> {
  try {
    let state = getState() as FamilyCleanupState;

    // Удалять могут и со страницы, которая список семей не грузила: без него
    // проверка всегда отвечала бы «семьи нет» и пустая семья оставалась бы.
    if (state.families.items.length === 0) {
      await loadFamilies();
      state = getState() as FamilyCleanupState;
    }

    const kitten = state.kittens.items.find((k) => k._id === kittenId);
    const family = familyEmptiedBy(
      state.families.items,
      state.kittens.items,
      kittenId,
      kitten?.familyId,
    );
    if (!family) return { removedFamily: null, familyWarning: null };

    await removeFamily(family._id);
    return {
      removedFamily: { id: family._id, name: family.name },
      familyWarning: null,
    };
  } catch (error) {
    return {
      removedFamily: null,
      familyWarning:
        typeof error === "string"
          ? `Котёнок удалён, но его семью убрать не удалось: ${error}`
          : "Котёнок удалён, но его семью убрать не удалось.",
    };
  }
}

// Возвращаем не только id, но и блок telegram из ответа:
// по нему UI решает, предупреждать ли о застрявшем посте
export const deleteKitten = createAsyncThunk<
  DeleteKittenResult,
  string,
  { rejectValue: string }
>(
  "kittens/deleteKitten",
  async (id, { dispatch, getState, rejectWithValue }) => {
    let response;
    try {
      response = await api.delete<DeleteKittenResponse>(`/cats/kitten/${id}`);
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Не удалось удалить котёнка"),
      );
    }

    // Состав семьи читается до того, как reducer выкинет котёнка из стора,
    // поэтому удаляемый id исключается в самой проверке.
    const cleanup = await removeEmptiedFamily(id, {
      getState,
      loadFamilies: () => dispatch(fetchFamilies()).unwrap(),
      removeFamily: (familyId) => dispatch(deleteFamily(familyId)).unwrap(),
    });

    return {
      id,
      telegram: response.data?.telegram ?? null,
      ...cleanup,
    };
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
