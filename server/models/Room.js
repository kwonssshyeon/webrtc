class Room {
  constructor(roomId) {
    this.id = roomId;
    this.peers = new Map();
    console.log(`new room created ${roomId}`);
  }

  addPeer(peer) {
    this.peers.set(peer.id, peer);
  }

  removePeer(peerId) {
    this.peers.delete(peerId);
  }

  getPeers() {
    return Array.from(this.peers.values());
  }

  getPeer(peerId) {
    return this.peers.get(peerId);
  }

  isEmpty() {
    return this.peers.size === 0;
  }

  getExistingPeersInfo(excludePeerId = null) {
    return this.getPeers()
      .filter((p) => p.id !== excludePeerId)
      .map((p) => ({
        peerId: p.id,
        hasVideo: p.producers.has("video"),
        hasAudio: p.producers.has("audio"),
        // TODO: producer 정보 필요
      }));
  }
}

module.exports = Room;
