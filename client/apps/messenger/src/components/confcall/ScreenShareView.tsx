import * as mediasoupClient from "mediasoup-client";
import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import hark from "hark";
import protooClient, { Peer } from "protoo-client";
import { isMappedTypeNode } from "typescript";

export interface ScreenShareViewInterface {
  videoTrack: MediaStreamTrack;
}

export default ({
  videoTrack
}: ScreenShareViewInterface) => {

  const videoElm: MutableRefObject<HTMLVideoElement | null> =
    useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoTrack) {
      const stream = new MediaStream();

      stream.addTrack(videoTrack);
      videoElm.current.srcObject = stream;


      videoElm.current.onpause = () => { };

      videoElm.current
        .play()
        .catch((error) => console.error("videoElem.play() failed:%o", error));
    } else {
      videoElm.current.srcObject = null;
    }
  }, [videoTrack]);

  return (
    <video
      ref={videoElm}
      autoPlay
      playsInline
      controls={false}
    />
  );
};
