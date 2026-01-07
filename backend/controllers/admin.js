
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// get admin dashboard stats
export const getdashstats=async (req,res,next)=>{
    try{
        const totalEvents=await Event.countDocuments()
        const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeEvents = await Event.countDocuments({ status: 'active' });

        // top
        const catStats = await Event.aggregate([
            {$group:{_id:"$category",count:{$sum:1}}},
            {$sort:{count:-1}},
            {$limit:5}
        ])
        // active cities
        const cityStats = await Event.aggregate([
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]);
        // bookings (last 30 days)
        const thirtyDaysAgo=new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const bookingsovertime=await Booking.aggregate([
            {$match:{createdAt:{$gte:thirtyDaysAgo}}},
            {
                $group:{
                    _id:{$dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                },
                
            },
            { $sort: { _id: 1 } }
        ])
        // revenue 
        const revStats = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            {
              $lookup: {
                from: 'events',
                localField: 'eventId',
                foreignField: '_id',
                as: 'event'
              }
            },
            { $unwind: '$event' },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$event.price' },
                averagePrice: { $avg: '$event.price' }
              }
            }
          ]);
          res.json({
            success: true,
            stats: {
              totalEvents,
              totalBookings,
              totalUsers,
              activeEvents,
              catStats,
              cityStats,
              bookingsovertime,
              revenue: revStats[0] || { totalRevenue: 0, averagePrice: 0 }
            }
          });
    }catch(err){
        next(err);
    }
}
// get all bookings with filters
export const allbookingwithFilter=async (req,res,next)=>{
try{
    const {
        page = 1,
        limit = 20,
        search,
        eventId,
        status,
        dateFrom,
        dateTo
      } = req.query;
      const query = {};

      if (eventId) query.eventId = eventId;
      if (status) query.status = status;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let bookings = await Booking.find(query)
  .populate('eventId', 'title date time')
  .populate('userId', 'name email')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));
  // Filter by search if provided
  if (search) {
    const searchLower = search.toLowerCase();
    bookings = bookings.filter(b => 
      b.userId.name.toLowerCase().includes(searchLower) ||
      b.userId.email.toLowerCase().includes(searchLower) ||
      b.eventId.title.toLowerCase().includes(searchLower)
    );
  }
  const total = await Booking.countDocuments(query);
  res.json({
    success: true,
    bookings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
      })
    }}catch(err){

    }
}

// export booking as csv
export const bookingascsv= async (req, res, next) => {
    try {
      const bookings = await Booking.find({ status: 'confirmed' })
        .populate('eventId', 'title date time city')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
  
      // Generate CSV
      const csvHeader = 'Booking ID,User Name,User Email,Event Title,Event Date,Event Time,City,Booking Date,Attendance\n';
      const csvRows = bookings.map(booking => {
        return [
          booking._id,
          booking.userId.name,
          booking.userId.email,
          booking.eventId.title,
          new Date(booking.eventId.date).toLocaleDateString(),
          booking.eventId.time,
          booking.eventId.city,
          new Date(booking.createdAt).toLocaleDateString(),
          booking.attendanceMarked ? 'Yes' : 'No'
        ].join(',');
      }).join('\n');
  
      const csv = csvHeader + csvRows;
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  };
//    Get all bookings for a specific event
 export const Allbookingseachevent=async (req,res,next)=>{
    try{
const id=req.params.id;
const bookings=await  Booking.find({
    eventId:id,
    status:"confirmed"
}).populate('userId', 'name email')
.sort({ createdAt: -1 });

res.json({
    success: true,
    bookings
  });
    }catch(err){
        next(err);
    }
}