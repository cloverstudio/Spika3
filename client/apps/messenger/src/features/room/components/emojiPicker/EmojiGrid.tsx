import React, { ReactElement } from "react";

type EmojiGridProps = {
    emojiSize: number;
    emojiSpacing: number;
    children: ReactElement | ReactElement[];
};

export default function EmojiGrid({
    emojiSize,
    emojiSpacing,
    children,
}: EmojiGridProps): React.ReactElement {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${emojiSize}px, 1fr))`,
                gap: `${emojiSpacing}px`,
                flexWrap: "wrap",
                maxWidth: "100%",
                margin: "0 auto",
            }}
        >
            {children}
        </div>
    );
}
