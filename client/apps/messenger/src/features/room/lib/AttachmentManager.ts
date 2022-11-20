class AttachmentManager {
    files: { roomId: number; files: File[] }[] = [];
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

    addEventListener(roomId: number, listener: (files: File[]) => void) {
        this.listeners.push({ roomId, listener });
    }

    removeEventListener(roomId: number) {
        this.listeners = this.listeners.filter((l) => l.roomId !== roomId);
    }
}

export default new AttachmentManager();
