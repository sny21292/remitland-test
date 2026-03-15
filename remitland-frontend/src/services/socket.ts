/**
 * Socket.IO Service - Handles real-time events from the backend.
 *
 * Listens for TWO event types:
 * 1. "transaction-status-updated" — status changed by another user
 * 2. "new-transaction" — a queued transaction finished processing
 *
 * When either event fires, we dispatch a Redux action to update the UI
 * instantly — no page refresh needed.
 */

import { io, Socket } from "socket.io-client";
import type { AppDispatch } from "../store/store";
import { updateTransactionInList, addTransactionToList } from "../store/receiverSlice";

let socket: Socket | null = null;

/**
 * Connect to the Socket.IO server and start listening for events.
 */
export function connectSocket(dispatch: AppDispatch): void {
  if (socket?.connected) return;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:6001", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected");
  });

  // Event 1: Another user changed a transaction's status
  socket.on("transaction-status-updated", (data: { id: number; status: string }) => {
    dispatch(updateTransactionInList(data));
  });

  // Event 2: A queued transaction finished processing → appears in the list
  socket.on("new-transaction", (data: {
    id: number;
    status: string;
    currency_code: string;
    date_time: string;
    request_id: string;
    type: string;
    type_detail: string | null;
    to_name: string;
    amount: string;
  }) => {
    // Transform backend format to our frontend Transaction shape
    dispatch(addTransactionToList({
      id: data.id,
      date: data.date_time,
      request_id: data.request_id,
      type: data.type,
      to: data.to_name,
      amount: parseFloat(String(data.amount).replace(/,/g, "")),
      currency: data.currency_code,
      status: data.status,
      cancel_reason: null,
    }));
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected");
  });

  socket.on("connect_error", (error: Error) => {
    console.warn("Socket.IO connection error:", error.message);
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
