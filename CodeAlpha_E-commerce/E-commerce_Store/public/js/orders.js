document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader('orders');

  const container = document.getElementById('orders-content');
  const alert = document.getElementById('alert');
  const user = await getCurrentUser();

  const successId = getQueryParam('success');
  if (successId) {
    showAlert(alert, `Order #${successId} placed successfully!`, 'success');
  }

  if (!user) {
    container.innerHTML = `
      <div class="auth-container">
        <h1>Login Required</h1>
        <p style="text-align:center;margin-bottom:1.5rem;color:var(--muted)">
          Log in to view your order history.
        </p>
        <a href="login.html?redirect=orders.html" class="btn btn-primary btn-block">Login</a>
      </div>
    `;
    return;
  }

  try {
    const { orders } = await api('/api/orders');

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>No orders yet</h2>
          <p>Your order history will appear here.</p>
          <a href="index.html" class="btn btn-primary" style="margin-top:1rem;display:inline-flex">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="orders-list">${orders.map((order) => `
      <div class="order-card" data-order-id="${order.id}">
        <div class="order-header">
          <div>
            <strong>Order #${order.id}</strong>
            <p style="color:var(--muted);font-size:0.85rem;margin-top:0.25rem">
              ${new Date(order.created_at + 'Z').toLocaleString()}
            </p>
          </div>
          <div style="text-align:right">
            <span class="order-status">${order.status}</span>
            <p style="font-weight:700;margin-top:0.35rem">${formatPrice(order.total)}</p>
          </div>
        </div>
        <p class="order-items-preview">Ship to: ${order.shipping_address}</p>
        <button class="btn btn-secondary view-details" data-id="${order.id}" style="margin-top:0.75rem">
          View Details
        </button>
        <div class="order-details" id="details-${order.id}" style="display:none;margin-top:1rem"></div>
      </div>
    `).join('')}</div>`;

    document.querySelectorAll('.view-details').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const detailsEl = document.getElementById(`details-${id}`);

        if (detailsEl.style.display === 'block') {
          detailsEl.style.display = 'none';
          btn.textContent = 'View Details';
          return;
        }

        const { order } = await api(`/api/orders/${id}`);
        detailsEl.innerHTML = order.items.map((item) => `
          <div class="summary-row">
            <span>${item.name} × ${item.quantity}</span>
            <span>${formatPrice(item.price_at_purchase * item.quantity)}</span>
          </div>
        `).join('');
        detailsEl.style.display = 'block';
        btn.textContent = 'Hide Details';
      });
    });
  } catch (err) {
    container.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
});
