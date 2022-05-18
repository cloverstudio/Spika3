import React, { useEffect, useState } from "react";
import { generateRandomString } from "../../../../lib/utils";
import * as Constants from "../../../../lib/constants";

export default function useDeviceId() {
    const [deviceId, setDeviceId] = useState("");

    useEffect(() => {
        if (!window.localStorage.getItem(Constants.LSKEY_DEVICEID)) {
            window.localStorage.setItem(Constants.LSKEY_DEVICEID, generateRandomString(14));
        }

        setDeviceId(window.localStorage.getItem(Constants.LSKEY_DEVICEID));
    }, []);

    return deviceId;
}
