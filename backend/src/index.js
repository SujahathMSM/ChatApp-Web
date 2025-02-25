import express from "express";
import AuthRoutes from "./routes/auth.route.js";
import MessageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoutes);
app.use("/api/message", MessageRoutes);

app.listen(PORT, () => {
  console.log("Server is started on port 5001");
  connectDB();
});
