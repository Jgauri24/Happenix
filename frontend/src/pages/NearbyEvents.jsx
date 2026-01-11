import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, List, Map as MapIcon, Info } from 'lucide-react';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MapView from '../components/MapView';
import { useLocation } from '../hooks/useLocation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NearbyEvents() {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [recenterTrigger, setRecenterTrigger] = useState(0);
    const {
        location,
        loadingLocation,
        prompted,
        manualCity,
        setManualCity,
        requestLocation,
        setManualLocation
    } = useLocation();

    const handleManualSubmit = (e) => {
        e.preventDefault();
        setManualLocation(manualCity);
    };

    const { data: events, isLoading } = useQuery({
        queryKey: ['events', 'nearby', location],
        queryFn: async () => {
            if (!location.city && !location.lat) return [];
            const params = {};
            if (location.city) params.city = location.city;
            if (location.lat) params.lat = location.lat;
            if (location.lng) params.lng = location.lng;

            const res = await api.get('/events/nearby', { params });
            return res.data.events;
        },
        enabled: !!(location.city || location.lat)
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-4">
                            <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        Location Based
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                        Find events happening right in your neighborhood with real-time tracking
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    {/* Search Form */}
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <div className="relative flex-1 md:w-64">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Enter your city..."
                                className="input pl-10 w-full h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                value={manualCity}
                                onChange={(e) => setManualCity(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary h-12 px-6 rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all">
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (location.lat && location.lng) {
                                    setRecenterTrigger(prev => prev + 1);
                                } else {
                                    requestLocation(false);
                                }
                            }}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 h-12 w-12 flex items-center justify-center rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            title="Use Current Location"
                        >
                            <Navigation className={`h-5 w-5 ${loadingLocation ? 'animate-pulse' : ''}`} />
                        </button>
                    </form>

                    {/* View Switcher */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'list'
                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <List className="h-4 w-4" />
                            <span className="font-medium">List</span>
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'map'
                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <MapIcon className="h-4 w-4" />
                            <span className="font-medium">Map</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Status Messages */}
            {loadingLocation && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900 animate-ping"></div>
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white">
                            <Navigation className="h-8 w-8 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Locating You...</h3>
                    <p className="text-gray-600 dark:text-gray-400">Finding the best events right where you are.</p>
                </div>
            )}

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {!loadingLocation && (
                    <motion.div
                        key={viewMode + (events?.length || 0)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : events?.length > 0 ? (
                            viewMode === 'list' ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event, index) => (
                                        <motion.div
                                            key={event._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <EventCard event={event} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                                        <MapView events={events} userLocation={location} recenterTrigger={recenterTrigger} />
                                    </div>
                                    <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                                            <span>Active Events</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Info className="h-4 w-4" />
                                            <span>Click markers to see details</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : prompted && (location.city || location.lat) ? (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
                                <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-full mb-6">
                                    <MapPin className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    No events found near {location.city || 'your location'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                                    We couldn't find any events nearby at the moment. Try searching for a different city or check back soon!
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setManualLocation('')}
                                        className="btn btn-secondary px-8 rounded-xl"
                                    >
                                        Clear Search
                                    </button>
                                    <button
                                        onClick={() => requestLocation(false)}
                                        className="btn btn-primary px-8 rounded-xl"
                                    >
                                        Use Current Location
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/10 dark:to-transparent rounded-3xl">
                                <MapPin className="h-20 w-20 text-primary-500/30 mb-8" />
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Your Next Adventure</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-10">
                                    Search for your city or enable location access to discover amazing events happening right in your neighborhood.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => requestLocation(false)}
                                        className="btn btn-primary px-8 h-14 rounded-2xl flex items-center gap-3 font-bold shadow-xl shadow-primary-500/20"
                                    >
                                        <Navigation className="h-5 w-5" />
                                        Allow Location Access
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

