import express from 'express';
import User from '../models/User.js';



// Get user's bookmarked events
const getbookmarked= async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json({
      success: true,
      events: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};


// Get user's recently viewed events

const getrecentlyadded= async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('recentlyViewed.eventId')
      .select('recentlyViewed');

    const events = user.recentlyViewed
      .filter(item => item.eventID) // Filter out deleted events
      .map(item => ({
        ...item.eventId.toObject(),
        viewedAt: item.viewedAt
      }));

    res.json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
};





