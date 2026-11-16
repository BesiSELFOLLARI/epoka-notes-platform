/*
 * FILE PURPOSE: Controls the login and registration form on index.html. It switches the same form between login and account-creation modes, checks the entered details, asks the shared Auth functions to verify or create the account, and moves to academic selection after a successful result.
 * CONNECTIONS: Uses the HTML ids nameField, confirmPasswordField, studentName, studentEmail, studentPassword, confirmPassword, formTitle, submitBtn, switchText, switchMode, loginErr, and loginForm. Auth.register() and Auth.login() are defined in common.js; style.css controls how the form and its error message look.
 */

// This variable remembers which form mode is active. false means login; true means registration. updateForm() uses it to show the correct fields and button labels.
// // This one boolean controls which purpose the shared form has. Keeping the mode in a variable lets the same submit listener handle both registration and login.
let registerMode = false;
// Update the login page to match registerMode. The HTML already contains both sets of fields; this function changes their hidden and required properties and updates the visible text.
function updateForm() {
    // // The name and confirmation fields are only needed for registration, so hidden switches their visibility when the mode changes.
    document.getElementById("nameField").hidden = !registerMode;
    document.getElementById("confirmPasswordField").hidden = !registerMode;

    // // A hidden field should not block login submission; it becomes required only when the student is creating an account.
    document.getElementById("studentName").required = registerMode;
    document.getElementById("confirmPassword").required = registerMode;

    // // Update the text in the existing HTML elements rather than creating a second form; this keeps the page layout the same in both modes.
    document.getElementById("formTitle").textContent = registerMode
        ? "Create your account."
        : "Welcome back.";

    document.getElementById("submitBtn").textContent = registerMode
        ? "Create Account"
        : "Log in to Epoka Tutor";

    document.getElementById("switchText").textContent = registerMode
        ? "Already have an account?"
        : "Don't have an account?";

    document.getElementById("switchMode").textContent = registerMode
        ? "Log in here"
        : "Create an account";
}

// Switch between registration and login
// Connect the Create Account / Log in button in index.html to the mode-switching behaviour. The click changes registerMode and calls updateForm() so the same HTML form changes purpose.
document.getElementById("switchMode").addEventListener("click", () => {
    // // Flip false to true or true to false, switching between login and registration.
    registerMode = !registerMode;
    document.getElementById("loginErr").textContent = "";
    // // Clear values from the previous mode so details entered for one action are not accidentally carried into the other.
    document.getElementById("loginForm").reset();
    updateForm();
});

// Submit the login or registration form
// Connect the HTML loginForm to the account logic. The submit event handles both login and registration depending on registerMode.
document.getElementById("loginForm").addEventListener("submit", event => {
    // Prevent the browser from submitting/reloading the page; this handler processes the form or Enter key and updates the existing chat screen itself.
    // // Forms normally reload/navigate when submitted. Prevent that default action because this script validates the fields and handles navigation itself.
    event.preventDefault();

    document.getElementById("loginErr").textContent = "";

    const name = document.getElementById("studentName").value.trim();
    // // Normalize the email before checking it, so leading/trailing spaces and uppercase letters do not cause a valid university address to fail.
    const email = document.getElementById("studentEmail").value.trim().toLowerCase();
    const password = document.getElementById("studentPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check that the email ends with the university domain
    // // Check that the university domain appears at the end of the address; the form stops here and displays an error if it does not.
    if (email.indexOf("@epoka.edu.al") !== email.length - 13) {
        document.getElementById("loginErr").textContent =
            "Please use your university email address (@epoka.edu.al).";
        return;
    }

    if (password.length < 6) {
        document.getElementById("loginErr").textContent =
            "Password must contain at least 6 characters.";
        return;
    }

    if (registerMode && !name) {
        document.getElementById("loginErr").textContent = "Please enter your name.";
        return;
    }

    // // This extra check is only relevant during registration; login has no confirmation field.
    if (registerMode && password !== confirmPassword) {
        document.getElementById("loginErr").textContent = "Passwords do not match.";
        return;
    }

    let result;

    if (registerMode) {
        result = Auth.register(name, email, password);
    } else {
        result = Auth.login(email, password);
    }

    // // Auth returns an object with an ok value and an error message. If the operation failed, show that message and stay on the form.
    if (!result.ok) {
        document.getElementById("loginErr").textContent = result.message;
        return;
    }

    // // Continue to the academic selection screen only after registration or login has succeeded.
    location.href = "select.html";
});

updateForm();


