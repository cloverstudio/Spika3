import { useSelector, useDispatch } from "react-redux";

import { RootState } from "../store/store";
import { showSnackBar, showBasicDialog } from "../store/uiSlice";

interface useShowSnackBarParams {
  severity: "error" | "warning" | "info" | "success";
  text: string;
}

interface useShowBasicDialogParams {
  text: string;
}

interface listeners {
  onBasicDialogOK: Function | undefined;
}

// global
export const uiListeners: listeners = {
  onBasicDialogOK: undefined,
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

  return (param: useShowBasicDialogParams, callBack: Function) => {
    uiListeners.onBasicDialogOK = callBack;

    dispatch(
      showBasicDialog({
        text: param.text,
        allowButtonLabel: "OK",
        denyButtonLabel: "Cancel",
        title: "Worning",
      })
    );
  };
}
