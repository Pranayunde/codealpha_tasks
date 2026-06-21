const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT id, name, description, price, image_url, stock, category FROM products WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  sql += ' ORDER BY name ASC';
  const products = db.prepare(sql).all(...params);
  res.json({ products });
});

router.get('/categories', (req, res) => {
  const categories = db.prepare(
    'SELECT DISTINCT category FROM products ORDER BY category'
  ).all().map((r) => r.category);
  res.json({ categories });
});

router.get('/:id', (req, res) => {
  const product = db.prepare(
    'SELECT id, name, description, price, image_url, stock, category FROM products WHERE id = ?'
  ).get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product });
});

module.exports = router;
