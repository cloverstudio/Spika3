import { Box, useTheme } from "@mui/material";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface DatePickerProps {
    onClickDay: (value: Date) => void;
    styles?: React.CSSProperties;
    maxDate?: Date;
    minDate?: Date;
}

export function DatePicker({ onClickDay, styles = {}, maxDate, minDate }: DatePickerProps) {
    const theme = useTheme();

    const isDarkMode = theme.palette.mode === "dark";

    const onClickDayHandler = (value: Date) => {
        onClickDay(value);
    };

    return (
        <Box
            sx={{
                width: "285px",
                border: "none",
                borderRadius: "16px",
                ...styles,
            }}
        >
            <Calendar
                className={`calendar-container ${isDarkMode ? "calendar-dark" : ""}`}
                onClickDay={onClickDayHandler}
                maxDate={maxDate}
                minDate={minDate}
            />
        </Box>
    );
}
