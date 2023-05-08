export default function filterText(text: string): string {
    // escape html
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // fold multiple new line in one
    text = text.replace(/\n{3,}/g, "\n");

    // auto link
    const autolinkRegex = /(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#%;:~=.\/\-?_+()]+)/gi;
    const internalLink = text.includes(window.origin);

    text = text.replace(
        autolinkRegex,
        `<a href="$1" ${!internalLink ? 'target="_blank"' : ""} >$1</a>`
    );

    return text;
}
