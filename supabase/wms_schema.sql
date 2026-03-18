-- 1. Create Warehouses Table
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Update Shipments Table
ALTER TABLE public.shipments 
ADD COLUMN IF NOT EXISTS source_warehouse_id UUID REFERENCES public.warehouses(id),
ADD COLUMN IF NOT EXISTS destination_warehouse_id UUID REFERENCES public.warehouses(id),
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_quantity INTEGER DEFAULT 0;

-- 4. Enable Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE warehouses;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;

-- 5. Add Seed Data
INSERT INTO public.warehouses (name, location, lat, lng, capacity) VALUES
('Mumbai Central Warehouse', 'Mumbai, MH', 19.076, 72.8777, 50000),
('Delhi Northern Hub', 'Delhi, DL', 28.7041, 77.1025, 75000),
('Chennai Southern Depot', 'Chennai, TN', 13.0827, 80.2707, 40000),
('Kolkata Eastern Center', 'Kolkata, WB', 22.5726, 88.3639, 30000);

-- Insert inventory for Mumbai
INSERT INTO public.inventory (warehouse_id, product_name, quantity) 
SELECT id, 'Electronics', 1200 FROM public.warehouses WHERE name = 'Mumbai Central Warehouse';
INSERT INTO public.inventory (warehouse_id, product_name, quantity) 
SELECT id, 'Textiles', 4500 FROM public.warehouses WHERE name = 'Mumbai Central Warehouse';

-- Insert inventory for Delhi
INSERT INTO public.inventory (warehouse_id, product_name, quantity) 
SELECT id, 'FMCG', 8900 FROM public.warehouses WHERE name = 'Delhi Northern Hub';
INSERT INTO public.inventory (warehouse_id, product_name, quantity) 
SELECT id, 'Pharmaceuticals', 2300 FROM public.warehouses WHERE name = 'Delhi Northern Hub';
