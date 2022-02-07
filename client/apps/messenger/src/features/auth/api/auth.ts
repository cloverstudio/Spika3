import api from "../../../api/api";

const userApi = api.injectEndpoints({
    endpoints: (build) => ({
        signUp: build.mutation({
            query: (data) => {
                return { url: "/messenger/auth", method: "POST", data };
            },
        }),
        verify: build.mutation({
            query: (data) => {
                return { url: "/messenger/auth/verify", method: "POST", data };
            },
            invalidatesTags: [{ type: "Auth", id: "me" }],
        }),
        update: build.mutation({
            query: (data) => {
                return { url: "/messenger/me", method: "PUT", data };
            },
        }),
        getUser: build.query<any, void>({
            query: () => "/messenger/me",
            providesTags: [{ type: "Auth", id: "me" }],
        }),
    }),
    overrideExisting: true,
});

export const { useSignUpMutation, useVerifyMutation, useUpdateMutation, useGetUserQuery } = userApi;
