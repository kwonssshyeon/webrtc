class Peer {
  constructor(socketId, roomId) {
    this.id = socketId;
    this.roomId = roomId;
    this.producerTransport = null;
    this.consumerTransport = null;
    this.producers = new Map(); // kind -> Producer
    this.consumers = new Map(); // consumerId -> Consumer
  }

  setProducerTransport(transport) {
    this.producerTransport = transport;
  }

  setConsumerTransport(transport) {
    this.consumerTransport = transport;
  }

  addProducer(kind, producer) {
    this.producers.set(kind, producer);
  }

  addConsumer(consumerId, consumer) {
    this.consumers.set(consumerId, consumer);
  }

  removeConsumer(consumerId) {
    this.consumers.delete(consumerId);
  }

  cleanup() {
    // Transport 정리
    if (this.producerTransport) {
      this.producerTransport.close();
      this.producerTransport = null;
    }
    if (this.consumerTransport) {
      this.consumerTransport.close();
      this.consumerTransport = null;
    }

    // Producers와 Consumers 정리
    this.producers.clear();
    this.consumers.clear();
  }
}

module.exports = Peer;
