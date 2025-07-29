const { createWebRtcTransport } = require("../services/mediasoupService");
const roomManager = require("../services/roomManager");

function setupTransportHandlers(socket) {
  // Producer Transport 생성
  socket.on("create-producer-transport", async (data, callback) => {
    try {
      const peer = roomManager.getPeer(socket.id);
      if (!peer) return callback({ error: "Peer not found" });

      const transport = await createWebRtcTransport();
      peer.setProducerTransport(transport);

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error("Error creating producer transport:", error);
      callback({ error: error.message });
    }
  });

  // Consumer Transport 생성
  socket.on("create-consumer-transport", async (data, callback) => {
    try {
      const peer = roomManager.getPeer(socket.id);
      if (!peer) return callback({ error: "Peer not found" });

      const transport = await createWebRtcTransport();
      peer.setConsumerTransport(transport);

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error("Error creating consumer transport:", error);
      callback({ error: error.message });
    }
  });

  // Transport 연결
  socket.on("connect-transport", async (data, callback) => {
    const { transportId, dtlsParameters } = data;
    const peer = roomManager.getPeer(socket.id);
    console.log(`Peer: ${peer}`)
    if (!peer) return;

    try {
      let transport = null;

      if (peer.producerTransport && peer.producerTransport.id === transportId) {
        transport = peer.producerTransport;
      } else if (
        peer.consumerTransport &&
        peer.consumerTransport.id === transportId
      ) {
        transport = peer.consumerTransport;
      }

      if (transport) {
        await transport.connect({ dtlsParameters });
        console.log(`Transport ${transportId} connected for peer ${socket.id}`);
        transport.connected = true;
        callback({ success: true });
      }
    } catch (error) {
      console.error("Error connecting transport:", error);
      callback({ error: error.message });
    }
  });
}

module.exports = {
  setupTransportHandlers,
};
