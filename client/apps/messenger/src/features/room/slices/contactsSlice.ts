import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "../../../types/User";
import { dynamicBaseQuery } from "../../../api/api";

import type { RootState } from "../../../store/store";

interface ContactsState {
    list: User[];
    count: number;
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
}

export const fetchContact = createAsyncThunk(
    "user/fetchContact",
    async (args: { page: number; keyword: string }) => {
        const response = await dynamicBaseQuery(
            `/messenger/contacts?page=${args.page}&keyword=${args.keyword}`
        );
        return {
            data: response.data,
            keyword: args.keyword,
            page: args.page,
        };
    }
);

export const contactsSlice = createSlice({
    name: <string>"contacts",
    initialState: <ContactsState>{ list: [], count: null },
    reducers: {
        resetContacts(state) {
            state.list = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchContact.fulfilled, (state, { payload }) => {
            const userIds = state.list.map((u) => u.id);
            const notAdded = payload.data.list.filter((u: User) => !userIds.includes(u.id));

            if (state.keyword !== payload.keyword && payload.page === 1) {
                state.list = [...payload.data.list];
            } else {
                state.list = [...state.list, ...notAdded];
            }

            state.count = payload.data.count;
            state.loading = "idle";
        });
        builder.addCase(fetchContact.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchContact.rejected, (state) => {
            state.loading = "failed";
        });
    },
});

export const {} = contactsSlice.actions;

export const selectContacts = (
    state: RootState
): ContactsState & { sortedByDisplayName: [string, User[]][] } => {
    const sortedByDisplayNameObj = state.contacts.list.reduce((acc: any, user) => {
        if (user.displayName) {
            const firstLetter = user.displayName[0].toLocaleUpperCase();
            if (acc[firstLetter]) {
                acc[firstLetter].push(user);
            } else {
                acc[firstLetter] = [user];
            }
        }

        return acc;
    }, {});

    const sortedByDisplayName = Object.entries<User[]>(sortedByDisplayNameObj).sort((a, b) =>
        a[0] < b[0] ? -1 : 1
    );

    return { ...state.contacts, sortedByDisplayName };
};

export const selectContactById =
    (id: number) =>
    (state: RootState): User =>
        state.contacts.list.find((u) => u.id === id);

export const selectContactLoading =
    () =>
    (state: RootState): "idle" | "pending" | "succeeded" | "failed" =>
        state.room.loading;

export const { resetContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
