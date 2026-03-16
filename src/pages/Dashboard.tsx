import { StatCard } from "@/components/StatCard";
import { ShipmentCard } from "@/components/ShipmentCard";
import { StatusBadge } from "@/components/StatusBadge";
import { LiveMap } from "@/components/LiveMap";
import { mockShipments, mockTrackingData, analyticsData } from "@/lib/mock-data";
import { Package, Truck, Users, AlertTriangle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { kpis } = analyticsData;
  const activeShipments = mockShipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED');

  // Build map points from active shipments
  const mapPoints = activeShipments.flatMap(s => {
    const tracking = mockTrackingData[s.id];
    const lastPos = tracking?.[tracking.length - 1];
    return [
      { lat: s.origin_lat, lng: s.origin_lng, label: s.origin_name, type: 'origin' as const },
      { lat: s.dest_lat, lng: s.dest_lng, label: s.dest_name, type: 'destination' as const },
      ...(lastPos ? [{ lat: lastPos.lat, lng: lastPos.lng, label: `${s.tracking_id} • ${s.vehicle_number}`, type: 'truck' as const }] : []),
    ];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground">Total visibility across the Indian subcontinent.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Shipments" value={kpis.totalShipments} icon={Package} trend={{ value: 12, label: "vs last week" }} />
        <StatCard title="Active" value={kpis.activeShipments} icon={Truck} iconClassName="bg-accent/10 text-accent" />
        <StatCard title="Delayed" value={kpis.delayedShipments} icon={AlertTriangle} iconClassName="bg-delayed/10 text-delayed" />
        <StatCard title="Delivery Rate" value={`${kpis.deliveryRate}%`} icon={CheckCircle2} iconClassName="bg-success/10 text-success" trend={{ value: 2.1, label: "vs last week" }} />
      </div>

      {/* Alert Banner */}
      {activeShipments.some(s => s.status === 'DELAYED') && (
        <div className="flex items-center gap-3 rounded-lg border border-delayed/30 bg-delayed/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-delayed shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Delay Alert:</span> Shipment SHP-I9J0K1L2 (Chennai → Bangalore) may be delayed by 45 minutes due to traffic on NH48.
          </p>
        </div>
      )}

      {/* Map + Recent Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-card-foreground">Live Fleet Map</h2>
              <span className="text-xs text-muted-foreground">{activeShipments.length} active</span>
            </div>
            <LiveMap points={mapPoints} className="h-[360px]" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Shipments</h2>
          {mockShipments.slice(0, 4).map(s => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-card-foreground mb-4">Deliveries This Week</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analyticsData.deliveriesOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <Tooltip />
            <Bar dataKey="deliveries" fill="hsl(222, 47%, 11%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="delayed" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
