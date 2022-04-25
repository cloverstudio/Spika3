import React, { useState, useEffect, useLayoutEffect, ReactComponentElement } from "react";
import { Box, Select, MenuItem, SxProps } from "@mui/material";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { hideBasicDialog } from "../store/modalSlice";
import { RootState } from "../store/store";
import { uiListeners } from "../hooks/useModal";

type Props = {
    show: boolean;
    title: string;
    allowButtonLabel: string;
    denyButtonLabel: string;
    onOk: Function;
    onCancel: Function;
    items: Map<string, string>;
};

export default function BasicDialog({
    show,
    title,
    allowButtonLabel,
    denyButtonLabel,
    onOk,
    onCancel,
    items,
}: Props) {
    const [selectedValue, setSelectedValue] = useState<string>("");
    const modalState = useSelector((state: RootState) => state.modal);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!items) return;
        const itemsAry = [...items];
        if (itemsAry.length == 0) return;

        if (selectedValue === "") setSelectedValue(itemsAry[0][0]);
    }, [items]);

    return (
        <Dialog
            open={show}
            onClose={(e) => dispatch(hideBasicDialog())}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {items ? (
                        <Select
                            sx={{
                                width: "300px",
                            }}
                            value={selectedValue}
                            onChange={(e) => {
                                setSelectedValue(e.target.value);
                            }}
                        >
                            {[...items].map(([val, label]) => {
                                return (
                                    <MenuItem value={val} key={val}>
                                        {label}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    ) : null}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={(e) => {
                        dispatch(hideBasicDialog());
                        if (onCancel) onCancel();
                    }}
                >
                    {denyButtonLabel}
                </Button>

                <Button
                    onClick={(e) => {
                        dispatch(hideBasicDialog());
                        if (onOk) onOk(selectedValue);
                    }}
                >
                    {allowButtonLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}