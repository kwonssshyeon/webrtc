// services/RoomService.js
import { SocketManager } from "./SocketManager";
import { MediaManager } from "./MediaManager";
import { MediasoupClient } from "./MediasoupClient";
import { PeerManager } from "./PeerManager";

export class RoomService {
  constructor() {
    this.socketManager = new SocketManager();
    this.mediaManager = new MediaManager();
    this.mediasoupClient = new MediasoupClient(this.socketManager);
    this.peerManager = new PeerManager();

    this.isConnected = false;
    this.roomId = null;
    this.onStateChange = null;
  }

  setStateChangeCallback(callback) {
    this.onStateChange = callback;
  }

  setPeersUpdateCallback(callback) {
    this.peerManager.setPeersUpdateCallback(callback);
  }

  async joinRoom(roomId) {
    if (!roomId.trim()) {
      throw new Error("방 ID를 입력하세요.");
    }

    try {
      // 소켓 연결
      const socket = this.socketManager.connect();

      // 로컬 미디어 스트림 가져오기
      await this.mediaManager.getUserMedia();

      // 소켓 이벤트 리스너 설정
      this.setupSocketListeners();

      // 방 참가
      this.socketManager.emit("join-room", { roomId });

      this.isConnected = true;
      this.roomId = roomId;
      this.notifyStateChange();
    } catch (error) {
      console.error("Error joining room:", error);
      throw new Error("방에 참가할 수 없습니다: " + error.message);
    }
  }

  setupSocketListeners() {
    // 라우터 RTP 기능 수신
    this.socketManager.on(
      "router-rtp-capabilities",
      async (rtpCapabilities) => {
        try {
          await this.mediasoupClient.initializeDevice(rtpCapabilities);
          await this.mediasoupClient.createTransports();
          await this.produceMedia();
        } catch (error) {
          console.error("Error setting up device:", error);
        }
      }
    );

    // 기존 피어들 정보 수신
    this.socketManager.on("existing-peers", (existingPeers) => {
      alert("Received existing peers:", existingPeers);
      this.peerManager.addExistingPeers(existingPeers);

      // 각 피어의 producer 정보가 있다면 바로 consume 시도
      existingPeers.forEach(peer => {
        if (peer.producers && peer.producers.length > 0) {
          console.log(`[ROOM DEBUG] Processing producers for existing peer ${peer.peerId}`);
          
          peer.producers.forEach(producer => {
            console.log(`[ROOM DEBUG] Processing producer:`, producer);
            
            // new-producer 이벤트와 동일하게 처리
            this.handleNewProducer({
              peerId: peer.peerId,
              producerId: producer.id,
              kind: producer.kind
            });
          });
        }
      });
    });

    // 새 피어 참가
    this.socketManager.on("new-peer", (data) => {
      this.peerManager.addPeer(data.peerId);
    });

    // 새 프로듀서 생성됨
    this.socketManager.on("new-producer", (data) => {
      console.log("서버에서 new-producer 받음")
      this.handleNewProducer(data);
      console.log("서버에서 new-producer 받고 핸들링 완료")
    });

    // 컨슈머 종료
    this.socketManager.on("consumer-closed", (data) => {
      this.mediasoupClient.closeConsumer(data.consumerId);
    });

    // 피어 연결 해제
    this.socketManager.on("peer-disconnected", (data) => {
      this.peerManager.removePeer(data.peerId);
    });

    // 에러 처리
    this.socketManager.on("error", (error) => {
      console.error("Socket error:", error);
      throw new Error("소켓 오류: " + error.message);
    });
  }


  async handleNewProducer(data) {
    const { peerId, producerId, kind } = data;

      try {
        this.peerManager.updatePeerMedia(peerId, kind, true);
        console.log("eeeeeeeeeeeeeeeeeeeeeeeeee");
        await this.mediasoupClient.consume(producerId, peerId, kind);
      } catch (error) {
        console.error("Error handling new producer:", error);
        this.peerManager.updatePeerMedia(peerId, kind, false);
      }
  }

  async produceMedia() {
    const videoTrack = this.mediaManager.getVideoTrack();
    const audioTrack = this.mediaManager.getAudioTrack();

    if (videoTrack) {
      await this.mediasoupClient.produce(videoTrack, "video");
    }

    if (audioTrack) {
      await this.mediasoupClient.produce(audioTrack, "audio");
    }
  }

  toggleVideo() {
    const isEnabled = this.mediaManager.toggleVideo();

    if (isEnabled) {
      this.mediasoupClient.resumeProducer("video");
    } else {
      this.mediasoupClient.pauseProducer("video");
    }

    return isEnabled;
  }

  toggleAudio() {
    const isEnabled = this.mediaManager.toggleAudio();

    if (isEnabled) {
      this.mediasoupClient.resumeProducer("audio");
    } else {
      this.mediasoupClient.pauseProducer("audio");
    }

    return isEnabled;
  }

  setLocalVideoElement(element) {
    this.mediaManager.setVideoElement(element);
  }

  leaveRoom() {
    // 미디어 정리
    this.mediaManager.cleanup();

    // Mediasoup 정리
    this.mediasoupClient.cleanup();

    // 소켓 연결 해제
    this.socketManager.disconnect();

    // 피어 정리
    this.peerManager.clear();

    // 상태 초기화
    this.isConnected = false;
    this.roomId = null;
    this.notifyStateChange();
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      roomId: this.roomId,
    };
  }

  getLocalStream() {
    return this.mediaManager.localStream;
  }

  getPeers() {
    return this.peerManager.getPeersMap();
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getConnectionState());
    }
  }
}
