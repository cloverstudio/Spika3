import React, { useCallback, useEffect, useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { getGroupedEmojis, searchEmoji } from "./utils/getEmojis";
import EmojiGrid from "./EmojiGrid";
import { Emoji } from "./types";
import Tabs from "./Tabs";
import useStrings from "../../../../hooks/useStrings";
import axios from "axios";
import AttachmentManager from "../../lib/AttachmentManager";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch } from "../../../../hooks";
import { setInputType, setReplyMessage } from "../../slices/input";

declare const GIPHY_API_KEY: string;
declare const GIPHY_API_BASE_URL: string;

type EmojiPickerProps = {
    onSelect: (emoji: string) => void;
    setHideTextInput: (hide: boolean) => void;
};

const emojiSize = 22;
const emojiSpacing = 10;
const groupedEmojis = getGroupedEmojis("native", 12.0);

export default function EmojiPickerContainer({
    onSelect,
    setHideTextInput,
}: EmojiPickerProps): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const [showType, setShowType] = useState<"emoji" | "gif">("emoji");
    const strings = useStrings();
    const dispatch = useAppDispatch();

    useEffect(() => {
        return () => {
            setHideTextInput(false);
        };
    }, []);

    return (
        <Box width="100%" mb={0.5} padding="0 20px" height="100%">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    position: "relative",
                }}
            >
                <Button
                    onClick={() => {
                        setShowType("emoji");
                        setHideTextInput(false);
                    }}
                    sx={{
                        color: "text.primary",
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        width: "130px",
                        height: "45px",
                        backgroundColor: showType === "emoji" ? "background.paper" : "transparent",
                    }}
                >
                    {strings.emojis}
                </Button>
                <Button
                    onClick={() => {
                        setShowType("gif");
                        setHideTextInput(true);
                    }}
                    sx={{
                        color: "text.primary",
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        width: "130px",
                        height: "45px",
                        backgroundColor: showType === "gif" ? "background.paper" : "transparent",
                    }}
                >
                    {strings.gifs}
                </Button>

                <IconButton
                    sx={{
                        position: "absolute",
                        right: "0",
                    }}
                    onClick={() => dispatch(setInputType({ roomId, type: "text" }))}
                >
                    <CloseIcon color="primary" />
                </IconButton>
            </Box>

            {showType === "emoji" && <EmojiPicker onSelect={onSelect} />}
            {showType === "gif" && <GifPicker />}
        </Box>
    );
}

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
    const strings = useStrings();

    const [results, setResults] = useState<Emoji[] | undefined>(undefined);
    const [tabIndex, setTabIndex] = useState(0);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;

        setTimeout(() => {
            if (value.trim()) {
                const search = value.toLowerCase();
                const searchResult = searchEmoji(search, "native", 12.0);
                setResults(searchResult);
            } else {
                setResults(undefined);
            }
        }, 0);
    }, []);

    const handleEmojiClick = (e, data: Emoji) => {
        onSelect(data.native);
    };

    const handleTabChange = (newValue: number) => {
        setTabIndex(newValue);
    };

    const activeCategory = Object.entries(groupedEmojis)[tabIndex];

    return (
        <Box>
            <Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Box maxWidth="100%" width="100%" padding="16px 0">
                        <Input
                            disableUnderline={true}
                            placeholder={strings.search}
                            fullWidth
                            sx={{
                                backgroundColor: "background.paper",
                                px: "20px",
                                py: "9px",
                                input: {
                                    padding: 0,
                                },
                            }}
                            onChange={handleSearch}
                        />
                    </Box>
                </Box>

                <Tabs value={tabIndex} onChange={handleTabChange} showIndicator={!results} />
            </Box>

            <Box maxHeight="7rem" height="7rem" sx={{ overflowY: "auto", overflowX: "hidden" }}>
                {results ? (
                    <EmojiGrid emojiSize={emojiSize} emojiSpacing={emojiSpacing}>
                        {results.map((data) => (
                            <Button
                                key={`emoji-${data.native}`}
                                onClick={(e) => handleEmojiClick(e, data)}
                                sx={{ p: 0, m: 0, minWidth: "auto" }}
                            >
                                <span
                                    className="emoji-native"
                                    style={{ fontSize: `${emojiSize}px` }}
                                >
                                    {data.native}
                                </span>
                            </Button>
                        ))}
                    </EmojiGrid>
                ) : (
                    <Box position="relative">
                        <EmojiGrid emojiSize={emojiSize} emojiSpacing={emojiSpacing}>
                            {activeCategory[1].map((data) => (
                                <Button
                                    key={`emoji-${data.native}`}
                                    onClick={(e) => handleEmojiClick(e, data)}
                                    sx={{ p: 0, m: 0, minWidth: "auto" }}
                                >
                                    <span
                                        className="emoji-native"
                                        style={{ fontSize: `${emojiSize}px` }}
                                    >
                                        {data.native}
                                    </span>
                                </Button>
                            ))}
                        </EmojiGrid>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function GifPicker() {
    const strings = useStrings();

    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();

    const limit = 50;

    const [dataToShow, setDataToShow] = useState<
        { id: string; url: string; title: string; previewUrl: string }[]
    >([]);
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const [search, setSearch] = useState("");
    const [idOfSelectedGif, setIdOfSelectedGif] = useState("");
    const [hasError, setHasError] = useState(false);

    const gifContainerRef = React.useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        if (gifContainerRef.current) {
            gifContainerRef.current.scrollTop = 0;
        }
    };

    const fetchGifs = async (options?: { search?: string; offset?: number }) => {
        setHasError(false);
        setIsLoading(true);
        try {
            let url = "";

            if (options?.search)
                url = `${GIPHY_API_BASE_URL}/search?api_key=${GIPHY_API_KEY}&limit=${limit}&q=${options.search}`;
            else url = `${GIPHY_API_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}`;

            if (options?.offset) url += `&offset=${options.offset}`;

            const result = await axios.get(url);
            if (result.data) {
                const gifs = result.data.data.map((gif) => {
                    return {
                        id: gif.id,
                        url: gif.images.fixed_height.url,
                        previewUrl: gif.images.preview_gif.url,
                        title: gif.title,
                    };
                });
                if (options?.offset) {
                    setDataToShow((prev) => [...prev, ...gifs]);
                } else {
                    setDataToShow(gifs);
                }
                setOffset(result.data.pagination.offset + result.data.pagination.count);
                setTotalCount(result.data.pagination.total_count);
            }
        } catch (error) {
            console.error("Error fetching GIFs:", error);
            setHasError(true);
        } finally {
            setIsScrolledToBottom(false);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchGifs();
        dispatch(setReplyMessage({ message: null, roomId }));
        return () => {
            setSearch("");
            setOffset(0);
            setDataToShow([]);
            setTotalCount(0);
        };
    }, []);

    useEffect(() => {
        const container = gifContainerRef.current;

        if (!container) return;

        const handleScroll = (e: Event) => {
            if (isLoading) return;
            const target = e.target as HTMLDivElement;

            if (target.scrollHeight - target.scrollTop === target.clientHeight) {
                setIsScrolledToBottom(true);
            } else {
                setIsScrolledToBottom(false);
            }
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (offset >= totalCount) return;

        if (isScrolledToBottom) {
            if (search) fetchGifs({ search, offset });
            else fetchGifs({ offset });
        }
    }, [isScrolledToBottom, search]);

    const handleGifClick = async (id: string, url: string, title: string) => {
        try {
            setIdOfSelectedGif(id);
            const response = await fetch(url);
            const blob = await response.blob();
            const gifName = title || "gif_" + Date.now() + ".gif";

            const uploadedGif = new File([blob], gifName, { type: "image/gif" });

            AttachmentManager.addFiles({ roomId, files: [uploadedGif] });
            setIdOfSelectedGif("");
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };

    return (
        <Box width="100%" height="100%">
            <Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Box maxWidth="100%" width="100%" padding="16px 0">
                        <Input
                            disableUnderline={true}
                            placeholder={strings.searchGifs}
                            autoFocus
                            fullWidth
                            sx={{
                                backgroundColor: "background.paper",
                                px: "20px",
                                py: "9px",
                                input: {
                                    padding: 0,
                                },
                            }}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && e.currentTarget.value !== search) {
                                    scrollToTop();
                                    setSearch(e.currentTarget.value);
                                    setOffset(0);
                                    setDataToShow([]);
                                    fetchGifs({ search: e.currentTarget.value, offset: 0 });
                                }
                                if (
                                    e.key === "Backspace" &&
                                    e.currentTarget.value !== search &&
                                    e.currentTarget.value === ""
                                ) {
                                    scrollToTop();
                                    setOffset(0);
                                    setSearch("");
                                    setDataToShow([]);
                                    fetchGifs();
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            <Box
                maxHeight="221px"
                height="221px"
                sx={{ overflowY: "auto", overflowX: "hidden" }}
                ref={gifContainerRef}
            >
                {search && dataToShow.length === 0 && !isLoading && !hasError && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: "12px",
                        }}
                    >
                        {strings.noData}
                    </Box>
                )}

                {hasError && !isLoading && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: "12px",
                        }}
                    >
                        {strings.anErrorHasOccurred}
                    </Box>
                )}

                <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fill, minmax(100px, 1fr))"
                    gridAutoRows="minmax(100px, auto)"
                    gap="12px"
                    sx={{ position: "relative", mb: "12px" }}
                >
                    {dataToShow.map((gif, i) => {
                        return (
                            <Box
                                key={gif.id + i}
                                width="100px"
                                height="100px"
                                overflow="hidden"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    position: "relative",
                                    borderRadius: "12px",
                                }}
                            >
                                <Box
                                    onClick={() => {
                                        if (idOfSelectedGif) return;
                                        handleGifClick(gif.id, gif.url, gif.title);
                                    }}
                                    sx={{
                                        p: 0,
                                        m: 0,
                                        minWidth: "auto",
                                        "&:hover": {
                                            cursor: idOfSelectedGif ? "default" : "pointer",
                                        },
                                    }}
                                >
                                    <img
                                        src={gif.previewUrl}
                                        alt={gif.title}
                                        style={{ borderRadius: "12px" }}
                                        width="100%"
                                    />
                                </Box>
                                {gif.id === idOfSelectedGif && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            transform: "translate(-50%, -50%)",
                                            top: "50%",
                                            left: "50%",
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
