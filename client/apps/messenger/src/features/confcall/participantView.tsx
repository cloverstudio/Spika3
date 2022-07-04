import React, { useEffect, useState, useRef } from "react";
import { Box, Grid, useMediaQuery, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import {} from "@mui/icons-material";
import CSS from "csstype";

import UserType from "../../types/User";

import {
    setShowCall,
    setRoomId,
    setCameraEnabled,
    setMicrophoneEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
    setScreenshareEnabled,
} from "./slice/callSlice";

export interface ComponentInterface {
    user: UserType;
}

const defaultStyle: CSS.Properties = {
    height: "100%",
    width: "100%",
    border: "1px solid #fff1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "common.confCallFirstLetterColor",
    fontFamily: "'Roboto', sans-serif",
    fontWeight: "bold",
    backgroundColor: "common.videoBackground",
    fontSize: "72px",
};

export default (props: ComponentInterface) => {
    return <Box sx={{ ...defaultStyle }}>{props.user.displayName.substring(0, 1)}</Box>;
};
