interface ICookieConfig {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    domain: string;
    expires: Date;
    path: string;
}

export default class config {
    static cookieConfig: ICookieConfig = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: process.env.ENV !== "production" ? "localhost" : ".spika.chat",
        expires: new Date(2147483647000), // Maximum Unix epoch time
        path: "/",
    };
}
