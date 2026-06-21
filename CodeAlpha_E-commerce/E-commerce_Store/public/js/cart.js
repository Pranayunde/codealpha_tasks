const GUEST_CART_KEY = 'shop_guest_cart';

function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function getGuestCartCount() {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}

async function addToCart(productId, quantity = 1) {
  const user = await getCurrentUser();

  if (user) {
    await api('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  } else {
    const cart = getGuestCart();
    const existing = cart.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    saveGuestCart(cart);
  }

  await updateCartBadge();
}

async function syncGuestCart() {
  const guestItems = getGuestCart();
  if (guestItems.length === 0) return;

  await api('/api/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items: guestItems })
  });

  localStorage.removeItem(GUEST_CART_KEY);
}

async function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  const user = await getCurrentUser();
  let count = 0;

  if (user) {
    try {
      const data = await api('/api/cart');
      count = data.items.reduce((sum, item) => sum + item.quantity, 0);
    } catch {
      count = 0;
    }
  } else {
    count = getGuestCartCount();
  }

  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline' : 'none';
}

async function loadCartItems() {
  const user = await getCurrentUser();

  if (user) {
    const data = await api('/api/cart');
    return { items: data.items, subtotal: data.subtotal, isGuest: false };
  }

  const guestItems = getGuestCart();
  if (guestItems.length === 0) {
    return { items: [], subtotal: 0, isGuest: true };
  }

  const products = await api('/api/products');
  const productMap = Object.fromEntries(products.products.map((p) => [p.id, p]));

  const items = guestItems
    .map((gi) => {
      const p = productMap[gi.productId];
      if (!p) return null;
      return {
        product_id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        stock: p.stock,
        quantity: gi.quantity
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal, isGuest: true };
}

async function updateCartQuantity(productId, quantity, isGuest) {
  if (isGuest) {
    const cart = getGuestCart();
    const item = cart.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
    saveGuestCart(cart);
  } else {
    await api(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }
}

async function removeFromCart(productId, isGuest) {
  if (isGuest) {
    const cart = getGuestCart().filter((i) => i.productId !== productId);
    saveGuestCart(cart);
  } else {
    await api(`/api/cart/${productId}`, { method: 'DELETE' });
  }
}
