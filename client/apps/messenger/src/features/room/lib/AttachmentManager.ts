import { store } from "../../../store/store";
import { sendFileMessage } from "../slices/messages";

class AttachmentManager {
    files: { roomId: number; files: File[] }[] = [];
    sent: { roomId: number; files: File[] }[] = [];
    listeners: { roomId: number; listener: (files: File[]) => void }[] = [];

    addFiles({ roomId, files }: { roomId: number; files: File[] }): void {
        const indx = this.files.findIndex((m) => m.roomId === roomId);
        const filteredListeners = this.listeners.filter((l) => l.roomId === roomId);

        if (indx === -1) {
            this.files.push({ roomId, files });
            filteredListeners.forEach((l) => l.listener(files));
        } else {
            const currentFiles = this.files[indx].files;
            const currentFilesNames = this.files[indx].files.map((f) => f.name);
            const toAdd = files.filter((f) => !currentFilesNames.includes(f.name));
            this.files.splice(indx, 1, { roomId, files: [...currentFiles, ...toAdd] });
            filteredListeners.forEach((l) => l.listener([...currentFiles, ...toAdd]));
        }
    }

    addSentFiles({ roomId, files }: { roomId: number; files: File[] }): void {
        const indx = this.sent.findIndex((m) => m.roomId === roomId);

        if (indx === -1) {
            this.sent.push({ roomId, files });
        } else {
            const currentFiles = this.sent[indx].files;
            const currentFilesNames = this.sent[indx].files.map((f) => f.name);
            const toAdd = files.filter((f) => !currentFilesNames.includes(f.name));
            this.sent.splice(indx, 1, { roomId, files: [...currentFiles, ...toAdd] });
        }
    }

    setFiles({ roomId, files }: { roomId: number; files: File[] }): void {
        const indx = this.files.findIndex((m) => m.roomId === roomId);
        const filteredListeners = this.listeners.filter((l) => l.roomId === roomId);

        if (indx === -1) {
            this.files.push({ roomId, files });
        } else {
            this.files.splice(indx, 1, { roomId, files });
        }

        filteredListeners.forEach((l) => l.listener(files));
    }

    removeFile({ roomId, fileName }: { roomId: number; fileName: string }): void {
        const indx = this.files.findIndex((m) => m.roomId === roomId);
        if (indx === -1) {
            return;
        }

        const files = this.files[indx].files.filter((i) => i.name !== fileName);

        this.files.splice(indx, 1, { roomId, files });

        const filteredListeners = this.listeners.filter((l) => l.roomId === roomId);
        filteredListeners.forEach((l) => l.listener(files));
    }

    getFiles(roomId: number) {
        return this.files.find((m) => m.roomId === roomId)?.files;
    }

    getFile({ roomId, fileName }: { roomId: number; fileName: string }) {
        const indx = this.sent.findIndex((m) => m.roomId === roomId);
        if (indx === -1) {
            return;
        }

        return this.sent[indx].files.find((i) => i.name === fileName);
    }

    addEventListener(roomId: number, listener: (files: File[]) => void) {
        this.listeners.push({ roomId, listener });
    }

    removeEventListener(roomId: number) {
        this.listeners = this.listeners.filter((l) => l.roomId !== roomId);
    }

    async send({ roomId }: { roomId: number }) {
        const files = this.getFiles(roomId);
        this.setFiles({ roomId, files: [] });

        for (const file of files) {
            this.addSentFiles({ roomId, files: [file] });
            store.dispatch(
                sendFileMessage({
                    roomId,
                    file,
                })
            );
        }
    }
}

export default new AttachmentManager();
