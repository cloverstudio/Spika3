import React from "react";
import SendingIcon from "../../../../../assets/sending-icon.svg";
import SentIcon from "../../../../../assets/sent-icon.svg";
import DeliveredIcon from "../../../../../assets/delivered-icon.svg";
import SeenIcon from "../../../../../assets/seen-icon.svg";
import PendingIcon from "../../../../../assets/pending-icon.svg";
import FailedIcon from "../../../../../assets/failed-icon.svg";
import { Box } from "@mui/material";

type StatusIconProps = {
    status: string;
};

export default function StatusIcon({ status }: StatusIconProps): React.ReactElement {
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

            case "sending": {
                return PendingIcon;
            }

            case "failed": {
                return FailedIcon;
            }

            default: {
                return SentIcon;
            }
        }
    };

    const Icon = getIcon(status);

    return (
        <Box alignSelf="end">
            <img src={Icon} width="12px" style={{ marginLeft: "0.375rem" }} />
        </Box>
    );
}
