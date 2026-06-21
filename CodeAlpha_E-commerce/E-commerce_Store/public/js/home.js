let allProducts = [];

async function loadCategories() {
  const data = await api('/api/products/categories');
  const select = document.getElementById('category');
  data.categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function renderProducts(products) {
  const container = document.getElementById('products');

  if (products.length === 0) {
    container.innerHTML = '<p class="empty-state">No products found.</p>';
    return;
  }

  container.innerHTML = products.map((p) => `
    <article class="product-card">
      <a href="product.html?id=${p.id}">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy">
      </a>
      <div class="product-card-body">
        <span class="product-category">${p.category}</span>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p class="product-price">${formatPrice(p.price)}</p>
        <button class="btn btn-primary add-to-cart" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
          ${p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const alert = document.getElementById('alert');
      try {
        await addToCart(parseInt(btn.dataset.id, 10));
        showAlert(alert, 'Added to cart!', 'success');
        setTimeout(() => clearAlert(alert), 2000);
      } catch (err) {
        showAlert(alert, err.message);
      }
    });
  });
}

function filterProducts() {
  const search = document.getElementById('search').value.toLowerCase();
  const category = document.getElementById('category').value;

  const filtered = allProducts.filter((p) => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader('shop');

  try {
    const data = await api('/api/products');
    allProducts = data.products;
    await loadCategories();
    renderProducts(allProducts);

    document.getElementById('search').addEventListener('input', filterProducts);
    document.getElementById('category').addEventListener('change', filterProducts);
  } catch (err) {
    document.getElementById('products').innerHTML =
      `<p class="empty-state">Failed to load products: ${err.message}</p>`;
  }
});
