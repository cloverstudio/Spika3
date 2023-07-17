import linkifyHtml from "linkify-html";

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

    text = linkifyHtml(text, {
        defaultProtocol: "https",
        attributes(value, type) {
            if (type === "url" && !value.includes(window.origin)) {
                return {
                    target: "_blank",
                };
            }
        },
    });

    return text;
}
