import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { DragIndicator, FullscreenExit, Fullscreen } from "@mui/icons-material";
import Draggable from "react-draggable";
import { useSelector } from "react-redux";
import { selectCallUrl } from "../slices/callIframe";

declare const API_BASE_URL: string;

export default function CallIframe() {
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    const callUrl = useSelector(selectCallUrl);

    const handleToggleFullScreen = () => {
        if (!isFullScreen) {
            setDragPosition({ x: 0, y: 0 });
        }
        setIsFullScreen((prev) => !prev);
    };

    return (
        <Draggable
            handle="#drag-handle"
            disabled={isFullScreen}
            position={isFullScreen ? { x: 0, y: 0 } : dragPosition}
            onStop={(e, data) => setDragPosition({ x: data.x, y: data.y })}
            bounds="parent"
        >
            <Box
                sx={{
                    position: "fixed",
                    width: isFullScreen ? "100%" : "400px",
                    height: isFullScreen ? "100%" : "400px",
                    right: isFullScreen ? 0 : "48px",
                    bottom: isFullScreen ? 0 : "48px",
                    background: "rgba(0, 0, 0, 0.05)",
                    backdropFilter: "blur(4px)",
                    zIndex: 500,
                    border: !isFullScreen && "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: !isFullScreen && "8px",
                    overflow: "hidden",
                }}
            >
                <Stack
                    direction="row"
                    justifyContent={isFullScreen ? "flex-end" : "space-between"}
                    alignItems="center"
                    sx={{
                        padding: "4px 12px",
                        ...(!isFullScreen && { cursor: "move" }),
                    }}
                    id="drag-handle"
                    onDoubleClick={handleToggleFullScreen}
                >
                    {!isFullScreen && <DragIndicator />}
                    {isFullScreen ? (
                        <FullscreenExit
                            sx={{ cursor: "pointer" }}
                            onClick={handleToggleFullScreen}
                        />
                    ) : (
                        <Fullscreen sx={{ cursor: "pointer" }} onClick={handleToggleFullScreen} />
                    )}
                </Stack>
                <iframe
                    src={`${callUrl}&leaveApiUrl=${API_BASE_URL}/call/leave`}
                    allow="camera; microphone"
                    style={{
                        width: "100%",
                        height: "calc(100% - 32px)",
                        border: "none",
                    }}
                ></iframe>
            </Box>
        </Draggable>
    );
}
