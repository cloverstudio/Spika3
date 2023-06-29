import * as linkify from "linkifyjs";

export default function filterText(text: string): string {
    // escape html
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // fold multiple new line in one
    text = text.replace(/\n{3,}/g, "\n\n");

    linkify.find(text).forEach((found) => {
        if (found.type === "email") {
            text = text.replace(
                found.value,
                `<a href="mailto:${found.value}" target="_blank">${found.value}</a>`
            );
            return;
        }

        if (found.type === "url") {
            const internalLink = text.includes(window.origin);

            text = text.replace(
                found.value,
                `<a href="${found.href}" ${!internalLink ? 'target="_blank"' : ""} >${
                    found.value
                }</a>`
            );
            return;
        }
    });

    return text;
}
