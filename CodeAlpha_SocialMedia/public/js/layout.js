async function renderHeader(activePage = '') {
  const user = await getCurrentUser();
  const header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML = `
    <div class="container header-inner">
      <a href="index.html" class="logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">ConnectHub</span>
      </a>
      <nav>
        <a href="index.html" class="nav-link ${activePage === 'feed' ? 'active' : ''}">Feed</a>
        ${user ? `<a href="profile.html?u=${encodeURIComponent(user.username)}" class="nav-link ${activePage === 'profile' ? 'active' : ''}">Profile</a>` : ''}
        <div class="user-menu">
          ${user
            ? `<span class="user-chip">${avatarHtml(user, 'xs')} @${escapeHtml(user.username)}</span>
               <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>`
            : `<a href="login.html" class="btn btn-secondary btn-sm">Login</a>
               <a href="register.html" class="btn btn-primary btn-sm">Sign up</a>`
          }
        </div>
      </nav>
    </div>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = 'index.html';
  });
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <p>&copy; ${new Date().getFullYear()} ConnectHub — Express.js &amp; SQLite</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
});
