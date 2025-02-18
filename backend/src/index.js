import express from "express";
import AuthRoutes from "./routes/auth.route.js";
const app = express();

app.use("/api/auth", AuthRoutes);

app.listen(5001, () => {
  console.log("Server is started on port 5001");
});
