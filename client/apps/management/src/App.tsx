import React from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "@/pages/login";
import HomePage, { homeLoader } from "@/pages/home";
import UsersPage from "@/pages/users";
import GroupsPage from "@/pages/groups";

declare const BASE_URL: string;

const router = createBrowserRouter(
    [
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/",
            element: <HomePage />,
            loader: homeLoader,
            children: [
                {
                    path: "users",
                    element: <UsersPage />,
                },
                {
                    path: "groups",
                    element: <GroupsPage />,
                },
            ],
        },
    ],
    { basename: BASE_URL }
);

export default function App(): React.ReactElement {
    return <RouterProvider router={router} />;
}
