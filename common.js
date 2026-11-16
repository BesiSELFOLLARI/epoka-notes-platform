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
