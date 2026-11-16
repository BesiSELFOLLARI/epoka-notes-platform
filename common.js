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
