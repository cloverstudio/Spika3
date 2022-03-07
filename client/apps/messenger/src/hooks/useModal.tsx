import { useSelector, useDispatch } from "react-redux";

import { RootState } from "../store/store";
import { showSnackBar, showBasicDialog } from "../store/modalSlice";

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
    onBasicDialogOK: Function | undefined;
    onBasicDialogCancel: Function | undefined;
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

    return (param: useShowBasicDialogParams, onOK?: Function, onCancel?: Function) => {
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
