import React from "react";
import SendingIcon from "../../../../../assets/sending-icon.svg";
import SentIcon from "../../../../../assets/sent-icon.svg";
import DeliveredIcon from "../../../../../assets/delivered-icon.svg";
import SeenIcon from "../../../../../assets/seen-icon.svg";
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

            default: {
                return SentIcon;
            }
        }
    };

    const Icon = getIcon(status);

    return (
        <Box alignSelf="end">
            <img src={Icon} style={{ marginLeft: "0.375rem", marginBottom: "0.375rem" }} />
        </Box>
    );
}
