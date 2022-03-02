import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

declare const BASE_URL: string;

function App(): React.ReactElement {
    return (
        <Router basename={BASE_URL}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="user">
                    <Route index element={<User />} />
                    <Route path="add" element={<UserAdd />} />
                    <Route path="detail/:id" element={<UserDetail />} />
                    <Route path="edit/:id" element={<UserEdit />} />
                    <Route path="delete/:id" element={<UserDelete />} />
                    <Route path=":id/devices" element={<Device key="user_devices" />} />
                    <Route path=":userId/room" element={<Room key="user_rooms" />} />
                </Route>
                <Route path="device">
                    <Route index element={<Device />} />
                    <Route path="add" element={<DeviceAdd />} />
                    <Route path="detail/:id" element={<DeviceDetail />} />
                    <Route path="edit/:id" element={<DeviceEdit />} />
                    <Route path="delete/:id" element={<DeviceDelete />} />
                </Route>
                <Route path="room">
                    <Route index element={<Room />} />
                    <Route path="add" element={<RoomAdd />} />
                    <Route path="detail/:id" element={<RoomDetail />} />
                    <Route path="edit/:id" element={<RoomEdit />} />
                    <Route path="delete/:id" element={<RoomDelete />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
