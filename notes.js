/*
 * FILE PURPOSE: Manages the notes for the currently selected course. It reads that course's saved notes, creates the visible note cards, validates the add/edit form, and handles editing, deleting, cancelling, and saving notes.
 * CONNECTIONS: Auth.require() and Pick.require() in common.js ensure the student and academic selection exist. courseNotesKey() creates the same course-specific storage key used whenever a note is saved or loaded. The HTML ids for the form, note list, count, and buttons are updated here; style.css styles note-card, note-date, note-content, and note-actions.
 */

const user = Auth.require();
const pick = Pick.require();
const course = store.get("epoka_current_course", "");

if (user && pick && course) {
    // // Use a key containing the current faculty, department, year, and course so each course has its own notes collection.
    const key = courseNotesKey(pick, course);
    // // null means the form is creating a new note. When Edit is clicked, this stores that note's id so submit knows to update it instead.
    let editingId = null;

    document.getElementById("notesTitle").textContent = course + " - Notes";
    document.getElementById("notesCrumb").textContent =
        pick.fac + " / " + pick.dep + " / Year " + pick.year;
    document.getElementById("backCourse").href = "course.html";

    // Get the notes saved for this course
    // Read notes using the key for the current course. Returning an empty array when the stored value is not an array keeps the rendering and editing functions consistent.
    function getNotes() {
        // // Read the note array for this course. The default is an empty array for a course where no notes have been created yet.
        const notes = store.get(key, []);
        return Array.isArray(notes) ? notes : [];
    }

    // Recreate the notes list from the current course’s saved array and update the count shown above it.
    function renderNotes() {
        // // Always read the latest saved array before drawing; this ensures the count and cards represent the same data.
        const notes = getNotes();
        const box = document.getElementById("notesList");
        // Clear the generated list before rebuilding it from the latest data, preventing duplicate cards when the render function runs again.
        box.innerHTML = "";

        // // Keep the count above the list in sync with the number of note objects currently stored for this course.
        document.getElementById("noteCount").textContent =
            notes.length + (notes.length === 1 ? " note" : " notes");

        if (notes.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "You haven't saved any notes for this course yet.";
            box.appendChild(empty);
            return;
        }

        notes.forEach(note => {
            // // Build each note as an article containing its title, update date, content, and action buttons; CSS styles the card as one unit.
            const card = document.createElement("article");
            card.className = "note-card";

            const heading = document.createElement("h3");
            heading.textContent = note.title;

            const date = document.createElement("small");
            date.className = "note-date";
            date.textContent = "Last updated: " +
                new Date(note.updated).toLocaleString("en-US");

            const content = document.createElement("p");
            content.className = "note-content";
            // Display the saved note body as plain text. textContent is used because the note is user-entered content and should not be interpreted as HTML.
            content.textContent = note.content;

            const actions = document.createElement("div");
            actions.className = "note-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "ghost";
            editButton.textContent = "Edit";
            // // Pass the note's unique id to editNote(), so the form loads the correct note rather than relying on its position in the list.
            editButton.addEventListener("click", () => editNote(note.id));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "ghost danger-button";
            deleteButton.textContent = "Delete";
            // // Pass the same unique id to deleteNote(), allowing the correct card to be removed even if the list order changes.
            deleteButton.addEventListener("click", () => deleteNote(note.id));

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
            card.appendChild(heading);
            card.appendChild(date);
            card.appendChild(content);
            card.appendChild(actions);
            box.appendChild(card);
        });
    }

    // Add a new note or save changes to an existing note
    document.getElementById("noteForm").addEventListener("submit", event => {
        // Prevent the browser from submitting/reloading the page; this handler processes the form or Enter key and updates the existing chat screen itself.
        event.preventDefault();

        // // Read the two form fields and trim outer spaces before validation and saving.
        const title = document.getElementById("noteTitle").value.trim();
        const content = document.getElementById("noteContent").value.trim();

        // // Both fields are required; stop before changing storage if either one is empty.
        if (!title || !content) {
            document.getElementById("noteError").textContent = "Please fill in both the title and content.";
            return;
        }

        const notes = getNotes();

        // // An existing id means the student pressed Edit, so update that note. If it is null, the form is creating a new note.
        if (editingId !== null) {
            // // Find the existing note by its id, which is more reliable than using its current array position.
            const note = notes.find(item => item.id === editingId);

            if (note) {
                note.title = title;
                note.content = content;
                note.updated = Date.now();
            }
        } else {
            // // Add a new note at the beginning of the array so the newest note appears first in the rendered list.
            notes.unshift({
                id: Date.now(),
                title: title,
                content: content,
                updated: Date.now()
            });
        }

        // // Save the complete updated notes array before clearing the form or redrawing; report an error if browser storage could not save it.
        if (!store.set(key, notes)) {
            document.getElementById("noteError").textContent =
                "Note could not be saved. Your browser storage may be full.";
            return;
        }

        resetForm();
        renderNotes();
    });

    // Put the selected note in the form so it can be edited
    function editNote(id) {
        const notes = getNotes();
        // // Locate the note selected by its Edit button; the id links the visible card back to the original object in storage.
        const note = notes.find(item => item.id === id);

        if (!note) return;

        editingId = id;
        document.getElementById("noteTitle").value = note.title;
        document.getElementById("noteContent").value = note.content;
        document.getElementById("formHeading").textContent = "Edit Note";
        document.getElementById("saveNote").textContent = "Save Changes";
        document.getElementById("cancelEdit").hidden = false;
        document.getElementById("noteError").textContent = "";
        document.getElementById("noteTitle").focus();
    }

    // Delete a note after confirmation
    // Ask for confirmation, remove the note with the matching id, save the remaining notes, and refresh the list so the deleted card disappears.
    function deleteNote(id) {
        if (!confirm("Are you sure you want to delete this note?")) return;

        // // filter() creates a new array containing every note except the one with the selected id.
        const notes = getNotes().filter(note => note.id !== id);

        if (!store.set(key, notes)) {
            document.getElementById("noteError").textContent = "Note could not be deleted.";
            return;
        }

        if (editingId === id) resetForm();
        renderNotes();
    }

    // Clear the form and leave edit mode
    // Return the note form to its new-note state after saving, cancelling, or deleting the note being edited. It clears the inputs and restores the original heading and button label.
    function resetForm() {
        // // Reset the HTML form controls as well as the JavaScript edit state, returning the screen to the Add a Note mode.
        document.getElementById("noteForm").reset();
        editingId = null;
        document.getElementById("formHeading").textContent = "Add a Note";
        document.getElementById("saveNote").textContent = "Save Note";
        document.getElementById("cancelEdit").hidden = true;
        document.getElementById("noteError").textContent = "";
    }

    document.getElementById("cancelEdit").addEventListener("click", resetForm);
    renderNotes();
} else {
    location.replace("courses.html");
}

