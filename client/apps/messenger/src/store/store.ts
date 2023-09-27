import { configureStore } from "@reduxjs/toolkit";
import api from "../api/api";
import rootReducer from "./reducer";

declare const ENV: string;

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ["store.api"],
            },
        }).concat(api.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
