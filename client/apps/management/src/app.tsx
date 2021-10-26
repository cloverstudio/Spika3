import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard/index";
import User from "./pages/user/index";
import UserAdd from "./pages/user/add";
import UserDetail from "./pages/user/detail";
import UserEdit from "./pages/user/edit";
import UserDelete from "./pages/user/delete";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>
          <Route exact path="/user">
            <User />
          </Route>
          <Route exact path="/user/add">
            <UserAdd />
          </Route>
          <Route exact path="/user/detail/:id">
            <UserDetail />
          </Route>
          <Route exact path="/user/edit/:id">
            <UserEdit />
          </Route>
          <Route exact path="/user/delete/:id">
            <UserDelete />
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
