import NoteType from "../../../types/Notes";
import api from "../../../api/api";

const noteApi = api.injectEndpoints({
    endpoints: (build) => ({
        getNotesByRoomId: build.query<{ notes: NoteType[] }, number>({
            query: (roomId) => `/messenger/notes/roomId/${roomId}`,
            providesTags: (res) =>
                res && res.notes && res.notes.length
                    ? [
                          { type: "Notes", id: "LIST" },
                          ...res.notes.map((note) => ({
                              type: "Notes" as const,
                              id: `${note.id}`,
                          })),
                      ]
                    : [{ type: "Notes", id: "LIST" }],
        }),
        getNoteById: build.query<{ note: NoteType }, number>({
            query: (id) => `/messenger/notes/${id}`,
            providesTags: (res) => [{ type: "Notes", id: res.note.id }],
        }),
        createNote: build.mutation<{ note: NoteType }, any>({
            query: (data) => {
                return { url: `/messenger/notes/roomId/${data.roomId}`, data, method: "POST" };
            },
            invalidatesTags: () => [{ type: "Notes", id: "LIST" }],
        }),
        editNote: build.mutation<{ note: NoteType }, { noteId: number; data: any }>({
            query: ({ noteId, data }) => {
                return { url: `/messenger/notes/${noteId}`, method: "PUT", data };
            },
            invalidatesTags: (result) => [{ type: "Notes", id: result.note.id }],
        }),
        deleteNote: build.mutation<{ note: NoteType }, number>({
            query: (noteId) => {
                return { url: `/messenger/notes/${noteId}`, method: "DELETE" };
            },
            invalidatesTags: () => [{ type: "Notes", id: "LIST" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetNotesByRoomIdQuery,
    useGetNoteByIdQuery,
    useCreateNoteMutation,
    useEditNoteMutation,
    useDeleteNoteMutation,
} = noteApi;

export default noteApi;
