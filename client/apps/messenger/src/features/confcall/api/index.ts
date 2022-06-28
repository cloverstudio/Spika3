import { boolean } from "yup";
import api from "../../../api/api";
import UserType from "../../../types/User";
import DeviceType from "../../../types/Device";

const confcallApi = api.injectEndpoints({
    endpoints: (build) => ({
        join: build.mutation<any, any>({
            query: (roomId: number) => {
                return { url: `/confcall/${roomId}/join`, method: "POST" };
            },
        }),
        leave: build.mutation<any, any>({
            query: (roomId: number) => {
                return { url: `/confcall/${roomId}/leave`, method: "POST" };
            },
        }),
    }),
    overrideExisting: true,
});

export const { useJoinMutation, useLeaveMutation } = confcallApi;
