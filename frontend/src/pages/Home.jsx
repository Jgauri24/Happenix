import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, QrCode, LayoutDashboard, Compass } from 'lucide-react';

export default function Home() {
    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
                <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center" />
                <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
                        Discover Unforgettable <span className="text-primary-500">Events</span> Near You
                    </h1>
                    <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
                        The ultimate platform for finding, booking, and attending the best happenings in your city.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center">
                            Get Started <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link to="/events" className="btn btn-secondary text-lg px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20">
                            Browse Events
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="card text-center group hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Easy Booking</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Reserve your spot in seconds with our streamlined booking process.
                        </p>
                    </div>
                    <div className="card text-center group hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Location Based</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Find events happening right in your neighborhood with real-time tracking.
                        </p>
                    </div>
                    <div className="card text-center group hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Save to Calendar</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Never miss an event again. Easily sync your bookings with your favorite calendar apps.
                        </p>
                    </div>

                    {/* New Features */}
                    <div className="card text-center group hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Instant QR Entry</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Seamless entry with digital QR tickets. Forget printing, just scan and go.
                        </p>
                    </div>

                    <div className="card text-center group hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <LayoutDashboard className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Personal Dashboard</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track your entire journey, view history, and manage your bookings in one place.
                        </p>
                    </div>

                    <div className="card text-center group hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Compass className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Interactive Discovery</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Explore what's happening around you with our powerful map and search tools.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
