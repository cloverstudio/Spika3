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
    const [microphones, setMicrophones] = useState<Array<MediaDeviceInfo>>([]);

    useEffect(() => {
        // load cameara
        (async () => {
            const microphones = await getMicrophones();

            if (microphones && microphones.length > 0) {
                setMicrophones(microphones);
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
                    onChange={(e) =>
                        onChange(microphones.find((c) => c.deviceId === e.target.value))
                    }
                >
                    {microphones.map((device: MediaDeviceInfo) => (
                        <option value={device.deviceId} key={device.deviceId}>
                            {device.label}
                        </option>
                    ))}
                </select>
            </>
        </SettingModal>
    );
};
