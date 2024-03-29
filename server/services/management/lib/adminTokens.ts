import dayjs from "dayjs";

import Utils from "../../../components/utils";
import * as Consts from "../../../components/consts";

export interface Token {
    token: string;
    expireDate: number;
}

class TokenHandler {
    tokens: Token[] = [];

    constructor() {}

    newToken(): Token {
        const newToken = Utils.randomString(16);

        const newTokenObj: Token = {
            token: newToken,
            expireDate: dayjs().unix() + Consts.ADMIN_TOKEN_EXPIRED,
        };

        this.tokens.push(newTokenObj);

        return newTokenObj;
    }

    checkToken(token: string): boolean {
        const matchedToken: Token | undefined = this.tokens.find((item) => item.token === token);

        if (matchedToken === undefined) return false;

        return matchedToken.expireDate > dayjs().unix();
    }
}

export default new TokenHandler();
