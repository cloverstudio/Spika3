export interface failedResponseType {
    status: string;
    message: string;
}

export interface succeedResponseType {
    status: string;
    data: any;
}

export function response_fail(message: string, lang?: string): failedResponseType {
    const messageTable = {
        "Error happens": {
            ja: "エラーが発生しました。",
        },
    };

    const translattion: any = messageTable[message as keyof Object]
        ? messageTable[message as keyof Object][lang as keyof Object]
        : null;

    return {
        status: "fail",
        message: translattion || message,
    };
}

export function response_success(data: any, lang?: string): succeedResponseType {
    return {
        status: "success",
        data: data,
    };
}
