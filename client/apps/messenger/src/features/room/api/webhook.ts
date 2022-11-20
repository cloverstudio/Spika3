import WebhookType from "../../../types/Webhooks";
import api from "../../../api/api";

const webhookApi = api.injectEndpoints({
    endpoints: (build) => ({
        getWebhookByRoomId: build.query<WebhookType | null, number>({
            query: (roomId) => `/messenger/webhooks/roomId/${roomId}`,
            transformResponse: (res: { webhooks: WebhookType[] }) =>
                res?.webhooks?.length ? res.webhooks[0] : null,
            providesTags: (res) =>
                res
                    ? [
                          { type: "Webhooks", id: "LIST" },
                          { type: "Webhooks", id: res.id },
                      ]
                    : [{ type: "Webhooks", id: "LIST" }],
        }),
        createWebhook: build.mutation<{ webhook: WebhookType }, any>({
            query: (data) => {
                return { url: `/messenger/webhooks/roomId/${data.roomId}`, data, method: "POST" };
            },
            invalidatesTags: () => [{ type: "Webhooks", id: "LIST" }],
        }),
        editWebhook: build.mutation<{ webhook: WebhookType }, { id: number; data: any }>({
            query: ({ id, data }) => {
                return { url: `/messenger/webhooks/${id}`, method: "PUT", data };
            },
            invalidatesTags: (result) => [{ type: "Webhooks", id: result.webhook.id }],
        }),
        deleteWebhook: build.mutation<{ webhook: WebhookType }, number>({
            query: (id) => {
                return { url: `/messenger/webhooks/${id}`, method: "DELETE" };
            },
            invalidatesTags: () => [{ type: "Webhooks", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetWebhookByRoomIdQuery,
    useCreateWebhookMutation,
    useEditWebhookMutation,
    useDeleteWebhookMutation,
} = webhookApi;

export default webhookApi;
