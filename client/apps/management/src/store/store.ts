import { configureStore } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";

import counterReducer from "./counterSlice";
import adminAuthReducer from "./adminAuthSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: adminAuthReducer,
    ui: uiReducer
  },
  preloadedState: load(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(save()),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
