import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook to manage user location with real-time tracking support
 */
export const useLocation = () => {
  const [location, setLocation] = useState({ city: '', lat: null, lng: null });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [prompted, setPrompted] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const watchId = useRef(null);

  // Try to get location on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setLocation(prev => ({ ...prev, city: savedCity }));
      setManualCity(savedCity);
      setPrompted(true);
    } else {
      requestLocation();
    }

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const requestLocation = (watch = true) => {
    setLoadingLocation(true);
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
          city: ''
        });
        setLoadingLocation(false);
        setPrompted(true);
      };

      const error = (err) => {
        console.error("Error getting location:", err);
        setLoadingLocation(false);
        setPrompted(true);
        if (err.code === 1) {
            toast.error("Location access denied. Please enter your city manually.");
        }
      };

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      if (watch) {
        watchId.current = navigator.geolocation.watchPosition(success, error, options);
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
    if (city.trim()) {
      // Clear watch if user chooses manual city
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      
      setLocation({ city, lat: null, lng: null });
      setManualCity(city);
      localStorage.setItem('userCity', city);
      toast.success(`Location set to ${city}`);
    }
  };

  return {
    location,
    loadingLocation,
    prompted,
    manualCity,
    setManualCity,
    requestLocation,
    setManualLocation
  };
};
