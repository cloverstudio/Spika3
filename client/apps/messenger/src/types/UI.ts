export enum SnackbarTypes {
    success = "success",
    info = "info",
    danger = "danger",
    warning = "warning",
}

export type SnackbarState = {
    show: boolean;
    type: SnackbarTypes;
    message: string;
};
