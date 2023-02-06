import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "../../../types/User";
import { dynamicBaseQuery } from "../../../api/api";

import type { RootState } from "../../../store/store";

interface ContactsState {
    list: User[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
    count?: number;
    cursor?: number;
}

export const fetchContacts = createAsyncThunk(
    "user/fetchContact",
    async ({ showBots }: { showBots?: boolean }, thunkAPI) => {
        const { count, keyword, cursor } = (thunkAPI.getState() as RootState).contacts;
        const noMore = count === 0 || !!(count && !cursor);

        if (noMore) {
            throw new Error("Can't fetch");
        }

        const response = await dynamicBaseQuery(
            `/messenger/contacts?keyword=${keyword}&showBots=${showBots ? "1" : ""}&${
                cursor ? `cursor=${cursor}` : ""
            }`
        );
        return {
            data: response.data,
        };
    }
);

export const contactsSlice = createSlice({
    name: <string>"contacts",
    initialState: <ContactsState>{
        list: [],
        count: null,
        keyword: "",
        loading: "idle",
        cursor: null,
    },
    reducers: {
        setKeyword(state, action: { payload: string }) {
            state.keyword = action.payload;
            state.count = null;
            state.cursor = null;
            state.loading = "idle";
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchContacts.fulfilled, (state, { payload }) => {
            const userIds = state.list.map((u) => u.id);
            const notAdded = payload.data.list.filter((u: User) => !userIds.includes(u.id));

            if (!state.cursor) {
                state.list = payload.data.list;
            } else {
                state.list = [...state.list, ...notAdded];
            }

            state.cursor = payload.data.nextCursor;
            state.count = payload.data.count;
            state.loading = "idle";
        });
        builder.addCase(fetchContacts.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchContacts.rejected, (state) => {
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

export const selectContactById = (id: number) => (state: RootState) =>
    state.contacts.list.find((u) => u.id === id);
export const selectContactLoading = () => (state: RootState) => state.contacts.loading;
export const selectKeyword = () => (state: RootState) => state.contacts.keyword;

export const { setKeyword } = contactsSlice.actions;
export default contactsSlice.reducer;
