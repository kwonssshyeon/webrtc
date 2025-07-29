// services/SocketManager.js
import io from "socket.io-client";
import { SERVER_CONFIG } from "../constants/config";

export class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SERVER_CONFIG.URL, SERVER_CONFIG.OPTIONS);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      // 리스너 추적을 위해 저장
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Promise 기반 emit
  emitAsync(event, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit(event, data, (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}
