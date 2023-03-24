import { useDispatch } from "react-redux";

import { showSnackBar, showBasicDialog } from "@/store/modalSlice";

interface useShowSnackBarParams {
    severity: "error" | "warning" | "info" | "success";
    text: string;
}

interface useShowBasicDialogParams {
    text: string;
    title?: string;
    allowButtonLabel?: string;
    denyButtonLabel?: string;
}

interface listeners {
    onBasicDialogOK: () => void | undefined;
    onBasicDialogCancel: () => void | undefined;
}

// because we cannot store function in Redux
export const uiListeners: listeners = {
    onBasicDialogOK: undefined,
    onBasicDialogCancel: undefined,
};

export function useShowSnackBar() {
    const dispatch = useDispatch();

    return (param: useShowSnackBarParams) => {
        dispatch(
            showSnackBar({
                severity: param.severity,
                text: param.text,
            })
        );
    };
}

export function useShowBasicDialog() {
    const dispatch = useDispatch();

    return (param: useShowBasicDialogParams, onOK?: () => void, onCancel?: () => void) => {
        uiListeners.onBasicDialogOK = onOK;
        uiListeners.onBasicDialogCancel = onCancel;

        dispatch(
            showBasicDialog({
                text: param.text,
                allowButtonLabel: param.allowButtonLabel || "OK",
                denyButtonLabel: param.denyButtonLabel || null,
                title: param.title || "",
            })
        );
    };
}
