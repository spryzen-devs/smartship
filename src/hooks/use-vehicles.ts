import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type VehicleStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'MAINTENANCE';

export interface Vehicle {
  id: string;
  vehicle_number: string;
  type: string;
  capacity: string;
  status: VehicleStatus;
  created_at: string;
}

export const useVehicles = () => {
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("vehicle_number", { ascending: true });

      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const createVehicle = useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("vehicles")
        .insert([newVehicle])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added to fleet");
    },
    onError: (error) => {
      toast.error(`Error adding vehicle: ${error.message}`);
    },
  });

  const updateVehicleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VehicleStatus }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle status updated");
    },
    onError: (error) => {
      toast.error(`Error updating vehicle status: ${error.message}`);
    },
  });

  return { vehicles, isLoading, error, createVehicle, updateVehicleStatus };
};
