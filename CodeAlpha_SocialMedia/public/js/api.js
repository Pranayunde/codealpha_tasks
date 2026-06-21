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

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showAlert(container, message, type = 'error') {
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
}

function clearAlert(container) {
  if (container) container.innerHTML = '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const date = new Date(dateStr.replace(' ', 'T') + 'Z');
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const USER_PALETTES = [
  { bg: '6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', accent: '#6366f1' },
  { bg: 'ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', accent: '#ec4899' },
  { bg: '06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', accent: '#06b6d4' },
  { bg: 'f97316', gradient: 'linear-gradient(135deg, #f97316, #eab308)', accent: '#f97316' },
  { bg: '10b981', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)', accent: '#10b981' },
  { bg: '8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)', accent: '#8b5cf6' },
  { bg: 'ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f97316)', accent: '#ef4444' }
];

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80'
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getUserPalette(key) {
  return USER_PALETTES[hashString(key || 'user') % USER_PALETTES.length];
}

function getCoverImage(key) {
  return COVER_IMAGES[hashString(key || 'cover') % COVER_IMAGES.length];
}

function avatarHtml(user, size = 'md') {
  const name = user.name || user.username || '?';
  const pxMap = { xs: 56, sm: 84, md: 96, lg: 192 };
  const px = pxMap[size] || 96;

  if (user.avatar_url) {
    return `<img class="avatar avatar-${size}" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(name)}">`;
  }

  const palette = getUserPalette(user.username || name);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${palette.bg}&color=fff&size=${px}&bold=true&format=svg`;
  return `<img class="avatar avatar-${size}" src="${avatarUrl}" alt="${escapeHtml(name)}">`;
}

function coverStyle(username) {
  const palette = getUserPalette(username);
  const image = getCoverImage(username);
  return `background-image: linear-gradient(135deg, rgb(99 102 241 / 0.55), rgb(236 72 153 / 0.45)), url('${image}');`;
}
