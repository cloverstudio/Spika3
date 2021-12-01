import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard/index";
import User from "./pages/user/index";
import UserAdd from "./pages/user/add";
import UserDetail from "./pages/user/detail";
import UserEdit from "./pages/user/edit";
import UserDelete from "./pages/user/delete";
import Device from "./pages/device/index";
import DeviceAdd from "./pages/device/add";
import DeviceDetail from "./pages/device/detail";
import DeviceEdit from "./pages/device/edit";
import DeviceDelete from "./pages/device/delete";
import Room from "./pages/room/index";
import RoomAdd from "./pages/room/add";
import RoomDetail from "./pages/room/detail";
import RoomEdit from "./pages/room/edit";
import RoomDelete from "./pages/room/delete";
declare var BASE_URL: string;

function App() {
    return (
        <>
            <Router basename={BASE_URL}>
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
                    <Route exact path="/user/:id/devices">
                        <Device key="user_devices" />
                    </Route>
                    <Route exact path="/user/:userId/room">
                        <Room key="user_rooms" />
                    </Route>
                    <Route exact path="/device">
                        <Device />
                    </Route>
                    <Route exact path="/device/add">
                        <DeviceAdd />
                    </Route>
                    <Route exact path="/device/detail/:id">
                        <DeviceDetail />
                    </Route>
                    <Route exact path="/device/edit/:id">
                        <DeviceEdit />
                    </Route>
                    <Route exact path="/device/delete/:id">
                        <DeviceDelete />
                    </Route>
                    <Route exact path="/room">
                        <Room />
                    </Route>
                    <Route exact path="/room/add">
                        <RoomAdd />
                    </Route>
                    <Route exact path="/room/detail/:id">
                        <RoomDetail />
                    </Route>
                    <Route exact path="/room/edit/:id">
                        <RoomEdit />
                    </Route>
                    <Route exact path="/room/delete/:id">
                        <RoomDelete />
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

export default App;
