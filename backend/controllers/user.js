import User from "../models/User.js";

// Get user's bookmarked events
export const getbookmarked = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("bookmarks");
    res.json({
      success: true,
      events: user.bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's recently viewed events

export const getrecentlyadded = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("recentlyViewed.eventId")
      .select("recentlyViewed");

    const events = user.recentlyViewed
      .filter((item) => item.eventID) // Filter out deleted events
      .map((item) => ({
        ...item.eventId.toObject(),
        viewedAt: item.viewedAt,
      }));

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, location } = req.body;
    const userId = req.user._id;

    // 1. Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Build update object
    const updates = {};
    if (name) updates.name = name;
    
    // 3. Email uniqueness check
    if (email && email !== userExists.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email is already taken" });
      }
      updates.email = email.toLowerCase();
    }

    // 4. Handle Avatar Upload
    if (req.file) {
      updates.avatar = req.file.path;
    }

    // 5. Handle Location Updates using dot notation for nested fields
    // This allows updating 'city' without overwriting 'lat'/'lng' if they existed
    if (location) {
      if (location.city !== undefined) updates['location.city'] = location.city;
      if (location.lat !== undefined) updates['location.lat'] = location.lat;
      if (location.lng !== undefined) updates['location.lng'] = location.lng;
    }

    // 5. Perform Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location || {},
        createdAt: updatedUser.createdAt,
        attendedCount: updatedUser.attendedCount || 0,
      },
      message: "Profile updated successfully"
    });
  } catch (Err) {
    console.error("Profile update error:", Err);
    if (Err.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    next(Err);
  }
};
