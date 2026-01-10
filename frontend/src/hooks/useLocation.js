import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook to manage user location with real-time tracking support
 */
export const useLocation = () => {
  const [location, setLocation] = useState({ city: "", lat: null, lng: null });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [prompted, setPrompted] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const watchId = useRef(null);

  // Try to get location on mount
  useEffect(() => {
    // Always try to request location permission first, but respect saved preferences
    if (
      navigator.geolocation &&
      !localStorage.getItem("locationPermissionDenied")
    ) {
      requestLocation(false); // Don't watch initially, just get once
    } else {
      const savedCity = localStorage.getItem("userCity");
      if (savedCity) {
        setLocation((prev) => ({ ...prev, city: savedCity }));
        setManualCity(savedCity);
        setPrompted(true);
      } else {
        setPrompted(true); // Still mark as prompted even if no location
      }
    }

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const requestLocation = (watch = true) => {
    setLoadingLocation(true);
    // Clear the denied flag when user explicitly requests location
    localStorage.removeItem("locationPermissionDenied");

    if (navigator.geolocation) {
      // Clear existing watch if any
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }

      const success = (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          city: "",
        });
        setLoadingLocation(false);
        setPrompted(true);
        localStorage.removeItem("locationPermissionDenied");
        toast.success("Location access granted!");
      };

      const error = (err) => {
        // Only log unknown errors
        if (err.code !== 1 && err.code !== 3) {
           console.warn("Geolocation warning:", err.message);
        }
        
        setLoadingLocation(false);
        setPrompted(true);
        if (err.code === 1) {
          localStorage.setItem("locationPermissionDenied", "true");
          toast.error(
            "Location access denied. Please enter your city manually."
          );
        } else if (err.code === 2) {
          toast.error("Location unavailable. Please enter your city manually.");
        } else if (err.code === 3) {
          // Timeout - just suppress or show mild toast
          toast.error(
            "Location request timed out. Please enter your city manually."
          );
        }
      };

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      if (watch) {
        watchId.current = navigator.geolocation.watchPosition(
          success,
          error,
          options
        );
      } else {
        navigator.geolocation.getCurrentPosition(success, error, options);
      }
    } else {
      toast.error("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
      setPrompted(true);
    }
  };

  const setManualLocation = (city) => {
    // Clear watch if user chooses manual city or clears it
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (city && city.trim()) {
      setLocation({ city, lat: null, lng: null });
      setManualCity(city);
      localStorage.setItem("userCity", city);
      toast.success(`Location set to ${city}`);
    } else {
      // Clear location
      setLocation({ city: "", lat: null, lng: null });
      setManualCity("");
      localStorage.removeItem("userCity");
      setPrompted(false); // Allow prompt again after clearing
    }
  };

  return {
    location,
    loadingLocation,
    prompted,
    manualCity,
    setManualCity,
    requestLocation,
    setManualLocation,
  };
};
