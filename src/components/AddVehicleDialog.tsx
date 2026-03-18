import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus } from "lucide-react";
import { useVehicles } from "@/hooks/use-vehicles";

const formSchema = z.object({
  vehicle_number: z.string().min(4, "Vehicle number is required"),
  type: z.string().min(2, "Type is required (e.g. Truck, Van)"),
  capacity: z.string().min(1, "Capacity is required"),
  status: z.enum(["AVAILABLE", "ON_DELIVERY", "MAINTENANCE"]),
});

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const { createVehicle } = useVehicles();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "AVAILABLE",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createVehicle.mutateAsync(values as any);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add vehicle:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="vehicle_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input placeholder="TN09TR4421" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Eicher 10.75 / Tata Ace" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Tons/Kgs)</FormLabel>
                  <FormControl>
                    <Input placeholder="10 Tons" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="ON_DELIVERY">On Delivery</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVehicle.isPending}>
                {createVehicle.isPending ? "Adding..." : "Add Vehicle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
