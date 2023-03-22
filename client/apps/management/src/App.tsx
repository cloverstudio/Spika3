import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";

declare const BASE_URL: string;

export default function App(): React.ReactElement {
    return (
        <>
            <Router basename={BASE_URL}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Router>
        </>
    );
}
