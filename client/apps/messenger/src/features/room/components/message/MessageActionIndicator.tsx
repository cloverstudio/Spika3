import React from "react";
import { Box } from "@mui/material";
import useStrings from "../../../../hooks/useStrings";

interface Props {
    isUsersMessage: boolean;
    actionTitle: string;
    icon?: React.ReactNode;
    styles?: React.CSSProperties;
}

export default function MessageActionIndicator({
    isUsersMessage,
    actionTitle,
    icon,
    styles,
}: Props) {
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
                ...(styles ? styles : {}),
            }}
        >
            {icon && icon}
            <span
                style={{
                    color: "#9AA0A6",
                    fontFamily: "Montserrat",
                    fontSize: "10px",
                    fontStyle: "italic",
                    fontWeight: 500,
                }}
            >
                {actionTitle}
            </span>
        </Box>
    );
}
