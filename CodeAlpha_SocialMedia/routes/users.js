const express = require('express');
const db = require('../db/database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    bio: row.bio || '',
    avatar_url: row.avatar_url || '',
    created_at: row.created_at
  };
}

function getProfileStats(userId) {
  const posts = db.prepare('SELECT COUNT(*) AS count FROM posts WHERE user_id = ?').get(userId).count;
  const followers = db.prepare('SELECT COUNT(*) AS count FROM followers WHERE following_id = ?').get(userId).count;
  const following = db.prepare('SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?').get(userId).count;
  return { posts, followers, following };
}

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

router.put('/me', authRequired, (req, res) => {
  const { name, bio, avatar_url } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.prepare(`
    UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?
  `).run(name.trim(), (bio || '').trim(), (avatar_url || '').trim(), req.user.id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: publicUser(user) });
});

router.get('/:username', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = getProfileStats(user.id);
  const currentUserId = req.user?.id || null;
  const isOwnProfile = currentUserId === user.id;
  const isFollowing = currentUserId && !isOwnProfile
    ? !!db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, user.id)
    : false;

  const posts = db.prepare(`
    SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC
  `).all(user.id).map((post) => enrichPost(post, currentUserId));

  res.json({
    user: publicUser(user),
    stats,
    is_own_profile: isOwnProfile,
    is_following: isFollowing,
    posts
  });
});

router.post('/:username/follow', authRequired, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (target.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  const existing = db.prepare(
    'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?'
  ).get(req.user.id, target.id);

  if (existing) {
    return res.json({ following: true, message: 'Already following' });
  }

  db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(req.user.id, target.id);
  const stats = getProfileStats(target.id);
  res.status(201).json({ following: true, stats });
});

router.delete('/:username/follow', authRequired, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(req.user.id, target.id);
  const stats = getProfileStats(target.id);
  res.json({ following: false, stats });
});

module.exports = router;
