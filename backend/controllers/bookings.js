import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { generateQRCode } from "../utils/qrCode.js";
import {
  sendBookingConfirmation,
  sendEventReminder,
  sendEventUpdate,
} from "../utils/notifications.js";

// Create a new booking
export const newBooking = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID is required" });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check if event is active
    if (event.status !== "active") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Event is not available for booking",
        });
    }

    // Check if already booked
    let booking = await Booking.findOne({
      eventId,
      userId: req.user._id,
    });

    if (booking && booking.status === 'confirmed') {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already booked this event",
        });
    }

    // Check capacity
    if (event.maxAttendees) {
      const currentBookings = await Booking.countDocuments({
        eventId,
        status: "confirmed",
      });
      if (currentBookings >= event.maxAttendees) {
        return res
          .status(400)
          .json({ success: false, message: "Event is full" });
      }
    }

    if (booking) {
      // Reactivate cancelled booking
      booking.status = 'confirmed';
      booking.attendanceMarked = false; // Reset attendance if it was somehow marked
      booking.qrCodeUrl = 'pending'; // verify this won't break client temporarily
    } else {
      // Create new booking
      booking = new Booking({
        eventId,
        userId: req.user._id,
        qrCodeUrl: 'pending',
        qrCodeData: {},
      });
    }
    
    // Save first to ensure we have an ID (for new bookings)
    await booking.save();

    // Generate QR code with actual booking ID
    const qrData = await generateQRCode({
      bookingId: booking._id.toString(),
      eventId: event._id.toString(),
      userId: req.user._id.toString(),
      timestamp: new Date(),
    });

    // Update booking with QR code data
    booking.qrCodeUrl = qrData.qrCodeUrl;
    booking.qrCodeData = qrData.qrCodeData;
    await booking.save();

    // Add to event attendees
    event.attendees.push(req.user._id);
    await event.save();

    // Send confirmation email
    const user = await User.findById(req.user._id);
    await sendBookingConfirmation(
      user.email,
      user.name,
      event.title,
      qrData.qrCodeUrl
    );

    // Populate booking data
    const populatedBooking = await Booking.findById(booking._id)
      .populate("eventId")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

//  Get user's bookings
export const getUserBooking = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    const query = { userId: req.user._id };

    // Filter out cancelled bookings by default
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'cancelled' };
    }

    let bookings = await Booking.find(query)
      .populate({
        path: "eventId",
        populate: { path: "createdBy", select: "name" },
      })
      .sort({ createdAt: -1 });

    // Filter upcoming/past if requested
    if (upcoming === "true") {
      bookings = bookings.filter((b) => new Date(b.eventId.date) >= new Date());
    } else if (upcoming === "false") {
      bookings = bookings.filter((b) => new Date(b.eventId.date) < new Date());
    }

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get single booking
export const SingleBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("userId", "name email");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check authorization
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Remove from event attendees
    const event = await Event.findById(booking.eventId._id);
    event.attendees = event.attendees.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await event.save();

    // Send cancellation email
    const user = await User.findById(req.user._id);
    await sendEventUpdate(
      user.email,
      user.name,
      event.title,
      "Your booking has been cancelled."
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Validate QR code (Admin only)
export const validateQR = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("userId", "name email");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ success: false, message: "Booking is not confirmed" });
    }

    // Mark attendance
    booking.attendanceMarked = true;
    booking.status = "attended";
    await booking.save();

    // Increment user's attended count
    await User.findByIdAndUpdate(booking.userId._id, {
      $inc: { attendedCount: 1 }
    });

    res.json({
      success: true,
      booking,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    next(error);
  }
};

//  Mark booking as attended (for past events self-check or testing)
export const attended = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Only allow if event date has passed
    if (new Date(booking.eventId.date) > new Date()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot mark attendance for future events",
        });
    }

    booking.status = "attended";
    booking.attendanceMarked = true;
    await booking.save();

    // Increment user's attended count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { attendedCount: 1 }
    });

    res.json({
      success: true,
      booking,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    next(error);
  }
};
