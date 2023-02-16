import React from "react";
import SendingIcon from "../../../../assets/sending-icon.svg";
import SentIcon from "../../../../assets/sent-icon.svg";
import DeliveredIcon from "../../../../assets/delivered-icon.svg";
import SeenIcon from "../../../../assets/seen-icon.svg";
import FailedIcon from "../../../../assets/failed-icon.svg";
import { Box, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { removeMessage, resendMessage } from "../../slices/messages";
import { useParams } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import useStrings from "../../../../hooks/useStrings";
import Delete from "@mui/icons-material/DeleteOutline";
import UploadOutlined from "@mui/icons-material/UploadRounded";

type StatusIconProps = {
    status: string;
    id: number;
};

export default function StatusIcon({ status, id }: StatusIconProps): React.ReactElement {
    const strings = useStrings();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const roomId = parseInt(useParams().id || "");
    const dispatch = useDispatch();

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (status === "failed") {
            setAnchorEl(event.currentTarget);
        }
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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

    const handleResend = () => {
        dispatch(resendMessage({ roomId, messageId: id }));
        handleClose();
    };

    const handleRemove = () => {
        dispatch(removeMessage({ roomId, id }));
        handleClose();
    };

    return (
        <Box alignSelf="end">
            <Box onClick={handleClick} sx={{ cursor: isFailed ? "pointer" : "auto" }}>
                <img src={Icon} width="12px" style={{ marginLeft: "0.375rem" }} />
            </Box>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleResend}>
                    <Box display="flex" gap={1}>
                        <UploadOutlined />
                        <Typography>{strings.resend}</Typography>
                    </Box>
                </MenuItem>
                <MenuItem onClick={handleRemove}>
                    <Box display="flex" gap={1} color="red">
                        <Delete />
                        <Typography>{strings.delete}</Typography>
                    </Box>
                </MenuItem>
            </Menu>
        </Box>
    );
}
