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
const emojiSpacing = 10;
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
        <Box width="100%" mb={0.5} padding="0 20px" height="100%">
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
