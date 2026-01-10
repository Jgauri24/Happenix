import express from 'express';
import { protect } from '../middleware/auth.js';
import {getBookmark,recentlyViewed} from "../controllers/user.js"
const router = express.Router();
 
router.get('/bookmarks', protect,getBookmark)
router.get('/recently-viewed', protect,recentlyViewed)