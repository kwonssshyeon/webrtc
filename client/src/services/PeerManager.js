// services/PeerManager.js
export class PeerManager {
  constructor() {
    this.peers = new Map();
    this.onPeersUpdate = null;
  }

  setPeersUpdateCallback(callback) {
    this.onPeersUpdate = callback;
  }

  addExistingPeers(existingPeers) {
    this.peers.clear();
    existingPeers.forEach((peer) => {
      this.peers.set(peer.peerId, {
        ...peer,
        hasVideo: peer.hasVideo || false,
        hasAudio: peer.hasVideo || false,
        videoElement: null,
      });
    });
    this.notifyUpdate();
  }

  addPeer(peerId) {
    this.peers.set(peerId, {
      peerId,
      hasVideo: false,
      hasAudio: false,
      videoElement: null,
    });
    this.notifyUpdate();
  }

  updatePeerMedia(peerId, kind, hasMedia = true) {
    const peer = this.peers.get(peerId);
    if (peer) {
      const mediaKey = `has${kind.charAt(0).toUpperCase() + kind.slice(1)}`;
      peer[mediaKey] = hasMedia;
      this.peers.set(peerId, peer);
      this.notifyUpdate();
    }
  }

  removePeer(peerId) {
    this.peers.delete(peerId);
    this.notifyUpdate();
  }

  getPeer(peerId) {
    return this.peers.get(peerId);
  }

  getAllPeers() {
    return Array.from(this.peers.entries());
  }

  getPeersMap() {
    return new Map(this.peers);
  }

  clear() {
    this.peers.clear();
    this.notifyUpdate();
  }

  notifyUpdate() {
    if (this.onPeersUpdate) {
      this.onPeersUpdate(this.getPeersMap());
    }
  }
}
