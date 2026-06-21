async function renderHeader(activePage = '') {
  const user = await getCurrentUser();
  const header = document.getElementById('site-header');
  if (!header) return;

  const navLinks = [
    { href: 'index.html', label: 'Shop', id: 'shop' },
    { href: 'cart.html', label: 'Cart', id: 'cart' }
  ];

  if (user) {
    navLinks.push({ href: 'orders.html', label: 'Orders', id: 'orders' });
  }

  header.innerHTML = `
    <div class="container header-inner">
      <a href="index.html" class="logo">ShopApp</a>
      <nav>
        ${navLinks.map((l) => `
          <a href="${l.href}" class="${activePage === l.id ? 'active' : ''}">${l.label}</a>
        `).join('')}
        <a href="cart.html" class="cart-link">
          🛒 <span id="cart-count" class="cart-badge" style="display:none">0</span>
        </a>
        <div class="user-menu">
          ${user
            ? `<span class="user-name">Hi, ${user.name}</span>
               <button class="btn btn-secondary" id="logout-btn">Logout</button>`
            : `<a href="login.html" class="btn btn-secondary">Login</a>
               <a href="register.html" class="btn btn-primary">Register</a>`
          }
        </div>
      </nav>
    </div>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = 'index.html';
  });

  await updateCartBadge();
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <p>&copy; ${new Date().getFullYear()} ShopApp. Built with Express.js &amp; SQLite.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
});
