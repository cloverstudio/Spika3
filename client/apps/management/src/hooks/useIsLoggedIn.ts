import { useEffect, useState } from "react";
import { dynamicBaseQuery } from "@/api";
import * as Constants from "@lib/constants";

export default function useIsLoggedIn(): { loading: boolean; isLoggedIn: boolean } {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = window.localStorage.getItem(Constants.ADMIN_ACCESS_TOKEN);

        if (token) {
            dynamicBaseQuery("/management/auth/check?token=" + token).then((res) => {
                if (res.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }

                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    return { loading, isLoggedIn };
}
