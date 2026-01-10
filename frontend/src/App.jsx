import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import NearbyEvents from "./pages/NearbyEvents.jsx";
import CreateEvent from "./pages/admin/createEvent.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminBookings from "./pages/admin/Bookings.jsx";
import EditEvent from "./pages/admin/EditEvent.jsx";
import Bookings from "./pages/Bookings.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import AdminEvents from "./pages/admin/Events.jsx";

import Profile from "./pages/Profile";
function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuthStore();
  return user?.role === "admin" ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="nearby" element={<NearbyEvents />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="admin/events/create"
          element={
            <AdminRoute>
              <CreateEvent />
            </AdminRoute>
          }
        />

        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />
        <Route
          path="admin/events/:id/edit"
          element={
            <AdminRoute>
              <EditEvent />
            </AdminRoute>
          }
        />
        <Route
          path="bookings/:id"
          element={
            <PrivateRoute>
              <BookingDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
