import api from "./api";

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
        }),
        update: build.mutation({
            query: (data) => {
                return { url: "/messenger/me", method: "PUT", data };
            },
        }),
    }),
    overrideExisting: true,
});

export const { useSignUpMutation, useVerifyMutation, useUpdateMutation } = userApi;
