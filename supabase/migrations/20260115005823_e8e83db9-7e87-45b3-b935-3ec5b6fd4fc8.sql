-- Adicionar novos status de pedido para delivery
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'completed';

-- Criar tabela de configurações da loja para INOVAFOOD
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  delivery_fee NUMERIC DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  opening_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "08:00", "close": "22:00"}}'::jsonb,
  whatsapp_welcome_message TEXT DEFAULT '👋 Bem-vindo ao INOVAFOOD! Escolha uma opção abaixo 👇',
  whatsapp_preparing_message TEXT DEFAULT '🍳 Seu pedido está sendo preparado!',
  whatsapp_ready_message TEXT DEFAULT '✅ Seu pedido está pronto para retirada!',
  whatsapp_delivery_message TEXT DEFAULT '🛵 Seu pedido saiu para entrega!',
  whatsapp_completed_message TEXT DEFAULT '🎉 Pedido entregue! Obrigado pela preferência!',
  whatsapp_connected BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  store_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos extras na tabela orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';

-- Criar tabela de pedidos inovafood (com dados completos do cliente sem autenticação)
CREATE TABLE IF NOT EXISTS public.inovafood_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  payment_method TEXT DEFAULT 'pix',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de categorias do delivery
CREATE TABLE IF NOT EXISTS public.inovafood_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos do delivery
CREATE TABLE IF NOT EXISTS public.inovafood_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.inovafood_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inovafood_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inovafood_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inovafood_products ENABLE ROW LEVEL SECURITY;

-- Políticas para store_settings
CREATE POLICY "Store owners can manage settings" ON public.store_settings
FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public can view store settings" ON public.store_settings
FOR SELECT USING (true);

-- Políticas para inovafood_orders (públicas para permitir pedidos sem login)
CREATE POLICY "Anyone can create orders" ON public.inovafood_orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view orders by phone" ON public.inovafood_orders
FOR SELECT USING (true);

CREATE POLICY "Store owners can manage orders" ON public.inovafood_orders
FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = inovafood_orders.store_id AND stores.user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Políticas para inovafood_categories
CREATE POLICY "Public can view categories" ON public.inovafood_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage categories" ON public.inovafood_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = inovafood_categories.store_id AND stores.user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Políticas para inovafood_products
CREATE POLICY "Public can view active products" ON public.inovafood_products
FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage products" ON public.inovafood_products
FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = inovafood_products.store_id AND stores.user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inovafood_orders_updated_at
BEFORE UPDATE ON public.inovafood_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inovafood_products_updated_at
BEFORE UPDATE ON public.inovafood_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO public.inovafood_categories (name, slug, icon, sort_order) VALUES
('Lanches', 'lanches', '🍔', 1),
('Bebidas', 'bebidas', '🥤', 2),
('Combos', 'combos', '🍟', 3),
('Sobremesas', 'sobremesas', '🍰', 4)
ON CONFLICT DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO public.inovafood_products (category_id, name, description, price, image_url) 
SELECT 
  c.id,
  p.name,
  p.description,
  p.price,
  p.image_url
FROM (
  VALUES 
    ('Lanches', 'X-Burguer Clássico', 'Pão, hambúrguer 150g, queijo, alface, tomate e maionese especial', 22.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
    ('Lanches', 'X-Bacon Especial', 'Pão, hambúrguer 180g, bacon crocante, queijo cheddar, cebola caramelizada', 28.90, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400'),
    ('Lanches', 'X-Tudo', 'Pão, 2 hambúrgueres, bacon, ovo, presunto, queijo, alface, tomate', 34.90, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400'),
    ('Lanches', 'Chicken Burger', 'Pão, frango empanado, queijo, alface, tomate e maionese', 24.90, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
    ('Bebidas', 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata gelada', 6.00, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400'),
    ('Bebidas', 'Suco Natural 500ml', 'Suco de laranja natural', 9.90, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'),
    ('Bebidas', 'Água Mineral 500ml', 'Água mineral sem gás', 4.00, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'),
    ('Bebidas', 'Milkshake Chocolate', 'Milkshake cremoso de chocolate 400ml', 14.90, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400'),
    ('Combos', 'Combo Família', 'X-Burguer + X-Bacon + 2 Refrigerantes + Batata Grande', 59.90, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400'),
    ('Combos', 'Combo Individual', 'X-Burguer + Refrigerante + Batata Média', 32.90, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'),
    ('Sobremesas', 'Petit Gateau', 'Bolo de chocolate com recheio cremoso e sorvete', 18.90, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'),
    ('Sobremesas', 'Açaí 500ml', 'Açaí cremoso com granola, banana e leite condensado', 22.90, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400')
) AS p(category_name, name, description, price, image_url)
JOIN public.inovafood_categories c ON c.slug = LOWER(REPLACE(p.category_name, ' ', '-')) OR c.name = p.category_name
ON CONFLICT DO NOTHING;