import React from "react";
import { Typography } from "@mui/material";

type Props = {
    timeLeft: number;
};

export default function CountdownTimer({ timeLeft }: Props): React.ReactElement {
    const m = timeLeft ? `0${Math.floor(timeLeft / 60)}` : "00";
    const s =
        timeLeft && timeLeft % 60 > 0
            ? timeLeft % 60 < 10
                ? `0${timeLeft % 60}`
                : timeLeft % 60
            : "00";

    return (
        <Typography component="span" variant="body1" fontWeight="medium">
            {`${m}:${s}`}
        </Typography>
    );
}
