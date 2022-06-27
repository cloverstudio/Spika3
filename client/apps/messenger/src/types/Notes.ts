import { Note } from ".prisma/client";

type NoteType = Omit<Note, "modifiedAt" | "createdAt"> & {
    createdAt: number;
    modifiedAt: number;
};

export default NoteType;
