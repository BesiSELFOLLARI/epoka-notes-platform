/*
 * FILE PURPOSE: Contains shared functions used across the website so each page does not need to repeat browser-storage code or academic selection checks.
 * CONNECTIONS: Most pages use store.get() and store.set(); select.js uses Pick.set(); academic pages use Pick.get() and Pick.require().
 */

// Shared browser-storage helper used by the rest of the project.
const store = {
    // Read one value by its storage key. Return the fallback if no value exists or the saved text cannot be parsed.
    get(key, fallback) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    },

    // Save a JavaScript value under a key. JSON.stringify converts objects and arrays into text for localStorage.
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }
};


// Account-related functions shared by the login screen and protected pages. login.js calls register() or login(); other pages call require() to check the current account.
const Auth = {
    user() {
        return store.get("epoka_user", null);
    },

    users() {
        return store.get("epoka_users", []);
    },

    // Create a student account: normalize the entered details, check for an existing email, add the new account to the saved users array, and store the newly logged-in student.
    register(name, email, password) {
        name = name.trim();
        email = email.trim().toLowerCase();

        const users = Auth.users();

        // // Search the complete saved-user array by normalized email; this prevents creating two accounts with the same email in different letter cases.
        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            return {
                ok: false,
                message: "This email already has an account. Please log in."
            };
        }

        // // Keep the account details together in one object so it can be added as a single item to the users array.
        const user = {
            name: name,
            email: email,
            password: password,
            joined: Date.now()
        };

        // // Add the new account to the array before saving the whole updated array back to localStorage.
        users.push(user);

        // // Save the updated list of all registered students first; if this fails, registration cannot be considered complete.
        if (!store.set("epoka_users", users)) {
            return {
                ok: false,
                message: "Account could not be saved in the browser."
            };
        }

        // // Save only the public profile details as the active session. The complete account record remains in epoka_users for login checking.
        if (!store.set("epoka_user", {
            name: user.name,
            email: user.email
        })) {
            return {
                ok: false,
                message: "Account created, but login information could not be saved."
            };
        }

        return { ok: true };
    },

    // Find a saved account with the entered email and password. If a match exists, save only the current student’s name and email as the active login details.
    login(email, password) {
        email = email.trim().toLowerCase();

        const users = Auth.users();
        // // find() returns the first account whose email AND password both match the values entered in the login form.
        const user = users.find(item =>
            item.email === email && item.password === password
        );

        if (!user) {
            return {
                ok: false,
                message: "Incorrect email or password."
            };
        }

        if (!store.set("epoka_user", {
            name: user.name,
            email: user.email
        })) {
            return {
                ok: false,
                message: "Login information could not be saved. Please try again."
            };
        }

        return { ok: true };
    },

    // End the current session by removing the active user and academic selection from localStorage, then return the browser to the login screen.
    logout() {
        localStorage.removeItem("epoka_user");
        localStorage.removeItem("epoka_pick");
        location.href = "index.html";
    },

    // Protect pages that need a signed-in student. If no active user is saved, redirect to the login screen; otherwise fill the shared account-name area and connect logout buttons.
    require() {
        const user = Auth.user();

        if (!user) {
            // Redirect to the login page when there is no active account. replace() also prevents the protected page from remaining as the immediate previous history entry.
            location.replace("index.html");
            return null;
        }

        // // Select every HTML element marked data-who, not just one element, so the student's name can appear consistently in shared page headers.
        document.querySelectorAll("[data-who]").forEach(element => {
            element.textContent = user.name;
        });

        // // Any element marked data-logout receives the same logout action, allowing different pages to reuse one shared handler.
        document.querySelectorAll("[data-logout]").forEach(button => {
            button.addEventListener("click", Auth.logout);
        });

        return user;
    }
};


// Faculty, department and year selection.
// Shared helper for the selected faculty, department, and study year.
const Pick = {
    // Retrieve the saved academic selection.
    get() {
        return store.get("epoka_pick", {
            fac: null,
            dep: null,
            year: null
        });
    },

    // Save the student's academic selection.
    set(selection) {
        return store.set("epoka_pick", selection);
    },

    // Check that all required academic selection details exist.
    require() {
        const selection = Pick.get();

        if (!selection.fac || !selection.dep || !selection.year) {
            location.replace("select.html");
            return null;
        }

        return selection;
    }
};
        return selection;
    }
};
