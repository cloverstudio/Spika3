import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface FilterState {
    filterType: string;
}

export const filterSlice = createSlice({
    name: <string>"filter",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: <FilterState>{
        filterType: "",
    },
    reducers: {
        setFilter: (state, action: PayloadAction<FilterState>) => {
            state.filterType = action.payload.filterType;
        },
    },
});

export const { setFilter } = filterSlice.actions;

export const currentFilter = (state: RootState): string => state.filter.filterType;

export default filterSlice.reducer;
