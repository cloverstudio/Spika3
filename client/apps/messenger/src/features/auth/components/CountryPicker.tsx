import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
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
import useStrings from "../../../hooks/useStrings";

const CountryPicker = (props: any) => {
    const [searchText, setSearchText] = React.useState("");
    const [tempCountries, setTempCountries] = React.useState(countries);
    const [countryCode, setCountryCode] = React.useState("385");
    const [openMenu, setOpenMenu] = React.useState(false);
    const [staticBoxCoordinates, setStaticBoxCoordinates] = React.useState<DOMRect>(null);
    const strings = useStrings();

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
        index: number
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
                    <Typography color="text.tertiary">+{tempCountries[index].phone}</Typography>
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
                        sx={{ marginLeft: 1, color: "text.tertiary" }}
                        primary={tempCountries[index].label}
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
                country.label.toLowerCase().includes(search.toLowerCase()) ||
                country.phone.includes(search)
        );
        setTempCountries(filter);
    };

    return (
        <div ref={inputRef} style={{ width: "100%" }}>
            <Box
                sx={{
                    border: "solid",
                    borderWidth: "1px",
                    borderColor: "divider",
                    borderRadius: 1,
                    width: "100%",
                }}
            >
                <Stack justifyContent="center" alignItems="center" spacing={2} direction="row">
                    <Button onClick={() => handleOpen()}>
                        <Typography color="primary.main" fontWeight="medium">
                            +{countryCode}
                        </Typography>
                        {!openMenu ? (
                            <KeyboardArrowDown color="primary" />
                        ) : (
                            <KeyboardArrowUp color="primary" />
                        )}
                    </Button>
                    <Divider orientation="vertical" sx={{ borderColor: "divider" }} flexItem />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        autoFocus
                        size="small"
                        placeholder={strings.phoneNumberExample}
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
                    />
                </Stack>
                {openMenu ? (
                    <Box
                        sx={{
                            position: "absolute",
                            backgroundColor: "white",
                            zIndex: 10,
                            width: staticBoxCoordinates.width,
                            left: staticBoxCoordinates.left,
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
                                backgroundColor: "background.paper",
                                borderRadius: "1em",
                                marginTop: "1.0em",
                                marginBottom: "2em",
                            }}
                            value={searchText}
                            onChange={handleSearch}
                            placeholder={strings.search}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                style: {
                                    padding: 10,
                                    border: "none",
                                },
                            }}
                        />
                        <Typography
                            color="text.tertiary"
                            textTransform="uppercase"
                            marginLeft="1em"
                        >
                            {strings.allCountries}
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
