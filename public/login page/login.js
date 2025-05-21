async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");

  try {
    const res = await fetch('https://ncc-campregistration-l6f6.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("isAdminLoggedIn", "true");
      window.location.href = "../admin.html";
    } else {
      errorMsg.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    errorMsg.textContent = "Server error. Try again later.";
  }
}
