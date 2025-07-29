// services/MediaManager.js
import { MEDIA_CONSTRAINTS } from "../constants/config";

export class MediaManager {
  constructor() {
    this.localStream = null;
    this.videoElement = null;
  }

  async getUserMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(
        MEDIA_CONSTRAINTS
      );
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw new Error("미디어 장치에 접근할 수 없습니다: " + error.message);
    }
  }

  setVideoElement(element) {
    this.videoElement = element;
    if (this.localStream && element) {
      element.srcObject = this.localStream;
      element.play().catch((e) => {
        console.log("Local video play failed:", e);
      });
    }
  }

  getVideoTrack() {
    return this.localStream?.getVideoTracks()[0] || null;
  }

  getAudioTrack() {
    return this.localStream?.getAudioTracks()[0] || null;
  }

  toggleVideo() {
    const videoTrack = this.getVideoTrack();
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  toggleAudio() {
    const audioTrack = this.getAudioTrack();
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  stopAllTracks() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  cleanup() {
    this.stopAllTracks();
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  // 원격 비디오 스트림 설정
  static setRemoteStream(peerId, track) {
    const videoElement = document.getElementById(`video-${peerId}`);
    console.log(`#### videoElement : ${videoElement}`)
      console.log(`#### stream : ${track}`)
    if (videoElement && track) {
      const stream = new MediaStream([track]);
      videoElement.srcObject = stream;
      
      videoElement.play().catch((e) => {
        console.log(`Remote video play failed for ${peerId}:`, e);
      });
    }
  }
}
