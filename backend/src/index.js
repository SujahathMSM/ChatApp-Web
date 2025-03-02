import express from "express";
import AuthRoutes from "./routes/auth.route.js";
import MessageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ limit: "50mb" })); // Parse JSON payloads with a size limit of 50MB
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Parse URL-encoded data with a size limit of 50MB
app.use(cookieParser());

// CORS Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this origin
    credentials: true, // Allow cookies and authorization headers
  })
);

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

// Start Server
server.listen(PORT, () => {
  console.log(`Server is started on port ${PORT}`);
  connectDB();
});
