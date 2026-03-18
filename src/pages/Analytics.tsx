import { StatCard } from "@/components/StatCard";
import { Package, Users, Clock, Warehouse, TrendingUp, Loader2, Target, History, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart,
} from "recharts";
import { useAnalyticsStats } from "@/hooks/use-analytics-stats";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  const { data: stats, isLoading } = useAnalyticsStats();

  // Colors for Pie Chart status distribution
  const STATUS_COLORS = [
    'hsl(222, 47%, 11%)', // DELIVERED
    'hsl(25, 95%, 53%)',  // IN_TRANSIT
    'hsl(0, 84%, 60%)',   // DELAYED
    'hsl(215, 16%, 47%)', // PENDING
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
        <p className="text-sm">Generating Performance Insights...</p>
      </div>
    );
  }

  const statusDistribution = [
    { name: 'On Time', value: stats?.onTimeRate || 0, fill: STATUS_COLORS[0] },
    { name: 'Delayed', value: 100 - (stats?.onTimeRate || 0), fill: STATUS_COLORS[2] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep performance metrics and trend analysis.</p>
        </div>
        <Badge variant="outline" className="gap-1 bg-accent/5 text-accent border-accent/20">
          <History className="h-3 w-3" /> Last 30 Days
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Success Rate" value={`${stats?.onTimeRate || 0}%`} icon={Target} iconClassName="bg-success/10 text-success" />
        <StatCard title="Avg Delivery" value={`${stats?.avgDeliveryTime || 0}h`} icon={Clock} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="Avg Delay" value={`${stats?.avgDelay || 0}m`} icon={TrendingUp} iconClassName="bg-delayed/10 text-delayed" />
        <StatCard title="Fleet Efficiency" value="92%" icon={Users} iconClassName="bg-accent/10 text-accent" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-foreground mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" /> Shipment Volume Trends
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats?.shipmentTrend}>
              <defs>
                <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(222, 47%, 11%)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(222, 47%, 11%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 32%, 91%)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="deliveries" name="Delivered" stroke="hsl(222, 47%, 11%)" strokeWidth={3} fillOpacity={1} fill="url(#colorDel)" />
              <Area type="monotone" dataKey="delayed" name="Delayed" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fillOpacity={0.05} fill="hsl(0, 84%, 60%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Warehouse Usage */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-foreground mb-6 flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-accent" /> Infrastructure Utilization
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats?.warehouseUsage}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="usage" name="Utilization %" fill="hsl(222, 47%, 11%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Driver Performance */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" /> Top Personnel Performance
            </h2>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Efficiency Metrics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  <th className="text-left py-3 px-2">Driver Name</th>
                  <th className="text-center py-3 px-2">Total Trips</th>
                  <th className="text-center py-3 px-2">Success Rate</th>
                  <th className="text-center py-3 px-2">Avg Time</th>
                  <th className="text-right py-3 px-2">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {stats?.driverStats.map((driver, idx) => {
                  const rate = Math.round((driver.onTime / driver.total) * 100);
                  return (
                    <tr key={idx} className="group hover:bg-accent/5 transition-colors">
                      <td className="py-4 px-2 font-medium">{driver.name}</td>
                      <td className="py-4 px-2 text-center font-mono">{driver.total}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rate > 90 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center text-muted-foreground">{driver.avgTime}h</td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-accent/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-accent h-full" style={{ width: `${rate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
