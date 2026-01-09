import { format } from 'date-fns';


// Format date for ICS/Google Calendar (ISO format without separators)

const formatCalendarDate = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Get event location string
 */
const getEventLocation = (event) => {
  if (event.type === 'online') {
    return event.onlineLink || 'Online Event';
  }
  return `${event.locationName || ''}, ${event.city}`.trim();
};

/**
 * Get event description with location info
 */
const getEventDescription = (event) => {
  const location = getEventLocation(event);
  const locationInfo = event.type === 'online' 
    ? `Join Link: ${event.onlineLink}` 
    : `Location: ${location}`;
  return `${event.description}\n\n${locationInfo}`;
};

/**
 * Calculate event start and end dates
 */
const getEventDates = (event) => {
  const startDate = new Date(event.date);
  const [hours, minutes] = event.time.split(':');
  startDate.setHours(parseInt(hours), parseInt(minutes));
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (event.duration || 60));
  
  return { startDate, endDate };
};

/**
 * Add event to Google Calendar
 */
export const addToGoogleCalendar = (event) => {
  const { startDate, endDate } = getEventDates(event);
  const location = getEventLocation(event);
  const description = getEventDescription(event);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  window.open(url, '_blank');
};

/**
 * Download ICS file for calendar
 */
export const downloadICS = (event) => {
  const { startDate, endDate } = getEventDates(event);
  const location = getEventLocation(event);
  const description = getEventDescription(event).replace(/\n/g, '\\n');

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Event Discovery//EN
BEGIN:VEVENT
UID:${event._id}@eventdiscovery.com
DTSTAMP:${formatCalendarDate(new Date())}
DTSTART:${formatCalendarDate(startDate)}
DTEND:${formatCalendarDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};




