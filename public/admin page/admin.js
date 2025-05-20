const toggleReg = document.getElementById("toggleReg");
const regTableBody = document.querySelector("#regTable tbody");
const downloadBtn = document.getElementById("downloadBtn");
const campForm = document.getElementById("campForm");
const campList = document.getElementById("campList");
const campBattalion = document.getElementById("campBattalion");
const campName = document.getElementById("campName");
const campFilter = document.getElementById("campFilter");
const registrationsBody = document.getElementById("registrationsBody");

// Load registration status
fetch("https://ncc-campregistration-l6f6.onrender.com/api/settings")
  .then(res => res.json())
  .then(data => {
    toggleReg.checked = data.registrationEnabled;
  });

toggleReg.addEventListener("change", () => {
  fetch("https://ncc-campregistration-l6f6.onrender.com/api/settings", {
    method: "POST",
    body: JSON.stringify({ registrationEnabled: toggleReg.checked }),
    headers: { "Content-Type": "application/json" },
  }).then(() => alert("Registration state updated."));
});

// Load & render registrations (filtered)
function loadRegistrations() {
  const selectedCamp = campFilter.value;
  regTableBody.innerHTML = "";
  fetch("https://ncc-campregistration-l6f6.onrender.com/api/registrations")
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
    });
}

// Delete registration
window.deleteRegistration = function(id) {
  fetch(`https://ncc-campregistration-l6f6.onrender.com/api/registrations/${id}`, { method: "DELETE" }).then(() => loadRegistrations());
};

// Download filtered CSV
downloadBtn.addEventListener("click", () => {
  const selectedCamp = campFilter.value;
  fetch("https://ncc-campregistration-l6f6.onrender.com/api/registrations")
    .then(res => res.json())
    .then(registrations => {
      const filtered = selectedCamp
        ? registrations.filter(r => r.camp === selectedCamp)
        : registrations;

      const csv = [
        ["Rank", "Full Name", "Year", "Enrollment", "Reg No", "Battalion", "Camp", "SD/SW"],
        ...filtered.map(r => [r.rank, r.fullname, r.year, r.enroll, r.regnum, r.battalion, r.camp, r.sd || ""])
      ];

      const blob = new Blob([csv.map(r => r.join(",")).join("\n")], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = selectedCamp ? `${selectedCamp}_registrations.csv` : "all_registrations.csv";
      a.click();
    });
});

// Camp handling (display + populate filter)
function renderCamps() {
  fetch("https://ncc-campregistration-l6f6.onrender.com/api/camps")
    .then(res => res.json())
    .then(campData => {
      campList.innerHTML = "";
      campFilter.innerHTML = `<option value="">-- All Camps --</option>`; // reset filter list

      Object.keys(campData).forEach(battalion => {
        campData[battalion].forEach(camp => {
          // Camp Badge
          const badge = document.createElement("div");
          badge.className = "badge";
          badge.innerHTML = `${camp} (${battalion}) <button onclick="removeCamp('${battalion}', '${camp}')">x</button>`;
          campList.appendChild(badge);

          // Add to filter dropdown
          const option = document.createElement("option");
          option.value = camp;
          option.textContent = camp;
          campFilter.appendChild(option);
        });
      });
    });
}

// Remove camp
window.removeCamp = function(battalion, camp) {
  fetch("https://ncc-campregistration-l6f6.onrender.com/api/camps", {
    method: "DELETE",
    body: JSON.stringify({ battalion, camp }),
    headers: { "Content-Type": "application/json" },
  }).then(() => renderCamps());
};

// Add new camp
campForm.addEventListener("submit", e => {
  e.preventDefault();
  const battalion = campBattalion.value;
  const camp = campName.value.trim();
  if (!battalion || !camp) return;

  fetch("https://ncc-campregistration-l6f6.onrender.com/api/camps", {
    method: "POST",
    body: JSON.stringify({ battalion, camp }),
    headers: { "Content-Type": "application/json" },
  }).then(() => renderCamps());
});

// Trigger reload on camp filter change
campFilter.addEventListener("change", loadRegistrations);

// Init
loadRegistrations();
renderCamps();




// Check login status
if (localStorage.getItem("isAdminLoggedIn") !== "true") {
  window.location.href = "./login page/login.html";
}
// Toggle menu
document.getElementById("menuToggle").addEventListener("click", function () {
  const menu = document.getElementById("menuOptions");
  menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
});
// Logout
function logout() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "./login page/login.html";
}
