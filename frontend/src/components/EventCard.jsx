import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, Wifi, Users } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { getImageUrl } from '../utils/config';

export default function EventCard({ event }) {
  const isOnline = event.type === 'online';
  const isFull = event.isFull;
  const isFree = event.price === 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="card hover:shadow-xl transition-all duration-300 group"
    >
      {/* Poster */}
      {event.poster ? (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(event.poster)}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isFull && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Full
            </div>
          )}
          {isFree && (
            <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Free
            </div>
          )}
          {isOnline && (
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <Wifi className="h-4 w-4 mr-1" />
              Online
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 mb-4 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Calendar className="h-16 w-16 text-white opacity-50" />
        </div>
      )}

      {/* Content */}
      <div>
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs font-medium">
            {event.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}</span>
          </div>

          {isOnline ? (
            <div className="flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              <span>Online Event</span>
            </div>
          ) : (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.city}</span>
              {event.locationName && (
                <span className="ml-1">• {event.locationName}</span>
              )}
            </div>
          )}

          {event.travelTimeText && (
            <div className="flex items-center text-primary-600 font-medium">
              <Clock className="h-4 w-4 mr-2" />
              <span>{event.travelTimeText} away</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-semibold">
                {isFree ? 'Free' : `$${event.price}`}
              </span>
            </div>
            {event.attendeeCount !== undefined && (
              <div className="flex items-center text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{event.attendeeCount} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}



