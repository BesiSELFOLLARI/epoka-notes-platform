/*
 * FILE PURPOSE: Controls the workspace for one selected course. It puts the course and academic path into the page, connects the Notes and Open Discussion cards to their pages, and shows how many notes and messages already belong to that course.
 * CONNECTIONS: Gets the current account and academic selection from common.js, then uses courseNotesKey() and courseChatKey() so its counts refer to exactly the same saved data used by notes.js and chat.js. The HTML ids courseTitle, courseCrumb, notesLink, chatLink, notesCount, and chatCount are updated here.
 */
// // Confirm that the student is signed in before showing course-specific information.
const user = Auth.require();
// // Confirm that a faculty, department, and year were selected; the workspace needs this path to identify the course context.
const pick = Pick.require();
// // courses.js saves the clicked course name here before navigating to this workspace.
const course = store.get("epoka_current_course", "");

if (user && pick && course) {
    // Create the storage key for this course’s notes. The helper includes the selected academic path and course, so the notes count and notes page read the same collection.
    const notesKey = courseNotesKey(pick, course);
    // Create the storage key for this course’s discussion. It matches the key chat.js uses, allowing the course workspace to count the same messages that the chat page displays.
    const messagesKey = courseChatKey(pick, course);

    document.getElementById("courseTitle").textContent = course;
    // // Show the academic path as a breadcrumb so the student can see which faculty, department, and year the workspace belongs to.
    document.getElementById("courseCrumb").textContent =
        pick.fac + " / " + pick.dep + " / Year " + pick.year;

    // // These links use normal page navigation; the click handlers below save the chat type before the destination page opens.
    document.getElementById("notesLink").href = "notes.html";
    document.getElementById("chatLink").href = "chat.html";

    // Open the course notes page
    document.getElementById("notesLink").addEventListener("click", () => {
        store.set("epoka_chat_type", "course");
    });

    // Open the course discussion
    document.getElementById("chatLink").addEventListener("click", () => {
        store.set("epoka_chat_type", "course");
    });

    // Read the notes belonging to this course. The empty array is the starting value for a course where no notes have been saved yet.
    const notes = store.get(notesKey, []);
    // Read the messages belonging to this course so the workspace can show the discussion count before the student opens the chat.
    const messages = store.get(messagesKey, []);

    // // Convert the array length into a readable count and handle singular/plural wording for one note versus multiple notes.
    document.getElementById("notesCount").textContent =
        notes.length + (notes.length === 1 ? " saved note" : " saved notes");

    document.getElementById("chatCount").textContent =
        messages.length + (messages.length === 1 ? " message" : " messages");
} else {
    location.replace("courses.html");
}

