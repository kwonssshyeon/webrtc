module.exports = {
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || "192.168.100.74",

  corsOptions: {
    origin: ["https://localhost:3000", "https://192.168.100.74:3000"],
    credentials: true,
  },

  socketOptions: {
    cors: {
      origin: ["https://localhost:3000", "https://192.168.100.74:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  },

  mediasoup: {
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
    },

    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
    ],

    webRtcTransportOptions: {
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: "192.168.100.74", // 실제 배포시에는 서버의 공인 IP로 변경
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
    },
  },
};
