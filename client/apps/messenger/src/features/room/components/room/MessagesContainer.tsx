import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function MessagesContainer({
    children,
    onLoadMore,
}: {
    children: React.ReactNode;
    onLoadMore: () => boolean;
}): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        ref.current.dataset.scrollHeight = "";
        ref.current.dataset.locked = "0";
        const observed = new Map();

        let lastMessageCount = Array.from(ref.current.children).filter(
            (e) => !e.id.includes("sending")
        ).length;

        const resizeObserver = new ResizeObserver(() => {
            const lockedForScroll = +ref.current.dataset.locked;

            if (!lockedForScroll) onScrollDown();
        });

        const config = { childList: true, subtree: true };

        const onChildListChange = () => {
            const newChildrenCount = ref.current.children.length;

            if (newChildrenCount) {
                for (let i = 0; i < newChildrenCount; i++) {
                    const element = ref.current.children[i];
                    if (!observed.get(element.id)) {
                        resizeObserver.observe(element);
                        observed.set(element.id, element);
                    }
                }

                const lockedForScroll = +ref.current.dataset.locked;
                const newMessageCount = Array.from(ref.current.children).filter(
                    (e) => !e.id.includes("sending")
                ).length;
                console.log({ lastMessageCount, newMessageCount, lockedForScroll });

                if (lastMessageCount === newMessageCount) {
                    return;
                }

                if (lockedForScroll && lastMessageCount + 1 !== newMessageCount) {
                    console.log("run");
                    const lastScrollHeight = +ref.current.dataset.scrollHeight;
                    if (ref.current.scrollHeight > lastScrollHeight) {
                        ref.current.scrollTop = ref.current.scrollHeight - lastScrollHeight;
                    }
                }

                lastMessageCount = newMessageCount;
            }
        };

        const mutationObserver = new MutationObserver((mutationList) => {
            if (mutationList.some((m) => m.type === "childList")) {
                onChildListChange();
            }
        });

        mutationObserver.observe(ref.current, config);

        console.log("msg contain oberve");

        return () => {
            console.log("msg contain leave");
            mutationObserver.disconnect();
            resizeObserver.disconnect();
        };
    }, [roomId]);

    const onScrollDown = () => {
        if (!ref.current) {
            return;
        }

        scrollElemBottom(ref.current);
        ref.current.dataset.locked = "0";
    };

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (!ref.current) {
            return;
        }

        const target = e.target as HTMLDivElement;

        if (target.scrollTop === 0) {
            const loaded = onLoadMore();
            if (loaded) {
                ref.current.dataset.locked = "1";
            }
        }

        ref.current.dataset.scrollHeight = target.scrollHeight.toString();
    };

    const onWheel = () => {
        if (!ref.current) {
            return;
        }

        const newLockedForScroll = getScrollBottom(ref.current) > 800;
        ref.current.dataset.locked = (+newLockedForScroll).toString();
    };

    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            position="relative"
            sx={{ overflowY: "hidden" }}
        >
            <Box
                ref={ref}
                sx={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    height: "100%",
                    paddingTop: "50px",
                    paddingBottom: "50px",
                }}
                id="room-container"
                px={1}
                onScroll={onScroll}
                onWheel={onWheel}
            >
                {children}
            </Box>
        </Box>
    );
}

function scrollElemBottom(element: HTMLElement): void {
    if (element.scrollHeight > element.clientHeight) {
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }
}

function getScrollBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
}
