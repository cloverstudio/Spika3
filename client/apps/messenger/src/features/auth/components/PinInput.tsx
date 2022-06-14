import React from "react";
import { Box, InputBase } from "@mui/material";

type Code = {
    value: string;
    ref: React.MutableRefObject<any>;
};

type Props = {
    codeArr: Code[];
    setCodeArr: React.Dispatch<React.SetStateAction<Code[]>>;
};

export default function PinInput({ codeArr, setCodeArr }: Props): React.ReactElement {
    return (
        <Box
            display="grid"
            gap={1}
            gridTemplateColumns="repeat(6, 1fr)"
            justifyContent="space-between"
        >
            {codeArr.map((c, i) => {
                return (
                    <NumberInput
                        key={i}
                        value={c.value}
                        inputRef={c.ref}
                        handleChange={(value) => {
                            const isDelete = !value;
                            const previousValue = c.value;
                            const newArr = [...codeArr];

                            if (value && isNaN(+value)) {
                                return;
                            }

                            if (!previousValue && isDelete && i > 0) {
                                newArr.splice(i - 1, 1, { ...codeArr[i - 1], value });

                                setCodeArr(newArr);

                                newArr[i - 1].ref.current.focus();
                                return;
                            }

                            if (!isDelete && value.length > 1) {
                                return;
                            }

                            newArr.splice(i, 1, { ...codeArr[i], value });
                            setCodeArr(newArr);

                            if (i < 5 && !isDelete) {
                                newArr[i + 1].ref.current.focus();
                            }
                        }}
                    />
                );
            })}
        </Box>
    );
}

function NumberInput({
    value,
    handleChange,
    inputRef,
}: {
    value: string;
    handleChange: (v: string) => void;
    inputRef: React.MutableRefObject<any>;
}): React.ReactElement {
    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
        event
    ) => {
        if (event.key === "Backspace") {
            handleChange("");
        }
    };
    return (
        <Box>
            <InputBase
                inputProps={{
                    ref: inputRef,
                    pattern: "[1-9]",
                    type: "number",
                }}
                value={value}
                onChange={({ target }) => {
                    handleChange(target.value);
                }}
                onKeyDown={handleKeyDown}
                sx={{
                    input: {
                        border: "1px solid",
                        borderColor: "text.tertiary",
                        borderRadius: "0.625rem",
                        height: "100%",
                        padding: "5px",
                        textAlign: "center",
                        color: "primary.main",
                        fontWeight: "bold",
                        lineHeight: "34px",
                        "&::-webkit-outer-spin-button": {
                            margin: "0",
                            WebkitAppearance: "none",
                        },
                        "&::-webkit-inner-spin-button": {
                            margin: "0",
                            WebkitAppearance: "none",
                        },
                        "&[type=number]": {
                            margin: "0",
                            WebkitAppearance: "textfield",
                        },
                    },
                }}
            />
        </Box>
    );
}
