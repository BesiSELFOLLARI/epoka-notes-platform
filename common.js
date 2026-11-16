/*
 * FILE PURPOSE: Contains shared functions used across the website so each page does not need to repeat account checks or browser-storage code. It saves and reads data, manages registration and login, checks the current student and academic selection, and creates separate storage keys for notes and conversations.
 * CONNECTIONS: login.js uses Auth.register() and Auth.login(); protected page scripts use Auth.require() and Pick.require(); most pages use store.get() and store.set(); course, notes, and chat pages use the key-building functions at the bottom of this file. HTML elements with data-who and data-logout are also connected here.
 */

// Shared browser-storage helper used by the rest of the project. It wraps localStorage so pages can save and retrieve JavaScript objects and arrays using the same JSON conversion and error handling.
const store = {
    // Read one value by its storage key. The fallback is returned when no value exists or the saved text cannot be parsed, so pages still receive the type of default value they expect.
    get(key, fallback) {
        try {
            // localStorage stores text, so this reads the saved text for the requested key before the next lines decide whether it exists and convert it back into a JavaScript value.
            // // The key identifies one saved item, such as the active user, academic selection, course notes, or a conversation.
            const value = localStorage.getItem(key);

            // // localStorage.getItem() returns null when the key has never been saved; return the caller's fallback instead of trying to parse null.
            if (value === null) {
                return fallback;
            }

            // JSON.parse converts the text retrieved from localStorage back into an object, array, number, or other JavaScript value that the page can work with.
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    },

    // Save a JavaScript value under a key. JSON.stringify is needed because localStorage can store strings, not complete JavaScript objects or arrays.
    set(key, value) {
        try {
            // Convert the value to text and save it in the browser. The same key is later used by store.get() to retrieve the value for the correct feature.
            // // JSON.stringify converts arrays and objects into text because localStorage stores strings. store.get() reverses this with JSON.parse().
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

// Faculty, department and year selection
// Shared helper for the selected faculty, department, and study year. select.js saves this selection, while courses.js, course.js, notes.js, and chat.js read it to show the correct academic content.
const Pick = {
    get() {
        return store.get("epoka_pick", {
            fac: null,
            dep: null,
            year: null
        });
    },

    set(selection) {
        return store.set("epoka_pick", selection);
    },

    // Protect pages that need a signed-in student. If no active user is saved, redirect to the login screen; otherwise fill the shared account-name area and connect logout buttons.
    require() {
        // // Read the saved faculty, department, and year together; later pages rely on all three to identify the correct course list.
        const selection = Pick.get();

        if (!selection.fac || !selection.dep || !selection.year) {
            // Return to academic selection if the required faculty, department, or year is missing; later pages need this information to choose the correct courses and storage keys.
            location.replace("select.html");
            return null;
        }

        return selection;
    }
};

// Create a separate conversation for each pair of students
function privateChatKey(email1, email2) {
    // // A prefix separates private-chat entries from course discussions and notes in localStorage.
    return "epoka_private:" +
        // // Lowercase removes email case differences, and sorting makes the key identical for both participants whichever student opens the chat.
        [email1.toLowerCase(), email2.toLowerCase()].sort().join("|");
}

// Each subject has its own public discussion
function courseChatKey(pick, course) {
    return "epoka_course:" +
        // // Put all parts of the academic path and course in the key so identical course names in different departments/years remain separate.
        [pick.fac, pick.dep, pick.year, course].join("|");
}

// Each course has its own saved notes
// Build the storage key for notes in one specific course. This prevents notes from one course appearing in another course’s notes page.
function courseNotesKey(pick, course) {
    return "epoka_notes:" +
        [pick.fac, pick.dep, pick.year, course].join("|");
}
