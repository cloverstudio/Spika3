import { RefObject, useEffect } from "react";

const useAutoSizeTextArea = (textAreaRef: RefObject<HTMLTextAreaElement>, value: string) => {
    useEffect(() => {
        if (value) {
            textAreaRef.current.style.height = "0px";
            const scrollHeight = textAreaRef.current.scrollHeight;

            if (scrollHeight < 250) {
                textAreaRef.current.style.height = scrollHeight + "px";
            } else {
                textAreaRef.current.style.height = "250px";
            }
        } else textAreaRef.current.style.height = "auto";
    }, [textAreaRef, value]);
};

export default useAutoSizeTextArea;
