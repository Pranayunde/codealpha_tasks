document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader('cart');

  const container = document.getElementById('checkout-content');
  const alert = document.getElementById('alert');
  const user = await getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <div class="auth-container">
        <h1>Login Required</h1>
        <p style="text-align:center;margin-bottom:1.5rem;color:var(--muted)">
          Please log in or create an account to complete your order.
        </p>
        <a href="login.html?redirect=checkout.html" class="btn btn-primary btn-block">Login</a>
        <p class="auth-footer">Don't have an account? <a href="register.html?redirect=checkout.html">Register</a></p>
      </div>
    `;
    return;
  }

  await syncGuestCart();
  const { items, subtotal } = await loadCartItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <a href="index.html" class="btn btn-primary" style="margin-top:1rem;display:inline-flex">Continue Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cart-layout">
      <div>
        <h2 style="margin-bottom:1rem">Shipping Details</h2>
        <form id="checkout-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" value="${user.name}" required>
          </div>
          <div class="form-group">
            <label for="address">Shipping Address</label>
            <textarea id="address" rows="3" placeholder="Street, City, State, ZIP" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Place Order</button>
        </form>
      </div>
      <div class="cart-summary">
        <h2>Order Summary</h2>
        ${items.map((item) => `
          <div class="summary-row">
            <span>${item.name} × ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert(alert);

    const address = document.getElementById('address').value.trim();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      const { order } = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: address })
      });

      window.location.href = `orders.html?success=${order.id}`;
    } catch (err) {
      showAlert(alert, err.message);
      btn.disabled = false;
      btn.textContent = 'Place Order';
    }
  });
});
