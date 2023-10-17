import React from "react";
import { Box } from "@mui/system";
import Shortcut from "@mui/icons-material/Shortcut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ModeEditOutlineOutlined from "@mui/icons-material/ModeEditOutlineOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    hideMessageOptions,
    selectMessageById,
    showDeleteModal,
    showMessageDetails,
} from "../../slices/messages";
import { setEditMessage } from "../../slices/input";
import { useShowSnackBar } from "../../../../hooks/useModal";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface Props {
    isUsersMessage: boolean;
    id: number;
    openMoreOptionsAtBottom?: boolean;
}

export default function MessageContextMoreOption({
    isUsersMessage,
    id,
    openMoreOptionsAtBottom,
}: Props) {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();
    const message = useAppSelector(selectMessageById(roomId, id));
    const showSnackBar = useShowSnackBar();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const menuOptions = [
        {
            name: "forward",
            text: "Forward message",
            icon: <Shortcut style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: () => {
                console.log("forward clicked");
            },
        },
        {
            name: "copy",
            text: "Copy",
            icon: <ContentCopy style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: async () => {
                await navigator.clipboard.writeText(message.body.text);
                dispatch(hideMessageOptions(roomId));
                showSnackBar({
                    severity: "info",
                    text: "Message Copied",
                });
            },
        },
        {
            name: "edit",
            text: "Edit",
            icon: <ModeEditOutlineOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: isUsersMessage && message.type === "text",
            onclick: () => {
                dispatch(setEditMessage({ roomId, message }));
            },
        },
        {
            name: "details",
            text: "Details",
            icon: <InfoOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: isUsersMessage,
            onclick: () => {
                dispatch(showMessageDetails({ roomId, messageId: id }));
            },
        },
        {
            name: "favorite",
            text: "Add to favorite",
            icon: <FavoriteBorderOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: () => {
                console.log("favorite clicked");
            },
        },
        {
            name: "delete",
            text: "Delete",
            icon: <DeleteOutlineOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            style: { color: "red" },
            onclick: () => {
                dispatch(showDeleteModal({ roomId, messageId: id }));
            },
        },
    ];

    const styleModifier = {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        // gap: "15px",
        backgroundColor: "#fff",
        boxShadow: "0px 1px 6px 0px rgba(0, 0, 0, 0.15)",
        padding: "0 8px",
        borderRadius: "10px",
        fontFamily: "Montserrat",
        fontWeight: 500,
        lineHeight: "normal",
        fontSize: "14px",
        minWidth: "200px",
        width: "auto",
        zIndex: 1001,
        ...(isUsersMessage
            ? { left: isMobile ? 0 : "-20px" }
            : { right: isMobile ? "-40px" : "-20px" }),
        ...(openMoreOptionsAtBottom && { top: "30px" }),
        ...(!openMoreOptionsAtBottom && { bottom: "30px" }),
    };

    return (
        <Box sx={{ ...styleModifier }}>
            {menuOptions.map((option) => {
                if (!option.show) return null;
                return (
                    <Box
                        key={option.name}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 8px",
                            gap: "8px",

                            "&:last-child": { marginBottom: "8px" },
                            "&:first-of-type": { marginTop: "8px" },

                            "&:hover": {
                                backgroundColor: "text.tertiary",
                                cursor: "pointer",
                                width: "100%",
                                borderRadius: "10px",
                            },
                            ...option.style,
                        }}
                        onClick={option.onclick}
                    >
                        {option.icon}
                        <Box marginRight="8px">{option.text}</Box>
                    </Box>
                );
            })}
        </Box>
    );
}
