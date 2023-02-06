import { useEffect } from "react";

const useAutoSizeTextArea = (textAreaRef: HTMLTextAreaElement | null, value: string) => {
    useEffect(() => {
        if (textAreaRef) {
            textAreaRef.style.height = "0px";
            const scrollHeight = textAreaRef.scrollHeight;

            if (scrollHeight < 250) {
                textAreaRef.style.height = scrollHeight + "px";
            } else {
                textAreaRef.style.height = "250px";
            }
        }
    }, [textAreaRef, value]);
};

export default useAutoSizeTextArea;
