// hooks/useVideoChat.js
import { useState, useEffect, useRef } from "react";
import { RoomService } from "../services/RoomService";

export const useVideoChat = () => {
  const [roomId, setRoomId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [peers, setPeers] = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const roomServiceRef = useRef(null);
  const localVideoRef = useRef(null);

  // RoomService 초기화
  useEffect(() => {
    roomServiceRef.current = new RoomService();

    // 상태 변경 콜백 설정
    roomServiceRef.current.setStateChangeCallback((state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        setLocalStream(roomServiceRef.current.getLocalStream());
      }
    });

    // 피어 업데이트 콜백 설정
    roomServiceRef.current.setPeersUpdateCallback((peersMap) => {
      setPeers(peersMap);
    });

    // 클린업
    return () => {
      if (roomServiceRef.current) {
        roomServiceRef.current.leaveRoom();
      }
    };
  }, []);

  // 로컬 비디오 엘리먼트 설정
  useEffect(() => {
    if (localVideoRef.current && roomServiceRef.current) {
      roomServiceRef.current.setLocalVideoElement(localVideoRef.current);
    }
  }, [localStream]);

  const joinRoom = async () => {
    if (!roomId.trim()) {
      setError("방 ID를 입력하세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await roomServiceRef.current.joinRoom(roomId);
    } catch (error) {
      console.error("Error joining room:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = () => {
    if (roomServiceRef.current) {
      const enabled = roomServiceRef.current.toggleVideo();
      setIsVideoEnabled(enabled);
    }
  };

  const toggleAudio = () => {
    if (roomServiceRef.current) {
      const enabled = roomServiceRef.current.toggleAudio();
      setIsAudioEnabled(enabled);
    }
  };

  const leaveRoom = () => {
    if (roomServiceRef.current) {
      roomServiceRef.current.leaveRoom();
    }

    // 상태 초기화
    setRoomId("");
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setLocalStream(null);
    setError(null);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // 상태
    roomId,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    peers,
    localStream,
    error,
    isLoading,

    // 참조
    localVideoRef,

    // 액션
    setRoomId,
    joinRoom,
    toggleVideo,
    toggleAudio,
    leaveRoom,
    clearError,
  };
};
