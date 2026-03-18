import { createClient } from '@supabase/supabase-js';
import { setDefaultResultOrder } from 'node:dns';
import * as http from 'http';

// Force DNS to prefer IPv4 (fixes ConnectTimeoutError in NAT64 environments)
setDefaultResultOrder('ipv4first');

// Load .env variables natively (Node v20.12.0+)
try {
  // @ts-ignore - process.loadEnvFile is available in Node 24
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  }
} catch (e) {
  console.warn('.env file not found or loadEnvFile not supported, using existing environment variables');
}

// Standalone simulation engine


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl.replace(/(https:\/\/).*(.supabase.co)/, '$1***$2'));

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to calculate distance between two coordinates in meters
 */
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371e3; // Earth's radius in meters
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Interpolate between two points
 */
function interpolate(p1: [number, number], p2: [number, number], fraction: number): [number, number] {
  return [
    p1[0] + (p2[0] - p1[0]) * fraction,
    p1[1] + (p2[1] - p1[1]) * fraction
  ];
}

/**
 * Generates a simple straight-line route with intermediate points for fallback
 */
function generateFallbackRoute(start: [number, number], end: [number, number]): any {
  const points: [number, number][] = [];
  const steps = 10;
  
  for (let i = 0; i <= steps; i++) {
    const lat = start[0] + (end[0] - start[0]) * (i / steps);
    const lng = start[1] + (end[1] - start[1]) * (i / steps);
    points.push([lat, lng]);
  }
  
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
    duration: Math.round(distance / 13)
  };
}

/**
 * Fetch route from OSRM (Backend version) with fallbacks
 */
async function fetchRoute(origin: [number, number], dest: [number, number]) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
    
    console.log(`[ROUTE] Fetching OSRM route for ${origin} to ${dest}...`);
    const response = await withRetry(() => fetch(url), 2, 500);
    
    if (response.status === 429) {
      console.warn('[ROUTE] OSRM Rate limited. Using fallback.');
      return generateFallbackRoute(origin, dest);
    }

    if (!response.ok) {
      console.warn(`[ROUTE] OSRM error ${response.status}. Using fallback.`);
      return generateFallbackRoute(origin, dest);
    }

    // Safely parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('[ROUTE] OSRM returned non-JSON. Using fallback.');
      return generateFallbackRoute(origin, dest);
    }

    const data = await response.json() as any;
    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]),
        distance: route.distance, // meters
        duration: route.duration // seconds
      };
    }
  } catch (e) {
    console.error('[ROUTE] Failed to fetch route from OSRM, using fallback:', e instanceof Error ? e.message : e);
    return generateFallbackRoute(origin, dest);
  }
  return generateFallbackRoute(origin, dest); // Final fallback if data structure was unexpected
}

interface Shipment {
  id: string;
  tracking_id: string;
  route_coordinates: [number, number][] | null;
  current_route_index: number | null;
  status: string;
}

const activeSimulations = new Map<string, NodeJS.Timeout>();

const SIMULATION_SPEED_MULTIPLIER = 5; // 5x real speed - visible, smooth movement on the map

/**
 * Moves the truck to the exact position it should be based on time
 */
async function stepSimulation(shipmentId: string, cachedShipment?: any) {
  try {
    let shipment = cachedShipment;

    if (!shipment) {
      const { data, error: fetchError } = await withRetry(async () => {
        return await supabase
          .from('shipments')
          .select('*')
          .eq('id', shipmentId)
          .single();
      });

      if (fetchError || !data) {
        console.warn(`[${shipmentId}] Failed to fetch shipment (skipping tick):`, fetchError?.message || 'Shipment not found');
        return;
      }
      shipment = data;
    }

    let route = shipment.route_coordinates as [number, number][] | null;
    
    // Parse logistics metadata
    let metadata: any = {};
    try {
      if (shipment.cargo_description?.startsWith('LOGISTICS_META:')) {
        metadata = JSON.parse(shipment.cargo_description.replace('LOGISTICS_META:', ''));
      }
    } catch (e) {
      console.warn(`[${shipment.tracking_id}] Failed to parse metadata`);
    }

    // Recover route if missing
    if (!route || route.length === 0) {
      console.log(`[${shipment.tracking_id}] Missing route coordinates. Recovery in progress...`);
      const routeData = await fetchRoute([shipment.origin_lat, shipment.origin_lng], [shipment.dest_lat, shipment.dest_lng]);
      if (routeData) {
        route = routeData.coordinates;
        metadata.total_distance = routeData.distance;
        metadata.total_duration = routeData.duration;
        metadata.actual_start_time = new Date().toISOString();
        
        await withRetry(async () => {
          return await supabase.from('shipments').update({ 
            route_coordinates: route,
            cargo_description: 'LOGISTICS_META:' + JSON.stringify(metadata)
          }).eq('id', shipmentId);
        });
      } else {
        stopSimulation(shipmentId);
        return;
      }
    }

    // After this point, route is guaranteed to be present
    const activeRoute = route!;

    // Ensure metadata is initialized for time-based tracking
    let metadataChanged = false;
    if (!metadata.actual_start_time) {
      metadata.actual_start_time = new Date().toISOString();
      metadataChanged = true;
    }

    if (route && route.length > 0 && (!metadata.total_distance || !metadata.total_duration)) {
      console.log(`[${shipment.tracking_id}] Initializing missing route statistics...`);
      let totalDist = 0;
      for (let i = 0; i < route.length - 1; i++) {
        totalDist += calculateDistance(route[i], route[i+1]);
      }
      metadata.total_distance = Math.max(totalDist, 1);
      // Rough duration estimate if not known: 40km/h average in India
      metadata.total_duration = Math.max(Math.round(totalDist / 11), 60);
      metadataChanged = true;
    }

    if (metadataChanged) {
      await withRetry(async () => {
        return await supabase.from('shipments').update({ 
          cargo_description: 'LOGISTICS_META:' + JSON.stringify(metadata)
        }).eq('id', shipmentId);
      });
    }

    // --- Time-Based Movement Logic ---

    const startTime = new Date(metadata.actual_start_time || new Date()).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = (now - startTime) / 1000;
    const totalDuration = metadata.total_duration || 3600;
    const totalDistance = metadata.total_distance || 1000;

    // Calculate how much distance should have been covered by now
    // Expected distance = Speed * Time * Multiplier
    const speed = totalDistance / totalDuration; // meters per second
    const targetDistance = elapsedSeconds * speed * SIMULATION_SPEED_MULTIPLIER;

    if (targetDistance >= totalDistance) {
      console.log(`[${shipment.tracking_id}] Destination reached! (Final point)`);
      const lastPoint = activeRoute[activeRoute.length - 1];
      
      // Ensure metadata reflects 100% progress on completion
      metadata.progress_percentage = 100;
      metadata.display_eta = new Date().toISOString();
      
      await withRetry(async () => {
        const { error: updateError } = await supabase.from('shipments').update({ 
          status: 'DELIVERED',
          current_lat: lastPoint[0],
          current_lng: lastPoint[1],
          cargo_description: 'LOGISTICS_META:' + JSON.stringify(metadata)
        }).eq('id', shipmentId);

        if (updateError) throw updateError;

        // --- Inventory Update Logic (Arrival) ---
        if (shipment.destination_warehouse_id && shipment.product_name) {
          console.log(`[${shipment.tracking_id}] Increasing inventory at destination warehouse...`);
          
          // Use a RPC or a simple increment if possible, here we fetch and update for simplicity in single-shipment demo
          const { data: invData } = await supabase
            .from('inventory')
            .select('id, quantity')
            .eq('warehouse_id', shipment.destination_warehouse_id)
            .eq('product_name', shipment.product_name)
            .single();

          if (invData) {
            await supabase
              .from('inventory')
              .update({ quantity: invData.quantity + (shipment.product_quantity || 0) })
              .eq('id', invData.id);
          } else {
            // Create new inventory record if it doesn't exist
            await supabase
              .from('inventory')
              .insert({
                warehouse_id: shipment.destination_warehouse_id,
                product_name: shipment.product_name,
                quantity: shipment.product_quantity || 0
              });
          }
        }

        // --- Driver & Vehicle Lifestyle Update ---
        if (shipment.driver_id) {
          console.log(`[${shipment.tracking_id}] Setting driver ${shipment.driver_id} to OFFLINE...`);
          const { error: driverError } = await withRetry<{ error: any }>(async () => {
            const res = await supabase.from('drivers').update({ status: 'OFFLINE' }).eq('id', shipment.driver_id);
            return res;
          });
          if (driverError) console.error(`[${shipment.tracking_id}] Failed to update driver status:`, driverError.message);
        }

        if (shipment.vehicle_id) {
          console.log(`[${shipment.tracking_id}] Setting vehicle ${shipment.vehicle_id} to MAINTENANCE...`);
          const { error: vehicleError } = await withRetry<{ error: any }>(async () => {
             const res = await supabase.from('vehicles').update({ status: 'MAINTENANCE' }).eq('id', shipment.vehicle_id);
             return res;
          });
          if (vehicleError) console.error(`[${shipment.tracking_id}] Failed to update vehicle status:`, vehicleError.message);
        }
      });
      stopSimulation(shipmentId);
      return;
    }

    // Find the segment containing the target distance
    let currentDist = 0;
    let targetLat = activeRoute[0][0];
    let targetLng = activeRoute[0][1];
    let currentInx = 0;

    for (let i = 0; i < activeRoute.length - 1; i++) {
      const d = calculateDistance(activeRoute[i], activeRoute[i+1]);
      if (currentDist + d >= targetDistance) {
        // Target is in this segment! Interpolate.
        const fraction = (targetDistance - currentDist) / d;
        const pos = interpolate(activeRoute[i], activeRoute[i+1], fraction);
        targetLat = pos[0];
        targetLng = pos[1];
        currentInx = i;
        break;
      }
      currentDist += d;
    }

    // Update Insights
    const progressPerc = Math.min(99, Math.round((targetDistance / totalDistance) * 100));
    metadata.progress_percentage = progressPerc;

    // ETA should remain real-world relative
    // ETA = StartTime + (TotalDistance / Speed)
    // Note: We don't divide by SIMULATION_SPEED_MULTIPLIER for the ETA because ETA is a real clock time
    // Unless the user wants the "simulated" ETA? Usually ETA is real.
    const remainingDistance = totalDistance - targetDistance;
    const remainingTimeSeconds = remainingDistance / (speed * SIMULATION_SPEED_MULTIPLIER);
    const etaDate = new Date(now + (remainingTimeSeconds * 1000));
    metadata.display_eta = etaDate.toISOString();

    console.log(`[${shipment.tracking_id}] Synchronized Tick | Progress: ${progressPerc}% | ${Math.round(remainingDistance/1000)}km to goal | Index: ${currentInx}`);

    // Update shipment with exact position and metadata
    await withRetry(async () => {
      const { error: updateError } = await supabase
        .from('shipments')
        .update({
          current_lat: targetLat,
          current_lng: targetLng,
          current_route_index: currentInx,
          cargo_description: 'LOGISTICS_META:' + JSON.stringify(metadata),
          eta: metadata.display_eta,
          status: 'IN_TRANSIT'
        })
        .eq('id', shipmentId);
      
      if (updateError) throw updateError;

      // Push to logs for map trail
      await supabase
        .from('tracking_logs')
        .insert({
          shipment_id: shipmentId,
          latitude: targetLat,
          longitude: targetLng,
        });
    });

  } catch (err) {
    console.error(`[${shipmentId}] Simulation sync error:`, err);
  }
}

function startSimulation(shipmentId: string) {
  if (activeSimulations.has(shipmentId)) return;

  console.log(`Starting simulation for shipment: ${shipmentId} (at ${SIMULATION_SPEED_MULTIPLIER}x speed)`);
  // Standard interval is 3s, divided by multiplier for demo speed
  const intervalTime = 5000; // Update every 5 seconds for smooth real-time movement
  const interval = setInterval(() => stepSimulation(shipmentId), intervalTime);
  activeSimulations.set(shipmentId, interval);
}

function stopSimulation(shipmentId: string) {
  const interval = activeSimulations.get(shipmentId);
  if (interval) {
    clearInterval(interval);
    activeSimulations.delete(shipmentId);
    console.log(`Stopped simulation for shipment: ${shipmentId}`);
  }
}

/**
 * Helper to retry async operations with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.warn(`Transient error, retrying in ${delay}ms... (${retries} retries left):`, error instanceof Error ? error.message : error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Initial startup: Find all shipments currently in transit or delayed and resume simulation
 */
async function resumeActiveShipments() {
  const { data: shipments, error } = await withRetry(async () => {
    const result = await supabase
      .from('shipments')
      .select('id')
      .in('status', ['IN_TRANSIT', 'DELAYED']);
    return result;
  });

  if (error) {
    console.error('Error fetching active shipments:', error);
    return;
  }

  if (!shipments) {
    console.log('No active/delayed shipments found to resume.');
    return;
  }

  console.log(`Resuming ${shipments.length} active/delayed simulations...`);
  shipments.forEach(async (s) => {
    // Optimization: Pre-fetch and pass to simulation tick for immediate first update
    const { data: shipment, error: fetchError } = await supabase.from('shipments').select('*').eq('id', s.id).single();
    if (shipment && !fetchError) {
      startSimulation(s.id);
      // Run first tick immediately with the fetched data
      await stepSimulation(s.id, shipment);
    } else {
      console.error(`[${s.id}] Failed to pre-fetch for resumption:`, fetchError?.message);
    }
  });
}

/**
 * Watch for new shipments moving to IN_TRANSIT
 */
function watchShipments() {
  console.log('Watching for status changes...');
  
  supabase
    .channel('shipment-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'shipments' },
      (payload) => {
        const { id, status } = payload.new;
        const oldStatus = payload.old?.status;

        if (status === 'IN_TRANSIT' && oldStatus !== 'IN_TRANSIT') {
          // Pass the new shipment data to start simulation immediately
          startSimulation(id);
          stepSimulation(id, payload.new);
        } else if (status === 'DELAYED' && oldStatus === 'PENDING') {
          startSimulation(id);
          stepSimulation(id, payload.new);
        } else if (status === 'DELIVERED' || status === 'PENDING') {
          stopSimulation(id);
        }
      }
    )
    .subscribe();
}

// Start the engine
resumeActiveShipments().catch(e => console.error('Failed to resume:', e));
watchShipments();

console.log('SmartShip Simulation Engine is running...');

// --- Dummy Web Server for Render Free Tier ---
// Render requires Web Services to bind to a port, otherwise it kills the process.
// Background workers are paid, but Web Services have a free tier.
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SmartShip Simulation Engine is active and healthy.\n');
}).listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});
