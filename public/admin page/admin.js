const toggleReg = document.getElementById("toggleReg");
const regTableBody = document.querySelector("#regTable tbody");
const downloadBtn = document.getElementById("downloadBtn");
const campForm = document.getElementById("campForm");
const campList = document.getElementById("campList");
const campBattalion = document.getElementById("campBattalion");
const campName = document.getElementById("campName");
const campFilter = document.getElementById("campFilter");

// Load registration status on page load
fetch("/api/settings")
  .then(res => res.json())
  .then(data => {
    toggleReg.checked = data.registrationEnabled;
  })
  .catch(() => alert("Error loading registration status."));

toggleReg.addEventListener("change", () => {
  fetch("/api/settings", {
    method: "POST",
    body: JSON.stringify({ registrationEnabled: toggleReg.checked }),
    headers: { "Content-Type": "application/json" },
  })
    .then(() => alert("Registration state updated."))
    .catch(() => alert("Failed to update registration status."));
});

// Load registrations with optional camp filtering
function loadRegistrations() {
  const selectedCamp = campFilter.value;
  regTableBody.innerHTML = "";

  fetch("/api/registrations")
    .then(res => res.json())
    .then(registrations => {
      const filtered = selectedCamp
        ? registrations.filter(reg => reg.camp === selectedCamp)
        : registrations;

      filtered.forEach(reg => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${reg.rank}</td>
          <td>${reg.fullname}</td>
          <td>${reg.year}</td>
          <td>${reg.enroll}</td>
          <td>${reg.regnum}</td>
          <td>${reg.battalion}</td>
          <td>${reg.camp}</td>
          <td>${reg.sd || ''}</td>
          <td><button onclick="deleteRegistration('${reg._id}')">Delete</button></td>
        `;
        regTableBody.appendChild(tr);
      });
    })
    .catch(() => alert("Failed to load registrations."));
}

// Delete a specific registration
window.deleteRegistration = function(id) {
  fetch(`/api/registrations/${id}`, { method: "DELETE" })
    .then(() => loadRegistrations())
    .catch(() => alert("Failed to delete registration."));
};

// Download registrations as CSV
downloadBtn.addEventListener("click", () => {
  const selectedCamp = campFilter.value;

  fetch("/api/registrations")
    .then(res => res.json())
    .then(registrations => {
      const filtered = selectedCamp
        ? registrations.filter(r => r.camp === selectedCamp)
        : registrations;

      const csv = [
        ["Rank", "Full Name", "Year", "Enrollment", "Reg No", "Battalion", "Camp", "SD/SW"],
        ...filtered.map(r => [r.rank, r.fullname, r.year, r.enroll, r.regnum, r.battalion, r.camp, r.sd || ""])
      ];

      const blob = new Blob([csv.map(row => row.join(",")).join("\n")], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = selectedCamp ? `${selectedCamp}_registrations.csv` : "all_registrations.csv";
      a.click();
    })
    .catch(() => alert("Failed to download data."));
});

// Fetch and render all camps and update filter dropdown
function renderCamps() {
  fetch("/api/camps")
    .then(res => res.json())
    .then(campData => {
      campList.innerHTML = "";
      campFilter.innerHTML = `<option value="">-- All Camps --</option>`;

      Object.keys(campData).forEach(battalion => {
        campData[battalion].forEach(camp => {
          const badge = document.createElement("div");
          badge.className = "badge";
          badge.innerHTML = `${camp} (${battalion}) <button onclick="removeCamp('${battalion}', '${camp}')">x</button>`;
          campList.appendChild(badge);

          const option = document.createElement("option");
          option.value = camp;
          option.textContent = camp;
          campFilter.appendChild(option);
        });
      });
    })
    .catch(() => alert("Failed to load camps."));
}

// Remove a specific camp
window.removeCamp = function(battalion, camp) {
  fetch("/api/camps", {
    method: "DELETE",
    body: JSON.stringify({ battalion, camp }),
    headers: { "Content-Type": "application/json" },
  })
    .then(() => renderCamps())
    .catch(() => alert("Failed to remove camp."));
};

// Add a new camp
campForm.addEventListener("submit", e => {
  e.preventDefault();
  const battalion = campBattalion.value.trim();
  const camp = campName.value.trim();

  if (!battalion || !camp) return alert("Both fields required.");

  fetch("/api/camps", {
    method: "POST",
    body: JSON.stringify({ battalion, camp }),
    headers: { "Content-Type": "application/json" },
  })
    .then(() => {
      renderCamps();
      campForm.reset();
    })
    .catch(() => alert("Failed to add camp."));
});

// Re-load registrations when filter changes
campFilter.addEventListener("change", loadRegistrations);

// Logout
function logout() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "../login page/login.html";
}

// Initial load
loadRegistrations();
renderCamps();
