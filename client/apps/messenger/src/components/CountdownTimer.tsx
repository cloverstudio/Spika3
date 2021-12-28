import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import useCountdownTimer from "../hooks/useCountdownTimer";

type Props = {
    onDone: () => void;
};

export default function CountdownTimer({ onDone }: Props): React.ReactElement {
    const timeLeft = useCountdownTimer(20);
    const m = timeLeft ? `0${Math.floor(timeLeft / 60)}` : "00";
    const s =
        timeLeft && timeLeft % 60 > 0
            ? timeLeft % 60 < 10
                ? `0${timeLeft % 60}`
                : timeLeft % 60
            : "00";

    useEffect(() => {
        if (timeLeft === 0) {
            onDone();
        }
    }, [timeLeft, onDone]);
    return (
        <Typography component="span" variant="body1" fontWeight="medium">
            {`${m}:${s}`}
        </Typography>
    );
}
