import { StatCard } from "@/components/StatCard";
import { ShipmentCard } from "@/components/ShipmentCard";
import { LiveMap, MapPoint } from "@/components/LiveMap";
import { useShipments } from "@/hooks/use-shipments";
import { useTracking } from "@/hooks/use-tracking";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { 
  Package, 
  Truck, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Warehouse,
  Activity,
  UserCheck,
  Fuel,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { shipments, isLoading: shipmentsLoading } = useShipments();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { user } = useAuth();
  
  const activeShipments = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED' || s.status === 'PENDING');
  const activeShipmentIds = activeShipments.map(s => s.id);
  const { positions } = useTracking(activeShipmentIds);

  if (shipmentsLoading || statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
        <p className="text-sm">Initializing Command Center...</p>
      </div>
    );
  }

  // Build map points from active shipments and real-time positions
  const mapPoints = shipments.flatMap(s => {
    const isStationary = s.status === 'PENDING' || s.status === 'DELIVERED';
    const currentPos = positions[s.id];
    
    if (isStationary && s.status !== 'PENDING') return [];

    const points: MapPoint[] = [
      { lat: s.origin_lat, lng: s.origin_lng, label: s.origin_name, type: 'origin' as const },
      { lat: s.dest_lat, lng: s.dest_lng, label: s.dest_name, type: 'destination' as const },
    ];

    if (currentPos) {
      points.push({ 
        lat: currentPos.latitude, 
        lng: currentPos.longitude, 
        label: `${s.tracking_id} • ${s.vehicle_number || 'Truck'}`, 
        type: 'truck' as const 
      });
    }

    return points;
  });

  const companyName = user?.user_metadata?.company_name || "Logistics Command Center";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
          <p className="text-sm text-muted-foreground">Admin: {user?.user_metadata?.full_name || "Logistics Administrator"}</p>
        </div>
        <Badge variant="outline" className="h-6 gap-1 bg-success/5 text-success border-success/20">
          <Activity className="h-3 w-3 animate-pulse" /> Live System
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Shipments" value={stats?.totalShipments || 0} icon={Package} />
        <StatCard title="Active" value={stats?.activeShipments || 0} icon={Truck} iconClassName="bg-accent/10 text-accent" />
        <StatCard title="Delayed" value={stats?.delayedShipments || 0} icon={AlertTriangle} iconClassName="bg-delayed/10 text-delayed" />
        <StatCard title="Delivered" value={stats?.deliveredShipments || 0} icon={CheckCircle2} iconClassName="bg-success/10 text-success" />
      </div>

      {/* Live Alerts */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map(alert => (
            <div key={alert.id} className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
              alert.severity === 'high' ? 'border-delayed/30 bg-delayed/5' : 'border-warning/30 bg-warning/5'
            }`}>
              <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.severity === 'high' ? 'text-delayed' : 'text-warning'}`} />
              <p className="text-sm text-foreground">
                <span className="font-semibold">{alert.type === 'CAPACITY' ? 'Capacity Alert:' : 'Delay Alert:'}</span> {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Operational View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-card-foreground">Live Fleet Map</h2>
              <span className="text-xs text-muted-foreground">{activeShipments.length} vehicles in motion</span>
            </div>
            <LiveMap points={mapPoints} className="h-[400px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fleet Status */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-accent" /> Fleet Visibility
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Drivers</span>
                  <span className="font-bold text-success">{stats?.availableDrivers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Busy Drivers</span>
                  <span className="font-bold text-accent">{stats?.busyDrivers || 0}</span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available Vehicles</span>
                    <span className="font-bold text-success">{stats?.availableVehicles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Vehicles</span>
                    <span className="font-bold text-accent">{stats?.activeVehicles || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Overview */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-accent" /> Warehouse Overview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Units Stored</span>
                  <span className="font-bold">{stats?.totalInventoryUnits.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Most Loaded</span>
                  <span className="font-bold text-xs truncate max-w-[120px]">{stats?.mostLoadedWarehouse?.name || "None"}</span>
                </div>
                {stats?.mostLoadedWarehouse && (
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>UTILIZATION</span>
                      <span>{stats.mostLoadedWarehouse.utilization}%</span>
                    </div>
                    <div className="w-full bg-accent/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-accent h-full transition-all" 
                        style={{ width: `${stats.mostLoadedWarehouse.utilization}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {shipments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic p-8 text-center bg-accent/5 rounded-xl border border-dashed border-border">
                No active shipments
              </p>
            ) : (
              shipments.slice(0, 5).map(s => (
                <ShipmentCard key={s.id} shipment={s} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
