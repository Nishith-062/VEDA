import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  useTracks,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useParticipantContext,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "@livekit/components-styles"; // ✅ add this
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:3000/api/live-class";
// import { ParticipantLoop, ParticipantName } from "@livekit/components-react";

// function ParticipantNamesView() {
//   const participants = useParticipants();

//   return (
//     <div>
//       <ParticipantLoop participants={participants}>
//         <div
//           style={{
//             margin: "4px",
//             padding: "4px 8px",
//             display: "inline-block",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//           }}
//         >
//           <ParticipantName />
//         </div>
//       </ParticipantLoop>
//     </div>
//   );
// }

const TracksView = () => {
  // ✅ useTracks is inside LiveKitRoom context

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
};

const BroadcastPage = () => {
  const { token, authUser } = useAuthStore();
  // console.log(authUser._id);
  const { id } = useParams();
  const navigate = useNavigate();

  // console.log(token);
  const [details, setDetails] = useState({
    token: "",
    wsUrl: "",
    roomName: "",
    class: "",
  });

  useEffect(() => {
    if (!token) return; // wait until token is ready

    const fetchData = async () => {
      try {
        const res = await axios.post(
          `${BASE_URL}/${id}/start`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDetails({
          token: res.data.token,
          wsUrl: res.data.wsUrl,
          roomName: res.data.roomName,
          class: res.data.class,
        });

        // ✅ call notifications AFTER class is started
      } catch (error) {
        console.error("Error fetching class details:", error);
      }
    };

    fetchData();
  }, [id, token]);

  useEffect(() => {
    async function pushNotification() {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/notifications/notify",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching class details:", error);
      }
    }
    pushNotification();
  }, [details.token, token]);

  // console.log(details);
  async function Disconnect() {
    try {
      const res = await axios.post(
        `${BASE_URL}/${id}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/teacher");
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  }

  return (
    <div style={{ height: "70vh" }}>
      <LiveKitRoom
        audio
        video
        token={details.token}
        serverUrl={details.wsUrl}
        data-lk-theme="default" // optional LiveKit styling
        onDisconnected={Disconnect} // ✅ redirect after leave
      >
        <TracksView />
        <ControlBar />
        {/* <ParticipantNamesView /> */}
      </LiveKitRoom>
    </div>
  );
};

export default BroadcastPage;
