import React, { useEffect, useRef } from "react";
import {
    Box,
    Stack,
    TextField,
    Typography,
    Divider,
    InputAdornment,
    ListItem,
    ListItemText,
    ListItemButton,
    Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { KeyboardArrowDown, KeyboardArrowUp, Search } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import countries, { CountryType } from "../lib/countries";
import { isValidPhoneNumber } from "libphonenumber-js";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

const useStyles = makeStyles(() => ({
    noBorder: {
        border: "none",
    },
}));

const CountryPicker = (props: any) => {
    const classes = useStyles();
    const [searchText, setSearchText] = React.useState("");
    const [tempCountries, setTempCountries] = React.useState(countries);
    const [countryCode, setCountryCode] = React.useState("1");
    const [openMenu, setOpenMenu] = React.useState(false);
    const [staticBoxCoordinates, setStaticBoxCoordinates] = React.useState<DOMRect>(null);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };
    const handlePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.phoneNum(event.target.value);
        const checkPhone = "+" + countryCode + event.target.value;
        props.validation(isValidPhoneNumber(checkPhone));
    };
    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => {
        setCountryCode(tempCountries[index].phone);
        props.code(tempCountries[index].phone);
        setOpenMenu(!openMenu);
    };

    const handleOpen = () => {
        setOpenMenu(!openMenu);
    };

    const inputRef = useRef(null);

    function renderRow(props: ListChildComponentProps) {
        const { index, style } = props;

        return (
            <ListItem
                style={style}
                key={index}
                component="div"
                disablePadding
                secondaryAction={
                    <Typography color="#9AA0A6">+{tempCountries[index].phone}</Typography>
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
                    <ListItemText sx={{ marginLeft: 1 }} primary={tempCountries[index].label} />
                </ListItemButton>
            </ListItem>
        );
    }

    useEffect(() => {
        setStaticBoxCoordinates(inputRef.current.getBoundingClientRect());
        (async () => {
            await filterCountries(searchText);
        })();
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
        <ThemeProvider theme={theme}>
            <div ref={inputRef} style={{ width: "100%" }}>
                <Box
                    sx={{
                        border: "solid",
                        borderWidth: "1px",
                        borderColor: "lightgray",
                        borderRadius: 1,
                        padding: "0.5em",
                        width: "100%",
                    }}
                >
                    <Stack justifyContent="center" alignItems="center" spacing={2} direction="row">
                        <Button onClick={() => handleOpen()}>
                            <Typography color="#0288d1"> +{countryCode}</Typography>
                            {!openMenu ? (
                                <KeyboardArrowDown color="info" />
                            ) : (
                                <KeyboardArrowUp color="info" />
                            )}
                        </Button>
                        <Divider orientation="vertical" flexItem />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            autoFocus
                            size="small"
                            placeholder="Eg. 98334234"
                            InputProps={{
                                classes: { notchedOutline: classes.noBorder },
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
                                borderColor: "lightgray",
                                borderRadius: 1,
                            }}
                        >
                            <TextField
                                variant="outlined"
                                fullWidth
                                autoFocus
                                sx={{
                                    backgroundColor: "#F2F2F2",
                                    borderRadius: "1em",
                                    marginTop: "1.0em",
                                    marginBottom: "2em",
                                }}
                                value={searchText}
                                onChange={handleSearch}
                                placeholder="Search"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                    classes: { notchedOutline: classes.noBorder },
                                }}
                                inputProps={{
                                    style: {
                                        padding: 10,
                                    },
                                }}
                            />
                            <Typography color="#9AA0A6" marginLeft="1em">
                                ALL COUNTRIES
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
        </ThemeProvider>
    );
};

export default CountryPicker;
