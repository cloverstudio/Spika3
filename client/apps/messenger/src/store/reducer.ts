import { combineReducers } from "@reduxjs/toolkit";
import api from "../api/api";

import counterReducer from "./counterSlice";
import adminAuthReducer from "./adminAuthSlice";

const rootReducer = combineReducers({
    counter: counterReducer,
    auth: adminAuthReducer,
    [api.reducerPath]: api.reducer,
});

export default rootReducer;
