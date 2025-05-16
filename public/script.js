document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  const container = document.getElementById("registrationContainer");
  const closedMessage = document.getElementById("closedMessage");
  const serverError = document.getElementById("serverError");
  const thankYouMessage = document.getElementById("thankYouMessage");
  const submitAgainBtn = document.getElementById("submitAgainBtn");


    // Dynamically detect backend URL (helpful for Render deployment)
  const BASE_URL = location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : ""; // Same origin for deployed frontend/backend on Render


  fetch('${BASE_URL}/api/settings')
    .then(response => {
      if (!response.ok) throw new Error("Server error");
      return response.json();
    })
    .then(data => {
      if (!data.registrationEnabled) {
        container.style.display = "none";
        closedMessage.style.display = "block";
        return;
      }

      const battalionSelect = document.getElementById("battalion");
      const campSelect = document.getElementById("camp");

      fetch("${BASE_URL}/api/camps")
        .then(response => response.json())
        .then(campData => {
          battalionSelect.addEventListener("change", () => {
            const selected = battalionSelect.value;
            const camps = campData[selected] || [];
            campSelect.innerHTML = "<option value=''>Select Camp</option>";
            camps.forEach(c => {
              const opt = document.createElement("option");
              opt.value = c;
              opt.textContent = c;
              campSelect.appendChild(opt);
            });
          });
        });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const regnum = formData.get("regnum");
        const camp = formData.get("camp");

        try {
          const res = await fetch('${BASE_URL}/api/registrations');
          const registrations = await res.json();

          const duplicate = registrations.find(
            r => r.regnum === regnum && r.camp === camp
          );

          if (duplicate) {
            alert("This registration number is already registered for this camp.");
            return;
          }

          await fetch('${BASE_URL}/api/register', {
            method: "POST",
            body: formData,
          });

          form.reset();
          container.style.display = "none";
          thankYouMessage.style.display = "block";
        } catch (err) {
          alert("Error submitting form. Please try again.");
        }
      });
    })
    .catch(() => {
      container.style.display = "none";
      closedMessage.style.display = "none";
      serverError.style.display = "block";
    });

  submitAgainBtn.addEventListener("click", () => {
    thankYouMessage.style.display = "none";
    container.style.display = "block";
  });
});
