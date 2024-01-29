import React from "react";
import { Box, Typography } from "@mui/material";
import { useAppDispatch } from "../../../../../../hooks";
import { setActiveNoteId, showRightSidebar } from "../../../../slices/rightSidebar";

export default function CreatedNoteSystemMessage({
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
    const time = new Date(createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });

    const dispatch = useAppDispatch();
    return (
        <Box textAlign="center" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontStyle="italic">
                    {time}
                </Box>{" "}
                <Box component="span" fontWeight="bold">
                    {body.subject}
                </Box>{" "}
                created note{" "}
                <Box component="span" fontWeight="bold">
                    {body.objects?.map((o, i) => {
                        const objectId = body.objectIds[i];
                        return (
                            <span
                                key={objectId || i}
                                onClick={() => {
                                    if (!objectId) return;
                                    dispatch(showRightSidebar());
                                    dispatch(setActiveNoteId(objectId));
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {o}
                            </span>
                        );
                    })}
                </Box>
            </Typography>
        </Box>
    );
}
