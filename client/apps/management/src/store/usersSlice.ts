import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "@/types/User";
import { dynamicBaseQuery } from "@/api";

import type { RootState } from "@/store";

interface UsersState {
    list: User[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
    count?: number;
    cursor?: number;
}

export const fetchContacts = createAsyncThunk("user/fetchContact", async (_, thunkAPI) => {
    const { count, keyword, cursor } = (thunkAPI.getState() as RootState).users;
    const noMore = count === 0 || !!(count && !cursor);

    if (noMore) {
        throw new Error("Can't fetch");
    }

    const response = await dynamicBaseQuery(
        `/management/users/members?keyword=${keyword}&${cursor ? `cursor=${cursor}` : ""}`,
    );
    return {
        data: response.data,
    };
});

export const usersSlice = createSlice({
    name: <string>"contacts",
    initialState: <UsersState>{
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
            const notAdded = payload.data.data.list.filter((u: User) => !userIds.includes(u.id));

            if (!state.cursor) {
                state.list = payload.data.data.list;
            } else {
                state.list = [...state.list, ...notAdded];
            }

            state.cursor = payload.data.data.nextCursor;
            state.count = payload.data.data.count;
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

export const {} = usersSlice.actions;

export const selectContacts =
    (hideBots: boolean) =>
    (state: RootState): UsersState & { sortedByDisplayName: [string, User[]][] } => {
        const sortedByDisplayNameObj = state.users.list.reduce((acc: any, user) => {
            if (hideBots && user.isBot) return acc;

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
            a[0] < b[0] ? -1 : 1,
        );

        return { ...state.users, sortedByDisplayName };
    };

export const selectContactById = (id: number) => (state: RootState) =>
    state.users.list.find((u) => u.id === id);
export const selectContactLoading = () => (state: RootState) => state.users.loading;
export const selectKeyword = () => (state: RootState) => state.users.keyword;

export const { setKeyword } = usersSlice.actions;
export default usersSlice.reducer;
