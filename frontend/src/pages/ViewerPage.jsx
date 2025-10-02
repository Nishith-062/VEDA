import React, { useEffect, useState } from "react";
import { 
  ControlBar, 
  GridLayout, 
  ParticipantTile, 
  RoomAudioRenderer, 
  useTracks, 
  RoomContext,
  useRoomContext 
} from "@livekit/components-react";
import '@livekit/components-styles';
import { Room, Track, VideoQuality } from "livekit-client";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ViewerPage = () => {
  const navigate=useNavigate()
  const {token:authToken,authUser}=useAuthStore()
  const {id}=useParams()
  const [streamData, setStreamData] = useState({ 
    token: '', 
    wsUrl: '', 
    roomName: '', 
    host: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamMode, setStreamMode] = useState('high'); // 'audio-only' | 'low' | 'medium' | 'high'

  const [room] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: {
      resolution: {
        width: 1280,
        height: 720,
        frameRate: 30,
      },
    },
  }));

  // Simulated connection - replace with your actual API

  useEffect(() => {
    if (!authToken || !id || !authUser) return;

    const fetchStreamData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `http://localhost:3000/api/live-class/${id}/join`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        const { token,wsUrl,roomName, class:liveClass } = res.data;

        if (!token) {
          setError("LiveKit token is missing or invalid.");
          setStreamData(null);
        } else {
          setStreamData({ token,wsUrl,roomName,host:liveClass.faculty_id });
        }
      } catch (err) {
        console.error("Error joining class:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load the stream.");
        setStreamData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [id, authToken, authUser]);

  // Connect to room
  useEffect(() => {
    if (!streamData.wsUrl || !streamData.token) return;

    let mounted = true;

    const connect = async () => {
      if (mounted) {
        try {
          await room.connect(streamData.wsUrl, streamData.token);
          applyStreamMode(room, streamMode);
        } catch (err) {
          console.error("Failed to connect:", err);
          setError("Connection failed");
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      room.disconnect();
      navigate('/student')
      
    };
  }, [room, streamData.wsUrl, streamData.token]);

  // Apply stream mode when changed
  useEffect(() => {
    if (room.state !== 'connected') return;
    applyStreamMode(room, streamMode);
  }, [streamMode, room]);

  const applyStreamMode = (room, mode) => {
    room.remoteParticipants.forEach((participant) => {
      participant.videoTrackPublications.forEach((publication) => {
        if (mode === 'audio-only') {
          // Disable video completely
          publication.setEnabled(false);
        } else {
          // Enable video and set quality
          publication.setEnabled(true);
          
          const qualityMap = {
            'low': VideoQuality.LOW,
            'medium': VideoQuality.MEDIUM,
            'high': VideoQuality.HIGH
          };
          
          publication.setVideoQuality(qualityMap[mode]);
        }
      });
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#0f0f0f',
        color: 'white'
      }}>
        <div>Loading stream...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#0f0f0f',
        color: '#ff4444'
      }}>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" style={{ height: '100vh', position: 'relative', background: '#0f0f0f' }}>
        {/* Quality Control Panel */}
        <QualityControlPanel 
          streamMode={streamMode} 
          onStreamModeChange={setStreamMode}
        />

        {/* Video Conference View */}
        <MyVideoConference streamMode={streamMode} />
        
        {/* Audio Renderer */}
        <RoomAudioRenderer />
        
        {/* Control Bar */}
        <ControlBar />
      </div>
    </RoomContext.Provider>
  );
};

function QualityControlPanel({ streamMode, onStreamModeChange }) {
  const [expanded, setExpanded] = useState(false);

  const modes = [
    { value: 'audio-only', label: '🎧 Audio Only', bandwidth: '~50 Kbps', description: 'Voice only, no video' },
    { value: 'low', label: '📱 Low Quality', bandwidth: '~200 Kbps', description: '360p video' },
    { value: 'medium', label: '💻 Medium Quality', bandwidth: '~500 Kbps', description: '540p video' },
    { value: 'high', label: '🖥️ High Quality', bandwidth: '~1.5 Mbps', description: '720p+ video' }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '12px',
      padding: expanded ? '15px' : '10px 15px',
      minWidth: expanded ? '280px' : 'auto',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚙️</span>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
            Quality Settings
          </span>
        </div>
        <span style={{ color: 'white', fontSize: '12px', opacity: 0.7 }}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Current Mode Indicator */}
      {!expanded && (
        <div style={{ 
          marginTop: '5px', 
          color: '#4ade80', 
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {modes.find(m => m.value === streamMode)?.label}
        </div>
      )}

      {/* Expanded Options */}
      {expanded && (
        <div style={{ marginTop: '15px' }}>
          {modes.map((mode) => (
            <div
              key={mode.value}
              onClick={() => {
                onStreamModeChange(mode.value);
                setExpanded(false);
              }}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: streamMode === mode.value 
                  ? 'rgba(74, 222, 128, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: streamMode === mode.value 
                  ? '2px solid #4ade80' 
                  : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (streamMode !== mode.value) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (streamMode !== mode.value) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                  {mode.label}
                </span>
                <span style={{ 
                  color: '#4ade80', 
                  fontSize: '11px',
                  background: 'rgba(74, 222, 128, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {mode.bandwidth}
                </span>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' }}>
                {mode.description}
              </div>
            </div>
          ))}

          {/* Info Footer */}
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ color: '#60a5fa', fontSize: '11px', lineHeight: '1.5' }}>
              💡 Choose based on your internet speed. Changes apply instantly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyVideoConference({ streamMode }) {
  const room = useRoomContext();
  
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: streamMode !== 'audio-only' },
  );

  if (streamMode === 'audio-only') {
    return (
      <div style={{ 
        height: 'calc(100vh - var(--lk-control-bar-height))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1e1e 0%, #0f0f0f 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '450px', padding: '20px' }}>
          {/* Animated Audio Visualizer */}
          <div style={{ 
            fontSize: '80px', 
            marginBottom: '30px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🎧
          </div>
          
          <h2 style={{ 
            fontSize: '28px', 
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Audio-Only Mode
          </h2>
          
          <p style={{ 
            fontSize: '16px', 
            opacity: 0.7,
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            You're listening to the stream without video to save bandwidth (~50 Kbps).
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginTop: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>
                PARTICIPANTS
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#4ade80' }}>
                {room.remoteParticipants.size + 1}
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>
                STATUS
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#4ade80' }}>
                🟢 Live
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '30px', 
            fontSize: '13px', 
            opacity: 0.5,
            fontStyle: 'italic'
          }}>
            Switch to video mode anytime from quality settings
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      {/* Quality Badge */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          background: '#4ade80',
          animation: 'blink 2s ease-in-out infinite'
        }} />
        {streamMode === 'low' && '📱 Low Quality'}
        {streamMode === 'medium' && '💻 Medium Quality'}
        {streamMode === 'high' && '🖥️ High Quality'}
      </div>

      <GridLayout 
        tracks={tracks} 
        style={{ height: '100%' }}
      >
        <ParticipantTile />
      </GridLayout>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default ViewerPage;