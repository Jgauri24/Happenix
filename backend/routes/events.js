import { protect } from '../middleware/auth.js';
import express from "express";
import {
    getAllEvents,
    getnearbyevents,
    geteachevent,
    CreateEvent,
    updatedEvent,
    deleteEvent,
    BookUnbook,
    recentView,
    upload
  } from "../controllers/events.js";
  

const router=express.Router();
router.get('/',getAllEvents);
router.get('/nearby',getnearbyevents);
router.get('/:id',geteachevent);
router.post('/', protect, upload.single('poster'),CreateEvent);
router.put('/:id', protect, upload.single('poster'),updatedEvent);
router.delete('/:id', protect,deleteEvent);
router.post('/:id/bookmark', protect,BookUnbook);
router.post('/:id/view', protect,recentView)
export default router;