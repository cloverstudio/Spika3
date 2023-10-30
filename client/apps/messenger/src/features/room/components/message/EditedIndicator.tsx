import React from "react";
import ModeEditOutlineOutlined from "@mui/icons-material/ModeEditOutlineOutlined";
import { Box } from "@mui/material";
import useStrings from "../../../../hooks/useStrings";

interface Props {
    isUsersMessage: boolean;
}

export default function EditedIndicator({ isUsersMessage }: Props) {
    const strings = useStrings();
    return (
        <Box
            sx={{
                position: "absolute",
                ...(isUsersMessage
                    ? { right: "100%", marginRight: "8px" }
                    : { left: "100%", marginLeft: "8px" }),
                top: "53%",
                transform: "translateY(-53%)",
                display: "flex",
            }}
        >
            <ModeEditOutlineOutlined style={{ width: "16px", height: "16px", color: "#9AA0A6" }} />
            <span
                style={{
                    color: "#9AA0A6",
                    fontFamily: "Montserrat",
                    fontSize: "10px",
                    fontStyle: "italic",
                    fontWeight: 500,
                }}
            >
                {strings.edited}
            </span>
        </Box>
    );
}
