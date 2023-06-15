import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";
import React from "react";

type NewMessageAlertProps = {
    newMessages: number;
    onScrollDown: (arg: ScrollBehavior) => void;
};

export default function NewMessageAlert({
    newMessages,
    onScrollDown,
}: NewMessageAlertProps): React.ReactElement {
    return (
        <Box position="absolute" width="100%" textAlign="center" zIndex={1}>
            <Box display="inline-block" onClick={() => onScrollDown("smooth")}>
                <Box
                    bgcolor="common.myMessageBackground"
                    borderRadius="0.625rem"
                    display="flex"
                    zIndex={9999}
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
