const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

// MAIN //
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      location.assign('/');
    }
  } catch (err) {
    console.error(err.response.data.message);
  }
};

const logout = async () => {
  await fetch('/api/v1/users/logout', {
    method: 'GET',
  });
  window.location.reload(true);
};

if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
