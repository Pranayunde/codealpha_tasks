document.addEventListener('DOMContentLoaded', async () => {
  await renderHeader();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertEl = document.getElementById('alert');
      clearAlert(alertEl);

      try {
        await api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        });
        window.location.href = 'index.html';
      } catch (err) {
        showAlert(alertEl, err.message);
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertEl = document.getElementById('alert');
      clearAlert(alertEl);

      try {
        await api('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: document.getElementById('username').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        });
        window.location.href = 'index.html';
      } catch (err) {
        showAlert(alertEl, err.message);
      }
    });
  }
});
