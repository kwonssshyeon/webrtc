// VideoChat.jsx - 메인 컴포넌트
import React from "react";
import { useVideoChat } from "./hooks/useVideoChat";
import {
  RoomJoinForm,
  MediaControls,
  LocalVideo,
  RemoteVideo,
  VideoGrid,
  ErrorMessage,
  LoadingSpinner,
} from "./components/VideoComponents";

const VideoChat = () => {
  const {
    roomId,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    peers,
    error,
    isLoading,
    localVideoRef,
    setRoomId,
    joinRoom,
    toggleVideo,
    toggleAudio,
    leaveRoom,
    clearError,
  } = useVideoChat();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* 에러 메시지 */}
      <ErrorMessage message={error} onClose={clearError} />

      {/* 로딩 스피너 */}
      {isLoading && <LoadingSpinner message="방에 참가하는 중..." />}

      {!isConnected ? (
        /* 방 입장 폼 */
        <RoomJoinForm
          roomId={roomId}
          setRoomId={setRoomId}
          onJoin={joinRoom}
          isLoading={isLoading}
        />
      ) : (
        /* 화상채팅 인터페이스 */
        <div>
          {/* 미디어 컨트롤 버튼들 */}
          <MediaControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onLeaveRoom={leaveRoom}
          />

          {/* 비디오 그리드 */}
          <VideoGrid>
            {/* 로컬 비디오 */}
            <LocalVideo videoRef={localVideoRef} />

            {/* 원격 비디오들 */}
            {Array.from(peers.entries()).map(([peerId, peer]) => (
              <RemoteVideo key={peerId} peerId={peerId} peer={peer} />
            ))}
          </VideoGrid>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
