import express from 'express';
import { protect } from '../middleware/auth.js';
import {getbookmarked,getrecentlyadded,updateProfile} from "../controllers/user.js"
const router = express.Router();
 
router.get('/bookmarks', protect,getbookmarked)
router.get('/recently-viewed', protect,getrecentlyadded)
router.put("/profile",protect,updateProfile)
export default router;