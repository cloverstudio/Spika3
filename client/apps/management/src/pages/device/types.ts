export interface formItem {
    value: any;
    isError: boolean;
    helperText: string;
}

export interface formItems {
    userId: formItem;
    deviceId: formItem;
    type: formItem;
    osName: formItem;
    appVersion: formItem;
    token: formItem;
    pushToken: formItem;
}
