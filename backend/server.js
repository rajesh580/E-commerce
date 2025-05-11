const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = 'SECRET_KEY';

let users = [];
let orders = [];
let currentProductId = 1;

let products = [
  // Books
  {
    id: currentProductId++,
    name: "Atomic Habits",
    category: "Books",
    price: 15,
    image: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "The Alchemist",
    category: "Books",
    price: 12,
    image: "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg",
    description: "A novel by Paulo Coelho about following your dreams.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Deep Work",
    category: "Books",
    price: 17,
    image: "https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg",
    description: "Rules for Focused Success in a Distracted World by Cal Newport.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Onyx Storm",
    category: "Books",
    price: 20,
    image: "https://m.media-amazon.com/images/I/51o8XpOD5WL._SY445_SX342_.jpg",
    description: "DISCOVER THE FOLLOW-UP TO THE GLOBAL PHENOMENONS, FOURTH WING AND IRON FLAME!",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Naruto, Vol. 1: Uzumaki Naruto",
    category: "Books",
    price: 10,
    image: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQwf32sdpxid4qnXq_BkxJf_8OAt120hm6rAYPVUrvelEhsXBSs",
    description: "The first volume of the hit manga series! Naruto Uzumaki is a ninja-in-training with a need for attention, a knack for mischief, and sealed within him, a dangerous fox spirit.",
    seller: "admin",
    verified: true
  },

  // Clothes
  {
    id: currentProductId++,
    name: "Unisex Hoodie",
    category: "Clothes",
    price: 30,
    image: "https://m.media-amazon.com/images/I/91NLs-Q9BWL._AC_UY1100_.jpg",
    description: "Soft and warm unisex hoodie for all seasons.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Men's T-shirt",
    category: "Clothes",
    price: 10,
    image: "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg",
    description: "Comfortable cotton T-shirt for men.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Women's Dress",
    category: "Clothes",
    price: 25,
    image: "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg",
    description: "Elegant summer dress for women.",
    seller: "admin",
    verified: true
  },
  // Electrical Items
  {
    id: currentProductId++,
    name: "Portable Bluetooth Speaker",
    category: "Electrical Items",
    price: 35,
    image: "https://m.media-amazon.com/images/I/31zk4OOFEmL._SX300_SY300_QL70_FMwebp_.jpg",
    description: "Compact speaker with powerful sound and long battery life.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Wireless Headphones",
    category: "Electrical Items",
    price: 40,
    image: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg",
    description: "Bluetooth over-ear headphones.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Smart Watch",
    category: "Electrical Items",
    price: 60,
    image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg",
    description: "Fitness smart watch with heart rate monitor.",
    seller: "admin",
    verified: true
  },
  // Accessories
  {
    id: currentProductId++,
    name: "Leather Wallet",
    category: "Accessories",
    price: 20,
    image: "https://images.pexels.com/photos/179909/pexels-photo-179909.jpeg",
    description: "Genuine leather wallet.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Sunglasses",
    category: "Accessories",
    price: 18,
    image: "https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg",
    description: "UV-protected stylish sunglasses.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "polarized CALANDIS ski Goggles Sun Protection Sunglasses",
    category: "Accessories",
    price: 18,
    image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSWA7GIzADRVSjC4vIOW1mggLUOi57rcBO8XVJCgGxgd_1ZdBHkNfkApBStFpgbcjIZaFMHEuEc0Wv0G9zA0GFnAfgYyIWYUsFnwDy42Q2kndkgztmKvP8Y",
    description: "UV-protected stylish sunglasses.",
    seller: "admin",
    verified: true
  },
  // Others
  {
    id: currentProductId++,
    name: "Ceramic Coffee Mug",
    category: "Others",
    price: 9,
    image: "https://townofceramics.in/wp-content/uploads/2023/08/3-3.jpg",
    description: "Classic ceramic mug for your favorite hot beverages.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Gift Card",
    category: "Others",
    price: 25,
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg",
    description: "Gift card for your loved ones.",
    seller: "admin",
    verified: true
  },
  {
    id: currentProductId++,
    name: "Water Bottle",
    category: "Others",
    price: 8,
    image: "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg",
    description: "Reusable stainless steel water bottle.",
    seller: "admin",
    verified: true
  }
];

const categories = ["Books", "Clothes", "Electrical Items", "Accessories", "Others"];

// Endpoint to get all categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Create default admin user if not exists
const createAdminUser = () => {
  if (!users.find(u => u.username === "admin")) {
    users.push({
      username: "admin",
      password: bcrypt.hashSync("admin123", 8), // default password
      isAdmin: true,
      wishlist: [],
      cart: [],
      address: ""
    });
  }
};
createAdminUser();

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Signup
app.post('/api/signup', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User exists' });
  }
  const hashed = await bcrypt.hash(password, 8);
  users.push({ username, password: hashed, isAdmin: !!isAdmin, wishlist: [], cart: [], address: '' });
  res.json({ message: 'Signup successful' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ username, isAdmin: user.isAdmin }, SECRET);
  res.json({ token });
});

// List products (admin sees all, users see only verified), supports search and category filter
app.get('/api/products', authenticateToken, (req, res) => {
  const { search, category } = req.query;
  let filtered = products;
  if (!req.user.isAdmin) {
    filtered = filtered.filter(p => p.verified);
  }
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (category && category !== "All") filtered = filtered.filter(p => p.category === category);
  res.json(filtered);
});

// Add product
app.post('/api/products', authenticateToken, (req, res) => {
  const { name, category, price, image, description } = req.body;
  if (!categories.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }
  products.push({
    id: currentProductId++,
    name,
    category,
    price,
    image,
    description,
    seller: req.user.username,
    verified: false
  });
  res.json({ message: 'Product listed, pending admin verification' });
});

// Admin: verify product
app.post('/api/products/:id/verify', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  product.verified = true;
  res.json({ message: 'Product verified' });
});

// Admin: delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const id = Number(req.params.id);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ message: "Product not found" });
  products.splice(idx, 1);
  res.json({ message: 'Product deleted' });
});

// Admin: edit/update product
app.put('/api/products/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const { name, category, price, image, description, discount } = req.body;
  if (name !== undefined) product.name = name;
  if (category !== undefined) {
    if (!categories.includes(category))
      return res.status(400).json({ message: "Invalid category" });
    product.category = category;
  }
  if (price !== undefined) product.price = price;
  if (image !== undefined) product.image = image;
  if (description !== undefined) product.description = description;
  if (discount !== undefined) product.discount = discount;

  res.json({ message: "Product updated", product });
});

// Add to cart
app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId } = req.body;
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.cart.includes(productId)) user.cart.push(productId);
  res.json({ cart: user.cart });
});

// Remove from cart
app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  const id = Number(req.params.id);
  user.cart = user.cart.filter(pid => pid !== id);
  res.json({ cart: user.cart });
});

// View cart
app.get('/api/cart', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  const cartItems = user.cart.map(id => products.find(p => p.id === id)).filter(Boolean);
  res.json(cartItems);
});

// Add to wishlist
app.post('/api/wishlist', authenticateToken, (req, res) => {
  const { productId } = req.body;
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.wishlist.includes(productId)) user.wishlist.push(productId);
  res.json({ wishlist: user.wishlist });
});

// Remove from wishlist
app.delete('/api/wishlist/:id', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  const id = Number(req.params.id);
  user.wishlist = user.wishlist.filter(pid => pid !== id);
  res.json({ wishlist: user.wishlist });
});

// View wishlist
app.get('/api/wishlist', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  const wishItems = user.wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);
  res.json(wishItems);
});

// Add delivery address
app.post('/api/address', authenticateToken, (req, res) => {
  const { address } = req.body;
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.address = address;
  res.json({ address });
});

// Place order (simulate payment) & return receipt
app.post('/api/order', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.address) return res.status(400).json({ message: 'Address required' });
  const cartItems = user.cart.map(id => products.find(p => p.id === id)).filter(Boolean);
  if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  // Calculate total
  const total = cartItems.reduce((sum, p) => {
    let price = p.price;
    if (p.discount) price = price - (price * p.discount) / 100;
    return sum + price;
  }, 0);

  const order = {
    id: orders.length + 1,
    user: req.user.username,
    items: cartItems,
    address: user.address,
    date: new Date(),
    status: "pending",
    total: total.toFixed(2)
  };
  orders.push(order);
  user.cart = [];

  // Return receipt details
  res.json({ message: 'Order placed!', order });
});

// Get order summary for user (shows status)
app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(o => o.user === req.user.username);
  res.json(userOrders);
});

// Admin: view all orders (for accept/reject)
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  res.json(orders);
});

// Admin: accept order
app.post('/api/admin/orders/:id/accept', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.status = "accepted";
  res.json({ message: "Order accepted" });
});

// Admin: reject order
app.post('/api/admin/orders/:id/reject', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.status = "rejected";
  res.json({ message: "Order rejected" });
});

app.listen(5000, () => console.log('Server running on port 5000'));
