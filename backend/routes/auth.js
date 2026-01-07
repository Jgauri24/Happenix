import express from "express";
import { protect } from "../middleware/auth.js";
import {registerUser,loginUser,mydata,updateProfile} from "../controllers/auth.js"
const router = express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/me",protect,mydata)
router.put("/profile",protect,updateProfile)

export default router