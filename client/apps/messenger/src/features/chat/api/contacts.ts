import Contacts from "../../../types/Contacts";
import api from "../../../api/api";

declare const TEAM_MODE: string;

const contactsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getContacts: build.query<Contacts, number>({
            query: (page) => `/messenger/contacts?page=${page}`,
            providesTags: [{ type: "Contacts", id: "LIST" }],
        }),
        getContactsByKeyword: build.query<{ contacts: Contacts }, string>({
            query: (keyword) => `/messenger/contacts?keyword=${keyword}`,
            providesTags: [{ type: "Contacts", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetContactsQuery, useGetContactsByKeywordQuery } = contactsApi;
export default contactsApi;
