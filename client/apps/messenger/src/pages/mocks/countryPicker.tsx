import React, { useEffect } from "react";
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
    ListItemAvatar,
    Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { KeyboardArrowDown, Search } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import * as defaults from "./countries";
import { CountryType } from "./countries";

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

const CountryPicker = () => {
    const countries: CountryType[] = defaults.countries;
    const classes = useStyles();
    const [searchText, setSearchText] = React.useState<string>("");
    const [tempCountries, setTempCountries] = React.useState<CountryType[]>(countries);
    const [countryCode, setCountryCode] = React.useState<string>("1");

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };
    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => {
        console.log(index);
        console.log(tempCountries[index].phone);
        setCountryCode(tempCountries[index].phone);
    };

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
        (async () => {
            await filterCountries(searchText);
        })();
    }, [searchText]);

    const filterCountries = async (search: string) => {
        const filter: CountryType[] = countries.filter(
            (country) => country.label.includes(search) || country.phone.includes(search)
        );
        setTempCountries(filter);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    border: "solid",
                    borderWidth: "1px",
                    borderColor: "lightgray",
                    borderRadius: 1,
                    padding: "0.5em",
                    width: "80%",
                }}
            >
                <Stack justifyContent="center" alignItems="center" spacing={2} direction="row">
                    <Typography color="#0288d1"> +{countryCode}</Typography>
                    <KeyboardArrowDown color="info" />
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
                    />
                </Stack>

                <TextField
                    variant="outlined"
                    fullWidth
                    sx={{
                        backgroundColor: "#F2F2F2",
                        borderRadius: "1em",
                        marginTop: "2em",
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
                    height={400}
                    width="100%"
                    itemSize={46}
                    itemCount={tempCountries.length}
                    overscanCount={5}
                >
                    {renderRow}
                </FixedSizeList>
            </Box>
        </ThemeProvider>
    );
};

export default CountryPicker;
