async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

async function getCurrentUser() {
  try {
    const data = await api('/api/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showAlert(container, message, type = 'error') {
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function clearAlert(container) {
  if (container) container.innerHTML = '';
}
