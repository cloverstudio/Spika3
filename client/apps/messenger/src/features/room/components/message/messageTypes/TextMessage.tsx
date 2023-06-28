import React from "react";
import { Box } from "@mui/material";
import UserType from "../../../../../types/User";
import filterText from "../../../lib/filterText";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { selectChangeTerm } from "../../../slices/messages";

export default function TextMessage({
    isUsersMessage,
    body,
    sender,
    deleted,
}: {
    body: any;
    isUsersMessage: boolean;
    sender?: UserType;
    deleted?: boolean;
}) {
    const roomId = parseInt(useParams().id || "");
    const changeTerm = useSelector(selectChangeTerm({ text: filterText(body.text), roomId }));
    const backgroundColor = deleted
        ? "background.transparent"
        : isUsersMessage
        ? "common.myMessageBackground"
        : "background.paper";

    const filteredText = changeTerm ? changeTerm.to : filterText(body.text);

    return (
        <Box
            component={"div"}
            sx={{
                minWidth: "50px",
                maxWidth: "100%",
                backgroundColor: backgroundColor,
                borderRadius: "0.3rem",
                padding: "0.4rem",
                cursor: "pointer",
                color: deleted ? "text.tertiary" : "common.darkBlue",
                lineHeight: "1.2rem",
                whiteSpace: "pre-wrap",
                margin: "0px",
                fontSize: "0.95rem",
                border: deleted ? "1px solid #C9C9CA" : "none",
            }}
        >
            {sender && (
                <Box mb={1} fontWeight="medium">
                    {sender.displayName}
                </Box>
            )}
            <Box
                sx={{ overflowWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: filteredText }}
            />
        </Box>
    );
}
