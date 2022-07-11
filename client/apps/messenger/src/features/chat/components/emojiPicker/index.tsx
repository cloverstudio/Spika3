import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Input } from "@mui/material";
import { getGroupedEmojis, searchEmoji } from "./utils/getEmojis";
import EmojiGrid from "./EmojiGrid";
import { Emoji } from "./types";

type EmojiPickerProps = {
    onSelect: (string) => void;
};

const emojiSize = 22;
const emojiSpacing = 1;
const groupedEmojis = getGroupedEmojis("native", 12.0);

export default function EmojiPickerContainer({ onSelect }: EmojiPickerProps): React.ReactElement {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);

    const handleEmojiClick = (e, data: Emoji) => {
        console.log({ e, data });

        onSelect(data.native);
    };

    useEffect(() => {
        setResults(searchEmoji(searchTerm, "native", 12.0));
    }, [searchTerm]);

    console.log("render Picker");

    return (
        <Box width="100%" mb={0.5} pb={0.5} sx={{ overflowX: "auto" }}>
            <Box width="100%" mb={1}>
                <Input
                    disableUnderline={true}
                    fullWidth
                    placeholder="Search Emoji"
                    sx={{
                        backgroundColor: "common.chatBackground",
                        px: "20px",
                        py: "9px",
                        input: {
                            padding: 0,
                        },
                    }}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    value={searchTerm}
                />
            </Box>

            <Box maxHeight="7rem">
                {!searchTerm &&
                    Object.entries(groupedEmojis)
                        .slice(0, 1)
                        .map(([key, emojis]) => (
                            <Box key={key} mb={6} position="relative">
                                {/* <Box>{key}</Box> */}

                                <EmojiGrid emojiSize={emojiSize} emojiSpacing={emojiSpacing}>
                                    {emojis.map((data) => (
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
                        ))}

                {searchTerm && (
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
                )}
            </Box>
        </Box>
    );
}
