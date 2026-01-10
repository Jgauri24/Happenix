import express from "express";
import {
  newBooking,
  getUserBooking,
  SingleBooking,
  cancelBooking,
  validateQR,
  attended
} from "../controllers/bookings.js";

import {protect} from "../middleware/auth.js";


const router = express.Router();

router.post("/", protect, newBooking);
router.get("/", protect, getUserBooking);
router.get("/:id", protect, SingleBooking);
router.delete("/:id", protect, cancelBooking);
router.post("/:id/validate", protect,  validateQR);
router.post("/:id/attend", protect, attended);

export default router;

