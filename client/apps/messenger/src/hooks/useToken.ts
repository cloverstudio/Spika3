import { useEffect, useState } from "react";
import * as Constants from "../../../../lib/constants";

export default function useToken(): { loading: boolean; token: string } {
    const [token, setToken] = useState("");
    const [loading, setLoaded] = useState(true);

    useEffect(() => {
        setToken(window.localStorage.getItem(Constants.LSKEY_ACCESSTOKEN));
        setLoaded(false);
    }, []);

    return { loading, token };
}
