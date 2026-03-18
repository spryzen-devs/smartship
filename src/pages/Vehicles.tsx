import { useVehicles, VehicleStatus } from "@/hooks/use-vehicles";
import { StatusBadge } from "@/components/StatusBadge";
import { Truck, MoreVertical, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Vehicles() {
  const { vehicles, isLoading, updateVehicleStatus } = useVehicles();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
        <p className="text-sm">Loading fleet data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} registered vehicles</p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden glass-morphism">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered At</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-card-foreground">{v.vehicle_number}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-card-foreground">{v.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.capacity}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(v.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Set Status</DropdownMenuLabel>
                        {(["AVAILABLE", "ON_DELIVERY", "MAINTENANCE"] as VehicleStatus[]).map((status) => (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => updateVehicleStatus.mutate({ id: v.id, status })}
                            disabled={v.status === status}
                          >
                            Mark {status.replace("_", " ").toLowerCase()}
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
        {vehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-8 w-8 mb-2" />
            <p className="text-sm">No vehicles in fleet. Head to "Add Vehicle" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}

