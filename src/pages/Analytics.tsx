import { analyticsData } from "@/lib/mock-data";
import { StatCard } from "@/components/StatCard";
import { Package, Truck, Users, Clock, CheckCircle2, AlertTriangle, Warehouse, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";

export default function Analytics() {
  const { kpis, shipmentsByStatus, deliveriesOverTime } = analyticsData;

  const driverPerformance = [
    { name: 'Rajesh K.', deliveries: 42, onTime: 40 },
    { name: 'Suresh R.', deliveries: 38, onTime: 37 },
    { name: 'Kiran R.', deliveries: 35, onTime: 33 },
    { name: 'Amit S.', deliveries: 28, onTime: 25 },
    { name: 'Vikram P.', deliveries: 22, onTime: 20 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Performance metrics and insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Shipments" value={kpis.totalShipments} icon={Package} />
        <StatCard title="Active Drivers" value={kpis.activeDrivers} icon={Users} iconClassName="bg-success/10 text-success" />
        <StatCard title="Avg Delivery" value={kpis.avgDeliveryTime} icon={Clock} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="Warehouse Use" value={`${kpis.warehouseUtilization}%`} icon={Warehouse} iconClassName="bg-warning/10 text-warning" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Trend */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Delivery Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={deliveriesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip />
              <Area type="monotone" dataKey="deliveries" fill="hsl(222, 47%, 11%)" fillOpacity={0.1} stroke="hsl(222, 47%, 11%)" strokeWidth={2} />
              <Area type="monotone" dataKey="delayed" fill="hsl(0, 84%, 60%)" fillOpacity={0.1} stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Shipment Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={shipmentsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                {shipmentsByStatus.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Driver Performance */}
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Top Driver Performance</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={driverPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" width={80} />
              <Tooltip />
              <Bar dataKey="deliveries" fill="hsl(222, 47%, 11%)" radius={[0, 4, 4, 0]} name="Total" />
              <Bar dataKey="onTime" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} name="On Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
