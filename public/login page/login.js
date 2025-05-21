function login() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      // You can replace these with your own credentials
      const validUsername = "PB23SDA340023";
      const validPassword = "12213835";

      if (username === validUsername && password === validPassword) {
        localStorage.setItem("isAdminLoggedIn", "true");
        window.location.href = "../admin page/admin.html";
      } else {
        errorMsg.textContent = "Invalid username or password.";
      }
    }
