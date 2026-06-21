let cartState = { items: [], subtotal: 0, isGuest: true };

function renderCart() {
  const container = document.getElementById('cart-content');
  const { items, subtotal, isGuest } = cartState;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <p>Browse our products and add something you like.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:1rem;display:inline-flex">Continue Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${items.map((item) => `
          <div class="cart-item" data-product-id="${item.product_id}">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-info">
              <h3>${item.name}</h3>
              <p class="cart-item-price">${formatPrice(item.price)} each</p>
            </div>
            <div class="cart-item-actions">
              <div class="quantity-control">
                <button class="qty-minus" data-id="${item.product_id}">−</button>
                <input type="number" class="qty-input" data-id="${item.product_id}"
                       value="${item.quantity}" min="1" max="${item.stock}">
                <button class="qty-plus" data-id="${item.product_id}">+</button>
              </div>
              <button class="btn btn-danger btn-remove" data-id="${item.product_id}">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:1rem">
          Proceed to Checkout
        </a>
        ${isGuest ? '<p style="margin-top:0.75rem;font-size:0.85rem;color:var(--muted)">You will need to log in at checkout.</p>' : ''}
      </div>
    </div>
  `;

  bindCartEvents();
}

function bindCartEvents() {
  const alert = document.getElementById('alert');

  document.querySelectorAll('.qty-minus').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id, 10);
      const item = cartState.items.find((i) => i.product_id === id);
      if (item && item.quantity > 1) {
        await updateCartQuantity(id, item.quantity - 1, cartState.isGuest);
        await refreshCart();
      }
    });
  });

  document.querySelectorAll('.qty-plus').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id, 10);
      const item = cartState.items.find((i) => i.product_id === id);
      if (item && item.quantity < item.stock) {
        await updateCartQuantity(id, item.quantity + 1, cartState.isGuest);
        await refreshCart();
      }
    });
  });

  document.querySelectorAll('.qty-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const id = parseInt(input.dataset.id, 10);
      const item = cartState.items.find((i) => i.product_id === id);
      let qty = parseInt(input.value, 10);
      if (qty < 1) qty = 1;
      if (item && qty > item.stock) qty = item.stock;
      try {
        await updateCartQuantity(id, qty, cartState.isGuest);
        await refreshCart();
      } catch (err) {
        showAlert(alert, err.message);
      }
    });
  });

  document.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await removeFromCart(parseInt(btn.dataset.id, 10), cartState.isGuest);
      await refreshCart();
    });
  });
}

async function refreshCart() {
  cartState = await loadCartItems();
  renderCart();
  await updateCartBadge();
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader('cart');
  await refreshCart();
});
