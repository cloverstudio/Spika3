import React, { useRef } from "react";
import { Avatar, Box, Typography } from "@mui/material";

import MessageStatusIcon from "./MessageStatusIcon";

import { useParams } from "react-router-dom";

import MessageBody from "./MessageBody";
import MessageReactions from "./MessageReactions";
import getMessageStatus from "../lib/getMessageStatus";
import ReactionOptionsPopover from "./ReactionOptionsPopover";
import DatePopover from "./DatePopover";
import MessageContectMenu, { IconConfigs } from "./MessageContectMenu";
import { OnlinePredictionTwoTone } from "@mui/icons-material";
import User from "../../../types/User";
import RoomType from "../../../../../management/src/types/Room";
import { MessageRecordType } from "../../../types/Message";
import { useShowSnackBar } from "../../../hooks/useModal";
import { CSSProperties } from "@mui/styled-engine";

type MessageRowProps = {
    id: number;
    roomId: number;
    fromUserId: number;
    seenCount: number;
    totalUserCount: number;
    deliveredCount: number;
    type: string;
    body: any;
    createdAt: any;
    nextMessageSenderId?: number;
    previousMessageSenderId?: number;
    user: User;
    data: any;
    clickedAnchor: (event: React.MouseEvent<HTMLDivElement>, messageId: number) => void;
    showMessageDetails: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
    isDeleted: boolean;
    messageRecordsData: MessageRecordType[];
    hightlight?: boolean;
};

declare const UPLOADS_BASE_URL: string;

export default function MessageRow({
    id,
    roomId,
    fromUserId,
    seenCount,
    totalUserCount,
    deliveredCount,
    type,
    body,
    nextMessageSenderId,
    previousMessageSenderId,
    createdAt,
    user,
    data,
    clickedAnchor,
    showMessageDetails,
    onDelete,
    onEdit,
    isDeleted,
    messageRecordsData,
    hightlight,
}: MessageRowProps): React.ReactElement {
    const messageReactions = messageRecordsData?.filter((mr) => mr.type === "reaction") || [];

    const users = data?.room?.users;
    const roomType = data?.room?.type;
    const sender = users?.find((u) => u.userId === fromUserId)?.user;
    const [mouseOver, setMouseOver] = React.useState<boolean>(false);
    const [showReactionMenu, setShowReactionMenu] = React.useState<boolean>(false);

    const isUsersMessage = user?.id === fromUserId;
    const isFirstMessage = fromUserId !== previousMessageSenderId;
    const isLastMessage = fromUserId !== nextMessageSenderId;

    const showSnackBar = useShowSnackBar();

    let contextMenuIcons = IconConfigs.showInfo;

    if (isDeleted) {
        contextMenuIcons = IconConfigs.showInfo;
    } else if (isUsersMessage && type === "text") {
        contextMenuIcons =
            IconConfigs.showEmociton |
            IconConfigs.showInfo |
            IconConfigs.showEdit |
            IconConfigs.showDelete;
    } else if (isUsersMessage) {
        contextMenuIcons = IconConfigs.showEmociton | IconConfigs.showInfo | IconConfigs.showDelete;
    } else {
        contextMenuIcons = IconConfigs.showEmociton | IconConfigs.showInfo;
    }

    const hightlightStyle: CSSProperties = hightlight
        ? {
              paddingTop: "10px",
              paddingBottom: "5px",
              borderTop: "2px solid #ffaaaa",
              marginBottom: "10px",
              marginTop: "10px",
          }
        : {};

    return (
        <Box
            sx={{
                position: "relative",
                ...hightlightStyle,
            }}
            onMouseLeave={() => {
                setMouseOver(false);
                setShowReactionMenu(false);
            }}
        >
            {roomType === "group" && !isUsersMessage && isFirstMessage && (
                <Typography color="text.tertiary" fontWeight={600} pl="34px" mb={0.5} mt={2}>
                    {sender?.displayName}
                </Typography>
            )}

            <Box
                display="flex"
                justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
                mb={messageReactions.length ? "1.5rem" : "0.25rem"}
            >
                <Box
                    position="relative"
                    display="inline-flex"
                    alignItems="end"
                    justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
                >
                    {roomType === "group" && !isUsersMessage && isLastMessage ? (
                        <Avatar
                            sx={{ width: 26, height: 26, mr: 1, mb: "0.375rem" }}
                            alt={sender?.displayName}
                            src={`${UPLOADS_BASE_URL}${sender?.avatarUrl}`}
                        />
                    ) : (
                        !isUsersMessage && <Box width="26px" mr={1}></Box>
                    )}

                    <Box
                        onMouseEnter={() => {
                            setMouseOver(true);
                        }}
                    >
                        <MessageBody
                            id={id}
                            type={type}
                            body={body}
                            isUsersMessage={isUsersMessage}
                        />
                    </Box>

                    <MessageReactions
                        messageReactions={messageReactions}
                        isUsersMessage={isUsersMessage}
                    />

                    {isUsersMessage && (
                        <MessageStatusIcon
                            status={getMessageStatus({ totalUserCount, deliveredCount, seenCount })}
                        />
                    )}
                    {!isUsersMessage && (
                        <Box
                            className="reaction-btn"
                            display={mouseOver ? "flex" : "none"}
                            alignItems="center"
                            position="absolute"
                            top="0"
                            bottom="0"
                            right={"-26px"}
                            sx={{ cursor: "pointer" }}
                        ></Box>
                    )}

                    <DatePopover
                        mouseOver={mouseOver}
                        isUsersMessage={isUsersMessage}
                        createdAt={createdAt}
                        handleClose={() => setMouseOver(false)}
                    />
                    <MessageContectMenu
                        iconConfig={contextMenuIcons}
                        mouseOver={mouseOver}
                        isUsersMessage={isUsersMessage}
                        handleClose={() => setMouseOver(false)}
                        handleEmoticon={(e) => {
                            setShowReactionMenu(true);
                            setMouseOver(false);
                        }}
                        handleInfo={(e) => {
                            showMessageDetails(id);
                        }}
                        handleDelete={(e) => {
                            if (onDelete) onDelete(id);
                        }}
                        handleEdit={(e) => {
                            if (onEdit) onEdit(id);
                        }}
                        handleShare={async (e) => {
                            const parsedUrl = new URL(window.location.href);

                            const url = `${parsedUrl.origin}/messenger/rooms/${roomId}/${id}`;
                            await navigator.clipboard.writeText(url);

                            showSnackBar({
                                severity: "info",
                                text: "Permalink Copied",
                            });
                        }}
                    />
                    <ReactionOptionsPopover
                        isUsersMessage={isUsersMessage}
                        show={showReactionMenu}
                        messageId={id}
                        handleClose={() => setShowReactionMenu(false)}
                    />
                </Box>
            </Box>
        </Box>
    );
}
