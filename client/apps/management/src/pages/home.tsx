import React from "react";
import Base from "@/components/Base";
import { Box } from "@mui/material";
import LeftSidebar from "@/components/LeftSidebar";
import { Outlet, redirect } from "react-router-dom";
import RightSidebar from "@/components/RightSidebar";
import { dynamicBaseQuery } from "@/api";

export default function Home(): React.ReactElement {
    const rightSidebarOpen = false;

    return (
        <Base>
            <Box
                display="grid"
                sx={{
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: rightSidebarOpen ? "360px 4fr 360px" : "360px 2fr",
                        xl: rightSidebarOpen ? "360px 3fr 640px" : "360px 4fr",
                    },
                }}
            >
                <LeftSidebar />
                <Outlet />

                {rightSidebarOpen ? <RightSidebar /> : null}
            </Box>
        </Base>
    );
}

export async function homeLoader() {
    const res = await dynamicBaseQuery("/management/counts");

    if (res.data.status !== "success") {
        return redirect("/login");
    }

    const data = res.data.data;

    const { users, groups } = data;

    return {
        count: {
            users,
            groups,
        },
    };
}
