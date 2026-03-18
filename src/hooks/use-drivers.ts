import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type DriverStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  status: DriverStatus;
  created_at: string;
}

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Driver[];
    },
  });

  const createDriver = useMutation({
    mutationFn: async (newDriver: Omit<Driver, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("drivers")
        .insert([newDriver])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding driver: ${error.message}`);
    },
  });

  const updateDriverStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DriverStatus }) => {
      const { data, error } = await supabase
        .from("drivers")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver status updated");
    },
    onError: (error) => {
      toast.error(`Error updating driver status: ${error.message}`);
    },
  });

  return { drivers, isLoading, error, createDriver, updateDriverStatus };
};
