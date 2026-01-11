import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";
import profileRoutes from "./routes/user.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { verifyConnection } from "./utils/notifications.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express()

// Verify email connection
verifyConnection();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());


// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
    cors()
  );
mongoose
  .connect(
    "mongodb+srv://gaurijindal2024_db_user:LGN2QjpDCn3BG69D@happening.8dv372u.mongodb.net/?appName=happening"
  )
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log(err));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings",bookingRoutes)
app.use('/api/users',profileRoutes)
app.get("/", (req, res) => {
  res.json({ status: "Ok" });
});
app.use(errorHandler);

app.listen(3000, () => {
  console.log("the server is listening");
});
