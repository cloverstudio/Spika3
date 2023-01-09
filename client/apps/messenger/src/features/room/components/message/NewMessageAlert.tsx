import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";
import React from "react";

type NewMessageAlertProps = {
    newMessages: number;
    onScrollDown: () => void;
};

export default function NewMessageAlert({
    newMessages,
    onScrollDown,
}: NewMessageAlertProps): React.ReactElement {
    return (
        <Box position="absolute" width="100%" textAlign="center">
            <Box display="inline-block" onClick={onScrollDown}>
                <Box
                    bgcolor="common.myMessageBackground"
                    borderRadius="0.625rem"
                    display="flex"
                    m={0.5}
                    p={1}
                    sx={{ cursor: "pointer" }}
                >
                    <Box>{`${newMessages} new message${newMessages > 1 ? "s" : ""}`}</Box>
                    <ExpandMore />
                </Box>
            </Box>
        </Box>
    );
}
