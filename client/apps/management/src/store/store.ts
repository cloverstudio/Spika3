import { configureStore } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";

import counterReducer from "./counterSlice";
import adminAuthReducer from "./adminAuthSlice";
import uiReducer from "./uiSlice";
import api from "../api/api";

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        auth: adminAuthReducer,
        ui: uiReducer,
        [api.reducerPath]: api.reducer,
    },
    preloadedState: load(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ["store.api"],
            },
        }).concat(api.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
