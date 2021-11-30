import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";

import type { RootState } from "./store";

// Define a type for the slice state
interface CounterState {
    value: number;
}

export const counterSlice = createSlice({
    name: <string>"counter",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: <CounterState>{ value: 0 },
    reducers: {
        increment: (state, action: Action) => {
            state.value += 1;
        },
        decrement: (state, action: Action) => {
            state.value -= 1;
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload;
        },
    },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
