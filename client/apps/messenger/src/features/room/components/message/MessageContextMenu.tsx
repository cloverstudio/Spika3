import React, { useEffect, useRef } from "react";
import { Box } from "@mui/system";
import InsertEmoticon from "@mui/icons-material/InsertEmoticon";
import MoreVert from "@mui/icons-material/MoreVert";
import Reply from "@mui/icons-material/Reply";
import DatePopover from "./DatePopover";
import { useSelector } from "react-redux";
import {
    hideMessageOptions,
    selectShowMessageOptions,
    showMessageOptions,
} from "../../slices/messages";
import MessageContextMoreOption from "./MessageContextMoreOption";
import { useAppDispatch } from "../../../../hooks";

export enum IconConfigs {
    showEmoticon = 1,
    showInfo = 2,
    showEdit = 4,
    showDelete = 8,
    showReply = 16,
}

type Props = {
    isUsersMessage: boolean;
    mouseOver: boolean;
    createdAt: number;
    handleEmoticon?: (e: React.MouseEvent<any>) => void;
    handleShare?: (e: React.MouseEvent<any>) => void;
    handleReply?: (e: React.MouseEvent<any>) => void;
    iconConfig: IconConfigs;
    id: number;
    roomId: number;
    setShowReactionMenu: (boolean) => void;
    openMoreOptionsAtBottom?: boolean;
};

export default function MessageContextMenu({
    isUsersMessage,
    mouseOver,
    handleEmoticon,
    handleReply,
    handleShare,
    iconConfig,
    createdAt,
    id,
    roomId,
    setShowReactionMenu,
    openMoreOptionsAtBottom,
}: Props): React.ReactElement {
    const itemStyle = {
        cursor: "pointer",
        "&:hover": {
            opacity: 0.5,
        },
    };
    const areOptionsShown = useSelector(selectShowMessageOptions(roomId, id));
    const optionsRef = useRef(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!mouseOver) {
            dispatch(hideMessageOptions(roomId));
        }
    }, [mouseOver]);

    if (!mouseOver) return null;
    return (
        <Box
            sx={{
                position: "absolute",
                display: "flex",
                flexDirection: isUsersMessage ? "row-reverse" : "row",
                alignItems: "center",
                gap: "8px",
                top: "53%",
                ...(isUsersMessage ? { right: "100%" } : { left: "100%" }),
                transform: "translateY(-53%)",
                zIndex: 1000,
            }}
        >
            <DatePopover
                mouseOver={mouseOver}
                isUsersMessage={isUsersMessage}
                createdAt={createdAt}
            />

            {(iconConfig & IconConfigs.showReply) === IconConfigs.showReply && (
                <Reply
                    sx={{ ...itemStyle, ...{ color: "text.tertiary" } }}
                    onClick={(e) => handleReply(e)}
                />
            )}

            {(iconConfig & IconConfigs.showEmoticon) === IconConfigs.showEmoticon && (
                <InsertEmoticon
                    sx={{ ...itemStyle, ...{ color: "text.tertiary" } }}
                    onClick={(e) => handleEmoticon(e)}
                />
            )}
            <Box display="flex">
                <MoreVert
                    sx={{ ...itemStyle, ...{ color: "text.tertiary" } }}
                    onClick={() => {
                        setShowReactionMenu(false);
                        if (areOptionsShown) {
                            dispatch(hideMessageOptions(roomId));
                        } else {
                            dispatch(showMessageOptions({ roomId, messageId: id }));
                        }
                    }}
                />

                {areOptionsShown && (
                    <div ref={optionsRef}>
                        <MessageContextMoreOption
                            isUsersMessage={isUsersMessage}
                            id={id}
                            openMoreOptionsAtBottom={openMoreOptionsAtBottom}
                        />
                    </div>
                )}
            </Box>
        </Box>
    );
}
