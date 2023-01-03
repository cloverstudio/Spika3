import React from "react";
import SendingIcon from "../../../../assets/sending-icon.svg";
import SentIcon from "../../../../assets/sent-icon.svg";
import DeliveredIcon from "../../../../assets/delivered-icon.svg";
import SeenIcon from "../../../../assets/seen-icon.svg";
import FailedIcon from "../../../../assets/failed-icon.svg";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { resendMessage, selectMessageById } from "../../slices/messages";
import { useParams } from "react-router-dom";

type StatusIconProps = {
    status: string;
    id: number;
};

export default function StatusIcon({ status, id }: StatusIconProps): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const message = useSelector(selectMessageById(roomId, id));
    const dispatch = useDispatch();

    const getIcon = (status: string) => {
        switch (status) {
            case "sending": {
                return SendingIcon;
            }

            case "sent": {
                return SentIcon;
            }

            case "delivered": {
                return DeliveredIcon;
            }

            case "seen": {
                return SeenIcon;
            }

            case "failed": {
                return FailedIcon;
            }

            default: {
                return SentIcon;
            }
        }
    };

    const isFailed = status === "failed";

    const Icon = getIcon(status);

    const handleClick = () => {
        if (status === "failed") {
            dispatch(resendMessage({ roomId, messageId: id }));
        }
    };

    return (
        <Box alignSelf="end" onClick={handleClick} sx={{ cursor: isFailed ? "pointer" : "auto" }}>
            <img src={Icon} width="12px" style={{ marginLeft: "0.375rem" }} />
        </Box>
    );
}
