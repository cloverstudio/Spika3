import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MockTop from "./pages/mocks";
import MockChat from "./pages/mocks/chat";
import MockChatMedialist from "./pages/mocks/chatMedialist";
import MockChatNomessageUserList from "./pages/mocks/chatNomessageUserList";
import MockChatNomessage from "./pages/mocks/chatNomessage";
import MockChatSmallSidebar from "./pages/mocks/chatSmallSidebar";
import MockGroupDetail from "./pages/mocks/groupDetail";
import MockMessageMedia from "./pages/mocks/messageMedia";
import MockNoChat from "./pages/mocks/noChat";
import MockUserLIst from "./pages/mocks/userLIst";
import MockConferenceCall from "./pages/mocks/conferenceCallView";
import MockConfcall from "./pages/mocks/confcall";
import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import RoomPage from "./pages/room";

declare const BASE_URL: string;

export default function App(): React.ReactElement {
    return (
        <>
            <Router basename={BASE_URL}>
                <Routes>
                    <Route path="/" element={<AuthPage />} />
                    <Route path="app" element={<HomePage />} />

                    <Route path="rooms" element={<HomePage />}>
                        <Route path=":id" element={<RoomPage />} />
                    </Route>

                    <Route path="mock">
                        <Route index element={<MockTop />} />
                        <Route path="chat" element={<MockChat />} />
                        <Route path="chat_medialist" element={<MockChatMedialist />} />
                        <Route
                            path="chat_nomessage_userlist"
                            element={<MockChatNomessageUserList />}
                        />
                        <Route path="chat_nomessage" element={<MockChatNomessage />} />
                        <Route path="chat_small_sidebar" element={<MockChatSmallSidebar />} />
                        <Route path="groupdetail" element={<MockGroupDetail />} />
                        <Route path="message_media" element={<MockMessageMedia />} />
                        <Route path="nochat" element={<MockNoChat />} />
                        <Route path="userlist" element={<MockUserLIst />} />
                        <Route path="conferenceCallView" element={<MockConferenceCall />} />
                        <Route path="confcall" element={<MockConfcall />} />
                    </Route>
                </Routes>
            </Router>
        </>
    );
}
