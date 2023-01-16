import React, { useCallback, useState } from "react";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { getGroupedEmojis, searchEmoji } from "./utils/getEmojis";
import EmojiGrid from "./EmojiGrid";
import { Emoji } from "./types";
import Tabs from "./Tabs";
import useStrings from "../../../../hooks/useStrings";

type EmojiPickerProps = {
    onSelect: (string) => void;
};

const emojiSize = 22;
const emojiSpacing = 1;
const groupedEmojis = getGroupedEmojis("native", 12.0);

export default function EmojiPickerContainer({ onSelect }: EmojiPickerProps): React.ReactElement {
    const strings = useStrings();
    const [results, setResults] = useState<Emoji[] | undefined>(undefined);
    const [tabIndex, setTabIndex] = useState(0);

    const handleEmojiClick = (e, data: Emoji) => {
        onSelect(data.native);
    };

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

    const handleTabChange = (newValue: number) => {
        setTabIndex(newValue);
    };

    const activeCategory = Object.entries(groupedEmojis)[tabIndex];

    return (
        <Box width="100%" mb={0.5} p={0.5} sx={{ overflowX: "auto" }}>
            <Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    mb={2}
                >
                    <Box maxWidth="32rem" width="100%">
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

            <Box maxHeight="7rem">
                {results ? (
                    <EmojiGrid emojiSize={emojiSize} emojiSpacing={emojiSpacing}>
                        {results.map((data) => (
                            <Button
                                key={`emoji-${data.native}`}
                                onClick={(e) => handleEmojiClick(e, data)}
                                sx={{ p: 0.5 }}
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
                                    sx={{ p: 0.5 }}
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
