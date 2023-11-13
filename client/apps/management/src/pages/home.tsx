import React from "react";
import Base from "@/components/Base";
import { Box } from "@mui/material";
import LeftSidebar from "@/components/LeftSidebar";
import { Outlet, redirect } from "react-router-dom";
import { dynamicBaseQuery } from "@/api";

export default function Home(): React.ReactElement {
    return (
        <Base>
            <Box
                display="grid"
                sx={{
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "360px auto",
                    },
                }}
            >
                <LeftSidebar />
                <Outlet />
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

    const { users, groups, bots } = data;

    return {
        count: {
            users,
            groups,
            bots,
        },
    };
}
