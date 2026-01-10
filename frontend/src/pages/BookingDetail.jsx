import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Calendar, MapPin, Clock, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { addToGoogleCalendar, downloadICS } from '../utils/calendar';
// PDF generation would require jsPDF - commented out for now
// import jsPDF from 'jspdf';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data.booking;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries(['bookings']);
      navigate('/bookings');
    }
  });

  const downloadTicket = () => {
    if (!data) return;
    
    // Simple text-based ticket download
    const event = data.eventId;
    const ticketContent = `
EVENT TICKET
============

Event: ${event.title}
Date: ${format(new Date(event.date), 'MMM dd, yyyy')}
Time: ${event.time}
Location: ${event.type === 'online' ? 'Online' : event.city}
Booking ID: ${data._id}

Present this QR code at the event entrance.
    `.trim();

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${data._id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Ticket downloaded');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Booking not found</p>
        </div>
      </div>
    );
  }

  const event = data.eventId;
  const isOnline = event.type === 'online';
  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your Event Ticket</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-lg">
            {data.qrCodeData && (
              <QRCodeSVG
                value={JSON.stringify(data.qrCodeData)}
                size={256}
                level="H"
              />
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-3 text-primary-600" />
            <div>
              <p className="font-semibold">Date & Time</p>
              <p className="text-gray-600 dark:text-gray-400">
                {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')} at {event.time}
              </p>
            </div>
          </div>

          {isOnline ? (
            <div className="flex items-center">
              <span className="mr-3">🌐</span>
              <div>
                <p className="font-semibold">Online Event</p>
                {event.onlineLink && (
                  <a
                    href={event.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {event.onlineLink}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-primary-600" />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {event.locationName || event.city}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{event.city}</p>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-3 text-primary-600" />
            <div>
              <p className="font-semibold">Duration</p>
              <p className="text-gray-600 dark:text-gray-400">{event.duration} minutes</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Booking ID: {data._id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Booked on: {format(new Date(data.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isUpcoming && (
            <>
              <button
                onClick={downloadTicket}
                className="btn btn-primary flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </button>
              
              <button
                onClick={() => addToGoogleCalendar(event)}
                className="btn btn-secondary"
              >
                Add to Calendar
              </button>

              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="btn btn-danger flex items-center justify-center"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel Booking
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

