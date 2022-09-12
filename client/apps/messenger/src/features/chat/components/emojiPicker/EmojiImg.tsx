import React from "react";
import { BaseEmoji } from "./types";

type EmojiImgProps = {
    emoji: BaseEmoji;
    size?: number;
    sheetSize?: number;
};

export default function EmojiImg({
    emoji,
    size = 32,
    sheetSize = 64,
}: EmojiImgProps): React.ReactElement {
    const img = `https://cdn.jsdelivr.net/npm/emoji-datasource-native-split@1.0.6/img/sheets-clean/${sheetSize}/native/${emoji.img}`;

    return (
        <span
            data-testid="emoji-img"
            data-image={img}
            aria-label={emoji.native}
            className="emoji-img"
            style={{
                width: size,
                height: size,
                backgroundImage: `url(${img})`,
                backgroundPositionX: `${emoji.sheetX * (100 / 4)}%`,
                backgroundPositionY: `${emoji.sheetY * (100 / 4)}%`,
            }}
        />
    );
}
