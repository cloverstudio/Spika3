import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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
import AppTop from "./pages/app";
import Conftest from "./pages/app/confcall";

declare const BASE_URL: string;

function App() {
    console.log("BASE_URL", BASE_URL);
    return (
        <>
            <Router basename={BASE_URL}>
                <Switch>
                    <Route exact path="/">
                        <MockTop />
                    </Route>
                    <Route exact path="/mock/chat">
                        <MockChat />
                    </Route>
                    <Route exact path="/mock/chat_medialist">
                        <MockChatMedialist />
                    </Route>
                    <Route exact path="/mock/chat_nomessage_userlist">
                        <MockChatNomessageUserList />
                    </Route>
                    <Route exact path="/mock/chat_nomessage">
                        <MockChatNomessage />
                    </Route>
                    <Route exact path="/mock/chat_small_sidebar">
                        <MockChatSmallSidebar />
                    </Route>
                    <Route exact path="/mock/groupdetail">
                        <MockGroupDetail />
                    </Route>
                    <Route exact path="/mock/message_media">
                        <MockMessageMedia />
                    </Route>
                    <Route exact path="/mock/nochat">
                        <MockNoChat />
                    </Route>
                    <Route exact path="/mock/userlist">
                        <MockUserLIst />
                    </Route>
                    <Route exact path="/mock/conferenceCallView">
                        <MockConferenceCall />
                    </Route>
                    <Route exact path="/auth">
                        <AuthPage />
                    </Route>
                    <Route exact path="/mock/confcall">
                        <MockConfcall />
                    </Route>
                    <Route exact path="/app">
                        <AppTop />
                    </Route>
                    <Route exact path="/conftest">
                        <Conftest />
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

export default App;
