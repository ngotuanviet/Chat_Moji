import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary'
import { ConnectDB } from "./libs/db.js";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js"
import userRoute from "./routes/user.route.js";
import friendRoute from "./routes/friend.route.js";
import conversationRoute from "./routes/conversation.route.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/index.js"
// import swaggerUi from 'swagger-ui-express';
import fs from 'fs'
import { protectedRoute } from "./middleware/auth.middleware.js";

dotenv.config();
// config upload Image
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
// Port
const port = process.env.PORT || 5001;
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
//const swaggerDocument = JSON.parse(fs.readFileSync("./src/swagger.json", "utf8"))
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// public routes
app.use("/api/auth", authRoute);
// private routes
app.use(protectedRoute);
app.use("/api/user", userRoute);
app.use("/api/friends", friendRoute);
app.use('/api/messages', messageRoute);
app.use("/api/conversations", conversationRoute)
ConnectDB().then(() => {
  server.listen(port, () => {
    console.log(`server đang lắng nghe ở cổng ${port}`);
  });
});
