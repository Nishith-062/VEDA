// src/pages/StudentLive.js
import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useTranslation } from "react-i18next";
export default function StudentLive() {
  const roomName = "veda-live-classroom"; // must match Teacher
 const {t}=useTranslation();
  return (
    <div className="h-screen w-full">
      <JitsiMeeting
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableAudioLevels: true,
          disableModeratorIndicator: true,
          disableReactions: true,
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: [
            "fullscreen", "chat", "raisehand", "tileview"
          ], // no mic/cam buttons at all
        }}
        userInfo={{
          displayName: t("student"),
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}