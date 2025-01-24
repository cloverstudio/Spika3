import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface IncomingCall {
    roomId: number;
    roomType: string;
    avatarFileId: number;
    displayName: string;
    initiator: string;
}

interface InitialState {
    incomingCalls: IncomingCall[];
}

const initialState: InitialState = {
    incomingCalls: [],
};

export const incomingCallDialogSlice = createSlice({
    name: "incomingCallDialog",
    initialState,
    reducers: {
        addNewIncomingCall(state, action: PayloadAction<IncomingCall>) {
            state.incomingCalls.push(action.payload);
        },
        closeIncomingCall(
            state,
            action: PayloadAction<{
                roomId: number;
            }>,
        ) {
            state.incomingCalls = state.incomingCalls.filter(
                (call) => call.roomId !== action.payload.roomId,
            );
        },
    },
});

export const selectIncomingCalls = (state: RootState): IncomingCall[] =>
    state.incomingCall.incomingCalls;

export const { addNewIncomingCall, closeIncomingCall } = incomingCallDialogSlice.actions;

export default incomingCallDialogSlice.reducer;
