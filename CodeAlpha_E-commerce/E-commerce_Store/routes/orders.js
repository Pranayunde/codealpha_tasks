const express = require('express');
const db = require('../db/database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  const cartItems = db.prepare(`
    SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({
        error: `Insufficient stock for ${item.name}. Only ${item.stock} available.`
      });
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = db.transaction(() => {
    const order = db.prepare(`
      INSERT INTO orders (user_id, status, total, shipping_address)
      VALUES (?, 'confirmed', ?, ?)
    `).run(req.user.id, total, shippingAddress.trim());

    const orderId = order.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
      VALUES (?, ?, ?, ?)
    `);

    const updateStock = db.prepare(
      'UPDATE products SET stock = stock - ? WHERE id = ?'
    );

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      updateStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    return orderId;
  });

  try {
    const orderId = placeOrder();
    const order = getOrderById(orderId, req.user.id);
    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

function getOrderById(orderId, userId) {
  const order = db.prepare(`
    SELECT id, status, total, shipping_address, created_at
    FROM orders WHERE id = ? AND user_id = ?
  `).get(orderId, userId);

  if (!order) return null;

  const items = db.prepare(`
    SELECT oi.quantity, oi.price_at_purchase, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(orderId);

  return { ...order, items };
}

router.get('/', authRequired, (req, res) => {
  const orders = db.prepare(`
    SELECT id, status, total, shipping_address, created_at
    FROM orders WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id);

  res.json({ orders });
});

router.get('/:id', authRequired, (req, res) => {
  const order = getOrderById(parseInt(req.params.id, 10), req.user.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

module.exports = router;
