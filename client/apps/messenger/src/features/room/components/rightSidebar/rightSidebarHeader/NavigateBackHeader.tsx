import React from "react";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import useStrings from "../../../../../hooks/useStrings";

import { ActiveTabType, setActiveTab } from "../../../slices/rightSidebar";
import { useAppDispatch } from "../../../../../hooks";

interface Props {
    headerTitle: string;
    activeTab?: ActiveTabType;
}

export default function NavigateBackHeader({ headerTitle, activeTab }: Props) {
    const dispatch = useAppDispatch();

    return (
        <>
            <IconButton
                onClick={() => dispatch(setActiveTab(activeTab || "details"))}
                style={{ borderRadius: "10px" }}
            >
                <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
            </IconButton>
            <Typography variant="h6">{headerTitle}</Typography>
        </>
    );
}
