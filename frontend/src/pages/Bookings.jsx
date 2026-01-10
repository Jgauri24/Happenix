import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, Download, QrCode, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { QRCodeSVG } from 'qrcode.react';
import { getImageUrl } from '../utils/config';
import toast from 'react-hot-toast';

export default function Bookings() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data.bookings;
    }
  });

  // Filter out cancelled AND attended bookings as per requirement
  const activeBookings = data?.filter(b => b.status !== 'cancelled' && b.status !== 'attended' && !b.attendanceMarked) || [];

  const upcomingBookings = activeBookings.filter(b => new Date(b.eventId.date) >= new Date());
  const pastBookings = activeBookings.filter(b => new Date(b.eventId.date) < new Date());

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} isPast />
            ))}
          </div>
        </div>
      )}

      {data?.length === 0 && (
        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No bookings yet</p>
          <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Events →
          </Link>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, isPast = false }) {
  const event = booking.eventId;
  const isOnline = event.type === 'online';
  const queryClient = useQueryClient();

  const attendMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/bookings/${booking._id}/attend`);
    },
    onSuccess: () => {
      toast.success('Marked as attended!');
      queryClient.invalidateQueries(['bookings']);
      // Also invalidate user to update streak
      queryClient.invalidateQueries(['auth', 'me']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  });

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            to={`/events/${event._id}`}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 mb-2 block"
          >
            {event.title}
          </Link>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
            </div>
            {isOnline ? (
              <div className="flex items-center">
                <span className="mr-2">🌐</span>
                Online Event
              </div>
            ) : (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.city}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to={`/bookings/${booking._id}`}
            className="btn btn-primary text-sm whitespace-nowrap"
          >
            View Ticket
          </Link>

          {isPast && (
            booking.status === 'attended' || booking.attendanceMarked ? (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <CheckCircle className="h-3 w-3 mr-1" />
                Attended
              </span>
            ) : (
              <button
                onClick={() => attendMutation.mutate()}
                disabled={attendMutation.isPending}
                className="btn btn-secondary text-sm whitespace-nowrap"
              >
                Mark Attended
              </button>
            )
          )}
        </div>
      </div>

      {/* QR Code Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <QrCode className="h-4 w-4 mr-2" />
            Ticket ID: {booking._id.slice(-8)}
          </div>
          {booking.qrCodeUrl && (
            <img
              src={getImageUrl(booking.qrCodeUrl)}
              alt="QR Code"
              className="h-16 w-16"
            />
          )}
        </div>
      </div>
    </div>
  );
}
