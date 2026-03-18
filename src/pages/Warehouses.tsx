import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Warehouse as WarehouseIcon, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft,
  Info,
  Edit2,
  Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Skeleton } from "@/components/ui/skeleton";
import { AddWarehouseDialog, AddInventoryDialog, UpdateStockDialog } from "@/components/WarehouseDialogs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Warehouses() {
  const { warehouses, isLoading, deleteInventory } = useWarehouses();
  const [addWarehouseOpen, setAddWarehouseOpen] = useState(false);
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [updateStockOpen, setUpdateStockOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [selectedStockItem, setSelectedStockItem] = useState<{ id: string; product_name: string; quantity: number } | null>(null);

  const handleAddInventory = (id: string) => {
    setSelectedWarehouseId(id);
    setAddInventoryOpen(true);
  };

  const handleEditStock = (item: { id: string; product_name: string; quantity: number }) => {
    setSelectedStockItem(item);
    setUpdateStockOpen(true);
  };

  const handleDeleteStock = (id: string) => {
    if (confirm("Are you sure you want to remove this item from inventory?")) {
      deleteInventory.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Warehouses</h1>
            <p className="text-sm text-muted-foreground">{warehouses.length} active facilities in network</p>
          </div>
          <Button onClick={() => setAddWarehouseOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Warehouse
          </Button>
        </div>

        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-dashed border-border text-center">
            <WarehouseIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No Warehouses Found</h3>
            <p className="text-muted-foreground mb-4">You haven't added any storage facilities yet.</p>
            <Button onClick={() => setAddWarehouseOpen(true)}>Create Your First Warehouse</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map(w => {
              const used = (w.inventory as any[]).reduce((sum, item) => sum + item.quantity, 0);
              const utilization = Math.min(100, Math.round((used / w.capacity) * 100));
              
              return (
                <div key={w.id} className="group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-accent/40">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-card-foreground text-lg leading-tight">{w.name}</h3>
                        <Badge variant="outline" className="text-[10px] h-4 font-normal bg-accent/5">
                          ID: {w.id.substring(0, 6)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" /> {w.location}
                      </p>
                    </div>
                    <div className="rounded-lg bg-accent/10 p-2.5 transition-colors group-hover:bg-accent/20">
                      <WarehouseIcon className="h-5 w-5 text-accent" />
                    </div>
                  </div>

                  {/* Operational Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-accent/5 rounded-lg p-2 border border-accent/10 flex items-center gap-3">
                      <div className="bg-blue-500/10 p-1.5 rounded-md">
                        <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Incoming</p>
                        <p className="font-mono text-sm leading-none">{(w as any).stats.incoming} <span className="text-[10px] text-muted-foreground font-sans">Shipments</span></p>
                      </div>
                    </div>
                    <div className="bg-accent/5 rounded-lg p-2 border border-accent/10 flex items-center gap-3">
                      <div className="bg-amber-500/10 p-1.5 rounded-md">
                        <ArrowUpRight className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Outgoing</p>
                        <p className="font-mono text-sm leading-none">{(w as any).stats.outgoing} <span className="text-[10px] text-muted-foreground font-sans">Shipments</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium uppercase tracking-tighter">Capacity Utilization</span>
                      <span className={`font-bold tabular-nums ${utilization > 90 ? 'text-delayed' : utilization > 70 ? 'text-warning' : 'text-success'}`}>
                        {utilization}%
                      </span>
                    </div>
                    <Progress value={utilization} className="h-2 rounded-full bg-accent/10" />
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                      {used.toLocaleString()} <span className="text-[10px] text-muted-foreground/60">units stored</span> / {w.capacity.toLocaleString()} <span className="text-[10px] text-muted-foreground/60">capacity</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Package className="h-3.5 w-3.5 text-accent" />
                        Live Inventory
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-xs text-accent hover:text-accent/80 font-bold"
                              onClick={() => handleAddInventory(w.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add Stock
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add a new product type to this warehouse</TooltipContent>
                        </Tooltip>
                        <span className="text-border">|</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground font-bold"
                          onClick={() => toast.info(`Detailed view for ${w.name} coming soon!`)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                      {(w.inventory as any[]).length === 0 ? (
                        <div className="p-4 bg-accent/5 rounded-lg border border-dashed border-accent/20 text-center">
                          <p className="text-xs text-muted-foreground italic">No stock currently stored in this facility.</p>
                        </div>
                      ) : (
                        (w.inventory as any[]).map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5 transition-colors group/item border border-transparent hover:border-accent/10">
                            <span className="text-card-foreground text-sm font-medium">{item.product_name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                {item.quantity.toLocaleString()}
                              </span>
                              <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-muted-foreground hover:text-accent"
                                  onClick={() => handleEditStock(item)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteStock(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AddWarehouseDialog open={addWarehouseOpen} onOpenChange={setAddWarehouseOpen} />
        <AddInventoryDialog 
          warehouseId={selectedWarehouseId} 
          open={addInventoryOpen} 
          onOpenChange={setAddInventoryOpen} 
        />
        <UpdateStockDialog
          item={selectedStockItem}
          open={updateStockOpen}
          onOpenChange={setUpdateStockOpen}
        />
      </div>
    </TooltipProvider>
  );
}
