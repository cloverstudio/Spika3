import api from "../../../api/api";
import UserType from "../../../types/User";

const userApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUserById: build.query<{ user: UserType }, number>({
            query: (userId) => {
                return `/messenger/users/${userId}`;
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGetUserByIdQuery } = userApi;
export default userApi;
