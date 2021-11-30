export interface formItem {
    value: string;
    isError: boolean;
    helperText: string;
}

export interface formItems {
    displayName: formItem;
    phoneNumber: formItem;
    countryCode: formItem;
    email?: formItem;
    avatarUrl?: formItem;
    verified?: formItem;
    verificationCode?: formItem;
}
