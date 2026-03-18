import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useWarehouses } from "@/hooks/use-warehouses";

interface UpdateStockDialogProps {
  item: { id: string; product_name: string; quantity: number } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStockDialog({ item, open, onOpenChange }: UpdateStockDialogProps) {
  const { setInventoryQuantity } = useWarehouses();
  const form = useForm<{ quantity: number }>({
    values: {
      quantity: item?.quantity || 0,
    },
  });

  const onSubmit = async (values: { quantity: number }) => {
    if (!item) return;
    setInventoryQuantity.mutate({ 
      id: item.id, 
      quantity: values.quantity 
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock Level</DialogTitle>
          <DialogDescription>Adjust the quantity for {item?.product_name}. Setting to 0 will remove it from inventory.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={setInventoryQuantity.isPending}>
              {setInventoryQuantity.isPending ? "Updating..." : "Update Quantity"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const warehouseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().min(2, "Location is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

interface AddWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWarehouseDialog({ open, onOpenChange }: AddWarehouseDialogProps) {
  const { addWarehouse } = useWarehouses();
  const form = useForm<z.infer<typeof warehouseSchema>>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      capacity: 1000,
      lat: 20.5937,
      lng: 78.9629,
    },
  });

  const onSubmit = async (values: z.infer<typeof warehouseSchema>) => {
    addWarehouse.mutate({
      name: values.name,
      location: values.location,
      capacity: values.capacity,
      lat: values.lat,
      lng: values.lng,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Warehouse</DialogTitle>
          <DialogDescription>Create a new storage facility in your logistics network.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Mumbai South Hub" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (City)</FormLabel>
                  <FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Capacity (Units)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={addWarehouse.isPending}>
              {addWarehouse.isPending ? "Creating..." : "Create Warehouse"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const inventorySchema = z.object({
  product_name: z.string().min(2, "Product name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

interface AddInventoryDialogProps {
  warehouseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInventoryDialog({ warehouseId, open, onOpenChange }: AddInventoryDialogProps) {
  const { addInventory } = useWarehouses();
  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      product_name: "",
      quantity: 100,
    },
  });

  const onSubmit = async (values: z.infer<typeof inventorySchema>) => {
    if (!warehouseId) return;
    addInventory.mutate({ 
      warehouseId, 
      productName: values.product_name, 
      quantity: values.quantity 
    }, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
          <DialogDescription>Register a new product type in this warehouse.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Electronics" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={addInventory.isPending}>
              {addInventory.isPending ? "Adding..." : "Add to Stock"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
