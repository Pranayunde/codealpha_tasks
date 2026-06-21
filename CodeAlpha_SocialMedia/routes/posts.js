const express = require('express');
const db = require('../db/database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function enrichPost(post, currentUserId) {
  const author = db.prepare('SELECT id, username, name, avatar_url FROM users WHERE id = ?').get(post.user_id);
  const likeCount = db.prepare('SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?').get(post.id).count;
  const commentCount = db.prepare('SELECT COUNT(*) AS count FROM comments WHERE post_id = ?').get(post.id).count;
  const likedByMe = currentUserId
    ? !!db.prepare('SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?').get(currentUserId, post.id)
    : false;

  return {
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    author,
    like_count: likeCount,
    comment_count: commentCount,
    liked_by_me: likedByMe
  };
}

function enrichComment(comment) {
  const author = db.prepare('SELECT id, username, name, avatar_url FROM users WHERE id = ?').get(comment.user_id);
  return {
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    author
  };
}

router.get('/', (req, res) => {
  const currentUserId = req.user?.id || null;
  const followingOnly = req.query.following === 'true';

  let posts;
  if (followingOnly && currentUserId) {
    posts = db.prepare(`
      SELECT p.* FROM posts p
      JOIN followers f ON f.following_id = p.user_id
      WHERE f.follower_id = ?
      ORDER BY p.created_at DESC
    `).all(currentUserId);
  } else {
    posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  }

  res.json({ posts: posts.map((post) => enrichPost(post, currentUserId)) });
});

router.post('/', authRequired, (req, res) => {
  const { content } = req.body;
  const trimmed = (content || '').trim();

  if (!trimmed) {
    return res.status(400).json({ error: 'Post content is required' });
  }
  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'Post must be 500 characters or fewer' });
  }

  const result = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run(req.user.id, trimmed);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ post: enrichPost(post, req.user.id) });
});

router.get('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const currentUserId = req.user?.id || null;
  const comments = db.prepare(`
    SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC
  `).all(post.id).map(enrichComment);

  res.json({
    post: enrichPost(post, currentUserId),
    comments
  });
});

router.post('/:id/like', authRequired, (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const existing = db.prepare(
    'SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?'
  ).get(req.user.id, post.id);

  if (existing) {
    db.prepare('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?').run(req.user.id, post.id);
  } else {
    db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, post.id);
  }

  const likeCount = db.prepare('SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?').get(post.id).count;
  const likedByMe = !existing;

  res.json({ liked: likedByMe, like_count: likeCount });
});

router.get('/:id/comments', (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comments = db.prepare(`
    SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC
  `).all(post.id).map(enrichComment);

  res.json({ comments });
});

router.post('/:id/comments', authRequired, (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const trimmed = (req.body.content || '').trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  if (trimmed.length > 300) {
    return res.status(400).json({ error: 'Comment must be 300 characters or fewer' });
  }

  const result = db.prepare(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
  ).run(post.id, req.user.id, trimmed);

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ comment: enrichComment(comment) });
});

module.exports = router;
