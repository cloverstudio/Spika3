import React, { useEffect, useState } from "react";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import LeftArrow from "@mui/icons-material/KeyboardArrowLeft";
import RightArrow from "@mui/icons-material/ChevronRight";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, CircularProgress, IconButton, Modal, Typography } from "@mui/material";
import PlayCircleFilled from "@mui/icons-material/PlayCircleFilled";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    getGalleryImages,
    resetGalleryImages,
    setPreviewedImageMessageId,
} from "../../slices/messages";
import AttachmentManager from "../../lib/AttachmentManager";
import { DOWNLOAD_URL } from "../../../../../../../lib/constants";
import useEscapeKey from "../../../../hooks/useEscapeKey";
import { getGalleryFormattedDate } from "../../lib/formatDate";
import { galleryImageBatchLimitMobile, galleryImageBatchLimitNonMobile } from "../../lib/consts";

export const ImagePreviewModal = () => {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();

    const [fileLoaded, setFileLoaded] = useState(false);

    const [olderImagesBatchLoaded, setOlderImagesBatchLoaded] = useState(false);
    const [newerImagesBatchLoaded, setNewerImagesBatchLoaded] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const itemsPerBatch = isMobile ? galleryImageBatchLimitMobile : galleryImageBatchLimitNonMobile;

    const hasMoreNewerImages = useAppSelector(
        (state) => state.messages[roomId]?.galleryImagesHasMoreNewer,
    );
    const hasMoreOlderImages = useAppSelector(
        (state) => state.messages[roomId]?.galleryImagesHasMoreOlder,
    );

    const selectedMessageId = useAppSelector((state) => state.messages.previewedImageMessageId);

    const galleryImages = useAppSelector((state) => state.messages[roomId]?.galleryImages);

    const isLeftArrowDisabled =
        galleryImages?.length &&
        selectedMessageId === galleryImages[0].messageId &&
        !hasMoreOlderImages;

    const isRightArrowDisabled =
        galleryImages?.length &&
        selectedMessageId === galleryImages[galleryImages.length - 1]?.messageId &&
        !hasMoreNewerImages;

    const message = galleryImages?.find(
        (galleryImage) => galleryImage.messageId === selectedMessageId,
    );

    useEffect(() => {
        if (selectedMessageId && !galleryImages?.length) {
            dispatch(
                getGalleryImages({
                    roomId,
                    cursor: selectedMessageId,
                    itemsPerBatch,
                }),
            );
        }
        setFileLoaded(false);
    }, [selectedMessageId]);

    useEffect(() => {
        if (galleryImages?.length && olderImagesBatchLoaded) {
            dispatch(
                setPreviewedImageMessageId(galleryImages[galleryImages.length - 1]?.messageId),
            );
            setOlderImagesBatchLoaded(false);
        } else if (galleryImages?.length && newerImagesBatchLoaded) {
            dispatch(setPreviewedImageMessageId(galleryImages[0]?.messageId));
            setNewerImagesBatchLoaded(false);
        }
    }, [galleryImages]);

    const isLoading = useAppSelector((state) => state.messages[roomId]?.loading);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && !isLoading && !isLeftArrowDisabled)
                leftArrowClickHandler();
            else if (e.key === "ArrowRight" && !isLoading && !isRightArrowDisabled)
                rightArrowClickHandler();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const handleClose = () => {
        setFileLoaded(false);
        dispatch(setPreviewedImageMessageId(null));
        dispatch(resetGalleryImages(roomId));
    };

    const handleFileLoaded = () => {
        setFileLoaded(true);
    };

    useEscapeKey(handleClose);

    if (!selectedMessageId || !message) {
        return null;
    }

    const { body } = message;

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, uploadingFileName, fileId, thumbId } = body;

    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    if (!file) {
        return null;
    }
    const src = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${fileId}`;
    const thumbSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${thumbId}`;

    const galleryImageClickHandler = (messageId: number) => {
        dispatch(setPreviewedImageMessageId(messageId));
    };
    const leftArrowClickHandler = () => {
        const currentMessageIndex = galleryImages.findIndex(
            (galleryImage) => galleryImage.messageId === selectedMessageId,
        );
        const previousMessage = galleryImages[currentMessageIndex - 1];
        if (previousMessage) {
            dispatch(setPreviewedImageMessageId(previousMessage.messageId));
        } else if (currentMessageIndex === 0) {
            dispatch(
                getGalleryImages({
                    roomId,
                    cursor: selectedMessageId,
                    fetchOlder: true,
                    itemsPerBatch,
                }),
            );
            setOlderImagesBatchLoaded(true);
        }
    };

    const rightArrowClickHandler = () => {
        const currentMessageIndex = galleryImages.findIndex(
            (galleryImage) => galleryImage.messageId === selectedMessageId,
        );
        const nextMessage = galleryImages[currentMessageIndex + 1];
        if (nextMessage) {
            dispatch(setPreviewedImageMessageId(nextMessage.messageId));
        } else if (currentMessageIndex === galleryImages.length - 1) {
            dispatch(
                getGalleryImages({
                    roomId,
                    cursor: selectedMessageId,
                    fetchNewer: true,
                    itemsPerBatch,
                }),
            );
            setNewerImagesBatchLoaded(true);
        }
    };

    const leftArrowBackClickHandler = () => {
        dispatch(
            getGalleryImages({
                roomId,
                cursor: galleryImages[0].messageId,
                fetchOlder: true,
                itemsPerBatch,
            }),
        );
        setOlderImagesBatchLoaded(true);
    };

    const rightArrowBackClickHandler = () => {
        dispatch(
            getGalleryImages({
                roomId,
                cursor: galleryImages[galleryImages.length - 1].messageId,
                fetchNewer: true,
                itemsPerBatch,
            }),
        );
        setNewerImagesBatchLoaded(true);
    };

    return (
        <Modal open={!!file} onClose={handleClose}>
            <>
                <Box display="flex" gap={2} justifyContent="end" mr={2} mt={2}>
                    <Box
                        component="a"
                        href={src}
                        target="_blank"
                        sx={{ display: "block", color: "white" }}
                    >
                        <DownloadIcon fontSize="large" />
                    </Box>

                    <CloseOutlined
                        onClick={handleClose}
                        sx={{ color: "white", cursor: "pointer" }}
                        fontSize="large"
                    />
                </Box>

                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    bgcolor="transparent"
                    sx={{
                        transform: "translate(-50%, -50%)",
                        outline: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            marginBottom: "50px",
                            color: "#fff",
                        }}
                    >
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                            {message.username}
                        </Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                            {getGalleryFormattedDate(message.date)}
                        </Typography>
                    </Box>
                    <Box width="70vw" height="70vh">
                        {!fileLoaded && message.type === "image" && (
                            <Box>
                                {thumbSrc && (
                                    <Box
                                        component={"img"}
                                        maxHeight="65vh"
                                        maxWidth="65vw"
                                        height="auto"
                                        width="auto"
                                        src={thumbSrc}
                                        draggable={false}
                                        sx={{
                                            userSelect: "none",
                                            touchAction: "none",
                                            pointerEvents: "none",
                                            position: "absolute",
                                            top: "40%",
                                            left: "50%",
                                            transform: "translate(-50%, -45%)",
                                        }}
                                    />
                                )}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: "40%",
                                        left: "50%",
                                        transform: "translate(-50%, -45%)",
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            </Box>
                        )}

                        {message.type === "image" && (
                            <Box
                                component="img"
                                maxWidth="65vw"
                                maxHeight="70vh"
                                height={fileLoaded ? "auto" : "0px"}
                                width={fileLoaded ? "auto" : "0px"}
                                src={src}
                                key={selectedMessageId}
                                draggable={false}
                                sx={{
                                    userSelect: "none",
                                    touchAction: "none",
                                    pointerEvents: "none",
                                    visibility: fileLoaded ? "visible" : "hidden",
                                    position: "absolute",
                                    top: "40%",
                                    left: "50%",
                                    transform: "translate(-50%, -45%)",
                                }}
                                onLoad={handleFileLoaded}
                            />
                        )}
                        {message.type === "video" && (
                            <Box
                                component="video"
                                maxWidth="65vw"
                                maxHeight="70vh"
                                height={"auto"}
                                width={"auto"}
                                controls
                                autoPlay
                                key={selectedMessageId}
                                draggable={false}
                                sx={{
                                    userSelect: "none",
                                    position: "absolute",
                                    top: "40%",
                                    left: "50%",
                                    transform: "translate(-50%, -45%)",
                                }}
                            >
                                <source src={src} />
                                Your browser does not support the video tag.
                            </Box>
                        )}
                        <IconButton
                            disabled={isLeftArrowDisabled}
                            sx={{
                                position: "absolute",
                                top: "40%",
                                left: "0",
                                transform: "translate(-50%, -40%)",
                                width: "80px",
                                height: "80px",
                            }}
                            onClick={leftArrowClickHandler}
                        >
                            <LeftArrow
                                sx={{
                                    width: "82px",
                                    height: "82px",
                                    color: isLeftArrowDisabled ? "#282828" : "#fff",
                                }}
                            />
                        </IconButton>

                        <IconButton
                            disabled={isRightArrowDisabled}
                            sx={{
                                position: "absolute",
                                top: "40%",
                                left: "100%",
                                transform: "translate(-50%, -40%)",
                                width: "80px",
                                height: "80px",
                            }}
                            onClick={rightArrowClickHandler}
                        >
                            <RightArrow
                                sx={{
                                    width: "82px",
                                    height: "82px",
                                    color: isRightArrowDisabled ? "#282828" : "#fff",
                                }}
                            />
                        </IconButton>
                    </Box>
                    {galleryImages?.length > 0 && (
                        <Box textAlign="center">
                            <Box sx={{ position: "relative" }}>
                                <IconButton
                                    disabled={!hasMoreOlderImages}
                                    sx={{
                                        position: "absolute",
                                        top: "40%",
                                        left: "-30px",
                                        transform: "translate(-50%, -40%)",
                                        width: "50px",
                                        height: "50px",
                                    }}
                                    onClick={leftArrowBackClickHandler}
                                >
                                    <LeftArrow
                                        sx={{
                                            width: "40px",
                                            height: "40px",
                                            color: hasMoreOlderImages ? "#fff" : "#282828",
                                        }}
                                    />
                                </IconButton>

                                <IconButton
                                    disabled={!hasMoreNewerImages}
                                    sx={{
                                        position: "absolute",
                                        top: "40%",
                                        left: "calc(100% + 30px)",
                                        transform: "translate(-50%, -40%)",
                                        width: "50px",
                                        height: "50px",
                                    }}
                                    onClick={rightArrowBackClickHandler}
                                >
                                    <RightArrow
                                        sx={{
                                            width: "40px",
                                            height: "40px",
                                            color: hasMoreNewerImages ? "#fff" : "#282828",
                                        }}
                                    />
                                </IconButton>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "16px",
                                        marginTop: "12px",
                                        maxWidth: "70vw",
                                        justifyContent: "center",
                                    }}
                                >
                                    {galleryImages.map((galleryImage) => (
                                        <GalleryImageItem
                                            key={galleryImage.messageId}
                                            galleryImage={galleryImage}
                                            isActive={galleryImage.messageId === selectedMessageId}
                                            onGalleryImageClick={galleryImageClickHandler}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </>
        </Modal>
    );
};

interface GalleryImageItemProps {
    galleryImage: {
        messageId: number;
        type: string;
        body: any;
        date: Date;
        userId: number;
        username: string;
    };
    isActive?: boolean;
    onGalleryImageClick: (messageId: number) => void;
}

function GalleryImageItem({ galleryImage, isActive, onGalleryImageClick }: GalleryImageItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    if (!galleryImage.body.thumbId || !galleryImage.body.fileId) {
        return null;
    }

    const formattedDate = getGalleryFormattedDate(galleryImage.date);

    return (
        <Box
            onClick={() => onGalleryImageClick(galleryImage.messageId)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <Box
                    sx={{
                        position: "absolute",
                        backgroundColor: "#282828",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        width: "auto",
                        padding: "8px",
                        borderRadius: "10px",
                        display: "flex",
                        top: "-35px",
                        marginLeft: "20px",
                    }}
                >
                    <Typography sx={{ fontSize: "12px" }}>
                        {galleryImage.username} {formattedDate}
                    </Typography>
                </Box>
            )}
            <Box position="relative">
                <Box
                    component="img"
                    height="85px"
                    width="85px"
                    draggable={false}
                    sx={{
                        userSelect: "none",
                        touchAction: "none",
                        pointerEvents: "none",
                        objectFit: "cover",
                        border: isActive ? "4px solid" : "none",
                        borderColor: "primary.main",
                    }}
                    src={`${DOWNLOAD_URL}/${galleryImage.body.thumbId}`}
                />
                {galleryImage.type === "video" && (
                    <PlayCircleFilled
                        fontSize="large"
                        sx={{
                            position: "absolute",
                            inset: 0,
                            margin: "auto",
                            backgroundColor: "background.default",
                            borderRadius: "50%",
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}
