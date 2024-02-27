import React, { useEffect, useRef, useState } from "react";

import { Box, CircularProgress, IconButton, Typography, useTheme } from "@mui/material";
import useStrings from "../../../../../hooks/useStrings";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";
import {
    getRightSidebarFiles,
    getRightSidebarLinks,
    getRightSidebarMedia,
    resetRightSidebarFiles,
    resetRightSidebarLinks,
    resetRightSidebarMedia,
    setPreviewedImageMessageId,
    setTargetMessage,
} from "../../../slices/messages";
import { useParams } from "react-router-dom";
import { ImageItem } from "../../message/ImagePreviewModal";
import {
    rightSidebarMediaBatchLimit,
    rightSidebarFilesBatchLimit,
    rightSidebarLinkMessagesBatchLimit,
} from "../../../lib/consts";
import { getGalleryFormattedDate } from "../../../lib/formatDate";
import Download from "@mui/icons-material/Download";
import getFileIcon from "../../../lib/getFileIcon";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";
import TextMessage from "../../message/messageTypes/TextMessage";
import useEscapeKey from "../../../../../hooks/useEscapeKey";
import { toggleRightSidebar } from "../../../slices/rightSidebar";

export default function RightSidebarMediaContent() {
    const strings = useStrings();

    const [activeButton, setActiveButton] = useState<"media" | "link" | "doc">("media");

    const buttonStyle = {
        borderRadius: "10px",
        backgroundColor: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "45px",
        padding: "10px",
        textAlign: "center",
        color: "text.secondary",
        fontSize: "14px",
        fontWeight: 600,
        "&:hover": {
            cursor: "pointer",
        },
    };

    return (
        <Box height="100%">
            <Box
                sx={{
                    display: "flex",
                    bgcolor: "background.paper",
                    borderRadius: "10px",
                    maxWidth: "390px",
                    mt: 2,
                    mx: "auto",
                }}
            >
                <Box
                    sx={{
                        ...buttonStyle,
                        ...(activeButton === "media" && {
                            bgcolor: "action.hover",
                            color: "primary.main",
                        }),
                    }}
                    onClick={() => setActiveButton("media")}
                >
                    {strings.media}
                </Box>
                <Box
                    sx={{
                        ...buttonStyle,
                        ...(activeButton === "link" && {
                            bgcolor: "action.hover",
                            color: "primary.main",
                        }),
                    }}
                    onClick={() => setActiveButton("link")}
                >
                    {strings.links}
                </Box>
                <Box
                    sx={{
                        ...buttonStyle,
                        ...(activeButton === "doc" && {
                            bgcolor: "action.hover",
                            color: "primary.main",
                        }),
                    }}
                    onClick={() => setActiveButton("doc")}
                >
                    {strings.docs}
                </Box>
            </Box>

            <Box
                sx={{
                    height: "100%",
                    mt: 2,
                }}
            >
                {activeButton === "media" && <ImagesAndVideosContent />}
                {activeButton === "link" && <LinksContent />}
                {activeButton === "doc" && <DocsContent />}
            </Box>
        </Box>
    );
}

function ImagesAndVideosContent() {
    const roomId = parseInt(useParams().id || "");
    const mediaContainerRef = useRef<HTMLDivElement>(null);

    const strings = useStrings();

    const itemsPerBatch = rightSidebarMediaBatchLimit;

    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

    const dispatch = useAppDispatch();
    const media = useAppSelector((state) => state.messages[roomId]?.rightSidebarMedia);
    const count = useAppSelector((state) => state.messages[roomId]?.rightSidebarMediaCount);
    const isLoading = useAppSelector((state) => state.messages[roomId]?.loadingRightSidebarMedia);

    const mediaSortedByMonth = getSortedMediaByMonthAndYear(media);

    useEffect(() => {
        if (!media?.length)
            dispatch(
                getRightSidebarMedia({
                    roomId,
                    itemsPerBatch,
                }),
            );

        if (mediaContainerRef.current) {
            mediaContainerRef.current.addEventListener("scroll", () => {
                const { scrollTop, scrollHeight, clientHeight } = mediaContainerRef.current!;

                setIsScrolledToBottom(scrollHeight - scrollTop < clientHeight + 100);
            });
        }

        return () => {
            if (mediaContainerRef.current) {
                mediaContainerRef.current.removeEventListener("scroll", () => {});
            }
            dispatch(resetRightSidebarMedia(roomId));
        };
    }, []);

    useEffect(() => {
        if (isScrolledToBottom && media?.length < count && !isLoading) {
            dispatch(
                getRightSidebarMedia({
                    roomId,
                    itemsPerBatch,
                    cursor: media?.[media.length - 1].messageId,
                }),
            );

            setIsScrolledToBottom(false);
        }
    }, [isScrolledToBottom]);

    return (
        <Box
            sx={{
                height: "calc(100vh - 160px)",
                overflowY: "auto",
                overflowX: "hidden",
                px: 1,
                pb: 1,
            }}
            ref={mediaContainerRef}
        >
            {media?.length > 0 ? (
                Object.keys(mediaSortedByMonth).map((month, i) => {
                    let showThisMonthText = false;
                    const splitMonth = month.split(" ");
                    let monthText =
                        strings[splitMonth[0].toLowerCase()] + " " + splitMonth[1] || month;
                    const currentDate = new Date();

                    if (i === 0) {
                        const firstItemDate = new Date(mediaSortedByMonth[month][0].date);
                        if (
                            firstItemDate.getMonth() === currentDate.getMonth() &&
                            firstItemDate.getFullYear() === currentDate.getFullYear()
                        ) {
                            showThisMonthText = true;
                        }
                    }

                    if (
                        !showThisMonthText &&
                        currentDate.getFullYear().toString() === splitMonth[1]
                    ) {
                        monthText = splitMonth[0];
                    }

                    return (
                        <Box key={month + i}>
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "text.secondary",
                                    textAlign: "right",
                                    mt: 2,
                                    mb: 1,
                                }}
                            >
                                {showThisMonthText ? strings.thisMonth : monthText}
                            </Box>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    textAlign: "center",
                                    gap: "4px",
                                }}
                            >
                                {mediaSortedByMonth[month].map((item) => {
                                    return (
                                        <Box
                                            onClick={() =>
                                                dispatch(setPreviewedImageMessageId(item.messageId))
                                            }
                                            key={item.messageId}
                                            sx={{
                                                "&:hover": {
                                                    cursor: "pointer",
                                                },
                                            }}
                                        >
                                            <ImageItem
                                                galleryImage={item}
                                                imgWidth={"100%"}
                                                imgHeight={"125px"}
                                                showHoveredOverlay={true}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                })
            ) : (
                <Box textAlign="center">{!isLoading && strings.noData}</Box>
            )}
            {isLoading && !media?.length && (
                <Box sx={{ textAlign: "center" }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}

function LinksContent() {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();
    const linksContainerRef = useRef<HTMLDivElement>(null);

    const strings = useStrings();
    const linkMessages = useAppSelector((state) => state.messages[roomId]?.rightSidebarLinks);

    const itemsPerBatch = rightSidebarLinkMessagesBatchLimit;

    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

    const count = useAppSelector((state) => state.messages[roomId]?.rightSidebarLinksCount);
    const isLoading = useAppSelector((state) => state.messages[roomId]?.loadingRightSidebarMedia);

    const linksSortedByMonth = getSortedMediaByMonthAndYear(linkMessages);

    useEffect(() => {
        if (!linkMessages?.length) dispatch(getRightSidebarLinks({ roomId, itemsPerBatch }));

        if (linksContainerRef.current) {
            linksContainerRef.current.addEventListener("scroll", () => {
                const { scrollTop, scrollHeight, clientHeight } = linksContainerRef.current!;

                setIsScrolledToBottom(scrollHeight - scrollTop < clientHeight + 100);
            });
        }

        const handleOutsideClick = (e: MouseEvent) => {
            if (
                linksContainerRef.current &&
                !linksContainerRef.current.contains(e.target as Node)
            ) {
                dispatch(setTargetMessage({ roomId, messageId: null }));
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            if (linksContainerRef.current) {
                linksContainerRef.current.removeEventListener("scroll", () => {});
            }
            document.removeEventListener("mousedown", handleOutsideClick);
            dispatch(resetRightSidebarLinks(roomId));
            dispatch(setTargetMessage({ roomId, messageId: null }));
        };
    }, []);

    useEscapeKey(() => {
        dispatch(toggleRightSidebar());
    });

    useEffect(() => {
        if (isScrolledToBottom && linkMessages?.length < count && !isLoading) {
            dispatch(
                getRightSidebarLinks({
                    roomId,
                    itemsPerBatch,
                    cursor: linkMessages?.[linkMessages.length - 1].messageId,
                }),
            );

            setIsScrolledToBottom(false);
        }
    }, [isScrolledToBottom]);

    const linkMessageClickHandler = (messageId: number) => {
        dispatch(setTargetMessage({ roomId, messageId }));
    };

    return (
        <Box
            sx={{
                height: "calc(100vh - 160px)",
                overflowY: "auto",
                overflowX: "hidden",
                px: 1,
                pb: 1,
                position: "relative",
            }}
            ref={linksContainerRef}
        >
            {linkMessages?.length > 0 ? (
                Object.keys(linksSortedByMonth).map((month, i) => {
                    let showThisMonthText = false;
                    const splitMonth = month.split(" ");
                    let monthText =
                        strings[splitMonth[0].toLowerCase()] + " " + splitMonth[1] || month;
                    const currentDate = new Date();

                    if (i === 0) {
                        const firstItemDate = new Date(linksSortedByMonth[month][0]?.date);
                        if (
                            firstItemDate.getMonth() === currentDate.getMonth() &&
                            firstItemDate.getFullYear() === currentDate.getFullYear()
                        ) {
                            showThisMonthText = true;
                        }
                    }

                    if (
                        !showThisMonthText &&
                        currentDate.getFullYear().toString() === splitMonth[1]
                    ) {
                        monthText = splitMonth[0];
                    }

                    return (
                        <Box key={month + i}>
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "text.secondary",
                                    textAlign: "right",
                                    mt: 2,
                                    mb: 1,
                                    overflow: "hidden",
                                }}
                            >
                                {showThisMonthText ? strings.thisMonth : monthText}
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {linksSortedByMonth[month].map((item) => {
                                    return (
                                        <LinkMessageItem
                                            key={item.messageId}
                                            linkMessage={item}
                                            onClick={linkMessageClickHandler}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                })
            ) : (
                <Box textAlign="center">{strings.noData}</Box>
            )}

            {isLoading && !linkMessages?.length && (
                <Box sx={{ textAlign: "center" }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}

function DocsContent() {
    const roomId = parseInt(useParams().id || "");
    const filesContainerRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    const isLoading = useAppSelector((state) => state.messages[roomId]?.loadingRightSidebarMedia);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

    const itemsPerBatch = rightSidebarFilesBatchLimit;
    const files = useAppSelector((state) => state.messages[roomId]?.rightSidebarFiles);
    const count = useAppSelector((state) => state.messages[roomId]?.rightSidebarFilesCount);
    const strings = useStrings();

    const sortedFiles = getSortedMediaByMonthAndYear(files);

    useEffect(() => {
        if (!files?.length)
            dispatch(
                getRightSidebarFiles({
                    roomId,
                    itemsPerBatch,
                }),
            );

        if (filesContainerRef.current) {
            filesContainerRef.current.addEventListener("scroll", () => {
                const { scrollTop, scrollHeight, clientHeight } = filesContainerRef.current!;

                setIsScrolledToBottom(scrollHeight - scrollTop < clientHeight + 100);
            });
        }

        return () => {
            if (filesContainerRef.current) {
                filesContainerRef.current.removeEventListener("scroll", () => {});
            }
            dispatch(resetRightSidebarFiles(roomId));
        };
    }, []);

    useEffect(() => {
        if (isScrolledToBottom && files?.length < count && !isLoading) {
            dispatch(
                getRightSidebarFiles({
                    roomId,
                    itemsPerBatch,
                    cursor: files?.[files.length - 1].messageId,
                }),
            );

            setIsScrolledToBottom(false);
        }
    }, [isScrolledToBottom]);

    return (
        <Box
            sx={{
                height: "calc(100vh - 160px)",
                overflowY: "auto",
                overflowX: "hidden",
                px: 1,
                pb: 1,
                position: "relative",
            }}
            ref={filesContainerRef}
        >
            {files?.length > 0 ? (
                Object.keys(sortedFiles).map((month, i) => {
                    let showThisMonthText = false;
                    const splitMonth = month.split(" ");
                    let monthText =
                        strings[splitMonth[0].toLowerCase()] + " " + splitMonth[1] || month;
                    const currentDate = new Date();

                    if (i === 0) {
                        const firstItemDate = new Date(sortedFiles[month][0].date);
                        if (
                            firstItemDate.getMonth() === currentDate.getMonth() &&
                            firstItemDate.getFullYear() === currentDate.getFullYear()
                        ) {
                            showThisMonthText = true;
                        }
                    }

                    if (
                        !showThisMonthText &&
                        currentDate.getFullYear().toString() === splitMonth[1]
                    ) {
                        monthText = splitMonth[0];
                    }

                    return (
                        <Box key={month + i}>
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "text.secondary",
                                    textAlign: "right",
                                    mt: 2,
                                    mb: 1,
                                }}
                            >
                                {showThisMonthText ? strings.thisMonth : monthText}
                            </Box>

                            {sortedFiles[month].map((file) => {
                                return <FileItem key={file.messageId} file={file} />;
                            })}
                        </Box>
                    );
                })
            ) : (
                <Box textAlign="center">{!isLoading && strings.noData}</Box>
            )}
            {isLoading && !files?.length && (
                <Box sx={{ textAlign: "center" }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}

interface FileItemProps {
    file: {
        messageId: number;
        type: string;
        body: any;
        date: Date;
        userId: number;
        username: string;
    };
}

function FileItem({ file }: FileItemProps) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const Icon = getFileIcon(file.body.file.mimeType);
    const sizeInMB = (file.body.file.size / 1024 / 1024).toFixed(2);
    const sizeInKB = (file.body.file.size / 1024).toFixed(2);

    const href = `${DOWNLOAD_URL}/${file.body.fileId}`;

    return (
        <Box
            key={file.messageId}
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "4px",
                borderRadius: "10px",
                marginBottom: "10px",
                bgcolor: "primary.light",
                height: "115px",
                width: "100%",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 4px",
                    height: "23px",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: isDarkMode ? "text.primary" : "text.tertiary",
                    }}
                >
                    {file.username}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: isDarkMode ? "text.primary" : "text.tertiary",
                    }}
                >
                    {getGalleryFormattedDate(file.date)}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "common.linkThumbnail.received",
                    borderRadius: "10px",
                    height: "80px",
                    width: "100%",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "87%",
                    }}
                >
                    <Icon
                        fontSize="large"
                        sx={{
                            width: "25%",
                        }}
                    />

                    <Box>
                        <Typography
                            sx={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "text.primary",
                                wordBreak: "break-word",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                WebkitLineClamp: 2,
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {file.body.file.fileName}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "text.primary",
                            }}
                        >
                            {+sizeInMB > 0 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        width: "13%",
                        textAlign: "center",
                    }}
                >
                    <IconButton href={href} target="_blank" download>
                        <Download fontSize="medium" sx={{ color: "primary.main" }} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}

interface LinkMessageProps {
    linkMessage: {
        messageId: number;
        type: string;
        body: any;
        date: Date;
        userId: number;
        username: string;
    };
    onClick: (messageId: number) => void;
}

function LinkMessageItem({ linkMessage, onClick }: LinkMessageProps) {
    return (
        <Box
            sx={{
                mt: "8px",
                backgroundColor: "background.paper",
                borderRadius: "10px",
                cursor: "pointer",
            }}
            onClick={() => onClick(linkMessage.messageId)}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0 4px",
                    pt: "4px",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 4px",
                        height: "23px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                        }}
                    >
                        {linkMessage.username}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "12px",
                            fontWeight: 400,
                        }}
                    >
                        {getGalleryFormattedDate(linkMessage.date)}
                    </Typography>
                </Box>
                <TextMessage
                    body={linkMessage.body}
                    isUsersMessage={false}
                    collapseLinkThumbnail={true}
                    customStyle={{ border: "none", boxShadow: "none" }}
                />
            </Box>
        </Box>
    );
}

const getSortedMediaByMonthAndYear = (
    media: {
        messageId: number;
        type: string;
        body: any;
        date: Date;
        userId: number;
        username: string;
    }[],
): {
    [key: string]: {
        messageId: number;
        type: string;
        body: any;
        date: Date;
        userId: number;
        username: string;
    }[];
} => {
    return media?.reduce((acc: any, m: any) => {
        const month = new Date(m.date).toLocaleString("default", { month: "long" });
        const year = new Date(m.date).getFullYear();
        const monthYear = `${month} ${year}`;

        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(m);
        return acc;
    }, {});
};
