// services/MediasoupClient.js
import * as mediasoupClient from "mediasoup-client";
import { MediaManager } from "./MediaManager";

export class MediasoupClient {
  constructor(socketManager) {
    this.socketManager = socketManager;
    this.device = null;
    this.producerTransport = null;
    this.consumerTransport = null;
    this.producers = new Map();
    this.consumers = new Map();
  }

  async initializeDevice(rtpCapabilities) {
    try {
      this.device = new mediasoupClient.Device();
      await this.device.load({ routerRtpCapabilities: rtpCapabilities });
      return this.device;
    } catch (error) {
      console.error("Error initializing device:", error);
      throw error;
    }
  }

  async createTransports() {
    await Promise.all([
      this.createProducerTransport(),
      this.createConsumerTransport(),
    ]);
  }

  async createProducerTransport() {
    const transportData = await this.socketManager.emitAsync(
      "create-producer-transport"
    );

    this.producerTransport = this.device.createSendTransport(transportData);

    this.producerTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socketManager.emitAsync("connect-transport", {
            transportId: this.producerTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error);
        }
      }
    );

    this.producerTransport.on(
      "produce",
      async ({ kind, rtpParameters }, callback, errback) => {
        try {
          const data = await this.socketManager.emitAsync("produce", {
            kind,
            rtpParameters,
          });
          callback({ id: data.id });
        } catch (error) {
          errback(error);
        }
      }
    );
  }

  async createConsumerTransport() {
    const transportData = await this.socketManager.emitAsync(
      "create-consumer-transport"
    );

    this.consumerTransport = this.device.createRecvTransport(transportData);

    this.consumerTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socketManager.emitAsync("connect-transport", {
            transportId: this.consumerTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error);
        }
      }
    );
  }

  async produce(track, kind) {
    if (!this.producerTransport || !track) return null;

    try {
      const producer = await this.producerTransport.produce({ track });
      this.producers.set(kind, producer);
      return producer;
    } catch (error) {
      console.error(`Error producing ${kind}:`, error);
      throw error;
    }
  }

  async consume(producerId, peerId, kind) {
    if (!this.device || !this.consumerTransport) return null;

    try {
      const consumerData = await this.socketManager.emitAsync("consume", {
        producerId,
        rtpCapabilities: this.device.rtpCapabilities,
      });

      const consumer = await this.consumerTransport.consume({
        id: consumerData.id,
        producerId: consumerData.producerId,
        kind: consumerData.kind,
        rtpParameters: consumerData.rtpParameters,
      });

      this.consumers.set(consumer.id, consumer);

      // Consumer resume
      await this.socketManager.emitAsync("resume-consumer", {
        consumerId: consumer.id,
      });

      // 비디오인 경우 DOM에 연결
      if (kind === "video") {
        MediaManager.setRemoteStream(peerId, consumer.track);
      }

      return consumer;
    } catch (error) {
      console.error("Error consuming:", error);
      throw error;
    }
  }

  pauseProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.pause();
    }
  }

  resumeProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.resume();
    }
  }

  closeConsumer(consumerId) {
    const consumer = this.consumers.get(consumerId);
    if (consumer) {
      consumer.close();
      this.consumers.delete(consumerId);
    }
  }

  cleanup() {
    // Close all producers
    this.producers.forEach((producer) => producer.close());
    this.producers.clear();

    // Close all consumers
    this.consumers.forEach((consumer) => consumer.close());
    this.consumers.clear();

    // Close transports
    if (this.producerTransport) {
      this.producerTransport.close();
      this.producerTransport = null;
    }

    if (this.consumerTransport) {
      this.consumerTransport.close();
      this.consumerTransport = null;
    }

    this.device = null;
  }
}
