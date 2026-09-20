ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO public.categories (name)
VALUES ('Staples'), ('Proteins'), ('Stews & Soups')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, price, is_available, description, image_url)
SELECT categories.id, items.name, items.price, TRUE, items.description, items.image_url
FROM (VALUES
  ('Staples', 'Banku', 15.00, 'Traditional corn and cassava dough portion.', '/images/banku.jpg'),
  ('Staples', 'Jollof Rice', 25.00, 'Spiced Ghanaian tomato jollof rice.', '/images/jollof.jpg'),
  ('Staples', 'Plain Rice', 20.00, 'Steamed long-grain white rice.', '/images/plain_rice.jpg'),
  ('Staples', 'Waakye', 25.00, 'Classic rice and beans cooked with dried sorghum leaves.', '/images/waakye.jpg'),
  ('Staples', 'Kenkey', 15.00, 'Fermented white corn dough wrapped in corn husks.', '/images/kenkey.jpg'),
  ('Staples', 'Fufu', 30.00, 'Pounded cassava and green plantain portion.', '/images/fufu.jpg'),
  ('Proteins', 'Fish', 20.00, 'Fried or grilled seasoned fish portion.', '/images/fish.jpg'),
  ('Proteins', 'Chicken', 25.00, 'Crispy fried or roasted chicken piece.', '/images/chicken.jpg'),
  ('Proteins', 'Gizzard', 15.00, 'Spiced and grilled turkey/chicken gizzard skewer.', '/images/gizzard.jpg'),
  ('Proteins', 'Sausages', 10.00, 'Pan-fried meat sausages.', '/images/sausages.jpg'),
  ('Proteins', 'Meat (Assorted)', 20.00, 'Selection of goat, beef, or cow hide (wele).', '/images/meat.jpg'),
  ('Stews & Soups', 'Tomato Stew', 10.00, 'Rich spiced tomato and onion stew.', '/images/tomato_stew.jpg'),
  ('Stews & Soups', 'Other Stews', 10.00, 'Contour/palava stew or vegetable stew options.', '/images/palava_stew.jpg'),
  ('Stews & Soups', 'Goat Soup', 20.00, 'Traditional light goat soup with indigenous spices.', '/images/goat_soup.jpg'),
  ('Stews & Soups', 'Chicken Soup', 15.00, 'Slow-simmered chicken light soup.', '/images/chicken_soup.jpg'),
  ('Stews & Soups', 'Fish Soup', 15.00, 'Fresh fish light soup seasoned with local herbs.', '/images/fish_soup.jpg'),
  ('Stews & Soups', 'Groundnut / Palm Soup', 20.00, 'Rich peanut butter or palm nut soup.', '/images/groundnut_soup.jpg'),
  ('Stews & Soups', 'Pepper (Shito & Fresh)', 5.00, 'Black pepper (shito) or freshly ground red/green pepper sauce.', '/images/shito.jpg')
) AS items(category_name, name, price, description, image_url)
JOIN public.categories AS categories ON categories.name = items.category_name
WHERE NOT EXISTS (
  SELECT 1
  FROM public.menu_items AS existing
  WHERE LOWER(existing.name) = LOWER(items.name)
);
