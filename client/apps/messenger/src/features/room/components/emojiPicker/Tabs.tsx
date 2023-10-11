import React from "react";
import { Box } from "@mui/material";

import { ActivityIcon } from "./icons/ActivityIcon";
import { FlagsIcon } from "./icons/FlagsIcon";
import { FoodIcon } from "./icons/FoodIcon";
import { NatureIcon } from "./icons/NatureIcon";
import { ObjectsIcon } from "./icons/ObjectsIcon";
import { PeopleIcon } from "./icons/PeopleIcon";
import { RecentIcon } from "./icons/RecentIcon";
import { SymbolsIcon } from "./icons/SymbolsIcon";
import { TravelIcon } from "./icons/TravelIcon";

type TabsProps = {
    value: number;
    showIndicator: boolean;
    onChange(newValue: number): void;
};

interface Tab {
    id: string;
    name: string;
    icon: JSX.Element;
}

export const categories: Tab[] = [
    {
        id: "recent",
        name: "Recent",
        icon: <RecentIcon />,
    },
    {
        id: "smileys-people",
        name: "Smileys & People",
        icon: <PeopleIcon />,
    },
    {
        id: "animals-nature",
        name: "Animals & Nature",
        icon: <NatureIcon />,
    },
    {
        id: "food-drink",
        name: "Food & Drink",
        icon: <FoodIcon />,
    },
    {
        id: "activity",
        name: "Activity",
        icon: <ActivityIcon />,
    },
    {
        id: "travel-places",
        name: "Travel & Places",
        icon: <TravelIcon />,
    },

    {
        id: "objects",
        name: "Objects",
        icon: <ObjectsIcon />,
    },
    {
        id: "symbols",
        name: "Symbols",
        icon: <SymbolsIcon />,
    },
    {
        id: "flags",
        name: "Flags",
        icon: <FlagsIcon />,
    },
];

export default function Tabs({ value, onChange, showIndicator }: TabsProps): React.ReactElement {
    return (
        <Box display="flex" justifyContent="left" gap={1} mb={2} mt={"10px"}>
            {categories
                .filter((category) => {
                    if (category.id === "recent") {
                        return false;
                    }
                    return true;
                })
                .map((category, index) => (
                    <Box
                        key={`tabs-${category.id}`}
                        onClick={() => onChange(index)}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        width="40px"
                        height="40px"
                        borderRadius="50%"
                        p={1}
                        bgcolor={value === index && showIndicator ? "action.hover" : "transparent"}
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: "action.hover",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                height: "24px",
                                color:
                                    value === index && showIndicator
                                        ? "primary.main"
                                        : "text.navigation",
                            }}
                        >
                            {category.icon}
                        </Box>
                    </Box>
                ))}
        </Box>
    );
}
