import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/system";
import Shortcut from "@mui/icons-material/Shortcut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ModeEditOutlineOutlined from "@mui/icons-material/ModeEditOutlineOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    hideMessageOptions,
    selectMessageById,
    showDeleteModal,
    showForwardMessageModal,
    showMessageDetails,
} from "../../slices/messages";
import { setEditMessage } from "../../slices/input";
import { useShowSnackBar } from "../../../../hooks/useModal";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useMessageContainerContext } from "./MessagesContainer";
import useStrings from "../../../../hooks/useStrings";

interface Props {
    isUsersMessage: boolean;
    id: number;
    setMouseOver: (boolean) => void;
}

export default function MessageContextMoreOption({ isUsersMessage, id, setMouseOver }: Props) {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();
    const message = useAppSelector(selectMessageById(roomId, id));
    const showSnackBar = useShowSnackBar();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isDarkTheme = theme.palette.mode === "dark";

    const menuRef = useRef(null);

    const strings = useStrings();

    const { messageContainerRef } = useMessageContainerContext();

    const [positionBottom, setPositionBottom] = useState(null);
    const [positionTop, setPositionTop] = useState(null);

    useEffect(() => {
        if (!messageContainerRef.current || !menuRef.current) return;

        const messageContainerRect = messageContainerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();

        if (menuRect.top + menuRect.height > messageContainerRect.height) {
            setPositionBottom("34px");
        } else if (menuRect.top - menuRect.height < 0) {
            setPositionTop("34px");
        } else setPositionTop("34px");

        return () => {
            setPositionBottom(null);
            setPositionTop(null);
        };
    }, []);

    const menuOptions = [
        {
            name: "forward",
            text: strings.forwardMessage,
            icon: <Shortcut style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: () => {
                dispatch(showForwardMessageModal({ roomId, messageId: id }));
            },
        },
        {
            name: "copy",
            text: strings.copy,
            icon: <ContentCopy style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: async () => {
                await navigator.clipboard.writeText(message.body.text);
                dispatch(hideMessageOptions(roomId));
                showSnackBar({
                    severity: "info",
                    text: strings.messageCopied,
                });
                setMouseOver(false);
            },
        },
        {
            name: "copyPermalink",
            text: strings.copyPermalink,
            icon: <ShareOutlinedIcon style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: async () => {
                const parsedUrl = new URL(window.location.href);

                const url = `${parsedUrl.origin}/messenger/rooms/${roomId}?messageId=${id}`;
                await navigator.clipboard.writeText(url);
                dispatch(hideMessageOptions(roomId));
                showSnackBar({
                    severity: "info",
                    text: strings.permalinkCopied,
                });
                setMouseOver(false);
            },
        },
        {
            name: "edit",
            text: strings.edit,
            icon: <ModeEditOutlineOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: isUsersMessage && message.type === "text" && !message.isForwarded,
            onclick: () => {
                dispatch(setEditMessage({ roomId, message }));
            },
        },
        {
            name: "details",
            text: strings.details,
            icon: <InfoOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            onclick: () => {
                dispatch(showMessageDetails({ roomId, messageId: id }));
            },
        },
        {
            name: "favorite",
            text: strings.addToFavorite,
            icon: <FavoriteBorderOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: false, // functionality not implemented
            onclick: () => {
                console.log("favorite clicked");
            },
        },
        {
            name: "delete",
            text: strings.delete,
            icon: <DeleteOutlineOutlined style={{ width: "14px", height: "14px" }} />,
            onClick: () => {},
            show: true,
            style: { color: "error.main" },
            onclick: () => {
                dispatch(showDeleteModal({ roomId, messageId: id }));
            },
        },
    ];

    const styleModifier = {
        visibility: !positionBottom && !positionTop ? "hidden" : "visible",
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDarkTheme ? "background.paper" : "#fff",
        boxShadow: "0px 1px 6px 0px rgba(0, 0, 0, 0.15)",
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
        ...(positionTop && { top: positionTop }),
        ...(positionBottom && { bottom: positionBottom }),
    };

    return (
        <Box sx={{ ...styleModifier }} ref={menuRef}>
            {menuOptions.map((option) => {
                if (!option.show) return null;
                return (
                    <Box
                        key={option.name}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 16px",
                            gap: "8px",

                            "&:last-child": { marginBottom: "8px" },
                            "&:first-of-type": { marginTop: "8px" },

                            "&:hover": {
                                backgroundColor: "rgba(201, 201, 202, 0.5);",
                                cursor: "pointer",
                                width: "100%",
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
