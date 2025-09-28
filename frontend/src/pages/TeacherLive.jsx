import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useTranslation } from "react-i18next";
import "../i18n"; // make sure your i18n setup is imported

export default function TeacherLive() {
  const { t } = useTranslation();
  const roomName = "veda-live-classroom"; // Could make this dynamic

  return (
    <div className="h-screen w-full">
      <JitsiMeeting
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "chat",
            "settings",
            "raisehand",
            "tileview",
            "videoquality"
          ]
        }}
        userInfo={{
          displayName: t("teacher"), // Translatable name
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}
