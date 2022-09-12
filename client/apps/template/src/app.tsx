import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HelloWorld from "./pages/index";

declare var BASE_URL: string;

function App() {
    return (
        <>
            <Router basename={BASE_URL}>
                <Routes>
                    <Route path="/" element={<HelloWorld />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
