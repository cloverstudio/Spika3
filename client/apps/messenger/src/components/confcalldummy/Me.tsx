import React from "react";

import * as mediasoupClient from "mediasoup-client";
import PeerView from "./PeerView";

export interface MeViewInterface {
  audioProducer: mediasoupClient.types.Producer;
  videoProducer: mediasoupClient.types.Producer;
}

export default ({ videoProducer, audioProducer }: MeViewInterface) => {
  return (
    <>
      <PeerView
        isMe={true}
        videoTrack={videoProducer && videoProducer.track}
        audioTrack={audioProducer && audioProducer.track}
        muteAudio={true}
        muteVideo={true}
      />
    </>
  );
};
