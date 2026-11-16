
/*
 * FILE PURPOSE: Contains shared functions used across the website.
 * CONNECTIONS: All pages use store to save and retrieve browser data.
 * select.js uses Pick.set() to save the academic selection.
 * Other academic pages use Pick.get() and Pick.require().
 */

// Shared browser-storage helper used by the rest of the project.
const store = {
    // Read a saved value using its key. Return the fallback if no value exists.
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

    // Save a JavaScript value as text in localStorage.
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }
};

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

    // Check that all academic selection details exist before opening academic pages.
    require() {
        const selection = Pick.get();

        if (!selection.fac || !selection.dep || !selection.year) {
            location.replace("select.html");
            return null;
        }

        return selection;
    }
};
