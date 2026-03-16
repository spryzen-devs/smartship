import { mockShipments } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Shipments() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = statusFilter === "ALL"
    ? mockShipments
    : mockShipments.filter(s => s.status === statusFilter);

  const statuses = ["ALL", "PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "DELAYED"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shipments</h1>
          <p className="text-sm text-muted-foreground">{mockShipments.length} total shipments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-150 ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Route</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">ETA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.tracking_id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-card-foreground">{s.origin_name}</p>
                  <p className="text-xs text-muted-foreground">→ {s.dest_name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${s.priority === 'URGENT' ? 'text-delayed' : s.priority === 'HIGH' ? 'text-accent' : 'text-muted-foreground'}`}>{s.priority}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-card-foreground">{s.driver_name || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.vehicle_number || '—'}</td>
                <td className="px-4 py-3 text-accent font-medium text-xs">{new Date(s.eta).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-8 w-8 mb-2" />
            <p className="text-sm">No shipments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
