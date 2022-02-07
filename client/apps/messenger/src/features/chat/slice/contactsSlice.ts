import { createSlice } from "@reduxjs/toolkit";
import User from "../../../types/User";
import contactsApi from "../api/contacts";

import type { RootState } from "../../../store/store";

interface ContactsState {
    list: User[];
    count: number;
}

export const contactsSlice = createSlice({
    name: <string>"contacts",
    initialState: <ContactsState>{ list: [], count: null },
    reducers: {},
    extraReducers: (builder) => {
        builder.addMatcher(
            contactsApi.endpoints.getContacts.matchFulfilled,
            (state, { payload }) => {
                const userIds = state.list.map((u) => u.id);
                const notAdded = payload.list.filter((u) => !userIds.includes(u.id));

                state.list = [...state.list, ...notAdded];
                state.count = payload.count;
            }
        );
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

export default contactsSlice.reducer;
