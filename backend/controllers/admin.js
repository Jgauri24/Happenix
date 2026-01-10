import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// get admin dashboard stats
export const getdashstats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: "confirmed" });
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeEvents = await Event.countDocuments({ status: "active" });

    // top
    const catStats = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    // active cities
    const cityStats = await Event.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    // bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const bookingsovertime = await Booking.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    // revenue
    const revStats = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$event.price" },
          averagePrice: { $avg: "$event.price" },
        },
      },
    ]);
    res.json({
      success: true,
      stats: {
        totalEvents,
        totalBookings,
        totalUsers,
        activeEvents,
        categoryStats: catStats,
        cityStats,
        bookingsOverTime: bookingsovertime,
        revenue: revStats[0] || { totalRevenue: 0, averagePrice: 0 },
      },
    });
  } catch (err) {
    next(err);
  }
};
// get all bookings with filters
export const allbookingwithFilter = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      eventId,
      status,
      dateFrom,
      dateTo,
    } = req.query;
    const query = {};

    if (eventId) query.eventId = eventId;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // If search is provided, use aggregation with $lookup
    let bookings;
    let total;

    if (search) {
      // Convert search to regex for partial matching
      const searchRegex = new RegExp(search, "i");
      
      const pipeline = [
        { $match: query },
        // Lookup User
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        // Lookup Event
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "eventInfo",
          },
        },
        // Unwind to allow filtering on joined fields
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$eventInfo", preserveNullAndEmptyArrays: true } },
        // Match Search
        {
          $match: {
            $or: [
              { "userInfo.name": searchRegex },
              { "userInfo.email": searchRegex },
              { "eventInfo.title": searchRegex },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      // Get total count
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Booking.aggregate(countPipeline);
      total = countResult[0]?.total || 0;

      // Get paginated results
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const dataPipeline = [
        ...pipeline,
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
             _id: 1,
             status: 1,
             attendanceMarked: 1,
             createdAt: 1,
             eventId: "$eventInfo", // Use the unwinded info
             userId: "$userInfo"  // Use the unwinded info
          }
        }
      ];

      const aggResults = await Booking.aggregate(dataPipeline);
      
      // Remap to match structure expected by frontend (which expects populated objects)
      bookings = aggResults.map(b => ({
        ...b,
        eventId: b.eventId ? { ...b.eventId } : null,
        userId: b.userId ? { ...b.userId } : null
      }));
      
    } else {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      total = await Booking.countDocuments(query);

      bookings = await Booking.find(query)
        .populate("eventId", "title date time city")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// export booking as csv
export const bookingascsv = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ status: "confirmed" })
      .populate("eventId", "title date time city")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Generate CSV
    const csvHeader =
      "Booking ID,User Name,User Email,Event Title,Event Date,Event Time,City,Booking Date,Attendance\n";
    const csvRows = bookings
      .map((booking) => {
        return [
          booking._id,
          booking.userId.name,
          booking.userId.email,
          booking.eventId.title,
          new Date(booking.eventId.date).toLocaleDateString(),
          booking.eventId.time,
          booking.eventId.city,
          new Date(booking.createdAt).toLocaleDateString(),
          booking.attendanceMarked ? "Yes" : "No",
        ].join(",");
      })
      .join("\n");

    const csv = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
//  Get all bookings for a specific event
export const getEventBookings = async (req, res, next) => {
  try {
    const id = req.params.id;
    const bookings = await Booking.find({
      eventId: id,
      status: "confirmed",
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};
