const bcrypt = require('bcryptjs');
const db = require('./database');

const seeded = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
if (seeded > 0) {
  module.exports = db;
  return;
}

const passwordHash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(`
  INSERT INTO users (username, email, password_hash, name, bio, avatar_url)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const users = [
  ['alice', 'alice@example.com', passwordHash, 'Alice Chen', 'Coffee lover & photographer.', 'https://i.pravatar.cc/150?u=alice'],
  ['bob', 'bob@example.com', passwordHash, 'Bob Martinez', 'Building cool things on the web.', 'https://i.pravatar.cc/150?u=bob'],
  ['carol', 'carol@example.com', passwordHash, 'Carol Davis', 'Travel, food, and good books.', 'https://i.pravatar.cc/150?u=carol']
];

const userIds = users.map((u) => insertUser.run(...u).lastInsertRowid);

const insertPost = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)');
const posts = [
  [userIds[0], 'Just finished a morning hike. The view was incredible!'],
  [userIds[0], 'Anyone have book recommendations for the weekend?'],
  [userIds[1], 'Shipped a new project today. Feels great to see it live.'],
  [userIds[2], 'Best pasta in town — highly recommend the little place on 5th.'],
  [userIds[1], 'Hot take: tabs over spaces. Fight me.']
];

const postIds = posts.map((p) => insertPost.run(...p).lastInsertRowid);

db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(userIds[1], userIds[0]);
db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(userIds[2], userIds[0]);
db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(userIds[0], userIds[1]);

db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(userIds[1], postIds[0]);
db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(userIds[2], postIds[0]);
db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(userIds[0], postIds[2]);

db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)').run(
  postIds[0],
  userIds[1],
  'Looks amazing! Where was this?'
);
db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)').run(
  postIds[2],
  userIds[0],
  'Congrats! Would love to check it out.'
);

console.log('Seeded demo users (password: password123): alice, bob, carol');
