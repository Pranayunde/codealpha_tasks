function getRedirect() {
  return getQueryParam('redirect') || 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader('');

  const isRegister = document.getElementById('register-form');
  const isLogin = document.getElementById('login-form');
  const alert = document.getElementById('alert');
  const redirect = getRedirect();

  if (isRegister) {
    document.querySelector('.auth-footer a').href = `login.html?redirect=${redirect}`;

    isRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert(alert);

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;

      try {
        await api('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        });

        await syncGuestCart();
        window.location.href = redirect;
      } catch (err) {
        showAlert(alert, err.message);
        btn.disabled = false;
      }
    });
  }

  if (isLogin) {
    document.querySelector('.auth-footer a').href = `register.html?redirect=${redirect}`;

    isLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert(alert);

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;

      try {
        await api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        });

        await syncGuestCart();
        window.location.href = redirect;
      } catch (err) {
        showAlert(alert, err.message);
        btn.disabled = false;
      }
    });
  }
});
