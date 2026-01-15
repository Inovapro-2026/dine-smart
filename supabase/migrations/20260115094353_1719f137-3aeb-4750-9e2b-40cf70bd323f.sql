-- Allow public INSERT on store_settings for global settings (store_id IS NULL)
CREATE POLICY "Public can create global settings"
ON public.store_settings
FOR INSERT
WITH CHECK (store_id IS NULL);

-- Allow public UPDATE on store_settings for global settings (store_id IS NULL)
CREATE POLICY "Public can update global settings"
ON public.store_settings
FOR UPDATE
USING (store_id IS NULL)
WITH CHECK (store_id IS NULL);