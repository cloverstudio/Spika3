import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface IncomingMeet {
    roomId: number;
    roomType: string;
    avatarFileId: number;
    displayName: string;
    initiator: string;
}

interface InitialState {
    incomingMeets: IncomingMeet[];
}

const initialState: InitialState = {
    incomingMeets: [],
};

export const incomingMeetDialogSlice = createSlice({
    name: "incomingMeetDialog",
    initialState,
    reducers: {
        addNewIncomingMeet(state, action: PayloadAction<IncomingMeet>) {
            state.incomingMeets.push(action.payload);
        },
        closeIncomingMeet(
            state,
            action: PayloadAction<{
                roomId: number;
            }>,
        ) {
            state.incomingMeets = state.incomingMeets.filter(
                (meet) => meet.roomId !== action.payload.roomId,
            );
        },
    },
});

export const selectIncomingMeets = (state: RootState): IncomingMeet[] =>
    state.incomingMeet.incomingMeets;

export const { addNewIncomingMeet, closeIncomingMeet } = incomingMeetDialogSlice.actions;

export default incomingMeetDialogSlice.reducer;
