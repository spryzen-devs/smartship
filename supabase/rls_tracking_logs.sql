-- Allow read access to tracking_logs for live tracking
ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read tracking_logs" ON public.tracking_logs FOR SELECT USING (true);
