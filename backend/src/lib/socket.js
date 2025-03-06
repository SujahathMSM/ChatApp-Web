import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return socketUsersMap[userId];
}

//store the online users in backend
const socketUsersMap = {}; // {userId: socketId}

import Message from "../models/message.model.js";
import User from "../models/user.model.js";

io.on("connection", (socket) => {
  console.log("Connected to socket", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) socketUsersMap[userId] = socket.id;

  // Add this handler for messagesSeen event
  socket.on("messagesSeen", async ({ userId }) => {
    try {
      // Update messages as seen
      await Message.updateMany(
        { senderId: userId, receiverId: socket.handshake.query.userId },
        { seenAt: Date.now(), status: "seen" }
      );

      // Notify the sender that their messages were seen
      const senderSocketId = socketUsersMap[userId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { userId: socket.handshake.query.userId });
      }
    } catch (error) {
      console.error("Error handling messagesSeen:", error);
    }
  });

  socket.on("userOnline", async () => {
    await User.findByIdAndUpdate(userId, { lastSeen: Date.now() });
  // Update message statuses
  await Message.updateMany(
    { receiverId: userId, status: "sent" },
    { status: "delivered" }
  );
  // Notify all relevant users about status updates
  const updatedMessages = await Message.find({
    receiverId: userId,
    status: "delivered"
  });
  
  updatedMessages.forEach(message => {
    const senderSocketId = socketUsersMap[message.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdate", {
        messageId: message._id,
        status: "delivered"
      });
    }
  });

  io.emit("userStatusChanged", { userId, status: "online" });
});
  io.emit("getOnlineUsers", Object.keys(socketUsersMap));
  socket.on("disconnect", async () => {
    console.log("A user has disconnected", socket.id);
    await User.findByIdAndUpdate(userId, { lastSeen: Date.now() });
    io.emit("userStatusChanged", { userId, status: "offline" });
    delete socketUsersMap[userId];
    io.emit("getOnlineUsers", Object.keys(socketUsersMap));
  });
});

export { io, app, server };
