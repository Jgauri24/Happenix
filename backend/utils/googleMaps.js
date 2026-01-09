import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to get lat/lng coordinates
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    }
    throw new Error('Geocoding failed');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
};


//  * Calculate travel time using Google Distance Matrix API
//  * Falls back to Haversine if API fails

export const calculateTravelTime = async (origin, destination, mode = 'driving') => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        mode: mode, 
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
      const element = response.data.rows[0].elements[0];
      return {
        distance: element.distance.value, // in meters
        duration: element.duration.value, // in seconds
        distanceText: element.distance.text,
        durationText: element.duration.text
      };
    }
    throw new Error('Distance Matrix API failed');
  } catch (error) {
    console.error('Distance Matrix error:', error.message);
    // Fallback to Haversine formula
    return calculateHaversineDistance(origin, destination, mode);
  }
};

/**
 * Haversine formula to calculate distance between two points
 * Fallback when Google API is unavailable
 */
export const calculateHaversineDistance = (origin, destination, mode = 'driving') => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = origin.lat * Math.PI / 180;
  const φ2 = destination.lat * Math.PI / 180;
  const Δφ = (destination.lat - origin.lat) * Math.PI / 180;
  const Δλ = (destination.lng - origin.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  
  // Estimate duration (assuming average speed)
  const avgSpeed = mode === 'walking' ? 5 : mode === 'transit' ? 30 : 50; // km/h
  const duration = (distance / 1000) / avgSpeed * 3600; // in seconds

  return {
    distance,
    duration,
    distanceText: `${(distance / 1000).toFixed(1)} km`,
    durationText: `${Math.round(duration / 60)} mins`
  };
};

/**
 * Autocomplete places using Google Places API
 */
export const autocompletePlaces = async (input) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input,
        key: process.env.GOOGLE_PLACES_API_KEY || GOOGLE_MAPS_API_KEY,
        types: 'geocode'
      }
    });

    if (response.data.status === 'OK') {
      return response.data.predictions.map(prediction => ({
        description: prediction.description,
        placeId: prediction.place_id
      }));
    }
    return [];
  } catch (error) {
    console.error('Places autocomplete error:', error.message);
    return [];
  }
};
