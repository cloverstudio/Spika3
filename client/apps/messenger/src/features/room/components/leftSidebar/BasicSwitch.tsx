import * as React from "react";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

export default styled(Switch)(({ theme, checked }) => {
    return {
        width: 62,
        height: 34,
        padding: 7,
        "& .MuiSwitch-switchBase": {
            margin: 1,
            padding: 0,
            transform: "translateX(6px)",
            "&.Mui-checked": {
                transform: "translateX(22px)",
                "& + .MuiSwitch-track": {
                    opacity: 1,
                    backgroundColor: theme.palette.mode === "dark" ? "#737373" : "#C4C4C4",
                },
            },
        },
        "& .MuiSwitch-thumb": {
            backgroundColor:
                theme.palette.mode === "dark"
                    ? checked
                        ? "#fff"
                        : "#C9C9CA"
                    : checked
                      ? theme.palette.primary.main
                      : "#E6E6E6",
            width: 32,
            height: 32,
            "&:before": {
                content: "''",
                position: "absolute",
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
            },
        },
        "& .MuiSwitch-track": {
            opacity: 1,
            backgroundColor: theme.palette.mode === "dark" ? "#737373" : "#C4C4C4",
            borderRadius: 20 / 2,
        },
    };
});
