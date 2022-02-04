import { combineReducers } from "@reduxjs/toolkit";
import api from "../api/api";

import contactsReducer from "../features/chat/slice/contactsSlice";
import adminAuthReducer from "./adminAuthSlice";
import chatReducer from "../features/chat/slice/chatSlice";
import roomReducer from "../features/chat/slice/roomSlice";
import sidebarReducer from "../features/chat/slice/sidebarSlice";
import userReducer from "./userSlice";

const rootReducer = combineReducers({
    contacts: contactsReducer,
    auth: adminAuthReducer,
    chat: chatReducer,
    room: roomReducer,
    sidebar: sidebarReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
});

export default rootReducer;
