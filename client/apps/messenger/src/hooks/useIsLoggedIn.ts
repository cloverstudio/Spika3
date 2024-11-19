import { useEffect, useState } from "react";
import Cookie from "universal-cookie";

const globalCookie = new Cookie();

export default function useIsLoggedIn(): { isLoggedIn: boolean } {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    useEffect(() => {
        const isLoggedIn = globalCookie.get("isLoggedIn");
        if (!isLoggedIn) {
            setIsLoggedIn(false);
        }
    }, []);

    return { isLoggedIn };
}

