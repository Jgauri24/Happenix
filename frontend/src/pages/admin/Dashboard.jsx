import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.stats;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  const stats = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEvents || 0}</p>
            </div>
            <Calendar className="h-12 w-12 text-primary-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBookings || 0}</p>
            </div>
            <Ticket className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers || 0}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeEvents || 0}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Bookings Over Time */}
        {stats.bookingsOverTime && stats.bookingsOverTime.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Bookings Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Categories */}
        {stats.categoryStats && stats.categoryStats.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Cities */}
      {stats.cityStats && stats.cityStats.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Most Active Cities</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {stats.cityStats.map((city) => (
              <div key={city._id} className="text-center">
                <p className="text-2xl font-bold text-primary-600">{city.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{city._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/events/create" className="btn btn-primary">
            Create Event
          </Link>
          <Link to="/admin/events" className="btn btn-secondary">
            Manage Events
          </Link>
          <Link to="/admin/bookings" className="btn btn-secondary">
            View Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}



