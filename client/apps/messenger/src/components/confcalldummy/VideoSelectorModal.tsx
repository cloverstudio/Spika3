import React, { useEffect, useState } from "react";
import SettingModal from "./Modal";
import { getCameras, getMicrophones } from "./lib/SpikaBroadcastClient";

export default ({
    selectedDeviceId,
    onChange,
    onOK,
    onClose,
}: {
    selectedDeviceId?: string;
    onChange?: Function;
    onOK?: Function;
    onClose?: Function;
}) => {
    const [cameras, setCameras] = useState<Array<MediaDeviceInfo>>([]);

    useEffect(() => {
        // load cameara
        (async () => {
            const cameras = await getCameras();

            if (cameras && cameras.length > 0) {
                setCameras(cameras);
            }
        })();
    }, []);

    return (
        <SettingModal
            title="Set Video Source"
            onOK={() => {
                onOK();
            }}
            onClose={() => onClose()}
        >
            <>
                <select
                    value={selectedDeviceId ? selectedDeviceId : ""}
                    onChange={(e) => onChange(cameras.find((c) => c.deviceId === e.target.value))}
                >
                    {cameras.map((device: MediaDeviceInfo) => (
                        <option value={device.deviceId} key={device.deviceId}>
                            {device.label}
                        </option>
                    ))}
                </select>
            </>
        </SettingModal>
    );
};
