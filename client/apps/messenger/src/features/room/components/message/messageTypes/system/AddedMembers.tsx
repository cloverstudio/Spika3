import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks";
import { showNoteEditModal } from "../../../../slices/rightSidebar";
import { dynamicBaseQuery } from "../../../../../../api/api";
import { useCreateRoomMutation } from "../../../../api/room";

export default function AddedMembersSystemMessage({
    body,
    createdAt,
}: {
    body: {
        text: string;
        type: string;
        subject: string;
        objects: string[];
        objectIds: number[];
    };

    createdAt: number;
}): React.ReactElement {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [createRoom] = useCreateRoomMutation();
    const userId = useAppSelector((state) => state.user.id);

    const isSomeNoteEditing =
        useAppSelector((state) => state.rightSidebar.activeTab) === "editNote";

    const defaultHandleUserClick = async (userId: number) => {
        if (isSomeNoteEditing) {
            dispatch(showNoteEditModal());
            return;
        }

        try {
            const res = await dynamicBaseQuery(`/messenger/rooms/users/${userId}`);

            const room = res.data.room;

            if (room.id) {
                navigate(`/rooms/${room.id}`);
            }
        } catch (error) {
            const created = await createRoom({
                userIds: [userId],
            }).unwrap();

            if (created.room.id) {
                navigate(`/rooms/${created.room.id}?showBotInfo=1`);
            }
        }
    };

    const time = new Date(createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });
    return (
        <Box textAlign="center" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontStyle="italic">
                    {time}
                </Box>{" "}
                <Box component="span" fontWeight="bold">
                    {body.subject}
                </Box>{" "}
                added{" "}
                <Box component="span" fontWeight="bold">
                    {body.objects?.map((o, i) => {
                        const isLastItem = i === body.objects.length - 1;
                        const objectId = body.objectIds[i];
                        const isObjectMe = objectId === userId;
                        return (
                            <span
                                key={objectId || i}
                                onClick={() => {
                                    if (!objectId || isObjectMe) return;
                                    defaultHandleUserClick(objectId);
                                }}
                                style={{ cursor: isObjectMe ? "default" : "pointer" }}
                            >
                                {o}
                                {isLastItem ? "" : ", "}
                            </span>
                        );
                    })}
                </Box>{" "}
                to the group
            </Typography>
        </Box>
    );
}
