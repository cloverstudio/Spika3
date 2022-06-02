import api from "./api";
import DeviceType, { DeviceListType } from "../types/Device";

const deviceApi = api.injectEndpoints({
    endpoints: (build) => ({
        getDevices: build.query<DeviceListType, number>({
            query: (page) => `/management/device?page=${page}`,
            providesTags: [{ type: "Device", id: "LIST" }],
        }),
        getDevicesForUser: build.query<DeviceListType, { page: number; userId: string }>({
            query: ({ page, userId }) => `/management/device?page=${page}&userId=${userId}`,
            providesTags: [{ type: "Device", id: "LIST" }],
        }),
        createDevice: build.mutation<{ device: DeviceType }, any>({
            query: (data) => {
                return { url: "/management/device", data, method: "POST" };
            },
        }),
        getDeviceById: build.query<{ device: DeviceType }, string>({
            query: (deviceId) => {
                return `/management/device/${deviceId}`;
            },
        }),
        updateDevice: build.mutation<{ device: DeviceType }, { deviceId: string; data: any }>({
            query: ({ deviceId, data }) => {
                return { url: `/management/device/${deviceId}`, method: "PUT", data };
            },
            invalidatesTags: (res) => res && [{ type: "Device", id: "LIST" }],
        }),
        deleteDevice: build.mutation<{ deviceId: string }, any>({
            query: (deviceId) => {
                return { url: `/management/device/${deviceId}`, method: "DELETE" };
            },
            invalidatesTags: (res) => res && [{ type: "Device", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetDevicesQuery,
    useGetDevicesForUserQuery,
    useCreateDeviceMutation,
    useGetDeviceByIdQuery,
    useUpdateDeviceMutation,
    useDeleteDeviceMutation,
} = deviceApi;
export default deviceApi;
