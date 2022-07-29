import { boolean } from "yup";
import api from "../../../api/api";
import UserType from "../../../types/User";
import DeviceType from "../../../types/Device";

const confcallApi = api.injectEndpoints({
    endpoints: (build) => ({
        join: build.mutation<any, { roomId: number; data: any }>({
            query: ({ roomId, data }) => {
                return { url: `/confcall/${roomId}/join`, data, method: "POST" };
            },
        }),
        leave: build.mutation<any, any>({
            query: (roomId: number) => {
                return { url: `/confcall/${roomId}/leave`, method: "POST" };
            },
        }),
        participants: build.query<Array<UserType>, number>({
            query: (roomId) => {
                return `/confcall/participants/${roomId}`;
            },
        }),
    }),
    overrideExisting: true,
});

export const { useJoinMutation, useLeaveMutation, useParticipantsQuery } = confcallApi;
