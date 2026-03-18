import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, User, Truck } from "lucide-react";
import { useShipments } from "@/hooks/use-shipments";
import { useDrivers } from "@/hooks/use-drivers";
import { useVehicles } from "@/hooks/use-vehicles";
import { Textarea } from "@/components/ui/textarea";
import { geocodeLocation } from "@/lib/logistics-api";
import { Search, MapPin, Warehouse as WarehouseIcon, Package } from "lucide-react";
import { toast } from "sonner";
import { useWarehouses } from "@/hooks/use-warehouses";

const formSchema = z.object({
  tracking_id: z.string().min(3, "Tracking ID is required"),
  origin_name: z.string().min(1, "Pickup location is required"),
  origin_lat: z.coerce.number(),
  origin_lng: z.coerce.number(),
  dest_name: z.string().min(1, "Destination is required"),
  dest_lat: z.coerce.number(),
  dest_lng: z.coerce.number(),
  cargo_description: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  source_warehouse_id: z.string().optional(),
  destination_warehouse_id: z.string().optional(),
  product_name: z.string().optional(),
  product_quantity: z.coerce.number().min(0).optional(),
});

export function CreateShipmentDialog() {
  const [open, setOpen] = useState(false);
  const { createShipment } = useShipments();
  const { warehouses, isLoading: warehousesLoading, updateInventory } = useWarehouses();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();

  // Filters for available resources
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tracking_id: `SHP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      priority: "NORMAL",
      origin_lat: 13.0827,
      origin_lng: 80.2707,
      dest_lat: 12.9716,
      dest_lng: 77.5946,
      product_quantity: 10,
      source_warehouse_id: "",
      destination_warehouse_id: "",
      product_name: "",
      cargo_description: "",
      driver_id: "",
      vehicle_id: "",
    },
  });

  const sourceWarehouseId = form.watch("source_warehouse_id");
  const selectedSourceWarehouse = warehouses.find(w => w.id === sourceWarehouseId);
  const availableProducts = selectedSourceWarehouse?.inventory || [];

  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);

  const calculateRouteInfo = async (originLat: number, originLng: number, destLat: number, destLng: number) => {
    try {
      const { getRoute } = await import("@/lib/logistics-api");
      const routeData = await getRoute([originLat, originLng], [destLat, destLng]);
      if (routeData) {
        setDistance(Math.round(routeData.distance / 1000));
        setRoute(routeData.coordinates);
        const etaDate = new Date();
        etaDate.setSeconds(etaDate.getSeconds() + routeData.duration);
        setEta(etaDate.toISOString());
        return routeData;
      }
    } catch (error) {
      console.error("Failed to calculate route info:", error);
    }
    return null;
  };

  const handleGeocode = async (type: 'origin' | 'dest') => {
    const query = form.getValues(type === 'origin' ? 'origin_name' : 'dest_name');
    if (!query) {
      toast.error("Please enter a location name first");
      return;
    }

    try {
      const result = await geocodeLocation(query);
      if (result) {
        if (type === 'origin') {
          form.setValue('origin_lat', result.lat);
          form.setValue('origin_lng', result.lng);
          // If destination is also set, calculate route
          const destLat = form.getValues('dest_lat');
          const destLng = form.getValues('dest_lng');
          if (destLat && destLng) {
            await calculateRouteInfo(result.lat, result.lng, destLat, destLng);
          }
        } else {
          form.setValue('dest_lat', result.lat);
          form.setValue('dest_lng', result.lng);
          // If origin is also set, calculate route
          const originLat = form.getValues('origin_lat');
          const originLng = form.getValues('origin_lng');
          if (originLat && originLng) {
            await calculateRouteInfo(originLat, originLng, result.lat, result.lng);
          }
        }
        toast.success(`Found coordinates for ${query}`);
      } else {
        toast.error(`Could not find coordinates for "${query}"`);
      }
    } catch (error) {
      toast.error("Geocoding failed. Please enter coordinates manually.");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const selectedDriver = drivers.find(d => d.id === values.driver_id);
      const selectedVehicle = vehicles.find(v => v.id === values.vehicle_id);

      // 1. Deduct from source warehouse if selected
      if (values.source_warehouse_id && values.product_name && values.product_quantity) {
        await updateInventory.mutateAsync({
          warehouseId: values.source_warehouse_id,
          productName: values.product_name,
          change: -values.product_quantity
        });
      }
      
      // 2. Create the shipment
      // Properly transform empty strings to null for UUID columns to avoid Supabase errors
      const shipmentData = {
        ...values,
        source_warehouse_id: values.source_warehouse_id || null,
        destination_warehouse_id: values.destination_warehouse_id || null,
        driver_id: values.driver_id || null,
        vehicle_id: values.vehicle_id || null,
        driver_name: selectedDriver?.name || null,
        vehicle_number: selectedVehicle?.vehicle_number || null,
        cargo_description: values.cargo_description || null,
        product_name: values.product_name || null,
        status: "PENDING",
        eta: eta,
        route_coordinates: route,
        current_lat: values.origin_lat,
        current_lng: values.origin_lng,
        current_route_index: 0,
      };

      await createShipment.mutateAsync(shipmentData as any);

      toast.success("Shipment created and inventory updated!");
      setOpen(false);
      form.reset();
      setEta(null);
      setDistance(null);
      setRoute([]);
    } catch (error: any) {
      console.error("Failed to create shipment:", error);
      toast.error(error.message || "Failed to create shipment");
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>
            Enter details for the new shipment and link it to a warehouse for automated inventory tracking.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tracking_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment ID / Tracking ID</FormLabel>
                    <FormControl>
                      <Input placeholder="SH1023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="cargo_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Electronics, Textiles..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Pickup Details</h4>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="source_warehouse_id"
                    render={({ field }) => (
                      <FormItem className="min-w-[180px]">
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(val);
                            const w = warehouses.find(wh => wh.id === val);
                            if (w) {
                              form.setValue("origin_name", w.name);
                              form.setValue("origin_lat", w.lat);
                              form.setValue("origin_lng", w.lng);
                              // Recalculate route if destination exists
                              const destLat = form.getValues("dest_lat");
                              const destLng = form.getValues("dest_lng");
                              if (destLat && destLng) {
                                calculateRouteInfo(w.lat, w.lng, destLat, destLng);
                              }
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Link to Warehouse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (Manual Point)</SelectItem>
                            {warehouses.map(w => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="origin_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location Name</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Chennai Warehouse" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="icon"
                          onClick={() => handleGeocode('origin')}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="origin_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="origin_lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {sourceWarehouseId && (
              <div className="bg-accent/5 p-4 rounded-lg border border-accent/20 space-y-4">
                <div className="flex items-center gap-2 text-accent font-semibold text-xs border-b border-accent/10 pb-2 uppercase tracking-wider">
                  <Package className="h-3 w-3" />
                  Inventory Management
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="product_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Product</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableProducts.length === 0 ? (
                              <div className="p-2 text-xs text-muted-foreground text-center">No stock available</div>
                            ) : (
                              availableProducts.map((p: any) => (
                                <SelectItem key={p.id} value={p.product_name}>
                                  {p.product_name} ({p.quantity} units)
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Destination Details</h4>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="destination_warehouse_id"
                    render={({ field }) => (
                      <FormItem className="min-w-[180px]">
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(val);
                            const w = warehouses.find(wh => wh.id === val);
                            if (w) {
                              form.setValue("dest_name", w.name);
                              form.setValue("dest_lat", w.lat);
                              form.setValue("dest_lng", w.lng);
                              // Recalculate route if origin exists
                              const originLat = form.getValues("origin_lat");
                              const originLng = form.getValues("origin_lng");
                              if (originLat && originLng) {
                                calculateRouteInfo(originLat, originLng, w.lat, w.lng);
                              }
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Link to Warehouse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (Retail/Store)</SelectItem>
                            {warehouses.map(w => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="dest_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Name</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Bangalore Retail Store" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="icon"
                          onClick={() => handleGeocode('dest')}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="dest_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dest_lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Assignment</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driver_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Driver</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={driversLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={driversLoading ? "Loading..." : "Select driver"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDrivers.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground text-center">No available drivers</div>
                          ) : (
                            availableDrivers.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Vehicle</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={vehiclesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={vehiclesLoading ? "Loading..." : "Select vehicle"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableVehicles.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground text-center">No available vehicles</div>
                          ) : (
                            availableVehicles.map(v => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.vehicle_number} ({v.type})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
              {distance && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Est. Distance: <span className="text-foreground font-medium">{distance} km</span></span>
                    <span>Est. Time: <span className="text-foreground font-medium">{eta ? new Date(eta).toLocaleTimeString() : 'N/A'}</span></span>
                  </div>
                </div>
              )}
              {availableDrivers.length === 0 && !driversLoading && (
                <p className="mt-2 text-[10px] text-accent flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Only available drivers are shown here.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createShipment.isPending}>
                {createShipment.isPending ? "Creating..." : "Create Shipment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

