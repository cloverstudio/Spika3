import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import Chat from "../features/chat";
import { setActiveNoteId } from "../features/chat/slice/rightSidebarSlice";

export default function Home(): React.ReactElement {
    const noteId = +useParams().noteId;
    const dispatch = useDispatch();

    useEffect(() => {
        if (noteId) {
            dispatch(setActiveNoteId(noteId));
        }
    }, [noteId, dispatch]);

    return <Chat />;
}
