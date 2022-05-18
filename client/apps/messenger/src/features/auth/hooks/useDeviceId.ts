import { useEffect, useState } from "react";
import { generateRandomString } from "../../../../../../lib/utils";
import * as constants from "../../../../../../lib/constants";

export default function useDeviceId(): string {
    const [deviceId, setDeviceId] = useState("");

    useEffect(() => {
        if (!window.localStorage.getItem(constants.LSKEY_DEVICEID)) {
            window.localStorage.setItem(constants.LSKEY_DEVICEID, generateRandomString(14));
        }

        setDeviceId(window.localStorage.getItem(constants.LSKEY_DEVICEID));
    }, []);

    return deviceId;
}
