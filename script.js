// === KONFIGURACJA ===
const BACKEND_URL ="https://0b7d-37-47-71-1.ngrok-free.app"; // lokalny backend

// Obsługa logowania użytkownika
document.getElementById("loginForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert("Błąd logowania: " + (errorData.detail || JSON.stringify(errorData)));
            return;
        }

        const data = await response.json();
        const token = data.token;
        const role = data.role;

        localStorage.setItem("token", token);

        if (role === "admin") {
            window.location.href = "admin/adminPage.html";
        } else {
            window.location.href = "muzeum.html";
        }

    } catch (err) {
        alert("Błąd połączenia: " + err.message);
    }
});

// Rejestracja użytkownika
document.getElementById("registerForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const length = password.length >= 8;
    const lowercase = /[a-z]/.test(password);
    const uppercase = /[A-Z]/.test(password);
    const digit = /[0-9]/.test(password);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(length && lowercase && uppercase && digit && special)) {
        alert("Hasło nie spełnia wymagań bezpieczeństwa.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Hasła nie są zgodne.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
                role: "user"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            let msg = "Błąd rejestracji.";
            if (typeof error.detail === "string") {
                msg = error.detail;
            } else if (Array.isArray(error.detail)) {
                msg = error.detail.map(e => e.msg || JSON.stringify(e)).join("\n");
            } else if (typeof error === "object") {
                msg = JSON.stringify(error, null, 2);
            }
            alert("Błąd rejestracji:\n" + msg);
            return;
        }

        alert("Rejestracja zakończona sukcesem! Zaloguj się.");
        document.getElementById("registerForm").reset();
        clearChecklist();
        const match = document.getElementById("passwordMatch");
        if (match) {
            match.textContent = "";
            match.className = "";
        }

    } catch (err) {
        alert("Błąd połączenia: " + err.message);
    }
});

// Czyszczenie checklisty
function clearChecklist() {
    ["length", "lowercase", "uppercase", "digit", "special"].forEach(id => {
        document.getElementById(id)?.classList.remove("valid");
    });
}

// Sprawdzenie poprawności hasła
document.getElementById("newPassword")?.addEventListener("input", function () {
    const value = this.value;

    const length = value.length >= 8;
    const lowercase = /[a-z]/.test(value);
    const uppercase = /[A-Z]/.test(value);
    const digit = /[0-9]/.test(value);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    updateStatus("length", length);
    updateStatus("lowercase", lowercase);
    updateStatus("uppercase", uppercase);
    updateStatus("digit", digit);
    updateStatus("special", special);
});

function updateStatus(id, condition) {
    const el = document.getElementById(id);
    if (condition) {
        el.classList.add("valid");
    } else {
        el.classList.remove("valid");
    }
}

// Sprawdzenie, czy hasła się zgadzają
document.getElementById("newPassword")?.addEventListener("input", checkPasswordMatch);
document.getElementById("confirmPassword")?.addEventListener("input", checkPasswordMatch);

function checkPasswordMatch() {
    const pass1 = document.getElementById("newPassword").value;
    const pass2 = document.getElementById("confirmPassword").value;
    const msg = document.getElementById("passwordMatch");

    if (!msg) return;

    if (pass2 === "") {
        msg.textContent = "";
        msg.className = "";
        return;
    }

    if (pass1 === pass2) {
        msg.textContent = "Hasła się zgadzają.";
        msg.className = "valid";
    } else {
        msg.textContent = "Hasła się różnią.";
        msg.className = "invalid";
    }
}

// Funkcja do zmiany widoczności hasła
function showPassword(id) {
    document.getElementById(id).type = "text";
}
function hidePassword(id) {
    document.getElementById(id).type = "password";
}
