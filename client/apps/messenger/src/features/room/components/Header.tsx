import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import Call from "@mui/icons-material/Call";
import SearchIcon from "@mui/icons-material/Search";
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
import { showLeftSidebar } from "../slices/leftSidebar";
import { toggleRightSidebar } from "../slices/rightSidebar";
import { RoomType } from "../../../types/Rooms";
import useStrings from "../../../hooks/useStrings";
import { useLazySearchMessagesQuery } from "../api/message";

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
                <Avatar alt={room?.name} src={`${UPLOADS_BASE_URL}/${room.avatarFileId}`} />

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
            </Box>
        </>
    );
}

function MobileBackButton() {
    const dispatch = useDispatch();

    const iconSxProps = { width: "25px", height: "25px", color: "primary.main", cursor: "pointer" };

    return (
        <ChevronLeft
            sx={{
                ...iconSxProps,
                mr: 0.5,
            }}
            onClick={() => dispatch(showLeftSidebar())}
        />
    );
}

let timer: NodeJS.Timeout;

function Search({ onClose }: { onClose: () => void }) {
    const strings = useStrings();
    const roomId = parseInt(useParams().id || "");
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);

    const [searchMessages, { isFetching, data, currentData }] = useLazySearchMessagesQuery();

    console.log({ data, currentData, isFetching });
    const onSearch = (keyword: string) => {
        console.log("search start", { keyword });
        if (keyword.length > 2) {
            searchMessages({ roomId, keyword });
        } else {
            setResults([]);
        }
    };

    useEffect(() => {
        if (data && data.messagesIds?.length > 0) {
            setResults(data.messagesIds);
        } else {
            setResults([]);
        }
    }, [data]);

    return (
        <>
            <Box width="100%" mr={3}>
                <Input
                    disableUnderline={true}
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
                                <Box display="flex" alignItems="center">
                                    {results.length > 0 && (
                                        <Typography mr={2}>1/{results.length}</Typography>
                                    )}
                                    {keyword.length > 0 && (
                                        <CancelIcon
                                            onClick={() => {
                                                setKeyword("");
                                                setResults([]);
                                            }}
                                            sx={{ color: "text.tertiary", cursor: "pointer" }}
                                        />
                                    )}
                                </Box>
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
                        setKeyword(e.target.value);

                        if (timer) {
                            clearTimeout(timer);
                        }
                        timer = setTimeout(() => onSearch(e.target.value), 700);
                    }}
                    value={keyword}
                />
            </Box>

            <Box display="flex" gap={2} justifyItems="center" mr={1}>
                <ExpandLess sx={{ color: "text.tertiary", cursor: "pointer" }} />
                <ExpandMore sx={{ color: "text.tertiary", cursor: "pointer" }} />
            </Box>
            <Button onClick={onClose}>{strings.cancel}</Button>
        </>
    );
}

function HeaderContentSkeleton() {
    return <Skeleton width="100%" />;
}
