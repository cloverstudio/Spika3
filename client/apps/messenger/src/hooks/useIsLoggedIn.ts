import { useEffect, useState } from "react";
import { dynamicBaseQuery } from "../api/api";

export default function useIsLoggedIn(): { loading: boolean; isLoggedIn: boolean } {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = window.localStorage.getItem("access-token");
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
