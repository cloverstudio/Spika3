class DeviceHandler {
    videoStreams: Array<MediaStream>;
    audioStreams: Array<MediaStream>;

    constructor() {
        this.videoStreams = [];
        this.audioStreams = [];
    }

    async getCameraList(): Promise<Array<MediaDeviceInfo>> {
        const devices: Array<MediaDeviceInfo> = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device: MediaDeviceInfo) => device.kind == "videoinput");
    }

    async getMicrophoneList(): Promise<Array<MediaDeviceInfo>> {
        const devices: Array<MediaDeviceInfo> = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device: MediaDeviceInfo) => device.kind == "audioinput");
    }

    async getCamera(deviceId: string): Promise<MediaStream> {
        // close all device before create new one
        this.videoStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });

        const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: deviceId
                ? {
                      deviceId,
                  }
                : true,
        });

        this.videoStreams.push(mediaStream);

        return mediaStream;
    }
    async getMicrophone(deviceId: string): Promise<MediaStream> {
        // close all device before create new one
        this.audioStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });

        const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({
            audio: deviceId
                ? {
                      deviceId,
                  }
                : true,
            video: false,
        });

        this.audioStreams.push(mediaStream);

        return mediaStream;
    }

    closeCamera() {
        this.videoStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });

        this.videoStreams = [];
    }

    closeMicrophone() {
        this.audioStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });

        this.audioStreams = [];
    }

    closeAllDevices() {
        this.videoStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });
        this.audioStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });

        this.videoStreams = [];
        this.audioStreams = [];
    }
}

export default new DeviceHandler();
