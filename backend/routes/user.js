import express from 'express';
import { protect } from '../middleware/auth.js';
import {getbookmarked,getrecentlyadded,updateProfile} from "../controllers/user.js"
const router = express.Router();
 
// Re-using upload from events controller or should move to a separate config
import { upload } from "../controllers/events.js"; 

router.get('/bookmarks', protect,getbookmarked)
router.get('/recently-viewed', protect,getrecentlyadded)
router.put("/profile", protect, upload.single('avatar'), updateProfile)
export default router;