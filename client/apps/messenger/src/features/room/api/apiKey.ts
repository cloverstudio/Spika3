import ApiKeyType from "../../../types/ApiKeys";
import api from "../../../api/api";

const apiKeyApi = api.injectEndpoints({
    endpoints: (build) => ({
        getApiKeyByRoomId: build.query<ApiKeyType | null, number>({
            query: (roomId) => `/messenger/api-keys/roomId/${roomId}`,
            transformResponse: (res: { apiKeys: ApiKeyType[] }) =>
                res?.apiKeys?.length ? res.apiKeys[0] : null,
            providesTags: (res) =>
                res
                    ? [
                          { type: "ApiKeys", id: "LIST" },
                          { type: "ApiKeys", id: res.id },
                      ]
                    : [{ type: "ApiKeys", id: "LIST" }],
        }),
        createApiKey: build.mutation<{ apiKey: ApiKeyType }, any>({
            query: (data) => {
                return { url: `/messenger/api-keys/roomId/${data.roomId}`, data, method: "POST" };
            },
            invalidatesTags: (result) => [
                { type: "ApiKeys", id: "LIST" },
                { type: "Rooms", id: result.apiKey.roomId },
            ],
        }),
        editApiKey: build.mutation<{ apiKey: ApiKeyType }, { id: number; data: any }>({
            query: ({ id, data }) => {
                return { url: `/messenger/api-keys/${id}`, method: "PUT", data };
            },
            invalidatesTags: (result) => [
                { type: "ApiKeys", id: result.apiKey.id },
                { type: "Rooms", id: result.apiKey.roomId },
            ],
        }),
        deleteApiKey: build.mutation<{ roomId: number }, number>({
            query: (id) => {
                return { url: `/messenger/api-keys/${id}`, method: "DELETE" };
            },
            invalidatesTags: (result) => [
                { type: "ApiKeys", id: "LIST" },
                { type: "Rooms", id: result.roomId },
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetApiKeyByRoomIdQuery,
    useCreateApiKeyMutation,
    useEditApiKeyMutation,
    useDeleteApiKeyMutation,
} = apiKeyApi;

export default apiKeyApi;
