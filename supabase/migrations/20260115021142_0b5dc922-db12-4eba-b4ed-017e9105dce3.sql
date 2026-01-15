-- Fix admin order status update when using anon key (current admin auth is localStorage-only)
-- Allow UPDATE on orders that have no store_id (single-tenant/demo mode)
DROP POLICY IF EXISTS "Authenticated can update orders without store" ON public.inovafood_orders;

CREATE POLICY "Public can update orders without store"
ON public.inovafood_orders
FOR UPDATE
USING (store_id IS NULL)
WITH CHECK (store_id IS NULL);