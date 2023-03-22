import api from "./api";
import { StatisticListType } from "../types/Statistic";

const messageApi = api.injectEndpoints({
    endpoints: (build) => ({
        getMessageStatisticByHour: build.query<
            StatisticListType,
            { startHour: number; endHour: number }
        >({
            query: ({ startHour, endHour }) =>
                `/management/message/statHour?start=${startHour}&end=${endHour}`,
            providesTags: [{ type: "Messages", id: "LIST" }],
        }),
        getMessageStatisticByDay: build.query<
            StatisticListType,
            { startDay: number; endDay: number }
        >({
            query: ({ startDay, endDay }) =>
                `/management/message/statDay?start=${startDay}&end=${endDay}`,
            providesTags: [{ type: "Messages", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetMessageStatisticByHourQuery, useGetMessageStatisticByDayQuery } = messageApi;

export default messageApi;
