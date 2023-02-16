import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import Room from "../features/room";
import { setActiveNoteId } from "../features/room/slices/rightSidebar";

export default function Home(): React.ReactElement {
    const noteId = +useParams().noteId;
    const dispatch = useDispatch();

    useEffect(() => {
        if (noteId) {
            dispatch(setActiveNoteId(noteId));
        }
    }, [noteId, dispatch]);

    return <Room />;
}
