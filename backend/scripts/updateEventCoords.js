import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Event from '../models/Event.js';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = "mongodb+srv://gaurijindal2024_db_user:LGN2QjpDCn3BG69D@happening.8dv372u.mongodb.net/?appName=happening";

const cityCoords = {
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Bangalore": { lat: 12.9716, lng: 77.5946 },
    "Bengaluru": { lat: 12.9716, lng: 77.5946 },
    "Delhi": { lat: 28.6139, lng: 77.2090 },
    "New Delhi": { lat: 28.6139, lng: 77.2090 },
    "Hyderabad": { lat: 17.3850, lng: 78.4867 },
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Pune": { lat: 18.5204, lng: 73.8567 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "Jaipur": { lat: 26.9124, lng: 75.7873 },
    "Goa": { lat: 15.2993, lng: 74.1240 },
    "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "Surat": { lat: 21.1702, lng: 72.8311 },
    "Chandigarh": { lat: 30.7333, lng: 76.7794 },
    "Lucknow": { lat: 26.8467, lng: 80.9462 },
    "Indore": { lat: 22.7196, lng: 75.8577 },
    "Nagpur": { lat: 21.1458, lng: 79.0882 },
    "Kochi": { lat: 9.9312, lng: 76.2673 },
    "Patna": { lat: 25.5941, lng: 85.1376 },
    "Bhopal": { lat: 23.2599, lng: 77.4126 },
    "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
    "Kanpur": { lat: 26.4499, lng: 80.3319 },
    "Guwahati": { lat: 26.1445, lng: 91.7362 }
};

const updateCoords = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB...');

        const events = await Event.find({ lat: { $exists: false } });
        console.log(`Found ${events.length} events without coordinates.`);

        let updatedCount = 0;
        for (const event of events) {
            const coords = cityCoords[event.city];
            if (coords) {
                // Add a small random offset to prevent direct overlap
                const latOffset = (Math.random() - 0.5) * 0.01;
                const lngOffset = (Math.random() - 0.5) * 0.01;
                
                event.lat = coords.lat + latOffset;
                event.lng = coords.lng + lngOffset;
                await event.save();
                updatedCount++;
            }
        }

        console.log(`Successfully updated coordinates for ${updatedCount} events!`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating events:', error);
        process.exit(1);
    }
};

updateCoords();
