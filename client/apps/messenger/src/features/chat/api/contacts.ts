import Contacts from "../../../types/Contacts";
import api from "../../../api/api";

declare const TEAM_MODE: string;

const contactsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getContacts: build.query<Contacts, { page: number; keyword: string }>({
            query: ({ page, keyword }) => `/messenger/contacts?page=${page}&keyword=${keyword}`,
            providesTags: (result, error, arg) => [{ type: "Contacts", id: "LIST" }],
        }),
        getContactsByKeyword: build.query<Contacts, string>({
            query: (keyword) => `/messenger/contacts?keyword=${keyword}`,
            providesTags: [{ type: "Contacts", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetContactsQuery, useGetContactsByKeywordQuery } = contactsApi;
export default contactsApi;
