const db = require('./database');

function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count > 0) {
    return false;
  }

  const products = [
  {
    name: 'Wireless Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    stock: 25,
    category: 'Electronics'
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor, GPS, and water resistance.',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
    stock: 18,
    category: 'Electronics'
  },
  {
    name: 'Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment and multiple pockets.',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=400&fit=crop',
    stock: 40,
    category: 'Accessories'
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning for all-day comfort.',
    price: 119.99,
    image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop',
    stock: 32,
    category: 'Footwear'
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'Handmade ceramic mug with ergonomic handle, holds 12oz. Dishwasher safe.',
    price: 18.99,
    image_url: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&h=400&fit=crop',
    stock: 100,
    category: 'Home'
  },
  {
    name: 'Desk Lamp',
    description: 'Adjustable LED desk lamp with three brightness levels and warm/cool light modes.',
    price: 45.99,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop',
    stock: 22,
    category: 'Home'
  },
  {
    name: 'Sunglasses',
    description: 'Polarized UV400 protection sunglasses with lightweight titanium frame.',
    price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    stock: 15,
    category: 'Accessories'
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker with 360° sound and 12-hour playtime.',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop',
    stock: 28,
    category: 'Electronics'
  }
  ];

  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image_url, stock, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.name, item.description, item.price, item.image_url, item.stock, item.category);
    }
  });

  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  return true;
}

if (require.main === module) {
  const seeded = seed();
  if (!seeded) {
    console.log('Database already seeded.');
  }
} else {
  seed();
}

module.exports = seed;
