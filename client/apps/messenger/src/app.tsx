import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import RoomPage from "./pages/room";
import Confcall from "./components/confcall";
import Playground from "./pages/playground";

declare const BASE_URL: string;

export default function App(): React.ReactElement {
    const handleClose = () => {};
    return (
        <>
            <Router basename={BASE_URL}>
                <Routes>
                    <Route path="/" element={<AuthPage />} />
                    <Route path="app" element={<HomePage />} />

                    <Route path="rooms" element={<HomePage />}>
                        <Route path=":id" element={<RoomPage />} />
                    </Route>

                    <Route
                        path="confcall"
                        element={
                            <Confcall
                                roomId="test"
                                userId="test"
                                userName="test"
                                onClose={() => {}}
                            />
                        }
                    />

                    <Route path="/playground" element={<Playground />} />
                </Routes>
            </Router>
        </>
    );
}
