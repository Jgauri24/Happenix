
import User from '../models/User.js';



// Get user's bookmarked events
export const getbookmarked= async (req, res, next) => {
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

export const getrecentlyadded= async (req, res, next) => {
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


