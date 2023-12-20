import useStrings from "../../../hooks/useStrings";

export function getGalleryFormattedDate(date: Date) {
    if (!date) return "";

    const strings = useStrings();

    const now = new Date();
    const imageDate = new Date(date);

    const diff = now.getTime() - imageDate.getTime();
    const diffDays = diff / (1000 * 3600 * 24);
    const diffYears = diffDays / 365;

    if (diffDays < 1) {
        return `${strings.today} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }

    if (diffDays < 2) {
        return `${strings.yesterday} ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    } else {
        return `${imageDate.getDate()}.${imageDate.getMonth() + 1}.${
            diffYears >= 1 ? imageDate.getFullYear() + "." : ""
        } ${imageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;
    }
}
