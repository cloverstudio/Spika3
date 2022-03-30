import React from "react";
import SendingIcon from "../../../assets/sending-icon.svg";
import SentIcon from "../../../assets/sent-icon.svg";
import DeliveredIcon from "../../../assets/delivered-icon.svg";
import SeenIcon from "../../../assets/seen-icon.svg";

type MessageStatusIconProps = {
    status: string;
};

export default function MessageStatusIcon({ status }: MessageStatusIconProps): React.ReactElement {
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

    return <img src={Icon} style={{ marginBottom: "0.375rem" }} />;
}
