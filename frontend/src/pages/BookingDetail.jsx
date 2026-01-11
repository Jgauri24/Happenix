import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Calendar, MapPin, Clock, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';
import { addToGoogleCalendar } from '../utils/calendar';

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
      queryClient.invalidateQueries(['booking', id]);
    }
  });

  const attendanceMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/bookings/${id}/attend`);
    },
    onSuccess: () => {
      toast.success('Attendance marked! Streak updated.');
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['auth', 'me']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  });

  const downloadTicket = () => {
    if (!data) return;

    // Get the Canvas element directly
    const sourceCanvas = document.getElementById('qr-code-canvas');
    if (!sourceCanvas) {
      toast.error('QR Code canvas not found');
      return;
    }

    // Get Data URL directly from the rendered canvas
    const image64 = sourceCanvas.toDataURL('image/png');

    // Create a new image for the QR
    const qrImg = new Image();
    qrImg.src = image64;

    // Wait for image to load
    qrImg.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Constants
      const width = 600;
      const padding = 40;
      const lineHeight = 30;
      const qrSize = 250; // Larger QR

      const height = padding + 60 + (6 * lineHeight) + 40 + qrSize + 40 + padding;

      canvas.width = width;
      canvas.height = height;

      // Draw Black Background
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, width, height);

      // Set Text Styles
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      let y = padding + 24;

      // Draw Header
      ctx.textAlign = 'left';
      ctx.fillText('EVENT TICKET', padding, y);
      y += 10;
      ctx.fillRect(padding, y, width - (padding * 2), 2); // Underline
      y += 40;

      // Draw Details
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`Event: ${event.title}`, padding, y);
      y += lineHeight;

      ctx.font = '16px sans-serif';
      ctx.fillText(`Date: ${format(new Date(event.date), 'MMM dd, yyyy')}`, padding, y);
      y += lineHeight;

      ctx.fillText(`Time: ${event.time}`, padding, y);
      y += lineHeight;

      ctx.fillText(`Location: ${event.type === 'online' ? 'Online' : event.city}`, padding, y);
      y += lineHeight;

      ctx.fillText(`Booking ID: ${data._id}`, padding, y);
      y += 50;

      // Draw QR Code
      // Draw a white background box for QR code to ensure readability
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((width - qrSize) / 2 - 10, y - 10, qrSize + 20, qrSize + 20);
      ctx.drawImage(qrImg, (width - qrSize) / 2, y, qrSize, qrSize);
      y += qrSize + 40;

      // Footer
      ctx.font = 'italic 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Present this QR code at the event entrance.', width / 2, y);

      // Trigger download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `ticket-${data._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Ticket downloaded');
    };

    qrImg.onerror = () => {
      toast.error('Failed to generate ticket image');
    };
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
          {data.status === 'cancelled' && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
              <p className="text-red-600 dark:text-red-400 font-bold text-lg flex items-center justify-center gap-2">
                <X className="h-6 w-6" /> This booking has been cancelled and is no longer valid.
              </p>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-lg">
            {data.qrCodeData && (
              <QRCodeCanvas
                id="qr-code-canvas"
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
          {isUpcoming ? (
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
                disabled={cancelMutation.isPending || data.status === 'cancelled'}
                className="btn btn-danger flex items-center justify-center"
              >
                <X className="h-5 w-5 mr-2" />
                {data.status === 'cancelled' ? 'Booking Cancelled' : 'Cancel Booking'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={downloadTicket}
                className="btn btn-secondary flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Ticket
              </button>

              {data.status === 'attended' ? (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-6 py-3 rounded-lg font-bold flex items-center">
                  <div className="mr-2">⚡</div> Attendance Marked
                </div>
              ) : (
                <button
                  onClick={() => attendanceMutation.mutate()}
                  disabled={attendanceMutation.isPending || data.status === 'cancelled'}
                  className="btn btn-primary flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white"
                >
                  <div className="mr-2 font-bold text-lg">⚡</div>
                  Mark Attendance & Increase Streak
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
