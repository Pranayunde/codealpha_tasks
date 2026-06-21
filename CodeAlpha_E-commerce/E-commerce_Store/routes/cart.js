const express = require('express');
const db = require('../db/database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function getCartItems(userId) {
  return db.prepare(`
    SELECT ci.id, ci.product_id, ci.quantity,
           p.name, p.price, p.image_url, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id ASC
  `).all(userId);
}

router.get('/', authRequired, (req, res) => {
  const items = getCartItems(req.user.id);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, subtotal });
});

router.post('/', authRequired, (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ error: 'Valid productId and quantity required' });
  }

  const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.prepare(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, productId);

  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} items available` });
  }

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
    ).run(req.user.id, productId, quantity);
  }

  const items = getCartItems(req.user.id);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, subtotal });
});

router.put('/:productId', authRequired, (req, res) => {
  const { quantity } = req.body;
  const productId = parseInt(req.params.productId, 10);

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} items available` });
  }

  const result = db.prepare(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?'
  ).run(quantity, req.user.id, productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  const items = getCartItems(req.user.id);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, subtotal });
});

router.delete('/:productId', authRequired, (req, res) => {
  db.prepare(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).run(req.user.id, parseInt(req.params.productId, 10));

  const items = getCartItems(req.user.id);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, subtotal });
});

router.post('/sync', authRequired, (req, res) => {
  const { items: guestItems } = req.body;
  if (!Array.isArray(guestItems)) {
    return res.status(400).json({ error: 'Items array required' });
  }

  for (const { productId, quantity } of guestItems) {
    if (!productId || quantity < 1) continue;

    const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
    if (!product) continue;

    const existing = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?'
    ).get(req.user.id, productId);

    const newQty = Math.min(
      (existing ? existing.quantity : 0) + quantity,
      product.stock
    );

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
      ).run(req.user.id, productId, newQty);
    }
  }

  const items = getCartItems(req.user.id);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, subtotal });
});

module.exports = router;
