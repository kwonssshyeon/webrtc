const mediasoup = require("mediasoup");
const config = require("../config/config");

let worker;
let router;

async function initializeMediasoup() {
  try {
    worker = await mediasoup.createWorker(config.mediasoup.worker);

    worker.on("died", () => {
      console.error("mediasoup worker died, exiting...");
      process.exit(1);
    });

    router = await worker.createRouter({
      mediaCodecs: config.mediasoup.mediaCodecs,
    });

    console.log("mediasoup initialized");
  } catch (error) {
    console.error("Failed to initialize mediasoup:", error);
    throw error;
  }
}

function getRouter() {
  return router;
}

function getWorker() {
  return worker;
}

async function createWebRtcTransport() {
  return await router.createWebRtcTransport(
    config.mediasoup.webRtcTransportOptions
  );
}

module.exports = {
  initializeMediasoup,
  getRouter,
  getWorker,
  createWebRtcTransport,
};
