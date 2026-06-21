document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader('shop');

  const id = getQueryParam('id');
  const container = document.getElementById('product-detail');
  const alert = document.getElementById('alert');

  if (!id) {
    container.innerHTML = '<p class="empty-state">Product not found.</p>';
    return;
  }

  try {
    const { product } = await api(`/api/products/${id}`);

    container.innerHTML = `
      <div class="product-detail">
        <img src="${product.image_url}" alt="${product.name}">
        <div>
          <span class="product-category">${product.category}</span>
          <h1>${product.name}</h1>
          <p class="price">${formatPrice(product.price)}</p>
          <p class="description">${product.description}</p>
          <p class="stock-info ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          ${product.stock > 0 ? `
            <div class="quantity-control">
              <button type="button" id="qty-minus">−</button>
              <input type="number" id="quantity" value="1" min="1" max="${product.stock}">
              <button type="button" id="qty-plus">+</button>
            </div>
            <button class="btn btn-primary" id="add-to-cart">Add to Cart</button>
          ` : ''}
        </div>
      </div>
    `;

    document.title = `${product.name} - ShopApp`;

    const qtyInput = document.getElementById('quantity');
    if (qtyInput) {
      document.getElementById('qty-minus').addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
      });
      document.getElementById('qty-plus').addEventListener('click', () => {
        qtyInput.value = Math.min(product.stock, parseInt(qtyInput.value, 10) + 1);
      });

      document.getElementById('add-to-cart').addEventListener('click', async () => {
        try {
          const qty = parseInt(qtyInput.value, 10);
          await addToCart(product.id, qty);
          showAlert(alert, `Added ${qty} item(s) to cart!`, 'success');
        } catch (err) {
          showAlert(alert, err.message);
        }
      });
    }
  } catch (err) {
    container.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
});
