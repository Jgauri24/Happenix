import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models using full paths to be safe
import Event from '../models/Event.js';
import User from '../models/User.js';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = "mongodb+srv://gaurijindal2024_db_user:LGN2QjpDCn3BG69D@happening.8dv372u.mongodb.net/?appName=happening";

const events = [
  {
    title: "Mumbai Tech Summit 2026",
    description: "The biggest tech conference in Mumbai featuring industry leaders in AI, Blockchain, and Software Engineering. Join us for a day of networking and innovation.",
    date: new Date("2026-03-15T10:00:00Z"),
    time: "10:00 AM",
    duration: 480,
    type: "offline",
    locationName: "Jio World Convention Centre",
    city: "Mumbai",
    category: "Technology",
    price: 49,
    maxAttendees: 500,
    status: "active",
    poster: "https://images.unsplash.com/photo-1540575861501-7ad05823c951?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Bangalore Jazz Night",
    description: "Experience a night of soulful jazz music at the heart of Bangalore. Featuring local and international jazz artists.",
    date: new Date("2026-02-20T19:00:00Z"),
    time: "07:00 PM",
    duration: 180,
    type: "offline",
    locationName: "The Humming Tree",
    city: "Bangalore",
    category: "Music",
    price: 15,
    maxAttendees: 150,
    status: "active",
    poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Delhi Food Festival",
    description: "A culinary journey through the flavors of Delhi. Taste the best street food, fine dining, and everything in between.",
    date: new Date("2026-04-05T11:00:00Z"),
    time: "11:00 AM",
    duration: 600,
    type: "offline",
    locationName: "Jawaharlal Nehru Stadium",
    city: "Delhi",
    category: "Food",
    price: 10,
    maxAttendees: 2000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Hyderabad Startup Expo",
    description: "Connecting startups with investors and mentors. A platform for the next generation of Indian entrepreneurs.",
    date: new Date("2026-05-12T09:00:00Z"),
    time: "09:00 AM",
    duration: 540,
    type: "offline",
    locationName: "HITEX Exhibition Center",
    city: "Hyderabad",
    category: "Business",
    price: 0,
    maxAttendees: 1000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chennai Yoga Retreat",
    description: "Find your inner peace with a sunrise yoga session at Marina Beach. Led by experienced practitioners.",
    date: new Date("2026-02-14T06:00:00Z"),
    time: "06:00 AM",
    duration: 120,
    type: "offline",
    locationName: "Marina Beach",
    city: "Chennai",
    category: "Health",
    price: 0,
    maxAttendees: 100,
    status: "active",
    poster: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pune Arts & Heritage Walk",
    description: "Explore the rich history and artistic heritage of Pune with a guided walk through the old city areas.",
    date: new Date("2026-03-22T08:00:00Z"),
    time: "08:00 AM",
    duration: 240,
    type: "offline",
    locationName: "Shaniwar Wada",
    city: "Pune",
    category: "Arts",
    price: 5,
    maxAttendees: 30,
    status: "active",
    poster: "https://images.unsplash.com/photo-1460661419201-fd4ce186860d?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Kolkata Literature Festival",
    description: "Celebrating the vibrant literary culture of Kolkata. Meet your favorite authors and attend engaging panel discussions.",
    date: new Date("2026-01-28T10:00:00Z"),
    time: "10:00 AM",
    duration: 480,
    type: "offline",
    locationName: "Victoria Memorial Grounds",
    city: "Kolkata",
    category: "Education",
    price: 0,
    maxAttendees: 800,
    status: "active",
    poster: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Jaipur Photography Workshop",
    description: "Capture the colors of the Pink City. Learn advanced photography techniques from experts in the field.",
    date: new Date("2026-04-18T16:00:00Z"),
    time: "04:00 PM",
    duration: 180,
    type: "offline",
    locationName: "Hawa Mahal",
    city: "Jaipur",
    category: "Arts",
    price: 25,
    maxAttendees: 20,
    status: "active",
    poster: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Goa Beach Party 2026",
    description: "The ultimate beach party in North Goa. Non-stop music, drinks, and fun under the stars.",
    date: new Date("2026-03-07T21:00:00Z"),
    time: "09:00 PM",
    duration: 420,
    type: "offline",
    locationName: "Anjuna Beach",
    city: "Goa",
    category: "Music",
    price: 30,
    maxAttendees: 1000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ahmedabad Heritage Cycle Tour",
    description: "Discover the UNESCO World Heritage City of Ahmedabad on two wheels. A refreshing morning tour.",
    date: new Date("2026-02-28T06:30:00Z"),
    time: "06:30 AM",
    duration: 150,
    type: "offline",
    locationName: "Bhadra Fort",
    city: "Ahmedabad",
    category: "Sports",
    price: 8,
    maxAttendees: 25,
    status: "active",
    poster: "https://images.unsplash.com/photo-1471506480208-89bd2906df09?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Surat Diamond & Textiles Expo",
    description: "Interational trade fair showcasing the best of Surat's diamond and textile industries.",
    date: new Date("2026-05-25T10:00:00Z"),
    time: "10:00 AM",
    duration: 540,
    type: "offline",
    locationName: "SIECC",
    city: "Surat",
    category: "Business",
    price: 20,
    maxAttendees: 3000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chandigarh Garden Festival",
    description: "Celebrate the beauty of Chandigarh's blooming gardens with flower shows and live performances.",
    date: new Date("2026-03-10T09:00:00Z"),
    time: "09:00 AM",
    duration: 480,
    type: "offline",
    locationName: "Zakir Hussain Rose Garden",
    city: "Chandigarh",
    category: "Other",
    price: 2,
    maxAttendees: 5000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1466721591559-1e66c002996e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Lucknow Kathak Evening",
    description: "An enchanting evening of classical Kathak dance performances by renowned artists.",
    date: new Date("2026-04-20T18:30:00Z"),
    time: "06:30 PM",
    duration: 120,
    type: "offline",
    locationName: "Sangeet Natak Akademi",
    city: "Lucknow",
    category: "Arts",
    price: 10,
    maxAttendees: 400,
    status: "active",
    poster: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Indore Cleanliness Awareness Run",
    description: "Join the run for a cleaner India in the cleanest city of the country. Finish line festivities included.",
    date: new Date("2026-01-15T06:00:00Z"),
    time: "06:00 AM",
    duration: 180,
    type: "offline",
    locationName: "Rajwada Palace",
    city: "Indore",
    category: "Sports",
    price: 0,
    maxAttendees: 2000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Nagpur Orange Festival",
    description: "A celebration of Nagpur's world-famous oranges with food stalls, cultural shows, and agricultural seminars.",
    date: new Date("2026-02-05T10:00:00Z"),
    time: "10:00 AM",
    duration: 600,
    type: "offline",
    locationName: "Reshimbagh Ground",
    city: "Nagpur",
    category: "Food",
    price: 5,
    maxAttendees: 10000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Kochi Startup Village Pitch Day",
    description: "Watch the most promising startups from Kerala pitch their ideas to a panel of venture capitalists.",
    date: new Date("2026-05-30T10:00:00Z"),
    time: "10:00 AM",
    duration: 360,
    type: "offline",
    locationName: "Startup Village",
    city: "Kochi",
    category: "Business",
    price: 15,
    maxAttendees: 200,
    status: "active",
    poster: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Patna Book Fair 2026",
    description: "Explore a vast collection of books across all genres at the annual Patna Book Fair.",
    date: new Date("2026-03-01T10:00:00Z"),
    time: "10:00 AM",
    duration: 600,
    type: "offline",
    locationName: "Gandhi Maidan",
    city: "Patna",
    category: "Education",
    price: 1,
    maxAttendees: 50000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Bhopal Lake Festival",
    description: "Water sports, music performances, and food stalls at the picturesque Upper Lake in Bhopal.",
    date: new Date("2026-04-12T16:00:00Z"),
    time: "04:00 PM",
    duration: 300,
    type: "offline",
    locationName: "Upper Lake",
    city: "Bhopal",
    category: "Sports",
    price: 0,
    maxAttendees: 5000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1518131359074-893f40f95229?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Visakhapatnam Beach Marathon",
    description: "Run along the beautiful coastline of Vizag. Categories for all fitness levels.",
    date: new Date("2026-02-22T05:30:00Z"),
    time: "05:30 AM",
    duration: 240,
    type: "offline",
    locationName: "RK Beach",
    city: "Visakhapatnam",
    category: "Sports",
    price: 12,
    maxAttendees: 3000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1532444458054-015fddf2b2cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Kanpur Industrial Innovation Summit",
    description: "A forum for discussing the future of manufacturing and industrial technology in North India.",
    date: new Date("2026-05-18T10:00:00Z"),
    time: "10:00 AM",
    duration: 480,
    type: "offline",
    locationName: "HBTI Campus",
    city: "Kanpur",
    category: "Technology",
    price: 25,
    maxAttendees: 500,
    status: "active",
    poster: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Guwahati Bihu Celebration",
    description: "Experience the colorful and energetic Bihu dance and music at the Rangghar celebration in Guwahati.",
    date: new Date("2026-04-14T15:00:00Z"),
    time: "03:00 PM",
    duration: 360,
    type: "offline",
    locationName: "Latasil Field",
    city: "Guwahati",
    category: "Music",
    price: 0,
    maxAttendees: 10000,
    status: "active",
    poster: "https://images.unsplash.com/photo-1514533212735-5df27d970db0?auto=format&fit=crop&w=800&q=80"
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Get an admin user ID to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    const eventsToSeed = events.map(event => ({
      ...event,
      createdBy: adminUser._id
    }));

    // Clear existing events (optional, maybe better to just add)
    // await Event.deleteMany({});
    // console.log('Existing events cleared.');

    await Event.insertMany(eventsToSeed);
    console.log(`Successfully seeded ${eventsToSeed.length} events!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
