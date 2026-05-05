import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/es/storage";

import authReducer from "./slices/authSlice";
import kittensReducer from "./slices/kittensSlice";
import parentsReducer from "./slices/parentsSlice";
import familiesReducer from "./slices/familiesSlice";
import { useDispatch } from "react-redux";

const persistedAuthReducer = persistReducer(
  {
    key: "token",
    storage,
    whitelist: ["token"],
  },
  authReducer,
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    kittens: kittensReducer,
    parents: parentsReducer,
    families: familiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
