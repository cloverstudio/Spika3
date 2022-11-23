import api from "../../../api/api";
import UserType from "../../../types/User";
import DeviceType from "../../../types/Device";

type AuthResponseType = {
    isNewUser: boolean;
    user: UserType;
    device: DeviceType;
    browserDeviceId: string;
};

const userApi = api.injectEndpoints({
    endpoints: (build) => ({
        signUp: build.mutation<AuthResponseType, any>({
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
            invalidatesTags: [{ type: "Auth", id: "me" }],
        }),
        updateUserAvatar: build.mutation({
            query: (data) => {
                return { url: "/messenger/me/avatar-url", method: "PUT", data };
            },
            invalidatesTags: [{ type: "Auth", id: "me" }],
        }),
        getUser: build.query<any, void>({
            query: () => "/messenger/me",
            providesTags: [{ type: "Auth", id: "me" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useSignUpMutation,
    useVerifyMutation,
    useUpdateMutation,
    useGetUserQuery,
    useUpdateUserAvatarMutation,
} = userApi;
