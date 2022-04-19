import Contacts from "../../../types/Contacts";
import api from "../../../api/api";

declare var TEAM_MODE: string;
console.log("TEAM_MODE", TEAM_MODE);
const contactsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getContacts: build.query<Contacts, number>({
            query: (page) => `/messenger/contacts?page=${page}`,
            providesTags: [{ type: "Contacts", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetContactsQuery } = contactsApi;
export default contactsApi;
