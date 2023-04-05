import { combineReducers } from "@reduxjs/toolkit";
import api from "@/api";

import modalReducer from "@/store/modalSlice";
import usersReducer from "@/store/usersSlice";

const appReducer = combineReducers({
    modal: modalReducer,
    users: usersReducer,
    [api.reducerPath]: api.reducer,
});

const rootReducer = (state, action) => {
    if (action.type === "USER_LOGOUT") {
        return appReducer(undefined, action);
    }

    return appReducer(state, action);
};

export default rootReducer;
