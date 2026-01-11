import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon issues in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Create a special icon for user location
let UserIcon = L.divIcon({
    className: 'custom-user-icon',
    html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map view when center changes
function ChangeView({ center, zoom, recenterTrigger }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom);
        }
    }, [center, zoom, map, recenterTrigger]);
    return null;
}

export default function MapView({ events, userLocation, recenterTrigger }) {
    const offlineEvents = events.filter(e => e.type === 'offline' && e.lat && e.lng);

    // Determine center: prioritize user location, then first event, then default
    let center = [28.6139, 77.2090]; // Default to Delhi center
    let zoom = 10;

    if (userLocation?.lat && userLocation?.lng) {
        center = [userLocation.lat, userLocation.lng];
        zoom = 12;
    } else if (offlineEvents.length > 0) {
        // Calculate the geographic average center of all events currently shown
        const centerLat = offlineEvents.reduce((sum, e) => sum + e.lat, 0) / offlineEvents.length;
        const centerLng = offlineEvents.reduce((sum, e) => sum + e.lng, 0) / offlineEvents.length;
        center = [centerLat, centerLng];
        zoom = 11;
    }

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView center={center} zoom={zoom} recenterTrigger={recenterTrigger} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation?.lat && userLocation?.lng && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                        <Popup>
                            <div className="p-1 text-center font-bold text-blue-600">Your Location</div>
                        </Popup>
                    </Marker>
                )}

                {offlineEvents.map((event) => (
                    <Marker key={event._id} position={[event.lat, event.lng]}>
                        <Popup>
                            <div className="p-1 min-w-[150px]">
                                <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                                <p className="text-xs text-gray-600 mb-1">{event.city}</p>
                                {event.travelDistanceText && (
                                    <p className="text-xs font-medium text-primary-600 mb-2 flex items-center">
                                        <Navigation className="h-3 w-3 mr-1" />
                                        {event.travelDistanceText} away
                                    </p>
                                )}
                                <Link
                                    to={`/events/${event._id}`}
                                    className="bg-primary-600 text-white px-3 py-1 rounded-md text-xs font-bold block text-center hover:bg-primary-700 transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
