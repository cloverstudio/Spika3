import React from "react";
import { Popover, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
    InsertEmoticon,
    Edit,
    DeleteOutline,
    InfoOutlined,
    Share,
    DoneAll,
} from "@mui/icons-material";

export enum IconConfigs {
    showEmociton = 1,
    showInfo = 2,
    showEdit = 4,
    showDelete = 8,
}

type Props = {
    isUsersMessage: boolean;
    handleClose: () => void;
    mouseOver: boolean;
    handleEmoticon?: (e: React.MouseEvent<any>) => void;
    handleInfo?: (e: React.MouseEvent<any>) => void;
    handleEdit?: (e: React.MouseEvent<any>) => void;
    handleDelete?: (e: React.MouseEvent<any>) => void;
    handleShare?: (e: React.MouseEvent<any>) => void;
    iconConfig: IconConfigs;
};

export default function DatePopover({
    isUsersMessage,
    handleClose,
    mouseOver,
    handleEmoticon,
    handleInfo,
    handleEdit,
    handleDelete,
    handleShare,
    iconConfig,
}: Props): React.ReactElement {
    const styleModifier: any = {
        opacity: 0,
    };
    if (!isUsersMessage) styleModifier.left = "40px";
    else styleModifier.right = "40px";

    if (mouseOver) styleModifier.opacity = 1;
    const itemStyle = {
        fontSize: "1.8em",
        marginRight: "10px",
        marginLeft: "10px",
        cursor: "pointer",
        color: "#222",
        "&:hover": {
            opacity: 0.5,
        },
    };

    if (!mouseOver) return <></>;

    return (
        <Box
            sx={{
                ...{
                    position: "absolute",
                    minWidth: "100px",
                    backgroundColor: "#fff",
                    border: "2px solid #9995",
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "5px",
                    padding: "10px",
                    top: "-50px",
                    zIndex: 1000,
                },
                ...styleModifier,
            }}
        >
            {(iconConfig & IconConfigs.showEmociton) == IconConfigs.showEmociton ? (
                <InsertEmoticon
                    sx={{ ...itemStyle, ...{ color: "#7af" } }}
                    onClick={(e) => handleEmoticon(e)}
                />
            ) : null}

            {(iconConfig & IconConfigs.showInfo) == IconConfigs.showInfo ? (
                <InfoOutlined sx={{ ...itemStyle, ...{} }} onClick={(e) => handleInfo(e)} />
            ) : null}
            {(iconConfig & IconConfigs.showEdit) == IconConfigs.showEdit ? (
                <Edit sx={{ ...itemStyle, ...{} }} onClick={(e) => handleEdit(e)} />
            ) : null}
            {(iconConfig & IconConfigs.showDelete) == IconConfigs.showDelete ? (
                <DeleteOutline
                    sx={{ ...itemStyle, ...{ color: "#f33" } }}
                    onClick={(e) => handleDelete(e)}
                />
            ) : null}
            <Share sx={{ ...itemStyle, ...{} }} onClick={(e) => handleShare(e)} />
        </Box>
    );
}
