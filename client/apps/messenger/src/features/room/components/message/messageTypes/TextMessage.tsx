import React from "react";
import { Box } from "@mui/material";
import UserType from "../../../../../types/User";
import filterText from "../../../lib/filterText";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { selectChangeTerm } from "../../../slices/messages";

export default function TextMessage({
    isUsersMessage,
    body,
    sender,
    deleted,
    highlighted,
    isReply,
    id,
    showBoxShadow = true,
}: {
    body: any;
    isUsersMessage: boolean;
    sender?: UserType;
    deleted?: boolean;
    highlighted?: boolean;
    isReply?: boolean;
    id?: number;
    showBoxShadow?: boolean;
}) {
    const roomId = parseInt(useParams().id || "");
    const changeTerm = useSelector(selectChangeTerm({ text: filterText(body.text), roomId, id }));
    const backgroundColor = highlighted
        ? "#d7aa5a"
        : deleted
        ? "background.transparent"
        : isUsersMessage
        ? "common.myMessageBackground"
        : "background.paper";

    const filteredText = changeTerm ? changeTerm.to : filterText(body.text);
    const isEmoji = !isReply && isSingleEmoji(filteredText);

    return (
        <Box
            component={"div"}
            sx={{
                minWidth: "50px",
                maxWidth: "100%",
                backgroundColor: isEmoji ? "transparent" : backgroundColor,
                borderRadius: "10px",
                padding: "6px",
                cursor: "pointer",
                color: deleted ? "text.tertiary" : "common.darkBlue",
                lineHeight: isEmoji ? "3.5rem" : "22px",
                whiteSpace: "pre-wrap",
                fontSize: isEmoji ? "3rem" : "0.95rem",
                border: deleted ? "1px solid #C9C9CA" : "none",
                ...(showBoxShadow && !isEmoji && { boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.10)" }),
            }}
        >
            {sender && (
                <Box mb={1} fontWeight="600">
                    {sender.displayName}
                </Box>
            )}
            <Box
                sx={{
                    overflowWrap: "break-word",
                    fontWeight: "500",
                    fontSize: isEmoji ? "48px" : "14px",
                    margin: "2px 0",
                    "a:visited": {
                        color: "inherit",
                    },
                    "a:link": {
                        color: "inherit",
                    },
                }}
                dangerouslySetInnerHTML={{ __html: filteredText }}
            />
        </Box>
    );
}

function isSingleEmoji(text: string) {
    const emojiRegex =
        /^[ \u{1F000}-\u{1FFFF}\u{200D}\u{FE0F}\u{203C}\u{2049}\u{20E3}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2605}\u{2607}-\u{2612}\u{2614}-\u{2615}\u{2616}-\u{2617}\u{2618}\u{2619}\u{261A}-\u{266F}\u{2670}-\u{2671}\u{2672}-\u{267B}\u{267C}-\u{267E}\u{267F}\u{2680}-\u{2685}\u{2690}-\u{2700}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}-\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2767}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}-\u{1F251}\u{1F300}-\u{1F320}\u{1F321}-\u{1F32C}\u{1F32D}-\u{1F32F}\u{1F330}-\u{1F335}\u{1F336}\u{1F337}-\u{1F37C}\u{1F37D}\u{1F37E}-\u{1F37F}\u{1F380}-\u{1F393}\u{1F394}-\u{1F395}\u{1F396}-\u{1F397}\u{1F398}-\u{1F39B}\u{1F39C}\u{1F39D}-\u{1F39E}\u{1F39F}\u{1F3A0}-\u{1F3C4}\u{1F3C5}-\u{1F3C6}\u{1F3C7}-\u{1F3CA}\u{1F3CB}-\u{1F3CC}\u{1F3CD}-\u{1F3CE}\u{1F3CF}\u{1F3D0}-\u{1F3D3}\u{1F3D4}-\u{1F3DF}\u{1F3E0}-\u{1F3F0}\u{1F3F3}-\u{1F3F5}\u{1F3F7}\u{1F3F8}-\u{1F3FA}\u{1F3FB}-\u{1F3FF}\u{1F400}-\u{1F43E}\u{1F43F}\u{1F440}\u{1F441}\u{1F442}-\u{1F4F7}\u{1F4F8}\u{1F4F9}-\u{1F4FC}\u{1F4FD}-\u{1F4FE}\u{1F4FF}\u{1F500}-\u{1F50F}\u{1F510}-\u{1F514}\u{1F515}\u{1F516}-\u{1F52B}\u{1F52C}-\u{1F52F}\u{1F530}-\u{1F53D}\u{1F546}-\u{1F54A}\u{1F54B}-\u{1F54F}\u{1F550}-\u{1F567}\u{1F568}-\u{1F56A}\u{1F56B}-\u{1F570}\u{1F571}-\u{1F573}\u{1F574}-\u{1F575}\u{1F576}-\u{1F579}\u{1F57A}\u{1F57B}-\u{1F587}\u{1F588}-\u{1F589}\u{1F58A}-\u{1F58D}\u{1F58E}-\u{1F58F}\u{1F590}\u{1F591}-\u{1F594}\u{1F595}-\u{1F596}\u{1F597}-\u{1F5A3}\u{1F5A4}\u{1F5A5}\u{1F5A6}-\u{1F5A7}\u{1F5A8}\u{1F5A9}\u{1F5AA}\u{1F5AB}\u{1F5AC}\u{1F5AD}-\u{1F5AE}\u{1F5AF}\u{1F5B0}-\u{1F5B3}\u{1F5B4}\u{1F5B5}-\u{1F5B6}\u{1F5B7}\u{1F5B8}\u{1F5B9}\u{1F5BA}\u{1F5BB}-\u{1F5BC}\u{1F5BD}\u{1F5BE}-\u{1F5BF}\u{1F5C0}\u{1F5C1}\u{1F5C2}-\u{1F5C4}\u{1F5C5}\u{1F5C6}-\u{1F5C7}\u{1F5C8}-\u{1F5C9}\u{1F5CA}-\u{1F5CB}\u{1F5CC}-\u{1F5CD}\u{1F5CE}-\u{1F5CF}\u{1F5D0}-\u{1F5D3}\u{1F5D4}-\u{1F5DB}\u{1F5DC}-\u{1F5DE}\u{1F5DF}\u{1F5E0}\u{1F5E1}-\u{1F5E2}\u{1F5E3}\u{1F5E4}\u{1F5E5}\u{1F5E6}\u{1F5E7}-\u{1F5E8}\u{1F5E9}-\u{1F5EA}\u{1F5EB}-\u{1F5EF}\u{1F5F0}\u{1F5F1}-\u{1F5F2}\u{1F5F3}\u{1F5F4}\u{1F5F5}\u{1F5F6}\u{1F5F7}\u{1F5F8}-\u{1F5F9}\u{1F5FA}-\u{1F64F}\u{1F650}-\u{1F67F}\u{1F680}-\u{1F6C5}\u{1F6C6}-\u{1F6CF}\u{1F6D0}-\u{1F6D2}\u{1F6D3}-\u{1F6D4}\u{1F6D5}\u{1F6D6}-\u{1F6D7}\u{1F6D8}\u{1F6D9}-\u{1F6DF}\u{1F6E0}-\u{1F6EC}\u{1F6ED}\u{1F6EE}-\u{1F6F0}\u{1F6F1}-\u{1F6F3}\u{1F6F4}-\u{1F6F6}\u{1F6F7}-\u{1F6F8}\u{1F6F9}-\u{1F6FC}\u{1F6FD}-\u{1F6FF}\u{1F700}-\u{1F773}\u{1F780}-\u{1F7D4}\u{1F7D5}-\u{1F7D8}\u{1F7D9}-\u{1F7EC}\u{1F7ED}-\u{1F7EE}\u{1F7EF}-\u{1F7F0}\u{1F7F1}-\u{1F7F4}\u{1F7F5}-\u{1F7F8}\u{1F7F9}-\u{1F7FC}\u{1F7FD}\u{1F7FE}-\u{1F7FF}\u{1F800}-\u{1F80B}\u{1F810}-\u{1F847}\u{1F850}-\u{1F859}\u{1F860}-\u{1F887}\u{1F890}-\u{1F8AD}\u{1F900}-\u{1F90B}\u{1F90C}-\u{1F93A}\u{1F93C}-\u{1F945}\u{1F947}-\u{1F94B}\u{1F94C}-\u{1F94F}\u{1F950}-\u{1F95E}\u{1F95F}-\u{1F96B}\u{1F96C}-\u{1F970}\u{1F971}-\u{1F972}\u{1F973}-\u{1F976}\u{1F977}-\u{1F979}\u{1F97A}\u{1F97B}-\u{1F97F}\u{1F980}-\u{1F984}\u{1F985}-\u{1F991}\u{1F992}-\u{1F997}\u{1F998}-\u{1F9A2}\u{1F9A3}-\u{1F9A4}\u{1F9A5}-\u{1F9AA}\u{1F9AB}-\u{1F9AD}\u{1F9AE}-\u{1F9AF}\u{1F9B0}-\u{1F9B9}\u{1F9BA}-\u{1F9BF}\u{1F9C0}-\u{1F9C2}\u{1F9C3}-\u{1F9CA}\u{1F9CB}-\u{1F9CC}\u{1F9CD}-\u{1F9CF}\u{1F9D0}-\u{1F9E6}\u{1F9E7}-\u{1F9FF}\u{1FA00}-\u{1FA53}\u{1FA54}-\u{1FA55}\u{1FA56}-\u{1FA5F}\u{1FA60}-\u{1FA6D}\u{1FA6E}-\u{1FA6F}\u{1FA70}-\u{1FA73}\u{1FA74}-\u{1FA77}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA82}\u{1FA83}-\u{1FA86}\u{1FA87}\u{1FA90}-\u{1FA95}\u{1FA96}-\u{1FFFD}\u{200C}\u{200D}]*$/u;

    return emojiRegex.test(text);
}
