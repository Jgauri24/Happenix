import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js"
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.use(express.json());
app.use(
    cors({
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
      ],
      credentials: true,
    })
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
app.get("/", (req, res) => {
  res.json({ status: "Ok" });
});
app.use(errorHandler);

app.listen(3000, () => {
  console.log("the server is listening");
});
