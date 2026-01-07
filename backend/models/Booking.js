import mongoose from "mongoose";
const bookingSchema= new mongoose.Schema({
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },  qrCodeUrl: {
        type: String,
        required: true
      },
      qrCodeData: {
        bookingId: { type: String },
        eventId: { type: String },
        userId: { type: String },
        timestamp: { type: Date }
      },
      status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'attended'],
        default: 'confirmed'
      },
      attendanceMarked: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
)
bookingSchema.index({ eventId: 1, userId: 1 }, { unique: true });
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;