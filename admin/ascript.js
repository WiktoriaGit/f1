function showPanel(name) {
  // Ukryj wszystkie panele
  document.querySelectorAll(".admin-panel").forEach(panel => {
    panel.classList.remove("active");
  });

  // Pokaż wybrany panel
  const panelToShow = document.getElementById(`panel-${name}`);
  if (panelToShow) {
    panelToShow.classList.add("active");
  }

  // Dynamiczne ładowanie zawartości
  if (name === "users") {
    loadUsers();
  }

  if (name === "exhibits") {
    loadExhibits();
  }
}

  
  // Domyślnie pokaż zakładkę "Eksponaty"
  window.onload = () => showPanel('exhibits');
  
  //zeby sie nie zwijało
  function toggleSection(name) {
    const section = document.getElementById(`section-${name}`);
    section.style.display = section.style.display === "block" ? "none" : "block";
  }
  

//do kodów qr
  function previewQR(id) {
    const baseUrl = "https://wm-backend-g4xy.onrender.com/qrcode/";
    const qrUrl = `${baseUrl}${id}`;
    document.getElementById("qrDisplayArea").innerHTML = `
      <p>Kod QR dla dzieła ID: ${id}</p>
      <img src="${qrUrl}" alt="Kod QR">
      <br><br>
      <a href="${qrUrl}" download="qrcode_${id}.png">📥 Pobierz PNG</a>
    `;
    toggleSection("qr-preview");
  }

  //wylogowanie
  function logout() {
    localStorage.removeItem("token");
    alert("Zostałeś wylogowany.");
    window.location.href = "index.html";
  }
  
  
//SPINANIE FASTAPI Z ADMINPAGE
//EKSPONATY - exhibit_list
async function loadExhibits() {
  try {
    const response = await fetch("https://wm-backend-g4xy.onrender.com/exhibit_list");
    const exhibits = await response.json();

    const tableBody = document.getElementById("exhibitTableBody");
    tableBody.innerHTML = "";

    exhibits.forEach((exhibit) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exhibit.id}</td>
        <td>${exhibit.title}</td>
        <td>${exhibit.description || ""}</td>
        <td>${exhibit.model_url || ""}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Błąd pobierania eksponatów:", err);
    alert("Nie udało się załadować listy eksponatów.");
  }
}



//EKSPONATY - dodanie
document.getElementById("addExhibitForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const title = form.querySelector("input[name='title']").value;
  const description = form.querySelector("textarea[name='description']").value;
  const model = form.querySelector("input[name='model']").value;

  const body = new URLSearchParams();
  body.append("title", title);
  body.append("description", description);
  body.append("model", model);

  try {
    const response = await fetch("https://wm-backend-g4xy.onrender.com/exhibit/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      const error = await response.json();
      alert("❌ Błąd: " + (error.detail || "Nie udało się dodać eksponatu."));
      return;
    }

    const result = await response.json();
    alert("✅ Dodano eksponat! ID: " + result.id);
    form.reset();
    loadExhibits(); // odśwież listę
  } catch (err) {
    alert("❌ Błąd połączenia: " + err.message);
  }
});



//EKSPONATY - edycja
document.getElementById("editExhibitForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const id = form.querySelector("input[name='id']").value;
  const title = form.querySelector("input[name='title']").value;
  const description = form.querySelector("textarea[name='description']").value;
  const model = form.querySelector("input[name='model']").value;

  const body = new URLSearchParams();
  body.append("title", title);
  body.append("description", description);
  body.append("model", model);

  try {
    const response = await fetch(`https://wm-backend-g4xy.onrender.com/exhibit/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      const error = await response.json();
      alert("❌ Błąd edycji: " + (error.detail || "Nie udało się edytować eksponatu."));
      return;
    }

    const result = await response.json();
    alert("✅ Zaktualizowano: " + result.title);
    form.reset();
    loadExhibits(); // odśwież listę
  } catch (err) {
    alert("❌ Błąd połączenia: " + err.message);
  }
});


//EKSPONATY - usuwanie
document.getElementById("deleteExhibitForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = e.target.querySelector("input[name='id']").value;

  if (!confirm(`Czy na pewno chcesz usunąć eksponat o ID ${id}?`)) return;

  try {
    const response = await fetch(`https://wm-backend-g4xy.onrender.com/exhibit/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const error = await response.json();
      alert("❌ Błąd usuwania: " + (error.detail || "Nie udało się usunąć eksponatu."));
      return;
    }

    alert("✅ Eksponat usunięty.");
    e.target.reset();
    loadExhibits(); // Odśwież listę
  } catch (err) {
    alert("❌ Błąd połączenia: " + err.message);
  }
});


//USERZY - lista
async function loadUsers() {
  try {
    const response = await fetch("https://wm-backend-g4xy.onrender.com/users");
    const users = await response.json();

    const tableBody = document.getElementById("userTableBody");
    tableBody.innerHTML = "";

    users.forEach(user => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.role}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Błąd pobierania użytkowników:", err);
    alert("❌ Nie udało się załadować listy użytkowników.");
  }
}

//USERZY - dodawanie
document.getElementById("addUserForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const body = new URLSearchParams(formData);

  try {
    const response = await fetch("https://wm-backend-g4xy.onrender.com/users", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      const error = await response.json();
      alert("❌ Błąd: " + (error.detail || "Nie udało się dodać użytkownika."));
      return;
    }

    alert("✅ Użytkownik dodany.");
    e.target.reset();
    loadUsers();
  } catch (err) {
    alert("❌ Błąd połączenia: " + err.message);
  }
});


//USERZY -usuwanie
document.getElementById("deleteUserForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = e.target.querySelector("input[name='id']").value;

  if (!confirm(`Czy na pewno chcesz usunąć użytkownika o ID ${id}?`)) return;

  try {
    const response = await fetch(`https://wm-backend-g4xy.onrender.com/users/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const error = await response.json();
      alert("❌ Błąd usuwania: " + (error.detail || "Nie udało się usunąć użytkownika."));
      return;
    }

    alert("✅ Użytkownik usunięty.");
    e.target.reset();
    loadUsers();
  } catch (err) {
    alert("❌ Błąd połączenia: " + err.message);
  }
});
