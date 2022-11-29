import React from "react";
import Lobby from "./lobby";
import Main from "./main";

export default function ConfCall() {
    const isCall = /^.+\/call.*$/.test(window.location.pathname);
    const isLobby = /^.+\/call\/lobby\/.+$/.test(window.location.pathname);

    if (!isCall) return null;

    if (isLobby) return <Lobby />;
    else return <Main />;
}
