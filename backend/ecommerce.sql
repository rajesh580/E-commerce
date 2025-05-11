-- Drop tables if they exist (for reseeding)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  address VARCHAR(255)
);

-- Categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INT,
  price DECIMAL(10,2) NOT NULL,
  discount INT DEFAULT 0,
  image VARCHAR(255),
  description TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Cart
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  FOREIGN KEY (cart_id) REFERENCES cart(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Wishlist
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE wishlist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wishlist_id INT,
  product_id INT,
  FOREIGN KEY (wishlist_id) REFERENCES wishlist(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  address VARCHAR(255),
  status VARCHAR(50),
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2),
  discount INT DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed Users
INSERT INTO users (username, password, is_admin, address) VALUES
  ('admin', 'admin123', TRUE, '123 Admin Street, City'),
  ('customer', 'customer123', FALSE, '456 Customer Ave, Town');

-- Seed Categories
INSERT INTO categories (name) VALUES
  ('Books'),
  ('Clothes'),
  ('Electrical Items'),
  ('Accessories'),
  ('Others');

-- Seed Products (with discounts on 6 products)
INSERT INTO products (name, category_id, price, discount, image, description) VALUES
  ('Wireless Headphones', 3, 120, 20, 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80', 'High-quality wireless headphones with noise cancellation.'),
  ('Classic Novel', 1, 30, 10, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', 'A must-read classic for literature lovers.'),
  ('Winter Jacket', 2, 90, 25, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', 'Stay warm and stylish during winter.'),
  ('Bluetooth Speaker', 3, 60, 15, 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', 'Portable speaker with deep bass and long battery life.'),
  ('Leather Wallet', 4, 40, 5, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', 'Premium leather wallet for everyday use.'),
  ('Sunglasses', 4, 50, 30, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80', 'Polarized sunglasses for UV protection.'),
  ('Basic T-Shirt', 2, 20, 0, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', 'Comfortable cotton t-shirt.'),
  ('Laptop Stand', 5, 35, 0, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', 'Ergonomic stand for laptops up to 17 inches.'),
  ('Notebook Set', 1, 15, 0, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', 'Set of 3 ruled notebooks.'),
  ('Smart Watch', 3, 150, 0, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', 'Track your fitness and notifications.'),
  ('Travel Backpack', 4, 80, 0, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', 'Spacious backpack for travel and daily use.'),
  ('Desk Lamp', 3, 25, 0, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', 'LED lamp with adjustable brightness.');

-- Seed Cart and Cart Items for customer (user_id = 2)
INSERT INTO cart (user_id) VALUES (2);
-- Assume cart_id = 1
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
  (1, 1, 1), -- Wireless Headphones
  (1, 2, 2), -- Classic Novel
  (1, 3, 1); -- Winter Jacket

-- Seed Wishlist and Wishlist Items for customer (user_id = 2)
INSERT INTO wishlist (user_id) VALUES (2);
-- Assume wishlist_id = 1
INSERT INTO wishlist_items (wishlist_id, product_id) VALUES
  (1, 4),
  (1, 5);

-- Seed an Order for customer (user_id = 2)
INSERT INTO orders (user_id, address, status) VALUES
  (2, '456 Customer Ave, Town', 'pending');
-- Assume order_id = 1
INSERT INTO order_items (order_id, product_id, quantity, price, discount) VALUES
  (1, 1, 1, 120, 20), -- Wireless Headphones
  (1, 2, 2, 30, 10);  -- Classic Novel

