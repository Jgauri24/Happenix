import express from "express";
import User from "../models/User.js"
import {generateToken} from "../utils/generateToken.js";

export const registerUser=async(req,res,next)=>{
    try{
const {name,email,password,role}=req.body;
if(!name ||!email ||!password){
return res.status(400).json({
    success: false,
    message: "Please provide all required fields",
  })
}
const userExist=await User.findOne({email})
if(userExist){
    return res.status(400).json({
        success: false, message: "User already exists"
    })
}
const user=await User.create({
    name,email,password,role:role||"user"
})
const token=generateToken(user._id)
res.status(201).json({
    success:true,
    token,
    user:{
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role

    }

})
    }catch(Err){
        next(Err)
    }
}

const express=express.Router();


export const loginUser=async(req,res,next)=>{
    const {email,password}=req.body
    try{
if(!email||!password){
    return res.status(400).json({ success: false, message: "Please provide email and password" })
}
const user=await User.findOne({email}).select("+password")
if(!user){
    return res
    .status(401)
    .json({ success: false, message: "Invalid credentials" });
}
const isMatch=await user.matchPassword(password)
if(!isMatch){
    return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
}
const token =generateToken(user._id);
res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      attendedCount: await Booking.countDocuments({
        userId: user._id,
        status: 'attended'
      })
    },
  });
    }catch(Err){
        next(Err)
    }
}

export const mydata=async(req,res,next)=>{
    try{
const user=await User.findById(req.user._id).populate("bookmarks")
res.json({success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      bookmarks: user.bookmarks,
      recentlyViewed: user.recentlyViewed,
      attendedCount: await Booking.countDocuments({
        userId: req.user._id,
        status: 'attended'
      }) }})
    }catch(Err){
        next(Err)
    }
}

export const updateProfile=async(req,res,next)=>{
    try{
        const { name, location } = req.body;
        const user=await User.findById(req.user._id)
        if(name) user.name=name
        if(location) user.location=location
        await user.save()
        res.json({
            success: true,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              location: user.location,
            },
          });
    }catch(Err){
        next(Err)
    }
}