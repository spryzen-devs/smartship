-- 1. Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Add company_id to all relevant tables
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE DEFAULT get_current_company_id();
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE DEFAULT get_current_company_id();
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE DEFAULT get_current_company_id();
ALTER TABLE public.tracking_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE DEFAULT get_current_company_id();
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE DEFAULT get_current_company_id();
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE DEFAULT get_current_company_id();

-- 3. Enable RLS on all tables
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Data Isolation (Users can only read/write their own company's data)

-- Drivers
DROP POLICY IF EXISTS "tenant_isolation_drivers" ON public.drivers;
CREATE POLICY "tenant_isolation_drivers" ON public.drivers
    FOR ALL USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());

-- Vehicles
DROP POLICY IF EXISTS "tenant_isolation_vehicles" ON public.vehicles;
CREATE POLICY "tenant_isolation_vehicles" ON public.vehicles
    FOR ALL USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());

-- Shipments
DROP POLICY IF EXISTS "tenant_isolation_shipments" ON public.shipments;
CREATE POLICY "tenant_isolation_shipments" ON public.shipments
    FOR ALL USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());

-- Tracking Logs
DROP POLICY IF EXISTS "tenant_isolation_tracking_logs" ON public.tracking_logs;
CREATE POLICY "tenant_isolation_tracking_logs" ON public.tracking_logs
    FOR ALL USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());

-- Warehouses
DROP POLICY IF EXISTS "tenant_isolation_warehouses" ON public.warehouses;
CREATE POLICY "tenant_isolation_warehouses" ON public.warehouses
    FOR ALL USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());

-- Inventory
DROP POLICY IF EXISTS "tenant_isolation_inventory" ON public.inventory;
CREATE POLICY "tenant_isolation_inventory" ON public.inventory
    FOR ALL USING (company_id = get_current_company_id())
    WITH CHECK (company_id = get_current_company_id());
