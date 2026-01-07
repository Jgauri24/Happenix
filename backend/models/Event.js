import mongoose from "mongoose";

const eventSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please provide an event title"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please provide an event description"]
    },category:{
        type:String,
        required:[true,"Please provide a category"],
        enum: ['Music', 'Sports', 'Technology', 'Business', 'Arts', 'Food', 'Education', 'Health', 'Other']
    },
    type:{
        type:String,
        enum:["online","offline"],
        required:[true,"Please specify event type"],
    },
    price:{
        type:Number,
        required:[true,'Please provide a price'],
        min:0,
        default:0
    },
    date:{
        type:Date,
        required: [true, 'Please provide an event date']
    },
    time:{
        type:String,
        required: [true, 'Please provide an event time'] 
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please provide event duration']
      },
      // For offline events
  locationName: {
    type: String
  },
  city: {
    type: String,
    required: [true, 'Please provide a city']
  },
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  // For online events
  onlineLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  poster: {
    type: String, 
    default: ''
  },
  maxAttendees: {
    type: Number,
    default: null 
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdAt: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;




