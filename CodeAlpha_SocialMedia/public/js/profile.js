document.addEventListener('DOMContentLoaded', async () => {
  const username = getQueryParam('u');
  if (!username) {
    const user = await getCurrentUser();
    if (user) {
      window.location.href = `profile.html?u=${encodeURIComponent(user.username)}`;
      return;
    }
    window.location.href = 'login.html';
    return;
  }

  await renderHeader('profile');
  await loadProfile(username);
});

async function loadProfile(username) {
  const alertEl = document.getElementById('alert');
  clearAlert(alertEl);

  try {
    const data = await api(`/api/users/${encodeURIComponent(username)}`);
    renderProfileHeader(data);
    renderPosts(data.posts);
  } catch (err) {
    showAlert(alertEl, err.message);
    document.getElementById('profile-header').innerHTML = '';
    document.getElementById('profile-posts').innerHTML = '';
  }
}

function renderProfileHeader(data) {
  const { user, stats, is_own_profile, is_following } = data;
  const header = document.getElementById('profile-header');

  header.innerHTML = `
    <div class="profile-hero">
      <div class="profile-cover" style="${coverStyle(user.username)}"></div>
      <div class="profile-card">
        ${avatarHtml(user, 'lg')}
        <div class="profile-info">
          <h1>${escapeHtml(user.name)}</h1>
          <p class="profile-username">@${escapeHtml(user.username)}</p>
          ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : ''}
          <div class="profile-stats">
            <span class="stat-pill posts-stat"><strong>${stats.posts}</strong> posts</span>
            <span class="stat-pill followers-stat"><strong>${stats.followers}</strong> followers</span>
            <span class="stat-pill following-stat"><strong>${stats.following}</strong> following</span>
          </div>
          <div class="profile-actions" id="profile-actions"></div>
        </div>
      </div>
    </div>
  `;

  const actions = document.getElementById('profile-actions');

  if (is_own_profile) {
    actions.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="edit-profile-btn">Edit profile</button>
    `;
    document.getElementById('edit-profile-btn').addEventListener('click', () => showEditModal(user));
  } else {
    actions.innerHTML = `
      <button class="btn ${is_following ? 'btn-unfollow' : 'btn-follow'} btn-sm" id="follow-btn">
        ${is_following ? 'Unfollow' : 'Follow'}
      </button>
    `;
    document.getElementById('follow-btn').addEventListener('click', () => toggleFollow(username, is_following));
  }
}

async function toggleFollow(username, currentlyFollowing) {
  try {
    const method = currentlyFollowing ? 'DELETE' : 'POST';
    const data = await api(`/api/users/${encodeURIComponent(username)}/follow`, { method });
    const btn = document.getElementById('follow-btn');
    btn.textContent = data.following ? 'Unfollow' : 'Follow';
    btn.className = `btn ${data.following ? 'btn-unfollow' : 'btn-follow'} btn-sm`;
    btn.onclick = () => toggleFollow(username, data.following);

    document.querySelector('.followers-stat').innerHTML = `<strong>${data.stats.followers}</strong> followers`;
  } catch (err) {
    if (err.message === 'Authentication required') {
      window.location.href = 'login.html';
    }
  }
}

function showEditModal(user) {
  const modal = document.getElementById('edit-modal');
  modal.style.display = 'flex';
  document.getElementById('edit-name').value = user.name;
  document.getElementById('edit-bio').value = user.bio || '';
  document.getElementById('edit-avatar').value = user.avatar_url || '';
}

function renderPosts(posts) {
  const container = document.getElementById('profile-posts');

  if (!posts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No posts yet</h3>
        <p>This user hasn't shared anything.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  posts.forEach((post) => {
    container.appendChild(renderPostCard(post, { showComments: true }));
  });
}

document.getElementById('edit-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('edit-alert');
  clearAlert(alertEl);

  try {
    await api('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        name: document.getElementById('edit-name').value,
        bio: document.getElementById('edit-bio').value,
        avatar_url: document.getElementById('edit-avatar').value
      })
    });
    document.getElementById('edit-modal').style.display = 'none';
    await loadProfile(getQueryParam('u'));
  } catch (err) {
    showAlert(alertEl, err.message);
  }
});

document.getElementById('close-modal')?.addEventListener('click', () => {
  document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('edit-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'edit-modal') {
    document.getElementById('edit-modal').style.display = 'none';
  }
});
