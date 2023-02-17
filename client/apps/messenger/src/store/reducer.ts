import { combineReducers } from "@reduxjs/toolkit";
import api from "../api/api";

import contactsReducer from "../features/room/slices/contacts";
import adminAuthReducer from "./adminAuthSlice";
import callReducer from "../features/confcall/slice/callSlice";
import rightSidebarReducer from "../features/room/slices/rightSidebar";
import leftSidebarReducer from "../features/room/slices/leftSidebar";
import inputReducer from "../features/room/slices/input";
import messagesReducer from "../features/room/slices/messages";
import userReducer from "./userSlice";
import modalReducer from "./modalSlice";

const appReducer = combineReducers({
    contacts: contactsReducer,
    auth: adminAuthReducer,
    leftSidebar: leftSidebarReducer,
    rightSidebar: rightSidebarReducer,
    user: userReducer,
    modal: modalReducer,
    call: callReducer,
    input: inputReducer,
    messages: messagesReducer,
    [api.reducerPath]: api.reducer,
});

const rootReducer = (state, action) => {
    if (action.type === "USER_LOGOUT") {
        return appReducer(undefined, action);
    }

    return appReducer(state, action);
};

export default rootReducer;
