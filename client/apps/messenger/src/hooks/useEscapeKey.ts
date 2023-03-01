import { useEffect } from "react";

export default function useEscapeKey(callback: () => void) {
    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                callback();
            }
        };
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [callback]);
}
