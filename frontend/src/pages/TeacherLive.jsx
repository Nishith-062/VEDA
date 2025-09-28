// TeacherLive.js
import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function TeacherLive() {
  const roomName = "veda-live-classroom"; // You could make this dynamic

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
            "microphone", "camera", "desktop", "fullscreen",
            "fodeviceselection", "hangup", "chat", "settings",
            "raisehand", "tileview", "videoquality"
          ]
        }}
        userInfo={{
          displayName: "Teacher",
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}