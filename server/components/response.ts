export interface errorResponseType {
    status: string;
    message: string;
}

export interface successResponseType {
    status: string;
    data: any;
}

export function errorResponse(message: string, lang?: string): errorResponseType {
    const messageTable = {
        "Error happens": {
            ja: "エラーが発生しました。",
        },
    };

    const translation: any = messageTable[message as keyof Object]
        ? messageTable[message as keyof Object][lang as keyof Object]
        : null;

    return {
        status: "fail",
        message: translation || message,
    };
}

export function successResponse(data: any, lang?: string): successResponseType {
    return {
        status: "success",
        data,
    };
}
