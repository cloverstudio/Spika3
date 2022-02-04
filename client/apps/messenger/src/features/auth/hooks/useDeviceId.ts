import { useEffect, useState } from "react";
import { generateRandomString } from "../../../../../../lib/utils";

export default function useDeviceId(): string {
    const [deviceId, setDeviceId] = useState("");

    useEffect(() => {
        if (!window.localStorage.getItem("deviceId")) {
            window.localStorage.setItem("deviceId", generateRandomString(14));
        }

        setDeviceId(window.localStorage.getItem("deviceId"));
    }, []);

    return deviceId;
}
