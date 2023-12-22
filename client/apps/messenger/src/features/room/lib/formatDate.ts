import useStrings from "../../../hooks/useStrings";

export function getGalleryFormattedDate(date: Date) {
    if (!date) return "";

    const strings = useStrings();

    const now = new Date();
    const imageDate = new Date(date);

    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(nowMidnight);
    yesterdayMidnight.setDate(nowMidnight.getDate() - 1);

    if (imageDate >= nowMidnight) {
        return `${strings.today} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }

    if (imageDate >= yesterdayMidnight) {
        return `${strings.yesterday} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    } else {
        const yearString =
            imageDate.getFullYear() === now.getFullYear() ? "" : `.${imageDate.getFullYear()}`;
        return `${imageDate.getDate()}.${
            imageDate.getMonth() + 1
        }${yearString} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }
}
