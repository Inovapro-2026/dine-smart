-- Adicionar novas categorias
INSERT INTO public.inovafood_categories (name, slug, icon, sort_order) VALUES
('Pizzas', 'pizzas', '🍕', 5),
('Marmitas', 'marmitas', '🍱', 6),
('Churrasco', 'churrasco', '🥩', 7),
('Porções', 'porcoes', '🍗', 8),
('Salgados', 'salgados', '🥟', 9)
ON CONFLICT DO NOTHING;

-- Adicionar mais produtos
INSERT INTO public.inovafood_products (category_id, name, description, price, image_url) 
SELECT 
  c.id,
  p.name,
  p.description,
  p.price,
  p.image_url
FROM (
  VALUES 
    -- Pizzas
    ('Pizzas', 'Pizza Margherita', 'Molho de tomate, mussarela, manjericão fresco e azeite', 45.90, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
    ('Pizzas', 'Pizza Calabresa', 'Calabresa fatiada, cebola, mussarela e orégano', 42.90, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'),
    ('Pizzas', 'Pizza 4 Queijos', 'Mussarela, provolone, parmesão e gorgonzola', 49.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
    ('Pizzas', 'Pizza Portuguesa', 'Presunto, ovo, cebola, azeitona, mussarela e orégano', 47.90, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400'),
    ('Pizzas', 'Pizza Frango c/ Catupiry', 'Frango desfiado, catupiry, milho e mussarela', 48.90, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400'),
    
    -- Marmitas
    ('Marmitas', 'Marmita Executiva', 'Arroz, feijão, bife acebolado, salada e farofa', 24.90, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'),
    ('Marmitas', 'Marmita Fitness', 'Arroz integral, frango grelhado, brócolis e batata doce', 28.90, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'),
    ('Marmitas', 'Marmita Feijoada', 'Feijoada completa com arroz, couve, farofa e laranja', 32.90, 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400'),
    ('Marmitas', 'Marmita Strogonoff', 'Arroz, strogonoff de frango, batata palha e salada', 27.90, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'),
    ('Marmitas', 'Marmita Churrasco', 'Arroz, feijão tropeiro, picanha fatiada e vinagrete', 34.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
    
    -- Churrasco
    ('Churrasco', 'Espeto de Picanha (2un)', 'Picanha premium no espeto com farofa', 38.90, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400'),
    ('Churrasco', 'Espeto Misto (4un)', 'Picanha, frango, linguiça e coração', 42.90, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'),
    ('Churrasco', 'Costela no Bafo 500g', 'Costela bovina assada lentamente, suculenta', 54.90, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400'),
    ('Churrasco', 'Combo Churrasco Família', 'Picanha, linguiça, frango + arroz, farofa, vinagrete', 89.90, 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=400'),
    
    -- Porções
    ('Porções', 'Batata Frita Grande', 'Batata frita crocante com cheddar e bacon', 28.90, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
    ('Porções', 'Frango à Passarinho', 'Coxinhas da asa fritas com tempero especial', 34.90, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400'),
    ('Porções', 'Calabresa Acebolada', 'Calabresa fatiada grelhada com cebola', 32.90, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400'),
    ('Porções', 'Isca de Peixe', 'Iscas de tilápia empanadas com molho tártaro', 36.90, 'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=400'),
    
    -- Salgados
    ('Salgados', 'Coxinha (6un)', 'Coxinhas de frango cremosas', 18.90, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'),
    ('Salgados', 'Esfiha Carne (6un)', 'Esfihas abertas de carne temperada', 22.90, 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=400'),
    ('Salgados', 'Pastel de Queijo (4un)', 'Pastéis crocantes recheados de queijo', 19.90, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'),
    ('Salgados', 'Empada de Frango (6un)', 'Empadas de massa fina com recheio cremoso', 24.90, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400'),
    
    -- Mais bebidas
    ('Bebidas', 'Guaraná 2L', 'Refrigerante Guaraná Antarctica', 12.90, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400'),
    ('Bebidas', 'Cerveja Heineken 600ml', 'Cerveja premium importada', 14.90, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
    ('Bebidas', 'Caipirinha', 'Caipirinha de limão tradicional', 16.90, 'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=400'),
    
    -- Mais sobremesas
    ('Sobremesas', 'Brownie c/ Sorvete', 'Brownie de chocolate com sorvete de creme', 19.90, 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400'),
    ('Sobremesas', 'Pudim de Leite', 'Pudim caseiro com calda de caramelo', 12.90, 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400'),
    ('Sobremesas', 'Torta de Limão', 'Torta de limão com merengue', 14.90, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400')
) AS p(category_name, name, description, price, image_url)
JOIN public.inovafood_categories c ON c.name = p.category_name
ON CONFLICT DO NOTHING;