import { combineReducers } from "@reduxjs/toolkit";
import api from "../api/api";

import contactsReducer from "../features/chat/slice/contactsSlice";
import adminAuthReducer from "./adminAuthSlice";
import chatReducer from "../features/chat/slice/chatSlice";
import callReducer from "../features/confcall/slice/callSlice";
import roomReducer from "../features/chat/slice/roomSlice";
import sidebarReducer from "../features/chat/slice/sidebarSlice";
import rightSidebarReducer from "../features/chat/slice/rightSidebarSlice";
import userReducer from "./userSlice";
import modalReducer from "./modalSlice";

const rootReducer = combineReducers({
    contacts: contactsReducer,
    auth: adminAuthReducer,
    chat: chatReducer,
    room: roomReducer,
    sidebar: sidebarReducer,
    rightSidebar: rightSidebarReducer,
    user: userReducer,
    modal: modalReducer,
    call: callReducer,
    [api.reducerPath]: api.reducer,
});

export default rootReducer;
