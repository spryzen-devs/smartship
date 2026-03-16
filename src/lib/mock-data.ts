// Mock data for the logistics platform MVP

export type ShipmentStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

export interface Shipment {
  id: string;
  tracking_id: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_name: string;
  dest_lat: number;
  dest_lng: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: ShipmentStatus;
  driver_name: string | null;
  vehicle_number: string | null;
  eta: string;
  created_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  status: DriverStatus;
  assigned_vehicle: string | null;
  total_deliveries: number;
  rating: number;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  type: string;
  capacity_kg: number;
  status: VehicleStatus;
  current_driver: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  capacity: number;
  used: number;
  items: { name: string; quantity: number }[];
}

export interface TrackingPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
}

export const mockShipments: Shipment[] = [
  {
    id: '1', tracking_id: 'SHP-A1B2C3D4', origin_name: 'Mumbai Warehouse', origin_lat: 19.076, origin_lng: 72.8777,
    dest_name: 'Pune Distribution Center', dest_lat: 18.5204, dest_lng: 73.8567, priority: 'HIGH', status: 'IN_TRANSIT',
    driver_name: 'Rajesh Kumar', vehicle_number: 'MH-01-AX-1234', eta: '2026-03-16T18:00:00Z', created_at: '2026-03-16T06:00:00Z',
  },
  {
    id: '2', tracking_id: 'SHP-E5F6G7H8', origin_name: 'Delhi Hub', origin_lat: 28.7041, origin_lng: 77.1025,
    dest_name: 'Jaipur Warehouse', dest_lat: 26.9124, dest_lng: 75.7873, priority: 'NORMAL', status: 'ASSIGNED',
    driver_name: 'Amit Singh', vehicle_number: 'DL-02-BX-5678', eta: '2026-03-17T10:00:00Z', created_at: '2026-03-16T08:00:00Z',
  },
  {
    id: '3', tracking_id: 'SHP-I9J0K1L2', origin_name: 'Chennai Port', origin_lat: 13.0827, origin_lng: 80.2707,
    dest_name: 'Bangalore Tech Park', dest_lat: 12.9716, dest_lng: 77.5946, priority: 'URGENT', status: 'DELAYED',
    driver_name: 'Suresh Reddy', vehicle_number: 'TN-09-CX-9012', eta: '2026-03-16T22:00:00Z', created_at: '2026-03-15T14:00:00Z',
  },
  {
    id: '4', tracking_id: 'SHP-M3N4O5P6', origin_name: 'Kolkata Depot', origin_lat: 22.5726, origin_lng: 88.3639,
    dest_name: 'Patna Center', dest_lat: 25.6093, dest_lng: 85.1376, priority: 'LOW', status: 'PENDING',
    driver_name: null, vehicle_number: null, eta: '2026-03-18T12:00:00Z', created_at: '2026-03-16T09:00:00Z',
  },
  {
    id: '5', tracking_id: 'SHP-Q7R8S9T0', origin_name: 'Ahmedabad Factory', origin_lat: 23.0225, origin_lng: 72.5714,
    dest_name: 'Surat Outlet', dest_lat: 21.1702, dest_lng: 72.8311, priority: 'NORMAL', status: 'DELIVERED',
    driver_name: 'Vikram Patel', vehicle_number: 'GJ-01-DX-3456', eta: '2026-03-15T16:00:00Z', created_at: '2026-03-14T07:00:00Z',
  },
  {
    id: '6', tracking_id: 'SHP-U1V2W3X4', origin_name: 'Hyderabad Warehouse', origin_lat: 17.385, origin_lng: 78.4867,
    dest_name: 'Visakhapatnam Port', dest_lat: 17.6868, dest_lng: 83.2185, priority: 'HIGH', status: 'IN_TRANSIT',
    driver_name: 'Kiran Rao', vehicle_number: 'AP-31-EX-7890', eta: '2026-03-16T20:00:00Z', created_at: '2026-03-16T05:00:00Z',
  },
];

export const mockDrivers: Driver[] = [
  { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', license_number: 'MH-1234567890', status: 'ON_TRIP', assigned_vehicle: 'MH-01-AX-1234', total_deliveries: 342, rating: 4.8 },
  { id: '2', name: 'Amit Singh', phone: '+91 98765 43211', license_number: 'DL-9876543210', status: 'ON_TRIP', assigned_vehicle: 'DL-02-BX-5678', total_deliveries: 218, rating: 4.5 },
  { id: '3', name: 'Suresh Reddy', phone: '+91 98765 43212', license_number: 'TN-5678901234', status: 'ON_TRIP', assigned_vehicle: 'TN-09-CX-9012', total_deliveries: 567, rating: 4.9 },
  { id: '4', name: 'Vikram Patel', phone: '+91 98765 43213', license_number: 'GJ-1357924680', status: 'AVAILABLE', assigned_vehicle: null, total_deliveries: 189, rating: 4.3 },
  { id: '5', name: 'Kiran Rao', phone: '+91 98765 43214', license_number: 'AP-2468013579', status: 'ON_TRIP', assigned_vehicle: 'AP-31-EX-7890', total_deliveries: 412, rating: 4.7 },
  { id: '6', name: 'Manoj Sharma', phone: '+91 98765 43215', license_number: 'UP-1122334455', status: 'OFF_DUTY', assigned_vehicle: null, total_deliveries: 95, rating: 4.1 },
];

export const mockVehicles: Vehicle[] = [
  { id: '1', vehicle_number: 'MH-01-AX-1234', type: 'Truck', capacity_kg: 10000, status: 'IN_USE', current_driver: 'Rajesh Kumar' },
  { id: '2', vehicle_number: 'DL-02-BX-5678', type: 'LCV', capacity_kg: 3500, status: 'IN_USE', current_driver: 'Amit Singh' },
  { id: '3', vehicle_number: 'TN-09-CX-9012', type: 'Container', capacity_kg: 20000, status: 'IN_USE', current_driver: 'Suresh Reddy' },
  { id: '4', vehicle_number: 'GJ-01-DX-3456', type: 'Truck', capacity_kg: 8000, status: 'AVAILABLE', current_driver: null },
  { id: '5', vehicle_number: 'AP-31-EX-7890', type: 'LCV', capacity_kg: 5000, status: 'IN_USE', current_driver: 'Kiran Rao' },
  { id: '6', vehicle_number: 'KA-05-FX-1122', type: 'Truck', capacity_kg: 12000, status: 'MAINTENANCE', current_driver: null },
];

export const mockWarehouses: Warehouse[] = [
  { id: '1', name: 'Mumbai Central Warehouse', location: 'Mumbai, MH', lat: 19.076, lng: 72.8777, capacity: 50000, used: 32000, items: [{ name: 'Electronics', quantity: 1200 }, { name: 'Textiles', quantity: 4500 }, { name: 'Auto Parts', quantity: 800 }] },
  { id: '2', name: 'Delhi Northern Hub', location: 'Delhi, DL', lat: 28.7041, lng: 77.1025, capacity: 75000, used: 58000, items: [{ name: 'FMCG', quantity: 8900 }, { name: 'Pharmaceuticals', quantity: 2300 }, { name: 'Furniture', quantity: 600 }] },
  { id: '3', name: 'Chennai Southern Depot', location: 'Chennai, TN', lat: 13.0827, lng: 80.2707, capacity: 40000, used: 15000, items: [{ name: 'Machinery', quantity: 350 }, { name: 'Chemicals', quantity: 1800 }] },
  { id: '4', name: 'Kolkata Eastern Center', location: 'Kolkata, WB', lat: 22.5726, lng: 88.3639, capacity: 30000, used: 28500, items: [{ name: 'Jute Products', quantity: 6700 }, { name: 'Tea', quantity: 3200 }] },
];

export const mockTrackingData: Record<string, TrackingPoint[]> = {
  '1': [
    { lat: 19.076, lng: 72.8777, speed: 0, timestamp: '2026-03-16T06:00:00Z' },
    { lat: 19.02, lng: 72.92, speed: 45, timestamp: '2026-03-16T07:00:00Z' },
    { lat: 18.95, lng: 73.05, speed: 62, timestamp: '2026-03-16T08:00:00Z' },
    { lat: 18.85, lng: 73.2, speed: 58, timestamp: '2026-03-16T09:00:00Z' },
    { lat: 18.75, lng: 73.4, speed: 55, timestamp: '2026-03-16T10:00:00Z' },
    { lat: 18.65, lng: 73.6, speed: 48, timestamp: '2026-03-16T11:00:00Z' },
  ],
  '6': [
    { lat: 17.385, lng: 78.4867, speed: 0, timestamp: '2026-03-16T05:00:00Z' },
    { lat: 17.42, lng: 78.8, speed: 55, timestamp: '2026-03-16T06:30:00Z' },
    { lat: 17.48, lng: 79.3, speed: 65, timestamp: '2026-03-16T08:00:00Z' },
    { lat: 17.55, lng: 80.0, speed: 60, timestamp: '2026-03-16T10:00:00Z' },
  ],
};

export const analyticsData = {
  shipmentsByStatus: [
    { name: 'Pending', value: 12, fill: 'hsl(215, 16%, 47%)' },
    { name: 'Assigned', value: 8, fill: 'hsl(222, 47%, 11%)' },
    { name: 'In Transit', value: 15, fill: 'hsl(25, 95%, 53%)' },
    { name: 'Delivered', value: 45, fill: 'hsl(160, 84%, 39%)' },
    { name: 'Delayed', value: 5, fill: 'hsl(0, 84%, 60%)' },
  ],
  deliveriesOverTime: [
    { date: 'Mon', deliveries: 12, delayed: 2 },
    { date: 'Tue', deliveries: 18, delayed: 1 },
    { date: 'Wed', deliveries: 15, delayed: 3 },
    { date: 'Thu', deliveries: 22, delayed: 2 },
    { date: 'Fri', deliveries: 28, delayed: 4 },
    { date: 'Sat', deliveries: 20, delayed: 1 },
    { date: 'Sun', deliveries: 8, delayed: 0 },
  ],
  kpis: {
    totalShipments: 85,
    activeShipments: 23,
    delayedShipments: 5,
    deliveryRate: 94.2,
    avgDeliveryTime: '6.4 hrs',
    activeDrivers: 18,
    activeVehicles: 22,
    warehouseUtilization: 72,
  },
};
