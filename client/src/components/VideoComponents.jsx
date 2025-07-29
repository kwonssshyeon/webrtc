// components/VideoComponents.jsx
import React from "react";
import { VIDEO_STYLES, BUTTON_STYLES } from "../constants/config";

// 방 입장 폼 컴포넌트
export const RoomJoinForm = ({ roomId, setRoomId, onJoin, isLoading }) => (
  <div style={{ marginBottom: "20px" }}>
    <input
      type="text"
      value={roomId}
      onChange={(e) => setRoomId(e.target.value)}
      placeholder="방 ID를 입력하세요"
      disabled={isLoading}
      style={{
        padding: "10px",
        marginRight: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        opacity: isLoading ? 0.6 : 1,
      }}
    />
    <button
      onClick={onJoin}
      disabled={isLoading || !roomId.trim()}
      style={{
        ...BUTTON_STYLES.primary,
        opacity: isLoading || !roomId.trim() ? 0.6 : 1,
        cursor: isLoading || !roomId.trim() ? "not-allowed" : "pointer",
      }}
    >
      {isLoading ? "참가 중..." : "방 참가"}
    </button>
  </div>
);

// 컨트롤 버튼들 컴포넌트
export const MediaControls = ({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeaveRoom,
}) => (
  <div style={{ marginBottom: "20px" }}>
    <button
      onClick={onToggleVideo}
      style={isVideoEnabled ? BUTTON_STYLES.success : BUTTON_STYLES.danger}
    >
      {isVideoEnabled ? "비디오 끄기" : "비디오 켜기"}
    </button>
    <button
      onClick={onToggleAudio}
      style={isAudioEnabled ? BUTTON_STYLES.success : BUTTON_STYLES.danger}
    >
      {isAudioEnabled ? "오디오 끄기" : "오디오 켜기"}
    </button>
    <button onClick={onLeaveRoom} style={BUTTON_STYLES.secondary}>
      방 나가기
    </button>
  </div>
);

// 로컬 비디오 컴포넌트
export const LocalVideo = ({ videoRef }) => (
  <div style={VIDEO_STYLES.videoContainer}>
    <h3>나 (로컬)</h3>
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={VIDEO_STYLES.video}
    />
  </div>
);

// 원격 비디오 컴포넌트
export const RemoteVideo = ({ peerId, peer }) => (
  <div key={peerId} style={VIDEO_STYLES.videoContainer}>
    <h3>참가자 {peerId.substring(0, 8)}</h3>
    <video
      id={`video-${peerId}`}
      autoPlay
      playsInline
      style={VIDEO_STYLES.video}
    />
    <div style={VIDEO_STYLES.status}>
      비디오: {peer.hasVideo ? "✅" : "❌"} | 오디오:{" "}
      {peer.hasAudio ? "✅" : "❌"}
    </div>
  </div> 
);

// 비디오 그리드 컨테이너
export const VideoGrid = ({ children }) => (
  <div style={VIDEO_STYLES.container}>{children}</div>
);

// 에러 메시지 컴포넌트
export const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "20px",
        border: "1px solid #f5c6cb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#721c24",
            fontSize: "18px",
            cursor: "pointer",
            padding: "0 5px",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

// 로딩 스피너 컴포넌트
export const LoadingSpinner = ({ message = "로딩 중..." }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        width: "20px",
        height: "20px",
        border: "2px solid #f3f3f3",
        borderTop: "2px solid #007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginRight: "10px",
      }}
    />
    <span>{message}</span>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);
