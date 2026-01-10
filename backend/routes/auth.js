import express from "express";
import { protect } from "../middleware/auth.js";
import {registerUser,loginUser,mydata} from "../controllers/auth.js"
const router = express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/me",protect,mydata)


export default router