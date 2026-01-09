
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

import { geocodeAddress, calculateTravelTime } from '../utils/googleMaps.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename=fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        const uploadsDir = path.join(__dirname, '../uploads/posters');
        if(!fs.existsSync(uploadsDir)){
fs.mkdir(uploadsDir, { recursive: true })
        }
        cb(null, uploadsDir);
    },filename: (req, file, cb) => {
        cb(null, `poster-${Date.now()}${path.extname(file.originalname)}`);
      }
})
export const upload=multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter:(req,file,cb)=>{
const allowedTypes=/jpeg|jpg|png|gif|webp/;
const extname =allowedTypes.test(path.extname(file.originalname).toLowerCase());
const mimetype = allowedTypes.test(file.mimetype);
if(extname&&mimetype){
    cb(null, true);
}else {
    cb(new Error('Only image files are allowed'));
  }

    }
})
// Get all events with filters,pagination, and sorting
export const getAllEvents=async(req, res, next)=>{
try{
    const {
        page = 1,
        limit = 12,
        search,
        category,
        city,
        type,
        status = 'active',
        minPrice,
        maxPrice,
        dateFrom,
        dateTo,
        sortBy = 'date', 
        userLat,
        userLng,
        travelMode = 'driving'
      } = req.query
      const query = { status };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (type) query.type = type;

    if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);


      }

    if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) query.date.$lte = new Date(dateTo);
      } else {
        query.date = { $gte: new Date() };
      }
    //pagination
    const skip=(parseInt(page)-1)* parseInt(limit)
    let events=await Event.find(query).populate('createdBy', 'name email')
    .sort(sortBy === 'price' ? { price: 1 } : sortBy === 'createdAt' ? { createdAt: -1 } : { date: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    //travel time if user location provided
    if (userLat && userLng && events.length > 0) {
        const userLocation = { lat: parseFloat(userLat), lng: parseFloat(userLng) };
        events=await Promise.all(
            events.map(async(e)=>{
                if(e.type==="offline" && e.lng && e.lat){
                    try{
                        const travelInfo = await calculateTravelTime(
                            userLocation,
                            { lat: e.lat, lng: e.lng },
                            travelMode
                          );
                          return {
                            ...e.toObject(),
                            travelTime: travelInfo.duration,
                            travelDistance: travelInfo.distance,
                            travelTimeText: travelInfo.durationText,
                            travelDistanceText: travelInfo.distanceText
                          };
                        } catch (error) {
                            return e.toObject();
                          }
                        }
                        return e.toObject();

                    })
                

            
        )

    if (sortBy === 'travelTime') {
        events.sort((a, b) => (a.travelTime || Infinity) - (b.travelTime || Infinity));
      }
    } else {
      events = events.map(e => e.toObject());
    }
// pages count
    const total = await Event.countDocuments(query);
    const eventsWithAttendees = await Promise.all(events.map(async (event) => {
        const attendeeCount = await Booking.countDocuments({ 
          eventId: event._id, 
          status: 'confirmed' 
        });
        return {
          ...event,
          attendeeCount,
          isFull: event.maxAttendees ? attendeeCount >= event.maxAttendees : false
        };
      }));

      res.json({
        success: true,
        events: eventsWithAttendees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
}catch(err){
next(err)
}
}

// Get events nearby a specific location 
export const getnearbyevents=async(req,res,next)=>{
    try{
    const { city, lat, lng, limit = 10, travelMode = 'driving' } = req.query;
    if (!city && (!lat || !lng)) {
        return res.status(400).json({ success: false, message: 'Please provide either a city or coordinates)' });
      }
      let query = { status: 'active', date: { $gte: new Date() } };
      
      

          if (city) {
              const nearbyCities = [city];
              const lowerCity = city.toLowerCase();
              
              if (lowerCity.includes('noida') || lowerCity.includes('delhi') || lowerCity.includes('gurgaon') || lowerCity.includes('ghaziabad') || lowerCity.includes('faridabad')) {
                  nearbyCities.push('Noida', 'New Delhi', 'Delhi', 'Gurgaon', 'Gurugram', 'Ghaziabad', 'Faridabad');
              } else if (lowerCity.includes('mumbai') || lowerCity.includes('navi mumbai') || lowerCity.includes('thane')) {
                  nearbyCities.push('Mumbai', 'Navi Mumbai', 'Thane');
              } else if (lowerCity.includes('bangalore') || lowerCity.includes('bengaluru')) {
                  nearbyCities.push('Bangalore', 'Bengaluru');
              }
              
              const cityRegex = nearbyCities.map(c => new RegExp(c, 'i'));
              query.city = { $in: cityRegex };
          } 
          else if (lat && lng) {
              const range = 0.45;
              const latNum = parseFloat(lat);
              const lngNum = parseFloat(lng);
              
              query.lat = { $gte: latNum - range, $lte: latNum + range };
              query.lng = { $gte: lngNum - range, $lte: lngNum + range };
          }
      
          let events = await Event.find(query)
            .sort({ date: 1 })
            .limit(parseInt(limit));
      
          if (lat && lng && events.length > 0) {
            const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
            
            events = await Promise.all(events.map(async (event) => {
              if (event.type === 'offline' && event.lat && event.lng) {
                try {
                  const travelInfo = await calculateTravelTime(
                    userLocation,
                    { lat: event.lat, lng: event.lng },
                    travelMode
                  );
                  return {
                    ...event.toObject(),
                    travelTime: travelInfo.duration,
                    travelDistance: travelInfo.distance,
                    travelTimeText: travelInfo.durationText,
                    travelDistanceText: travelInfo.distanceText
                  };
                } catch (error) {
                  return event.toObject();
                }
              }
              return event.toObject();
            }));
          } else {
              events = events.map(e => e.toObject());
          }
      
          res.json({
              success: true,
              count: events.length,
              events
          });
      
        } catch (error) {
          next(error);
        }}
    
      
    // Get single event by ID
       
export const geteachevent= async (req, res, next) => {
        try {
          const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
          
          if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
          }
      
          const attendeeCount = await Booking.countDocuments({ 
            eventId: event._id, 
            status: 'confirmed' 
          });
      
          res.json({
            success: true,
            event: {
              ...event.toObject(),
              attendeeCount,
              isFull: event.maxAttendees ? attendeeCount >= event.maxAttendees : false
            }
          });
        } catch (error) {
          next(error);
        }
      };
      


// Create new event (Admin only)
export const CreateEvent= async (req, res, next) => {
    try {
      const {
        title,
        description,
        category,
        type,
        price,
        date,
        time,
        duration,
        locationName,
        city,
        address,
        lat,
        lng,
        onlineLink,
        maxAttendees
      } = req.body;
  
      
      if (!title || !description || !category || !type || !date || !time || !city) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
      }
  
// offline
      let eventLat = lat ? parseFloat(lat) : null;
      let eventLng = lng ? parseFloat(lng) : null;
  
      if (type === 'offline' && address && !eventLat && !eventLng) {
        try {
          const geocoded = await geocodeAddress(address);
          eventLat = geocoded.lat;
          eventLng = geocoded.lng;
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
  
      const eventData = {
        title,
        description,
        category,
        type,
        price: parseFloat(price) || 0,
        date: new Date(date),
        time,
        duration: parseInt(duration) || 60,
        city,
        createdBy: req.user._id,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null
      };
  
      if (type === 'offline') {
        eventData.locationName = locationName || address;
        eventData.lat = eventLat;
        eventData.lng = eventLng;
      } else {
        eventData.onlineLink = onlineLink;
      }
  
      if (req.file) {
        eventData.poster = `/uploads/posters/${req.file.filename}`;
      }
  
      const event = await Event.create(eventData);
  
      res.status(201).json({
        success: true,
        event
      });
    } catch (error) {
      next(error);
    }
  }
  
    //  Update event (Admin only)
export const updatedEvent= async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
  
    
      if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
  
      const updateData = { ...req.body };
      
      if (updateData.date) updateData.date = new Date(updateData.date);
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.duration) updateData.duration = parseInt(updateData.duration);
      if (updateData.maxAttendees) updateData.maxAttendees = parseInt(updateData.maxAttendees);
  
      if (updateData.address && event.type === 'offline') {
        try {
          const geocoded = await geocodeAddress(updateData.address);
          updateData.lat = geocoded.lat;
          updateData.lng = geocoded.lng;
          if (!updateData.locationName) {
            updateData.locationName = geocoded.formattedAddress;
          }
          delete updateData.address;
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
  
      if (req.file) {
        updateData.poster = `/uploads/posters/${req.file.filename}`;
      }
  
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
      });
  
      res.json({
        success: true,
        event: updatedEvent
      });
    } catch (error) {
      next(error);
    }
  };
  
    // Delete event (Admin only)

export const deleteEvent=async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
  
      await Event.findByIdAndDelete(req.params.id);
      await Booking.deleteMany({ eventId: req.params.id });
  
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  
    // Bookmark/unbookmark event
   
export const BookUnbook= async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const eventId = req.params.id;
  
      const index = user.bookmarks.indexOf(eventId);
      if (index > -1) {
        user.bookmarks.splice(index, 1);
        await user.save();
        return res.json({ success: true, bookmarked: false });
      } else {
        user.bookmarks.push(eventId);
        await user.save();
        return res.json({ success: true, bookmarked: true });
      }
    } catch (error) {
      next(error);
    }
  };
  
//    Track event view for recently viewed
export const recentView= async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const eventId = req.params.id;
  
      user.recentlyViewed = user.recentlyViewed.filter(
        item => item.eventId.toString() !== eventId
      );
  
      user.recentlyViewed.unshift({
        eventId,
        viewedAt: new Date()
      });
  
      
      if (user.recentlyViewed.length > 20) {
        user.recentlyViewed = user.recentlyViewed.slice(0, 20);
      }
  
      await user.save();
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };
  

  
  
  
  