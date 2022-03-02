import { useEffect, useState } from "react";

export default function useToken(): { loading: boolean; token: string } {
    const [token, setToken] = useState("");
    const [loading, setLoaded] = useState(true);

    useEffect(() => {
        setToken(window.localStorage.getItem("access-token"));
        setLoaded(false);
    }, []);

    return { loading, token };
}
