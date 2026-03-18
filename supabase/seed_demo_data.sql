-- ===================================================
-- DEMO DATA SEED SCRIPT
-- Run in Supabase SQL Editor to restore all data
-- ===================================================

-- 1. WAREHOUSES
INSERT INTO public.warehouses (id, name, location, capacity, lat, lng) VALUES
('wh-001', 'Delhi Hub', 'New Delhi, Delhi', 5000, 28.6139, 77.2090),
('wh-002', 'Mumbai Port Warehouse', 'Mumbai, Maharashtra', 8000, 19.0760, 72.8777),
('wh-003', 'Bangalore Distribution Center', 'Bengaluru, Karnataka', 4000, 12.9716, 77.5946),
('wh-004', 'Chennai Logistics Hub', 'Chennai, Tamil Nadu', 6000, 13.0827, 80.2707),
('wh-005', 'Kolkata Freight Depot', 'Kolkata, West Bengal', 3500, 22.5726, 88.3639)
ON CONFLICT (id) DO NOTHING;

-- 2. INVENTORY (seed for each warehouse)
INSERT INTO public.inventory (warehouse_id, product_name, quantity) VALUES
('wh-001', 'Electronics', 1200),
('wh-001', 'Auto Parts', 850),
('wh-002', 'Textiles', 3200),
('wh-002', 'Chemicals', 650),
('wh-003', 'Pharmaceuticals', 1800),
('wh-003', 'Electronics', 900),
('wh-004', 'FMCG Goods', 2100),
('wh-005', 'Raw Materials', 1500)
ON CONFLICT DO NOTHING;

-- 3. DRIVERS
INSERT INTO public.drivers (id, name, phone, license_number, status) VALUES
('drv-001', 'Ravi Kumar', '+91-9876543210', 'DL-1234567890', 'AVAILABLE'),
('drv-002', 'Sunita Devi', '+91-9876543211', 'MH-0987654321', 'AVAILABLE'),
('drv-003', 'Arjun Sharma', '+91-9876543212', 'KA-1122334455', 'AVAILABLE'),
('drv-004', 'Priya Patel', '+91-9876543213', 'TN-5544332211', 'AVAILABLE'),
('drv-005', 'Mohammed Khan', '+91-9876543214', 'WB-6677889900', 'AVAILABLE'),
('drv-006', 'Deepak Singh', '+91-9876543215', 'RJ-1357924680', 'ON_DELIVERY'),
('drv-007', 'Anita Gupta', '+91-9876543216', 'UP-2468013579', 'ON_DELIVERY'),
('drv-008', 'Vijay Reddy', '+91-9876543217', 'AP-9012345678', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- 4. VEHICLES
INSERT INTO public.vehicles (id, vehicle_number, type, capacity, status) VALUES
('veh-001', 'MH-12-AB-1234', 'Truck', '10 Tonnes', 'AVAILABLE'),
('veh-002', 'DL-01-CD-5678', 'Mini Truck', '3 Tonnes', 'AVAILABLE'),
('veh-003', 'KA-03-EF-9012', 'Container', '20 Tonnes', 'AVAILABLE'),
('veh-004', 'TN-04-GH-3456', 'Trailer', '25 Tonnes', 'AVAILABLE'),
('veh-005', 'WB-05-IJ-7890', 'Van', '1.5 Tonnes', 'ON_DELIVERY'),
('veh-006', 'RJ-06-KL-2345', 'Truck', '10 Tonnes', 'ON_DELIVERY'),
('veh-007', 'GJ-07-MN-6789', 'Mini Truck', '5 Tonnes', 'AVAILABLE'),
('veh-008', 'HR-08-OP-1234', 'Container', '15 Tonnes', 'MAINTENANCE')
ON CONFLICT (id) DO NOTHING;

-- 5. SHIPMENTS (Mix of statuses)
INSERT INTO public.shipments (id, tracking_id, origin_name, origin_lat, origin_lng, dest_name, dest_lat, dest_lng, cargo_description, priority, status, driver_name, driver_id, vehicle_number, vehicle_id, current_lat, current_lng) VALUES
-- Delivered shipments
('shp-001', 'GT-10001', 'Delhi Hub', 28.6139, 77.2090, 'Mumbai Port Warehouse', 19.0760, 72.8777, 'Electronics - 500 units', 'HIGH', 'DELIVERED', 'Ravi Kumar', 'drv-001', 'MH-12-AB-1234', 'veh-001', 19.0760, 72.8777),
('shp-002', 'GT-10002', 'Bangalore Distribution Center', 12.9716, 77.5946, 'Chennai Logistics Hub', 13.0827, 80.2707, 'Pharmaceuticals - 200 boxes', 'URGENT', 'DELIVERED', 'Sunita Devi', 'drv-002', 'DL-01-CD-5678', 'veh-002', 13.0827, 80.2707),
('shp-003', 'GT-10003', 'Mumbai Port Warehouse', 19.0760, 72.8777, 'Delhi Hub', 28.6139, 77.2090, 'Textiles - 2 tonnes', 'NORMAL', 'DELIVERED', 'Arjun Sharma', 'drv-003', 'KA-03-EF-9012', 'veh-003', 28.6139, 77.2090),
-- In Transit
('shp-004', 'GT-10004', 'Delhi Hub', 28.6139, 77.2090, 'Kolkata Freight Depot', 22.5726, 88.3639, 'Auto Parts - 1 tonne', 'HIGH', 'IN_TRANSIT', 'Deepak Singh', 'drv-006', 'RJ-06-KL-2345', 'veh-006', 25.4358, 81.8463),
('shp-005', 'GT-10005', 'Chennai Logistics Hub', 13.0827, 80.2707, 'Bangalore Distribution Center', 12.9716, 77.5946, 'FMCG Goods - 500 kg', 'NORMAL', 'IN_TRANSIT', 'Anita Gupta', 'drv-007', 'WB-05-IJ-7890', 'veh-005', 13.0350, 79.4000),
-- Pending
('shp-006', 'GT-10006', 'Kolkata Freight Depot', 22.5726, 88.3639, 'Mumbai Port Warehouse', 19.0760, 72.8777, 'Raw Materials - 5 tonnes', 'LOW', 'PENDING', NULL, NULL, NULL, NULL, 22.5726, 88.3639),
('shp-007', 'GT-10007', 'Delhi Hub', 28.6139, 77.2090, 'Bangalore Distribution Center', 12.9716, 77.5946, 'Electronics - 100 units', 'URGENT', 'PENDING', NULL, NULL, NULL, NULL, 28.6139, 77.2090),
-- Delayed
('shp-008', 'GT-10008', 'Mumbai Port Warehouse', 19.0760, 72.8777, 'Chennai Logistics Hub', 13.0827, 80.2707, 'Chemicals - 300 kg', 'HIGH', 'DELAYED', 'Priya Patel', 'drv-004', 'TN-04-GH-3456', 'veh-004', 16.500, 76.700)
ON CONFLICT (id) DO NOTHING;

SELECT 
  (SELECT COUNT(*) FROM public.shipments) AS shipments,
  (SELECT COUNT(*) FROM public.drivers) AS drivers,
  (SELECT COUNT(*) FROM public.vehicles) AS vehicles,
  (SELECT COUNT(*) FROM public.warehouses) AS warehouses,
  (SELECT COUNT(*) FROM public.inventory) AS inventory_items;
