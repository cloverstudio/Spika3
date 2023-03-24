import { configureStore } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";
import api from "../api/api";
import rootReducer from "./reducer";

declare const ENV: string;

export const store = configureStore({
    reducer: rootReducer,
    // preloadedState: load(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ["store.api"],
            },
        }).concat(api.middleware),
    //.concat(save({ ignoreStates: ["api"] })),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
