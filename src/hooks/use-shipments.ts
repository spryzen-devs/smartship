import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type ShipmentStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
export type ShipmentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Shipment {
  id: string;
  tracking_id: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_name: string;
  dest_lat: number;
  dest_lng: number;
  cargo_description?: string;
  priority: ShipmentPriority;
  status: ShipmentStatus;
  driver_name?: string | null;
  driver_id?: string | null;
  vehicle_number?: string | null;
  vehicle_id?: string | null;
  route_coordinates?: [number, number][] | null;
  current_lat?: number | null;
  current_lng?: number | null;
  current_route_index?: number | null;
  eta?: string | null;
  created_at: string;
}

export const useShipments = () => {
  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading, error } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as Shipment[];
    },
  });

  const createShipment = useMutation({
    mutationFn: async (newShipment: Omit<Shipment, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("shipments")
        .insert([newShipment])
        .select()
        .single();

      if (error) throw error;

      if (newShipment.driver_id) {
        await supabase.from("drivers").update({ status: "ON_DELIVERY" }).eq("id", newShipment.driver_id);
      }
      if (newShipment.vehicle_id) {
        await supabase.from("vehicles").update({ status: "ON_DELIVERY" }).eq("id", newShipment.vehicle_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Shipment created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating shipment: ${error.message}`);
    },
  });

  const updateShipmentStatus = useMutation({
    mutationFn: async ({ id, status, shipment }: { id: string; status: ShipmentStatus; shipment?: Shipment }) => {
      const { data, error } = await supabase
        .from("shipments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (status === "DELIVERED" && shipment) {
        if (shipment.driver_id) {
          await supabase.from("drivers").update({ status: "AVAILABLE" }).eq("id", shipment.driver_id);
        }
        if (shipment.vehicle_id) {
          await supabase.from("vehicles").update({ status: "AVAILABLE" }).eq("id", shipment.vehicle_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Shipment status updated");
    },
    onError: (error) => {
      toast.error(`Error updating status: ${error.message}`);
    },
  });

  return { shipments, isLoading, error, createShipment, updateShipmentStatus };
};
