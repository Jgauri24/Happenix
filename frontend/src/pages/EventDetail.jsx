import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Clock, DollarSign, Wifi, Users, Bookmark, BookmarkCheck, Download, Share2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../store/authStore';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { addToGoogleCalendar, downloadICS } from '../utils/calendar';
import { getImageUrl } from '../utils/config';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data.event;
    }
  });

  // Track view
  const trackViewMutation = useMutation({
    mutationFn: async () => {
      if (user) {
        await api.post(`/events/${id}/view`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'recently-viewed']);
    }
  });

  useEffect(() => {
    if (user) {
      trackViewMutation.mutate();
    }
  }, [id, user]);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/events/${id}/bookmark`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.bookmarked ? 'Event bookmarked' : 'Bookmark removed');
      queryClient.invalidateQueries(['user', 'bookmarks']);
      queryClient.invalidateQueries(['auth', 'me']); // Refresh user data
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bookings', { eventId: id });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event booked successfully!');
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['event', id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Event not found</p>
        </div>
      </div>
    );
  }

  const isOnline = data.type === 'online';
  const isBookmarked = user?.bookmarks?.some(b => {
    const bookmarkId = typeof b === 'object' ? b._id : b;
    return bookmarkId === id;
  });
  const isBooked = false; // Would need to check user's bookings

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Poster */}
          {data.poster ? (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={getImageUrl(data.poster)}
                alt={data.title}
                className="w-full h-96 object-cover"
              />
            </div>
          ) : (
            <div className="mb-6 h-96 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Calendar className="h-24 w-24 text-white opacity-50" />
            </div>
          )}

          {/* Title & Category */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {data.category}
              </span>
              {isOnline && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center">
                  <Wifi className="h-4 w-4 mr-1" />
                  Online
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {data.title}
            </h1>
          </div>

          {/* Details */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 mt-1 text-primary-600" />
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {format(new Date(data.date), 'EEEE, MMMM dd, yyyy')} at {data.time}
                  </p>
                  <p className="text-sm text-gray-500">Duration: {data.duration} minutes</p>
                </div>
              </div>

              {isOnline ? (
                <div className="flex items-start">
                  <Wifi className="h-5 w-5 mr-3 mt-1 text-primary-600" />
                  <div>
                    <p className="font-semibold">Online Event</p>
                    {data.onlineLink && (
                      <a
                        href={data.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {data.onlineLink}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-primary-600" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">{data.city}</p>
                    {data.locationName && (
                      <p className="text-gray-600 dark:text-gray-400">{data.locationName}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <DollarSign className="h-5 w-5 mr-3 mt-1 text-primary-600" />
                <div>
                  <p className="font-semibold">Price</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {data.price === 0 ? 'Free' : `$${data.price}`}
                  </p>
                </div>
              </div>

              {data.attendeeCount !== undefined && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-3 mt-1 text-primary-600" />
                  <div>
                    <p className="font-semibold">Attendees</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {data.attendeeCount} {data.maxAttendees ? `of ${data.maxAttendees}` : ''} registered
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {data.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {data.price === 0 ? 'Free' : `$${data.price}`}
              </div>
              {data.maxAttendees && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.maxAttendees - (data.attendeeCount || 0)} spots left
                </p>
              )}
            </div>

            {user ? (
              <div className="space-y-3">
                {!isBooked && user.role !== 'admin' ? (
                  <button
                    onClick={() => bookingMutation.mutate()}
                    disabled={bookingMutation.isPending || data.isFull || data.status !== 'active'}
                    className="btn btn-primary w-full"
                  >
                    {bookingMutation.isPending ? 'Booking...' : 'Book Event'}
                  </button>
                ) : user.role === 'admin' ? (
                  <div className="text-center text-gray-500 font-semibold italic">
                    Admins cannot book events
                  </div>
                ) : (
                  <div className="text-center text-green-600 font-semibold">
                    ✓ You're registered!
                  </div>
                )}

                <button
                  onClick={() => bookmarkMutation.mutate()}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-5 w-5 mr-2" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5 mr-2" />
                      Bookmark
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: data.title,
                        text: data.description,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard');
                    }
                  }}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold mb-2">Add to Calendar</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => addToGoogleCalendar(data)}
                      className="btn btn-secondary w-full text-sm"
                    >
                      Google Calendar
                    </button>
                    <button
                      onClick={() => downloadICS(data)}
                      className="btn btn-secondary w-full text-sm"
                    >
                      Download .ics
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  Please login to book this event
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary w-full"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

