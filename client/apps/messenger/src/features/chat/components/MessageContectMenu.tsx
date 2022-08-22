import React from "react";
import { Popover, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
    InsertEmoticon,
    Edit,
    DeleteOutline,
    InfoOutlined,
    Close,
    DoneAll,
} from "@mui/icons-material";

type Props = {
    isUsersMessage: boolean;
    handleClose: () => void;
    mouseOver: boolean;
    handleEmoticon?: (e: React.MouseEvent<any>) => void;
    handleInfo?: (e: React.MouseEvent<any>) => void;
    handleEdit?: (e: React.MouseEvent<any>) => void;
    handleDelete?: (e: React.MouseEvent<any>) => void;
};

export default function DatePopover({
    isUsersMessage,
    handleClose,
    mouseOver,
    handleEmoticon,
    handleInfo,
    handleEdit,
    handleDelete,
}: Props): React.ReactElement {
    const styleModifier: any = {
        opacity: 0,
    };
    if (!isUsersMessage) styleModifier.left = "35px";
    else styleModifier.right = "50px";

    if (mouseOver) styleModifier.opacity = 1;
    const itemStyle = {
        fontSize: "2.0em",
        marginRight: "10px",
        marginLeft: "10px",
        cursor: "pointer",
        color: "#222",
        "&:hover": {
            opacity: "0.5",
        },
    };
    return (
        <Box
            sx={{
                ...{
                    transition: "opacity 0.2s ease",
                    minWidth: "100px",
                    backgroundColor: "#fff",
                    border: "2px solid #9995",
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "5px",
                    padding: "10px",
                    position: "absolute",
                    bottom: "-40px",
                    zIndex: 1000,
                },
                ...styleModifier,
            }}
        >
            <InsertEmoticon
                sx={{ ...itemStyle, ...{ color: "#7af" } }}
                onClick={(e) => handleEmoticon(e)}
            />
            <InfoOutlined sx={{ ...itemStyle, ...{} }} onClick={(e) => handleInfo(e)} />
            {isUsersMessage ? (
                <Edit sx={{ ...itemStyle, ...{} }} onClick={(e) => handleEdit(e)} />
            ) : null}
            {isUsersMessage ? (
                <DeleteOutline
                    sx={{ ...itemStyle, ...{ color: "#f33" } }}
                    onClick={(e) => handleDelete(e)}
                />
            ) : null}
        </Box>
    );
}
