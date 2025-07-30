const { getRouter } = require("../services/mediasoupService");
const roomManager = require("../services/roomManager");

function setupMediaHandlers(socket) {
  // Producer 생성
  socket.on("produce", async (data, callback) => {
    console.log(`Producer 생성 요청`);

    try {
      const { kind, rtpParameters } = data;
      const peer = roomManager.getPeer(socket.id);

      if (!peer || !peer.producerTransport) {
        return callback({ error: "Producer transport not found" });
      }

      const producer = await peer.producerTransport.produce({
        kind,
        rtpParameters,
      });

      peer.addProducer(kind, producer);

      // Producer 이벤트 리스너 추가
      producer.on("transportclose", () => {
        console.log(`Producer transport closed for peer ${socket.id}`);
      });

      // 다른 참가자들에게 새 Producer 알림
      socket.to(peer.roomId).emit("new-producer", {
        peerId: socket.id,
        producerId: producer.id,
        kind,
      });

      console.log(`Producer created: ${producer.id} for peer ${socket.id}`);
      callback({ id: producer.id });
    } catch (error) {
      console.error("Error creating producer:", error);
      callback({ error: error.message });
    }
  });

  // Consumer 생성
  socket.on("consume", async (data, callback) => {
    console.log(`Consumer 생성 요청`);

    try {
      const { producerId, rtpCapabilities } = data;
      const peer = roomManager.getPeer(socket.id);

      if (!peer || !peer.consumerTransport) {
        return callback({ error: "Consumer transport not found" });
      }

      const router = getRouter();

      // Producer가 라우터에서 consume 가능한지 확인
      if (!router.canConsume({ producerId, rtpCapabilities })) {
        return callback({ error: "Cannot consume" });
      }

      const consumer = await peer.consumerTransport.consume({
        producerId,
        rtpCapabilities,
        paused: false,
      });

      peer.addConsumer(consumer.id, consumer);

      // Consumer 이벤트 리스너 추가
      consumer.on("transportclose", () => {
        console.log(`Consumer transport closed for peer ${socket.id}`);
      });

      consumer.on("producerclose", () => {
        console.log(`Consumer producer closed for peer ${socket.id}`);
        peer.removeConsumer(consumer.id);
        socket.emit("consumer-closed", { consumerId: consumer.id });
      });

      console.log(`Consumer created: ${consumer.id} for peer ${socket.id}`);
      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (error) {
      console.error("Error creating consumer:", error);
      callback({ error: error.message });
    }
  });

  // Consumer resume
  socket.on("resume-consumer", async (data, callback) => {
    const { consumerId } = data;
    const peer = roomManager.getPeer(socket.id);

    if (peer && peer.consumers.has(consumerId)) {
      try {
        await peer.consumers.get(consumerId).resume();
        callback({ success: true });
        console.log(`Consumer resumed: ${consumerId} for peer ${socket.id}`);
      } catch (error) {
        console.error("Error resuming consumer:", error);
        callback({ error: error.message });
      }
    }
  });
}

module.exports = {
  setupMediaHandlers,
};
