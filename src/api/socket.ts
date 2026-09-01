import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./client";

// API_BASE_URL is e.g. http://localhost:4000/v1 — Socket.IO connects to the
// server origin itself, not the REST path.
const SOCKET_URL = API_BASE_URL.replace(/\/v1\/?$/, "");

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: true, transports: ["websocket", "polling"] });
  }
  return socket;
}
