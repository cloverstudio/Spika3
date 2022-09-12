import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import RoomPage from "./pages/room";
import Confcall from "./pages/confcall";
import Playground from "./pages/playground";

declare const BASE_URL: string;

export default function App(): React.ReactElement {
    const handleClose = () => {};
    return (
        <>
            <Router basename={BASE_URL}>
                <Routes>
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/confcall" element={<Confcall />} />
                    <Route path="app" element={<HomePage />} />

                    <Route path="rooms" element={<HomePage />}>
                        <Route path=":id" element={<RoomPage />} />
                        <Route path=":id/:messageId" element={<RoomPage />} />
                        <Route path=":id/call/lobby/:media" element={<RoomPage />} />
                        <Route path=":id/call" element={<RoomPage />} />
                    </Route>
                    <Route path="/playground" element={<Playground />} />
                </Routes>
            </Router>
        </>
    );
}
