const express = require("express");
const https = require("https");
const fs = require("fs");
const socketIo = require("socket.io");
const cors = require("cors");

const { initializeMediasoup } = require("./services/mediasoupService");
const { setupSocketHandlers } = require("./handlers/socketHandlers");
const config = require("./config/config");

const app = express();

// SSL 인증서 설정
const httpsOptions = {
  key: fs.readFileSync("./ssl/private-key.pem"),
  cert: fs.readFileSync("./ssl/certificate.pem"),
};
const server = https.createServer(httpsOptions, app);

// CORS 설정
app.use(cors(config.corsOptions));
app.use(express.json());

// Socket.IO 설정
const io = socketIo(server, config.socketOptions);

// 서버 시작
async function startServer() {
  try {
    await initializeMediasoup();
    setupSocketHandlers(io);

    server.listen(config.PORT, config.HOST, () => {
      console.log(`Server running on https://${config.HOST}:${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
