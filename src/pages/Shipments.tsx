import { useShipments, ShipmentStatus, Shipment } from "@/hooks/use-shipments";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, Search, Filter, Loader2, MoreHorizontal, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateShipmentDialog } from "@/components/CreateShipmentDialog";
import { ShipmentMapDialog } from "@/components/ShipmentMapDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Shipments() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const { shipments, isLoading, updateShipmentStatus } = useShipments();

  const filtered = statusFilter === "ALL"
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  const statuses = ["ALL", "PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "DELAYED"];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
        <p className="text-sm">Loading shipments...</p>
      </div>
    );
  }

  const handleOpenMap = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setMapOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shipments</h1>
          <p className="text-sm text-muted-foreground">{shipments.length} total shipments</p>
        </div>
        <CreateShipmentDialog />
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
      <div className="rounded-xl border border-border bg-card overflow-hidden glass-morphism">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Route</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver / Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created At</th>
                <th className="text-right px-4 py-3"></th>
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
                    <span className={`text-xs font-semibold ${
                      s.priority === 'URGENT' ? 'text-delayed' : 
                      s.priority === 'HIGH' ? 'text-accent' : 
                      'text-muted-foreground'
                    }`}>
                      {s.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-card-foreground">{s.driver_name || 'Unassigned'}</p>
                    <p className="text-xs font-mono text-muted-foreground">{s.vehicle_number || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(s.created_at).toLocaleString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenMap(s)}>
                          <MapIcon className="h-4 w-4 mr-2" />
                          View Route Map
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Update Status</DropdownMenuLabel>
                        {(["PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "DELAYED"] as ShipmentStatus[]).map((status) => (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => updateShipmentStatus.mutate({ id: s.id, status, shipment: s })}
                            disabled={s.status === status}
                          >
                            Mark as {status.replace("_", " ")}
                          </DropdownMenuItem>

                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-8 w-8 mb-2" />
            <p className="text-sm">No shipments found</p>
          </div>
        )}
      </div>

      <ShipmentMapDialog 
        shipment={selectedShipment} 
        open={mapOpen} 
        onOpenChange={setMapOpen} 
      />
    </div>
  );
}


