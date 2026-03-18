import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
  availableDrivers: number;
  busyDrivers: number;
  availableVehicles: number;
  activeVehicles: number;
  totalInventoryUnits: number;
  totalWarehouses: number;
  mostLoadedWarehouse: { name: string; utilization: number } | null;
  alerts: Array<{
    id: string;
    type: 'DELAY' | 'CAPACITY' | 'URGENT';
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async (): Promise<DashboardStats> => {
      const [{ data: shipments = [] }, { data: drivers = [] }, { data: vehicles = [] }, { data: warehouses = [] }] = await Promise.all([
        supabase.from("shipments").select("status, tracking_id, destination_warehouse_id, source_warehouse_id, cargo_description"),
        supabase.from("drivers").select("status"),
        supabase.from("vehicles").select("status"),
        supabase.from("warehouses").select("id, name, capacity, inventory(quantity)"),
      ]);

      const stats: DashboardStats = {
        totalShipments: shipments.length,
        activeShipments: shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING' || s.status === 'DELAYED').length,
        deliveredShipments: shipments.filter(s => s.status === 'DELIVERED').length,
        delayedShipments: shipments.filter(s => s.status === 'DELAYED').length,
        availableDrivers: drivers.filter(d => d.status === 'AVAILABLE').length,
        busyDrivers: drivers.filter(d => d.status === 'ON_DELIVERY').length,
        availableVehicles: vehicles.filter(v => v.status === 'AVAILABLE').length,
        activeVehicles: vehicles.filter(v => v.status === 'ON_DELIVERY').length,
        totalWarehouses: warehouses.length,
        totalInventoryUnits: 0,
        mostLoadedWarehouse: null,
        alerts: []
      };

      let maxUtil = -1;
      warehouses.forEach((w: any) => {
        const used = (w.inventory || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
        stats.totalInventoryUnits += used;
        const util = (used / w.capacity) * 100;
        if (util > maxUtil) {
          maxUtil = util;
          stats.mostLoadedWarehouse = { name: w.name, utilization: Math.round(util) };
        }
        if (util > 90) {
          stats.alerts.push({ id: `cap-${w.id}`, type: 'CAPACITY', severity: 'high', message: `Warehouse ${w.name} is at ${Math.round(util)}% capacity!` });
        }
      });

      shipments.filter(s => s.status === 'DELAYED').forEach(s => {
        stats.alerts.push({ id: `delay-${s.tracking_id}`, type: 'DELAY', severity: 'medium', message: `Shipment ${s.tracking_id} is currently delayed.` });
      });

      return stats;
    },
    refetchInterval: 10000,
  });
}
