export type EmojiSkin = {
    unified: string;
    non_qualified: string | null;
    image: string;
    sheet_x: number;
    sheet_y: number;
    added_in: string;
    has_img_apple: boolean;
    has_img_google: boolean;
    has_img_twitter: boolean;
    has_img_facebook: boolean;
};

export type BaseEmoji = {
    google: number;
    twitter: number;
    facebook: number;
    apple: number;
    native: string;
    sheetX: number;
    sheetY: number;
    img: string;
};

export type EmojiSet = "native" | "google" | "apple" | "facebook" | "twitter";
export type EmojiQuality = "clean" | "128" | "256";
export type Version =
    | 0.6
    | 0.7
    | 1.0
    | 2.0
    | 3.0
    | 4.0
    | 5.0
    | 11.0
    | 12.0
    | 12.1
    | 13.0
    | 13.1
    | 14.0;

export type Emoji = {
    google: number;
    twitter: number;
    facebook: number;
    apple: number;
    native: string;
    sheetX: number;
    sheetY: number;
    keywords: string[];
    name: string;
    sortOrder: number;
    skinVariations?: BaseEmoji[];
    img: string;
};
