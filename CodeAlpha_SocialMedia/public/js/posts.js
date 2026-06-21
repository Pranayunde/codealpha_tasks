function renderPostCard(post, { showComments = false, onUpdate } = {}) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post.id;
  card.style.setProperty('--post-accent', getUserPalette(post.author.username).accent);

  card.innerHTML = `
    <div class="post-header">
      ${avatarHtml(post.author, 'sm')}
      <div class="post-meta">
        <a href="profile.html?u=${encodeURIComponent(post.author.username)}" class="post-author">${escapeHtml(post.author.name)}</a>
        <span class="post-handle">@${escapeHtml(post.author.username)}</span>
        <span class="post-time">${formatDate(post.created_at)}</span>
      </div>
    </div>
    <p class="post-content">${escapeHtml(post.content)}</p>
    <div class="post-actions">
      <button class="action-btn like-btn ${post.liked_by_me ? 'active' : ''}" data-liked="${post.liked_by_me}">
        <span class="icon">${post.liked_by_me ? '♥' : '♡'}</span>
        <span class="like-count">${post.like_count}</span>
      </button>
      <button class="action-btn comment-toggle-btn">
        <span class="icon">💬</span>
        <span class="comment-count">${post.comment_count}</span>
      </button>
    </div>
    <div class="comments-section" style="display: ${showComments ? 'block' : 'none'}">
      <div class="comments-list"></div>
      <form class="comment-form">
        <input type="text" placeholder="Write a comment..." maxlength="300" required>
        <button type="submit" class="btn btn-primary btn-sm">Reply</button>
      </form>
    </div>
  `;

  const likeBtn = card.querySelector('.like-btn');
  likeBtn.addEventListener('click', async () => {
    try {
      const data = await api(`/api/posts/${post.id}/like`, { method: 'POST' });
      likeBtn.classList.toggle('active', data.liked);
      likeBtn.dataset.liked = data.liked;
      likeBtn.querySelector('.icon').textContent = data.liked ? '♥' : '♡';
      likeBtn.querySelector('.like-count').textContent = data.like_count;
      if (onUpdate) onUpdate();
    } catch (err) {
      if (err.message === 'Authentication required') {
        window.location.href = 'login.html';
      }
    }
  });

  const toggleBtn = card.querySelector('.comment-toggle-btn');
  const commentsSection = card.querySelector('.comments-section');
  toggleBtn.addEventListener('click', () => {
    const visible = commentsSection.style.display !== 'none';
    commentsSection.style.display = visible ? 'none' : 'block';
    if (!visible) loadComments(card, post.id);
  });

  const commentForm = card.querySelector('.comment-form');
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = commentForm.querySelector('input');
    const content = input.value.trim();
    if (!content) return;

    try {
      await api(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      input.value = '';
      await loadComments(card, post.id);
      const countEl = card.querySelector('.comment-count');
      countEl.textContent = Number(countEl.textContent) + 1;
      if (onUpdate) onUpdate();
    } catch (err) {
      if (err.message === 'Authentication required') {
        window.location.href = 'login.html';
      }
    }
  });

  if (showComments) loadComments(card, post.id);

  return card;
}

async function loadComments(card, postId) {
  const list = card.querySelector('.comments-list');
  list.innerHTML = '<p class="loading-sm">Loading comments...</p>';

  try {
    const data = await api(`/api/posts/${postId}/comments`);
    if (!data.comments.length) {
      list.innerHTML = '<p class="empty-sm">No comments yet.</p>';
      return;
    }
    list.innerHTML = data.comments.map((c) => `
      <div class="comment">
        ${avatarHtml(c.author, 'xs')}
        <div class="comment-body">
          <a href="profile.html?u=${encodeURIComponent(c.author.username)}" class="comment-author">${escapeHtml(c.author.name)}</a>
          <span class="comment-time">${formatDate(c.created_at)}</span>
          <p>${escapeHtml(c.content)}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="empty-sm">${escapeHtml(err.message)}</p>`;
  }
}
