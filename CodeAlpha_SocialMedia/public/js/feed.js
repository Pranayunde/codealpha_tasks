let currentUser = null;
let feedMode = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await getCurrentUser();
  await renderHeader('feed');

  const composeSection = document.getElementById('compose-section');
  const loginPrompt = document.getElementById('login-prompt');

  if (currentUser) {
    composeSection.style.display = 'block';
    loginPrompt.style.display = 'none';
    setupCompose();
    setupFeedTabs();
  } else {
    composeSection.style.display = 'none';
    loginPrompt.style.display = 'block';
  }

  await loadFeed();
});

function setupFeedTabs() {
  document.querySelectorAll('.feed-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feed-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      feedMode = tab.dataset.mode;
      loadFeed();
    });
  });
}

function setupCompose() {
  const form = document.getElementById('compose-form');
  const alertEl = document.getElementById('alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert(alertEl);

    const textarea = document.getElementById('post-content');
    const content = textarea.value.trim();
    if (!content) return;

    try {
      await api('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      textarea.value = '';
      showAlert(alertEl, 'Post published!', 'success');
      await loadFeed();
    } catch (err) {
      showAlert(alertEl, err.message);
    }
  });
}

async function loadFeed() {
  const container = document.getElementById('feed');
  container.innerHTML = '<p class="loading">Loading feed...</p>';

  try {
    const query = feedMode === 'following' ? '?following=true' : '';
    const data = await api(`/api/posts${query}`);

    if (!data.posts.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No posts yet</h3>
          <p>${feedMode === 'following' ? 'Follow people to see their posts here.' : 'Be the first to share something!'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    data.posts.forEach((post) => {
      container.appendChild(renderPostCard(post));
    });
  } catch (err) {
    container.innerHTML = `<p class="error-text">${escapeHtml(err.message)}</p>`;
  }
}
