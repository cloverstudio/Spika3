import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import Room from "../features/room";
import { setActiveNoteId } from "../features/room/slices/rightSidebar";
import { useAppDispatch } from "../hooks";

export default function Home(): React.ReactElement {
    const noteId = +useParams().noteId;
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (noteId) {
            dispatch(setActiveNoteId(noteId));
        }
    }, [noteId, dispatch]);

    return <Room />;
}
