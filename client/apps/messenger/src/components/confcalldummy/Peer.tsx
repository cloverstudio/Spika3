import React from "react";

import SpikaBroadcastClient, { Participant } from "./lib/SpikaBroadcastClient";
import * as mediasoupClient from "mediasoup-client";

import PeerView from "./PeerView";

export interface PeerInterface {
    participant: Participant;
}

export default ({ participant }: PeerInterface) => {
    const audioConsumer = participant.consumers.find((consumer) => consumer.track.kind === "audio");
    const videoConsumer = participant.consumers.find((consumer) => consumer.track.kind === "video");

    const audioCodec: string = audioConsumer
        ? audioConsumer.rtpParameters.codecs[0].mimeType.split("/")[1]
        : null;

    const videoCodec: string = videoConsumer
        ? videoConsumer.rtpParameters.codecs[0].mimeType.split("/")[1]
        : null;

    const videoScalabilityMode: mediasoupClient.types.ScalabilityMode = videoConsumer
        ? mediasoupClient.parseScalabilityMode(
              videoConsumer.rtpParameters.encodings[0].scalabilityMode
          )
        : null;

    const videoSpatialCurrentLayer: number = videoConsumer
        ? participant.consumerSpatialCurrentLayers.get(videoConsumer.id)
        : 0;

    const videoTemporaryCurrentLayer: number = videoConsumer
        ? participant.consumerTemporalCurrentLayers.get(videoConsumer.id)
        : 0;

    const consumerVideoLayerType: string = videoConsumer
        ? participant.consumerVideoLayerType.get(videoConsumer.id)
        : "";

    return (
        <PeerView
            isMe={false}
            peer={participant.peer}
            muteAudio={audioConsumer && audioConsumer.paused ? true : false}
            muteVideo={videoConsumer ? true : false}
            audioConsumerId={audioConsumer ? audioConsumer.id : null}
            videoConsumerId={videoConsumer ? videoConsumer.id : null}
            audioRtpParameters={audioConsumer ? audioConsumer.rtpParameters : null}
            videoRtpParameters={videoConsumer ? videoConsumer.rtpParameters : null}
            consumerSpatialLayers={videoScalabilityMode ? videoScalabilityMode.spatialLayers : null}
            consumerTemporalLayers={
                videoScalabilityMode ? videoScalabilityMode.temporalLayers : null
            }
            consumerCurrentSpatialLayer={videoSpatialCurrentLayer}
            consumerCurrentTemporalLayer={videoTemporaryCurrentLayer}
            consumerPreferredSpatialLayer={
                videoScalabilityMode ? videoScalabilityMode.spatialLayers - 1 : null
            }
            consumerPreferredTemporalLayer={
                videoScalabilityMode ? videoScalabilityMode.temporalLayers - 1 : null
            }
            audioTrack={audioConsumer ? audioConsumer.track : null}
            videoTrack={videoConsumer ? videoConsumer.track : null}
            videoMultiLayer={videoConsumer && consumerVideoLayerType !== "simple"}
            audioCodec={audioCodec ? audioCodec : null}
            videoCodec={videoCodec ? videoCodec : null}
            videoLayerType={consumerVideoLayerType}
            displayName={participant.displayName}
        />
    );
};
