import { useEffect } from "react";

export default function useEnterKey(callback: () => void) {
    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                callback();
            }
        };
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [callback]);
}
