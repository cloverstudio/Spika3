import { useEffect, useState } from "react";
import { dynamicBaseQuery } from "../api/api";
import * as Constants from "../../../../lib/constants";

export default function useIsLoggedIn(): { loading: boolean; isLoggedIn: boolean } {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = window.localStorage.getItem(Constants.LSKEY_ACCESSTOKEN);
        if (token) {
            dynamicBaseQuery("/messenger/me")
                .then((res) => {
                    if (res?.data?.user?.id) {
                        setIsLoggedIn(true);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    return { loading, isLoggedIn };
}
