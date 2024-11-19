import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "../../../types/User";
import { dynamicBaseQuery } from "../../../api/api";

import type { RootState } from "../../../store/store";
import { Room } from "@prisma/client";
import { RoomUserType } from "../../../types/Rooms";
import dayjs from "dayjs";

interface ContactsState {
    list: User[];
    recentUserChats: User[];
    recentGroupChats: Room[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
    count?: number;
    cursor?: number;
    groupsCursor?: number;
    groupsCount?: number;
    groupMessageRooms: (Room & { type: "group" })[];
    isAdvanceFiltersModalOpen: boolean;
    areAdvanceFiltersApplied: boolean;
    advanceFilters: {
        displayName?: string;
        country?: string;
        gender?: string;
        birthDate?: dayjs.Dayjs;
        isNaturalUser?: boolean;
        isLegalUser?: boolean;
        selectedInterestIds?: number[];
    };
}

export const fetchContacts = createAsyncThunk("user/fetchContact", async (_, thunkAPI) => {
    const { count, keyword, cursor, advanceFilters } = (thunkAPI.getState() as RootState).contacts;
    const noMore = count === 0 || !!(count && !cursor);

    let url = `/messenger/contacts?keyword=${keyword}`;

    if (noMore) {
        throw new Error("Can't fetch");
    }

    if (cursor) {
        url += `&cursor=${cursor}`;
    }

    if (advanceFilters.displayName) {
        url += `&displayName=${advanceFilters.displayName}`;
    }

    if (advanceFilters.country) {
        url += `&country=${advanceFilters.country}`;
    }

    if (advanceFilters.gender) {
        url += `&gender=${advanceFilters.gender}`;
    }

    if (advanceFilters.birthDate) {
        const birthDateFormatted = advanceFilters.birthDate.toString().split("T")[0];
        url += `&birthDate=${birthDateFormatted}`;
    }

    if (advanceFilters.isNaturalUser) {
        url += `&isNaturalUser=${advanceFilters.isNaturalUser}`;
    }

    if (advanceFilters.isLegalUser) {
        url += `&isLegalUser=${advanceFilters.isLegalUser}`;
    }

    if (advanceFilters.selectedInterestIds) {
        url += `&interestIds=${advanceFilters.selectedInterestIds.join(",")}`;
    }



    const response = await dynamicBaseQuery(
        url,
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
            `/messenger/group-message-rooms?keyword=${keyword}&${groupsCursor ? `cursor=${groupsCursor}` : ""
            }`,
        );
        return {
            data: response.data,
        };
    },
);

export const fetchRecentChats = createAsyncThunk("user/fetchRecentChats", async () => {
    const response = await dynamicBaseQuery("/messenger/recent-chats");

    return {
        data: response.data,
    };
});

export const contactsSlice = createSlice({
    name: <string>"contacts",
    initialState: <ContactsState>{
        list: [],
        recentUserChats: [],
        recentGroupChats: [],
        count: null,
        keyword: "",
        loading: "idle",
        cursor: null,
        groupsCursor: null,
        groupsCount: null,
        groupMessageRooms: [],
        isAdvanceFiltersModalOpen: false,
        areAdvanceFiltersApplied: false,
        advanceFilters: {},
    },
    reducers: {
        setKeyword(state, action: { payload: string }) {
            state.keyword = action.payload;
            state.count = null;
            state.cursor = null;
            state.groupsCursor = null;
            state.groupsCount = null;
            if (state.areAdvanceFiltersApplied) {
                state.areAdvanceFiltersApplied = false;
                state.advanceFilters = {};
            }
        },
        setAdvanceFilters(state, action: { payload: ContactsState["advanceFilters"] }) {
            state.advanceFilters = { ...state.advanceFilters, ...action.payload };
        },
        resetAdvanceFilters(state) {
            state.advanceFilters = {};
        },
        resetContactsListPagination(state) {
            state.cursor = null;
            state.groupsCursor = null;
            state.count = null;
            state.groupsCount = null;
            state.list = [];
            state.groupMessageRooms = [];
            state.loading = "pending";
            state.keyword = "";
        },
        setAdvanceFiltersModalOpen(state, action: { payload: boolean }) {
            state.isAdvanceFiltersModalOpen = action.payload;
        },
        setAdvanceFiltersApplied(state, action: { payload: boolean }) {
            state.areAdvanceFiltersApplied = action.payload;
            if (state.keyword) {
                state.keyword = "";
            }
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
        builder.addCase(fetchRecentChats.fulfilled, (state, { payload }) => {
            state.recentUserChats = payload.data.recentUserChats;
            state.recentGroupChats = payload.data.recentGroupChats;
        });
        builder.addCase(fetchRecentChats.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchRecentChats.rejected, (state) => {
            state.loading = "failed";
        });
    },
});

export const {
    setAdvanceFilters,
    resetAdvanceFilters,
    resetContactsListPagination,
    setAdvanceFiltersModalOpen,
    setAdvanceFiltersApplied,
    setKeyword,
} = contactsSlice.actions;

export const selectContacts =
    (options: {
        displayBots: boolean;
        excludeBlocked?: boolean;
        hideExistingMembers?: boolean;
        existingMembers?: RoomUserType[];
    }) =>
        (
            state: RootState,
        ): ContactsState & {
            sortedByDisplayName: [string, User[]][];
            groupsSortedByDisplayName: [string, Room[]][];
        } => {
            const sortedByDisplayNameObj = state.contacts.list
                .filter(
                    (u) =>
                        u.isBot === options.displayBots &&
                        (!options.excludeBlocked ||
                            !u.blockedBy?.some((bb) => bb.userId === state.user.id)) &&
                        (!options.hideExistingMembers ||
                            !options.existingMembers?.some((em) => em.userId === u.id)),
                )
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

export default contactsSlice.reducer;
