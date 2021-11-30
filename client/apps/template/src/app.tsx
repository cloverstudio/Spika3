import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import HelloWorld from "./pages/index";

declare var BASE_URL: string;

function App() {
    console.log("BASE_URL", BASE_URL);
    return (
        <>
            <Router basename={BASE_URL}>
                <Switch>
                    <Route exact path="/">
                        <HelloWorld />
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

export default App;
