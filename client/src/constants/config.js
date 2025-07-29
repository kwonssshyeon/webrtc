// constants/config.js
export const SERVER_CONFIG = {
  URL: "https://192.168.0.11:3001",
  OPTIONS: {
    transports: ["websocket", "polling"],
    upgrade: true,
    rememberUpgrade: true,
    rejectUnauthorized: true, // 개발환경용
  },
};

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    frameRate: { min: 15, ideal: 30, max: 60 },
  },
  audio: true,
};

export const VIDEO_STYLES = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  video: {
    width: "100%",
    maxWidth: "300px",
    height: "200px",
    backgroundColor: "#000",
    borderRadius: "8px",
  },
  videoContainer: {
    textAlign: "center",
  },
  status: {
    marginTop: "5px",
    fontSize: "12px",
  },
};

export const BUTTON_STYLES = {
  primary: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  success: {
    padding: "10px 20px",
    marginRight: "10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  danger: {
    padding: "10px 20px",
    marginRight: "10px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  secondary: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
