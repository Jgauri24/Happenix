# Happenix

Happenix is a high-fidelity event discovery and management platform designed to help users find and book local happenings while providing organizers with a robust suite for tracking attendance and validating tickets.

The platform distinguishes itself through real-time location metrics, automated QR ticketing, and community-driven engagement features like attendance streaks.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Bcrypt.js
- **State Management**: TanStack Query (React Query)
- **Email/Notifications**: Nodemailer
- **Maps/Location**: Leaflet, Distance Matrix API

## Core Features

### 1. Intelligent Discovery & Mapping
- **Neary Events Engine**: Dynamically calculates travel distance and time (driving/walking) from the user's current location to event venues.
- **Interactive Leaflet Map**: Visualizes offline events with custom markers and auto-focusing behavior based on search results.
- **Deep Filtering**: Comprehensive search system for city-wide, category-specific, and price-range event discovery.

### 2. Digital Ticketing System
- **QR Code Generation**: Every confirmed booking produces a unique QR code stored in the backend and rendered via the frontend for entrance validation.
- **Calendar Integration**: Seamlessly add events to Google Calendar or download .ics files for Apple/Outlook calendars.
- **Status Tracking**: Detailed booking lifecycle management (Confirmed, Attended, Cancelled).

### 3. Gamification & User Profiles
- **Attendance Streaks**: A specialized logic that monitors user participation patterns and maintains a "streak" to reward active community members.
- **Experience Points (XP)**: Points awarded upon marking attendance, visualised on the user's profile.
- **History Tracking**: Dedicated sections for "Recently Viewed" and "Saved Events" (bookmarks) with optimistic UI updates.

### 4. Administrative Dashboard
- **Analytics**: Real-time stats for total users, active events, and booking counts.
- **Validation Tool**: Integrated admin panel to scan user tickets and instantly mark attendance.
- **Content Management**: Full CRUD operations for events with support for online/offline toggles and location naming.

## Environment Variables

To run this project locally, you will need to create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_for_notifications
EMAIL_PASS=your_email_app_password
GOOGLE_MAPS_API_KEY=your_key_for_distance_matrix
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local installation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jgauri24/Happenix.git
   cd Happenix
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # (Optional) Seed the database with 20+ Indian events
   node scripts/seedEvents.js
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Development Focus
This project was developed with a heavy emphasis on:
- **Clean MVC Architecture**: Separated concerns for models, controllers, and routes in the backend.
- **Optimistic UI Updates**: Using TanStack Query to ensure the application feels fast even during network-heavy operations (like bookmarking).
- **Responsive Aesthetics**: A premium design system using Tailwind CSS that adapts across all device types.
