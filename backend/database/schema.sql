-- D1 SQLite Migration Schema for More House Decor IA
-- Run this in production using: npx wrangler d1 execute more-house-decor-db --remote --file=database/schema.sql

-- 1. Table for catalog products
CREATE TABLE IF NOT EXISTS catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  style TEXT NOT NULL,
  price REAL NOT NULL,
  dimensions TEXT DEFAULT 'N/D',
  description TEXT DEFAULT '',
  image TEXT NOT NULL
);

-- 2. Table for design history iterations
CREATE TABLE IF NOT EXISTS design_history (
  id TEXT PRIMARY KEY,
  imageUrl TEXT NOT NULL,
  label TEXT NOT NULL,
  current_issues TEXT,
  prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Junction table to associate products placed in each design iteration
CREATE TABLE IF NOT EXISTS design_products (
  design_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  justification TEXT NOT NULL,
  PRIMARY KEY (design_id, product_id),
  FOREIGN KEY (design_id) REFERENCES design_history(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES catalog(id) ON DELETE CASCADE
);

-- 4. Initial catalog products seed data
INSERT OR IGNORE INTO catalog (id, name, category, style, price, dimensions, description, image) VALUES
('prod-1', 'Sofá Modular Manta', 'Sala', 'Minimalista', 1250.0, '280 x 100 x 75 cm', 'Sofá de tres módulos tapizado en lino texturizado repelente a manchas. Diseño bajo y moderno.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400'),
('prod-2', 'Mesa de Centro Nido Alba', 'Sala', 'Moderno', 320.0, 'Diámetro 80 cm / 60 cm', 'Juego de dos mesas nido con superficie de chapa de roble y estructura metálica color negro mate.', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400'),
('prod-3', 'Mesa de Comedor Roble Nórdico', 'Comedor', 'Minimalista', 850.0, '200 x 95 x 75 cm', 'Mesa para 8 personas fabricada en madera maciza de roble con acabado natural encerado.', 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=400'),
('prod-4', 'Silla de Comedor Cuero Viena', 'Comedor', 'Elegante', 180.0, '50 x 55 x 85 cm', 'Silla ergonómica tapizada en cuero sintético premium color caramelo, patas de metal negro.', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400'),
('prod-5', 'Lámpara de Pie Cobre Arco', 'Sala', 'Industrial', 290.0, 'Altura 200 cm (Brazo extendido)', 'Lámpara de arco de acero cepillado con pantalla de cobre. Base de mármol negro pesado.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400'),
('prod-6', 'Escritorio de Madera y Hierro Fénix', 'Oficina', 'Industrial', 450.0, '140 x 60 x 75 cm', 'Escritorio rústico con madera reciclada tratada y patas de soporte en hierro forjado estructural.', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400'),
('prod-7', 'Silla Ergonómica Aero', 'Oficina', 'Moderno', 350.0, '65 x 65 x 115-125 cm', 'Silla giratoria de oficina con soporte lumbar activo, malla transpirable 3D y brazos 4D ajustables.', 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400'),
('prod-8', 'Aparador Nogal Imperial', 'Comedor', 'Lujo', 1100.0, '180 x 45 x 80 cm', 'Aparador trinchador de madera de nogal con detalles de puertas de vidrio templado y tiradores de latón.', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=400'),
('prod-9', 'Poltrona Terciopelo Jade', 'Sala', 'Elegante', 480.0, '85 x 80 x 90 cm', 'Butaca de acento tapizada en terciopelo verde esmeralda con patas metálicas doradas.', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=400'),
('prod-10', 'Consola Mármol Carrara', 'Sala', 'Lujo', 750.0, '120 x 35 x 75 cm', 'Consola de entrada minimalista de alta gama con cubierta de mármol Carrara pulido y patas doradas.', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400');
