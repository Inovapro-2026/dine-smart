-- Allow authenticated users to update orders (status) when store_id is null OR user is admin/store owner
-- Drop the existing ALL policy that only covers store owners
DROP POLICY IF EXISTS "Store owners can manage orders" ON public.inovafood_orders;

-- Recreate read access for everyone
-- (Already exists: "Anyone can view orders by phone" with USING (true))

-- Create policy for store owners to manage their orders
CREATE POLICY "Store owners can manage own store orders"
ON public.inovafood_orders
FOR ALL
USING (
  (EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = inovafood_orders.store_id
    AND stores.user_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = inovafood_orders.store_id
    AND stores.user_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy for authenticated users to update orders without store_id (demo/single-tenant mode)
CREATE POLICY "Authenticated can update orders without store"
ON public.inovafood_orders
FOR UPDATE
USING (
  store_id IS NULL
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  store_id IS NULL
  AND auth.uid() IS NOT NULL
);