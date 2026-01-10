import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {getdashstats,allbookingwithFilter,bookingascsv,getEventBookings} from "../controllers/admin.js";

const router = express.Router();
router.use(protect);
router.use(admin);

router.get("/stats",getdashstats)
router.get("/bookings",allbookingwithFilter)
router.get("/bookings/export",bookingascsv)
router.get("/events/:id/bookings",getEventBookings) 

export default router;