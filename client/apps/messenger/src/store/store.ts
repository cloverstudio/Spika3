import { configureStore } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";
import api from "../api/api";
import rootReducer from "./reducer";

declare const ENV: string;
console.log({ ENV });
export const store = configureStore({
    reducer: rootReducer,
    preloadedState: load(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: { ignoredPaths: ["store.api"] },
        })
            .concat(api.middleware)
            .concat(save()),
});

if (ENV !== "production" && module?.hot) {
    module.hot.accept("./reducer", () => store.replaceReducer(rootReducer));
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
