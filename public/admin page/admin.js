const toggleReg = document.getElementById("toggleReg");
const regTableBody = document.querySelector("#regTable tbody");
const downloadBtn = document.getElementById("downloadBtn");
const campForm = document.getElementById("campForm");
const campList = document.getElementById("campList");
const campBattalion = document.getElementById("campBattalion");
const campName = document.getElementById("campName");

// Load registration status
fetch("/api/settings")
  .then(response => response.json())
  .then(data => {
    toggleReg.checked = data.registrationEnabled;
  });

toggleReg.addEventListener("change", () => {
  fetch("/api/settings", {
    method: "POST",
    body: JSON.stringify({ registrationEnabled: toggleReg.checked }),
    headers: { "Content-Type": "application/json" },
  }).then(() => alert("Registration state updated."));
});

// Load & render registrations
function loadRegistrations() {
  regTableBody.innerHTML = "";
  fetch("/api/registrations")
    .then(response => response.json())
    .then(registrations => {
      registrations.forEach((reg) => {
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

window.deleteRegistration = function(id) {
  fetch(`/api/registrations/${id}`, {
    method: "DELETE",
  }).then(() => loadRegistrations());
};

// CSV Download
downloadBtn.addEventListener("click", () => {
  fetch("/api/registrations")
    .then(response => response.json())
    .then(registrations => {
      const csv = [
        ["Rank", "Full Name", "Year", "Enrollment", "Reg No", "Battalion", "Camp", "SD/SW"],
        ...registrations.map(r => [r.rank, r.fullname, r.year, r.enroll, r.regnum, r.battalion, r.camp, r.sd || ""])
      ];
      const blob = new Blob([csv.map(r => r.join(",")).join("\n")], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "registrations.csv";
      a.click();
    });
});

// Camp handling (display only added camps)
function renderCamps() {
  fetch("/api/camps")
    .then(response => response.json())
    .then(campData => {
      campList.innerHTML = "";
      Object.keys(campData).forEach(battalion => {
        campData[battalion].forEach((camp, index) => {
          const badge = document.createElement("div");
          badge.className = "badge";
          badge.innerHTML = `${camp} (${battalion}) <button onclick="removeCamp('${battalion}', '${camp}')">x</button>`;
          campList.appendChild(badge);
        });
      });
    });
}

// Remove camp
window.removeCamp = function(battalion, camp) {
  fetch("/api/camps", {
    method: "DELETE",
    body: JSON.stringify({ battalion, camp }),
    headers: { "Content-Type": "application/json" },
  }).then(() => renderCamps());
};

campForm.addEventListener("submit", e => {
  e.preventDefault();
  const battalion = campBattalion.value;
  const camp = campName.value.trim();
  if (!battalion || !camp) return;

  fetch("/api/camps", {
    method: "POST",
    body: JSON.stringify({ battalion, camp }),
    headers: { "Content-Type": "application/json" },
  }).then(() => renderCamps());
});
// Init
loadRegistrations();
renderCamps();

function logout() {
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "../login page/login.html";
  }