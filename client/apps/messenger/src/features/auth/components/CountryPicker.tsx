import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Search from "@mui/icons-material/Search";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import countries, { CountryType } from "../lib/countries";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";

const CountryPicker = (props: any) => {
    const [searchText, setSearchText] = React.useState("");
    const [tempCountries, setTempCountries] = React.useState(countries);
    const [countryCode, setCountryCode] = React.useState("385");
    const [openMenu, setOpenMenu] = React.useState(false);
    const [staticBoxCoordinates, setStaticBoxCoordinates] = React.useState<DOMRect>(null);
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };
    const handlePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.setPhoneNumber(event.target.value);
        const checkPhone = "+" + countryCode + event.target.value;
        props.validation(isValidPhoneNumber(checkPhone));
    };
    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
    ) => {
        setCountryCode(tempCountries[index].phone);
        props.code(tempCountries[index].phone);
        props.validation(isValidPhoneNumber("+" + tempCountries[index].phone + props.phoneNumber));
        setOpenMenu(!openMenu);
    };

    const handleOpen = () => {
        setOpenMenu(!openMenu);
    };

    const inputRef = useRef<HTMLDivElement>(null);

    function renderRow(props: ListChildComponentProps) {
        const { index, style } = props;

        return (
            <ListItem
                style={style}
                key={index}
                component="div"
                disablePadding
                secondaryAction={
                    <Typography color="text.dropdown">+{tempCountries[index].phone}</Typography>
                }
            >
                <ListItemButton onClick={(event) => handleListItemClick(event, index)}>
                    <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${tempCountries[
                            index
                        ].code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${tempCountries[
                            index
                        ].code.toLowerCase()}.png 2x`}
                        alt=""
                    />
                    <ListItemText
                        sx={{ marginLeft: 1, color: "text.dropdown" }}
                        primary={tempCountries[index][`label${currentLanguage.toUpperCase()}`]}
                    />
                </ListItemButton>
            </ListItem>
        );
    }

    useEffect(() => {
        if (inputRef.current) {
            setStaticBoxCoordinates(inputRef.current.getBoundingClientRect());
        }
        filterCountries(searchText);
    }, [searchText]);

    const filterCountries = async (search: string) => {
        const filter: CountryType[] = countries.filter(
            (country) =>
                country[`label${currentLanguage.toUpperCase()}`]
                    .toLowerCase()
                    .includes(search.toLowerCase()) || country.phone.includes(search),
        );
        setTempCountries(filter);
    };

    return (
        <div ref={inputRef} style={{ width: "100%" }}>
            <Box
                sx={{
                    border: "solid",
                    borderWidth: "1px",
                    borderColor: isDarkMode ? "#9AA0A6" : "divider",
                    borderRadius: "10px",
                    width: "100%",
                }}
            >
                <Stack justifyContent="center" alignItems="center" spacing={2} direction="row">
                    <Button onClick={() => handleOpen()}>
                        <Typography color="text.secondary" fontWeight="medium">
                            +{countryCode}
                        </Typography>
                        {!openMenu ? (
                            <KeyboardArrowDown
                                sx={{
                                    color: "text.secondary",
                                }}
                            />
                        ) : (
                            <KeyboardArrowUp
                                sx={{
                                    color: "text.secondary",
                                }}
                            />
                        )}
                    </Button>
                    <Divider
                        orientation="vertical"
                        sx={{ borderColor: isDarkMode ? "#9AA0A6" : "divider" }}
                        flexItem
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        autoFocus
                        size="small"
                        placeholder={t("phoneNumberExample")}
                        id="phoneNumber"
                        InputProps={{
                            type: "number",
                        }}
                        inputProps={{
                            pattern: "[0-9]*",
                        }}
                        sx={{
                            fieldset: {
                                border: "none",
                            },
                            input: {
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
                        onChange={handlePhoneNumber}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                props.onEnter();
                            }
                        }}
                        onFocus={() => setOpenMenu(false)}
                    />
                </Stack>
                {openMenu ? (
                    <Box
                        sx={{
                            position: "absolute",
                            backgroundColor: "background.default",
                            zIndex: 10,
                            width: staticBoxCoordinates.width,
                            // left: staticBoxCoordinates.left,
                            padding: "0.5em",
                            borderStyle: "none solid solid solid",
                            borderWidth: "1px",
                            borderColor: "divider",
                            borderRadius: 1,
                        }}
                    >
                        <TextField
                            variant="outlined"
                            fullWidth
                            autoFocus
                            sx={{
                                marginTop: "1rem",
                                marginBottom: "2rem",
                            }}
                            value={searchText}
                            onChange={handleSearch}
                            placeholder={t("search")}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: "background.paper",
                                    borderRadius: "0.75rem",
                                },
                            }}
                            inputProps={{
                                style: {
                                    padding: 10,
                                },
                            }}
                        />
                        <Typography
                            textTransform="uppercase"
                            marginLeft="1em"
                            color="text.dropdown"
                        >
                            {t("allCountries")}
                        </Typography>
                        <FixedSizeList
                            height={200}
                            width="100%"
                            itemSize={46}
                            itemCount={tempCountries.length}
                            overscanCount={5}
                        >
                            {renderRow}
                        </FixedSizeList>
                    </Box>
                ) : (
                    <Box></Box>
                )}
            </Box>
        </div>
    );
};

export default CountryPicker;
