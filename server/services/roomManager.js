const Room = require("../models/Room");
const Peer = require("../models/Peer");

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room 객체
    this.peers = new Map(); // socketId -> Peer 객체
  }

  createOrGetRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId);
  }

  createPeer(socketId, roomId) {
    const peer = new Peer(socketId, roomId);
    this.peers.set(socketId, peer);
    return peer;
  }

  getPeer(socketId) {
    return this.peers.get(socketId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  removePeer(socketId) {
    const peer = this.peers.get(socketId);
    if (peer) {
      const room = this.rooms.get(peer.roomId);
      if (room) {
        room.removePeer(socketId);

        // 방이 비어있으면 삭제
        if (room.isEmpty()) {
          this.rooms.delete(peer.roomId);
          console.log(`Room ${peer.roomId} deleted (empty)`);
        }
      }

      // Peer 정리
      peer.cleanup();
      this.peers.delete(socketId);
    }
    return peer;
  }

  joinRoom(socketId, roomId) {
    const room = this.createOrGetRoom(roomId);
    const peer = this.createPeer(socketId, roomId);
    room.addPeer(peer);
    return { room, peer };
  }
}

// 싱글톤 인스턴스
const roomManager = new RoomManager();

module.exports = roomManager;
