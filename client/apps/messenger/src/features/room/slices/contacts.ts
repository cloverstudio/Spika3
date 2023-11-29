import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "../../../types/User";
import { dynamicBaseQuery } from "../../../api/api";

import type { RootState } from "../../../store/store";
import { Room } from "@prisma/client";

interface ContactsState {
    list: User[];
    recentUserMessages: User[];
    recentGroupChats: Room[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
    count?: number;
    cursor?: number;
    groupsCursor?: number;
    groupsCount?: number;
    groupMessageRooms: (Room & { type: "group" })[];
}

export const fetchContacts = createAsyncThunk("user/fetchContact", async (_, thunkAPI) => {
    const { count, keyword, cursor } = (thunkAPI.getState() as RootState).contacts;
    const noMore = count === 0 || !!(count && !cursor);

    if (noMore) {
        throw new Error("Can't fetch");
    }

    const response = await dynamicBaseQuery(
        `/messenger/contacts?keyword=${keyword}&${cursor ? `cursor=${cursor}` : ""}`,
    );

    return {
        data: response.data,
    };
});

export const fetchGroupMessageRooms = createAsyncThunk(
    "user/fetchGroupMessageRoom",
    async (_, thunkAPI) => {
        const { groupsCount, keyword, groupsCursor } = (thunkAPI.getState() as RootState).contacts;

        const noMore = groupsCount === 0 || !!(groupsCount && !groupsCursor);

        if (noMore) {
            throw new Error("Can't fetch");
        }

        const response = await dynamicBaseQuery(
            `/messenger/group-message-rooms?keyword=${keyword}&${
                groupsCursor ? `cursor=${groupsCursor}` : ""
            }`,
        );
        return {
            data: response.data,
        };
    },
);

export const contactsSlice = createSlice({
    name: <string>"contacts",
    initialState: <ContactsState>{
        list: [],
        recentUserMessages: [],
        recentGroupChats: [],
        count: null,
        keyword: "",
        loading: "idle",
        cursor: null,
        groupsCursor: null,
        groupsCount: null,
        groupMessageRooms: [],
    },
    reducers: {
        setKeyword(state, action: { payload: string }) {
            state.keyword = action.payload;
            state.count = null;
            state.cursor = null;
            state.groupsCursor = null;
            state.groupsCount = null;
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

            state.recentUserMessages = payload.data.recentUserMessages;

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
        builder.addCase(fetchGroupMessageRooms.fulfilled, (state, { payload }) => {
            const groupRoomIds = state.groupMessageRooms.map((u) => u.id);
            const notAdded = payload.data.groupMessageRoomList.filter(
                (g: Room) => !groupRoomIds.includes(g.id),
            );

            if (!state.groupsCursor) {
                state.groupMessageRooms = payload.data.groupMessageRoomList;
            } else {
                state.groupMessageRooms = [...state.groupMessageRooms, ...notAdded];
            }

            state.recentGroupChats = payload.data.recentGroupChats;

            state.groupsCursor = payload.data.nextCursor;
            state.groupsCount = payload.data.count;
            state.loading = "idle";
        });
        builder.addCase(fetchGroupMessageRooms.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchGroupMessageRooms.rejected, (state) => {
            state.loading = "failed";
        });
    },
});

export const {} = contactsSlice.actions;

export const selectContacts =
    (options: { displayBots: boolean; showRecentChats?: boolean }) =>
    (
        state: RootState,
    ): ContactsState & {
        sortedByDisplayName: [string, User[]][];
        groupsSortedByDisplayName: [string, Room[]][];
    } => {
        const sortedByDisplayNameObj = state.contacts.list
            .filter((u) => u.isBot === options.displayBots)
            .reduce((acc: any, user) => {
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

        const groupsSortedByDisplayNameObj = state.contacts.groupMessageRooms.reduce(
            (acc: any, group) => {
                if (group.name) {
                    const firstLetter = group.name[0].toLocaleUpperCase();
                    if (acc[firstLetter]) {
                        acc[firstLetter].push(group);
                    } else {
                        acc[firstLetter] = [group];
                    }
                }

                return acc;
            },
            {},
        );

        const groupsSortedByDisplayName = Object.entries<Room[]>(groupsSortedByDisplayNameObj).sort(
            (a, b) => (a[0] < b[0] ? -1 : 1),
        );

        return { ...state.contacts, sortedByDisplayName, groupsSortedByDisplayName };
    };

export const selectContactById = (id: number) => (state: RootState) =>
    state.contacts.list.find((u) => u.id === id);
export const selectContactLoading = () => (state: RootState) => state.contacts.loading;
export const selectKeyword = () => (state: RootState) => state.contacts.keyword;

export const { setKeyword } = contactsSlice.actions;
export default contactsSlice.reducer;
