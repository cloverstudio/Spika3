import api from "./api";

const deviceApi = api.injectEndpoints({
    endpoints: (build) => ({
        getDevice: build.query<any, void>({
            query: () => "/messenger/device",
            providesTags: [{ type: "Device" }],
        }),
        updateDevice: build.mutation({
            query: (data) => {
                return { url: "/messenger/device", data, method: "PUT" };
            },
            invalidatesTags: [{ type: "Device" }],
        }),
    }),
    overrideExisting: true,
});

export const { useUpdateDeviceMutation, useGetDeviceQuery } = deviceApi;
export default deviceApi;
