import { TFunction } from "i18next";

export function getGalleryFormattedDate(date: Date, t: TFunction) {
    if (!date) return "";


    const now = new Date();
    const imageDate = new Date(date);

    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(nowMidnight);
    yesterdayMidnight.setDate(nowMidnight.getDate() - 1);

    if (imageDate >= nowMidnight) {
        return `${t("today")} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }

    if (imageDate >= yesterdayMidnight) {
        return `${t("yesterday")} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    } else {
        const yearString =
            imageDate.getFullYear() === now.getFullYear() ? "" : `.${imageDate.getFullYear()}`;
        return `${imageDate.getDate()}.${imageDate.getMonth() + 1
            }${yearString} ${imageDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })}`;
    }
}
