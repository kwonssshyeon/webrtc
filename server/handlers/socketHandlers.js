const { getRouter } = require("../services/mediasoupService");
const roomManager = require("../services/roomManager");
const transportHandlers = require("./transportHandlers");
const mediaHandlers = require("./mediaHandlers");

function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 방 참가 처리
    socket.on("join-room", async (data) => {
      const { roomId } = data;

      try {
        const { room, peer } = roomManager.joinRoom(socket.id, roomId);
        socket.join(roomId);

        // RTP Capabilities 전송
        const router = getRouter();
        socket.emit("router-rtp-capabilities", router.rtpCapabilities);

        // 기존 참가자들에게 새 참가자 알림
        socket.to(roomId).emit("new-peer", { peerId: socket.id });

        // 새 참가자에게 기존 참가자 목록 전송
        const existingPeers = room.getExistingPeersInfo(socket.id);
        socket.emit("existing-peers", existingPeers);

        console.log(`Peer ${socket.id} joined room ${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Transport 관련 핸들러 등록
    transportHandlers.setupTransportHandlers(socket);

    // Media 관련 핸들러 등록
    mediaHandlers.setupMediaHandlers(socket);

    // 연결 해제 처리
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      const peer = roomManager.removePeer(socket.id);
      if (peer) {
        // 다른 참가자들에게 알림
        socket.to(peer.roomId).emit("peer-disconnected", { peerId: socket.id });
      }
    });
  });
}

module.exports = {
  setupSocketHandlers,
};
