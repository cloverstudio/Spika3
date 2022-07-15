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
            className="emoji-grid"
            style={{
                gap: `${emojiSpacing}px`,
                gridTemplateColumns: `repeat(auto-fill, minmax(min(${emojiSize}px, 100%), 1fr))`,
            }}
        >
            {children}
        </div>
    );
}
