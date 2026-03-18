/**
 * Logistics API Utility
 * Handles geocoding (Nominatim) and routing (OSRM)
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng]
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Geocodes a location string using OpenStreetMap Nominatim API
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  if (!query) return null;
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.5',
        'User-Agent': 'SmartShip-India-Hackathon-Project'
      }
    });
    
    if (!response.ok) throw new Error('Geocoding service unavailable');
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Simple in-memory cache for routes
const routeCache = new Map<string, RouteResult>();

/**
 * Generates a simple straight-line route with intermediate points for fallback
 */
function generateFallbackRoute(start: [number, number], end: [number, number]): RouteResult {
  const points: [number, number][] = [];
  const steps = 10;
  
  for (let i = 0; i <= steps; i++) {
    const lat = start[0] + (end[0] - start[0]) * (i / steps);
    const lng = start[1] + (end[1] - start[1]) * (i / steps);
    points.push([lat, lng]);
  }
  
  // Calculate distance using Haversine-like approximation
  const R = 6371e3;
  const φ1 = start[0] * Math.PI / 180;
  const φ2 = end[0] * Math.PI / 180;
  const Δφ = (end[0] - start[0]) * Math.PI / 180;
  const Δλ = (end[1] - start[1]) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return {
    coordinates: points,
    distance,
    duration: Math.round(distance / 13) // ~45-50 km/h average
  };
}

/**
 * Fetches a driving route between two points using OSRM Routing API with fallbacks
 */
export async function getRoute(start: [number, number], end: [number, number]): Promise<RouteResult | null> {
  const cacheKey = `${start.join(',')}|${end.join(',')}`;
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey)!;

  try {
    // OSRM expects [lng, lat]
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    
    console.log('Fetching route from OSRM...');
    const response = await fetch(url);
    
    // Handle rate limiting (429) or other non-OK responses
    if (response.status === 429) {
      console.warn('OSRM Rate limited. Using fallback route.');
      return generateFallbackRoute(start, end);
    }

    if (!response.ok) {
      const text = await response.text();
      console.warn(`OSRM Error ${response.status}: ${text.substring(0, 100)}...`);
      return generateFallbackRoute(start, end);
    }
    
    // Check Content-Type to avoid "Unexpected token <" (HTML instead of JSON)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('OSRM returned non-JSON response. Using fallback.');
      return generateFallbackRoute(start, end);
    }

    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const result: RouteResult = {
        coordinates: route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]),
        distance: route.distance,
        duration: route.duration
      };
      
      routeCache.set(cacheKey, result);
      return result;
    }
    
    console.warn('OSRM returned no routes. Using fallback.');
    return generateFallbackRoute(start, end);

  } catch (error) {
    console.warn('Routing system failure, using straight-line fallback:', error);
    return generateFallbackRoute(start, end);
  }
}
