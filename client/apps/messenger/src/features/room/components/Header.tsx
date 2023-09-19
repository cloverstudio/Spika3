import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import Call from "@mui/icons-material/Call";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Videocam from "@mui/icons-material/Videocam";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import Avatar from "@mui/material/Avatar";
import { Box, Button, CircularProgress } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";

import { useGetRoomQuery } from "../api/room";
import { toggleRightSidebar } from "../slices/rightSidebar";
import { RoomType } from "../../../types/Rooms";
import useStrings from "../../../hooks/useStrings";
import { useLazySearchMessagesQuery } from "../api/message";
import {
    selectRoomMessages,
    selectTargetMessage,
    setKeyword,
    setTargetMessage,
} from "../slices/messages";
import { Link } from "react-router-dom";

export default function Header() {
    const roomId = parseInt(useParams().id || "");

    const { data: room, isLoading } = useGetRoomQuery(roomId);

    return (
        <Box px={2} borderBottom="0.5px solid" sx={{ borderColor: "divider" }}>
            <Box display="flex" justifyContent="space-between" height="80px">
                {isLoading && <HeaderContentSkeleton />}
                {room && <HeaderContent room={room} />}
            </Box>
        </Box>
    );
}

function HeaderContent({ room }: { room: RoomType }) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const [searchOn, setSearchOn] = useState(false);

    const iconSxProps = { width: "25px", height: "25px", color: "primary.main", cursor: "pointer" };
    const lobbyBaseUrl = `/rooms/${room.id}/call/lobby`;

    if (searchOn) {
        return (
            <>
                <Box display="flex" alignItems="center" width="100%">
                    {isMobile && <MobileBackButton />}
                    <Search onClose={() => setSearchOn(false)} />
                </Box>
            </>
        );
    }

    return (
        <>
            <Box display="flex" alignItems="center">
                {isMobile && <MobileBackButton />}
                <Avatar
                    alt={room?.name}
                    src={`${UPLOADS_BASE_URL}/${room.avatarFileId}`}
                    onClick={() => {
                        if (isMobile) return;
                        dispatch(toggleRightSidebar());
                    }}
                    sx={{ cursor: isMobile ? "default" : "pointer" }}
                />

                <Typography
                    fontWeight="500"
                    ml={1.5}
                    sx={{ cursor: "pointer" }}
                    onClick={() => dispatch(toggleRightSidebar())}
                >
                    {room.name}
                </Typography>
            </Box>
            <Box display="flex" gap={3} alignItems="center">
                <Videocam
                    sx={iconSxProps}
                    onClick={() => navigate(`${lobbyBaseUrl}/video`, { replace: true })}
                />
                <Call
                    sx={iconSxProps}
                    onClick={() => navigate(`${lobbyBaseUrl}/audio`, { replace: true })}
                />
                <SearchIcon sx={iconSxProps} onClick={() => setSearchOn(true)} />
                <MoreVertIcon
                    sx={iconSxProps}
                    onClick={() => dispatch(toggleRightSidebar())}
                ></MoreVertIcon>
            </Box>
        </>
    );
}

function MobileBackButton() {
    const iconSxProps = { width: "25px", height: "25px", color: "primary.main", cursor: "pointer" };

    return (
        <Link
            to="/app"
            style={{ textDecoration: "none", display: "grid", justifyContent: "center" }}
        >
            <ChevronLeft
                sx={{
                    ...iconSxProps,
                    mr: 0.5,
                }}
            />
        </Link>
    );
}

let timer: NodeJS.Timeout;

function Search({ onClose }: { onClose: () => void }) {
    const strings = useStrings();
    const roomId = parseInt(useParams().id || "");
    const [results, setResults] = useState([]);
    const [keyword, setLocalKeyword] = useState("");
    const dispatch = useDispatch();
    const currentTargetMessageId = useSelector(selectTargetMessage(roomId));
    const currentTargetMessageIndex = results.indexOf(currentTargetMessageId);
    const ref = useRef<HTMLInputElement>(null);
    const [searchMessages, { isFetching, data }] = useLazySearchMessagesQuery();
    const messages = useSelector(selectRoomMessages(roomId));

    const onSearch = (keyword: string) => {
        if (keyword?.length > 2) {
            searchMessages({ roomId, keyword });
            dispatch(setKeyword({ roomId, keyword }));
        } else {
            setResults([]);
            dispatch(setTargetMessage({ roomId, messageId: null }));
            dispatch(setKeyword({ roomId, keyword: "" }));
        }
    };

    const currentMessagesLength = Object.keys(messages).length;

    useEffect(() => {
        if (keyword?.length > 2 && currentMessagesLength > 0) {
            onSearch(keyword);
        }
    }, [currentMessagesLength, keyword]);

    const handleChangeKeyword = (keyword: string) => {
        dispatch(setKeyword({ roomId, keyword }));
        setLocalKeyword(keyword);
    };

    useEffect(() => {
        if (data && data.messagesIds?.length > 0) {
            setResults(data.messagesIds);
            if (currentTargetMessageIndex === -1 && keyword.length > 2) {
                dispatch(setTargetMessage({ roomId, messageId: data.messagesIds[0] }));
            }
        } else {
            setResults([]);
        }
    }, [data, dispatch, roomId, currentTargetMessageIndex, keyword]);

    useEffect(() => {
        if (ref?.current) {
            ref.current.focus();
        }
    }, []);

    const hasNext = results.length > 0 && currentTargetMessageIndex < results.length - 1;
    const hasPrev = results.length > 0 && currentTargetMessageIndex > 0;

    const handlePrev = () => {
        if (hasPrev) {
            dispatch(
                setTargetMessage({ roomId, messageId: results[currentTargetMessageIndex - 1] })
            );
        }
    };

    const handleNext = () => {
        if (hasNext) {
            dispatch(
                setTargetMessage({ roomId, messageId: results[currentTargetMessageIndex + 1] })
            );
        }
    };

    const handleClose = () => {
        handleChangeKeyword("");
        setResults([]);
        dispatch(setTargetMessage({ roomId, messageId: null }));
        onClose();
    };

    return (
        <>
            <Box width="100%" mr={3}>
                <Input
                    disableUnderline={true}
                    inputRef={ref}
                    startAdornment={
                        <InputAdornment sx={{ pr: 2 }} position="start">
                            <SearchIcon sx={{ width: "18px", color: "text.tertiary" }} />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment sx={{ pl: 2 }} position="end">
                            {isFetching ? (
                                <CircularProgress size={20} />
                            ) : (
                                keyword?.length > 0 && (
                                    <Box display="flex" alignItems="center">
                                        <Typography mr={2}>
                                            {!isNaN(currentTargetMessageIndex)
                                                ? currentTargetMessageIndex + 1
                                                : "-"}
                                            /{results.length}
                                        </Typography>
                                        <CancelIcon
                                            onClick={() => {
                                                handleChangeKeyword("");
                                                setResults([]);
                                                dispatch(
                                                    setTargetMessage({ roomId, messageId: null })
                                                );
                                            }}
                                            sx={{ color: "text.tertiary", cursor: "pointer" }}
                                        />
                                    </Box>
                                )
                            )}
                        </InputAdornment>
                    }
                    fullWidth
                    id="message_search"
                    placeholder={strings.search}
                    sx={{
                        backgroundColor: "background.paper",
                        px: "20px",
                        py: "9px",
                        input: {
                            padding: 0,
                        },
                    }}
                    onChange={(e) => {
                        setLocalKeyword(e.target.value);

                        if (timer) {
                            clearTimeout(timer);
                        }
                        timer = setTimeout(() => onSearch(e.target.value), 700);
                    }}
                    onKeyUp={(e) => {
                        if (e.key === "Escape") {
                            handleClose();
                        }
                    }}
                    value={keyword || ""}
                />
            </Box>

            <Box display="flex" gap={2} justifyItems="center" mr={1}>
                <ExpandLess
                    onClick={handleNext}
                    sx={{ color: hasNext ? "primary.main" : "text.tertiary", cursor: "pointer" }}
                />
                <ExpandMore
                    onClick={handlePrev}
                    sx={{ color: hasPrev ? "primary.main" : "text.tertiary", cursor: "pointer" }}
                />
            </Box>
            <Button onClick={handleClose}>{strings.cancel}</Button>
        </>
    );
}

function HeaderContentSkeleton() {
    return <Skeleton width="100%" />;
}
