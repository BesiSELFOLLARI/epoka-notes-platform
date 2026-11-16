/*
 * FILE PURPOSE: Handles the messaging screen. It decides whether the student opened a public course discussion or a private student chat, loads the correct saved messages, displays them, and saves new messages.
 * CONNECTIONS: Reads the signed-in student and academic selection through Auth and Pick in common.js. It uses courseChatKey() and privateChatKey() from common.js so each conversation has its own localStorage entry. The HTML elements chatBack, chatTitle, chatSubtitle, msgs, composer, and text are the places this script updates or listens to. CSS styles the msg, me, by, and empty classes created here.
 */
// // Check that a student is signed in before allowing access to a conversation; Auth.require() also fills the shared account name and connects logout buttons.
const user = Auth.require();
// // The previous page records whether the student chose a course discussion or a private chat. The default keeps the page in course-chat mode if no type was saved.
const type = store.get("epoka_chat_type", "course");
// // A public discussion needs the faculty/department/year selection to identify its course. A private chat is identified by the two students instead.
const pick = type === "course" ? Pick.require() : null;
const course = store.get("epoka_current_course", "");
// // courses.js saves this email when a student is selected from the student list; it tells this page who the private conversation is with.
const otherEmail = store.get("epoka_chat_email", "");

let otherUser = null;

if (type === "private") {
    const users = Auth.users();
    // // find() searches the saved accounts and returns the student whose email matches the one selected on the previous page.
    otherUser = users.find(item => item.email === otherEmail);
}

if (type === "course" && course) {
    document.getElementById("chatBack").href = "course.html";
} else {
    document.getElementById("chatBack").href = "courses.html";
}

if (user && (
    (type === "course" && pick && course) ||
    (type === "private" && otherUser)
)) {
    let key;

    if (type === "private") {
        // // The helper sorts the two email addresses before building the key, so both students reach the same private conversation regardless of who opened it.
        key = privateChatKey(user.email, otherUser.email);
        document.getElementById("chatTitle").textContent = otherUser.name;
        document.getElementById("chatSubtitle").textContent = "Private chat between students";
    } else {
        // // Include the academic path and course name so a discussion for one course cannot mix with another course’s messages.
        key = courseChatKey(pick, course);
        document.getElementById("chatTitle").textContent = course;
        document.getElementById("chatSubtitle").textContent = "Open discussion for this course";
    }

    // Read the conversation identified by key; private and course chats use different keys so their messages stay separate.
    function loadMessages() {
        // // Retrieve this conversation's saved array. An empty array is used the first time the conversation is opened.
        const messages = store.get(key, []);
        return Array.isArray(messages) ? messages : [];
    }

    // Rebuild the message area from the saved conversation so new, old, and empty states are displayed consistently.
    function draw() {
        // // This is the message-list container from chat.html; draw() rebuilds its contents whenever a message is sent or the page first opens.
        const box = document.getElementById("msgs");
        const messages = loadMessages();
        // Clear the generated list before rebuilding it from the latest data, preventing duplicate cards when the render function runs again.
        box.innerHTML = "";

        if (messages.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "No messages yet. Start the conversation!";
            box.appendChild(empty);
            return;
        }

        // // Create one visible message block for every saved message, keeping the order from the stored array.
        messages.forEach(message => {
            const item = document.createElement("div");
            item.className = "msg";

            // // Compare sender and current account emails so the CSS class can place/style the current student's own messages differently.
            if (message.email === user.email) {
                item.className = "msg me";
            }

            // // The sender/time line and message body are separate elements so style.css can format them independently.
            const by = document.createElement("div");
            by.className = "by";
            by.textContent = message.name + " · " +
                new Date(message.t).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short"
                });

            const paragraph = document.createElement("div");
            // Insert the message body as plain text, not HTML. This displays what the student typed without treating typed angle brackets or tags as page markup.
            paragraph.textContent = message.text;

            item.appendChild(by);
            item.appendChild(paragraph);
            box.appendChild(item);
        });

        // Move the chat message container to its bottom after drawing, so the newest message is visible without the student scrolling manually.
        box.scrollTop = box.scrollHeight;
    }

    // Send a text message and save it in localStorage
    function sendMessage() {
        // // Read the textarea value and remove spaces at the beginning/end; this also prevents a message containing only spaces from being sent.
        const text = document.getElementById("text").value.trim();

        if (text === "") {
            return;
        }

        const messages = loadMessages();

        // // Add the new message to the end of the existing array so it appears after earlier messages in the conversation.
        messages.push({
            name: user.name,
            email: user.email,
            text: text,
            // // Store the current time as a number; draw() converts it to a readable date and time for the message header.
            t: Date.now()
        });

        // // Do not clear the textarea or redraw as if the send worked unless the updated conversation was actually saved.
        if (!store.set(key, messages)) {
            alert("Message could not be saved. Please check your browser storage.");
            return;
        }

        // // Clear the input only after saving succeeds, so a failed save does not erase the student's message.
        document.getElementById("text").value = "";
        draw();
    }

    // Send the message when the form is submitted
    // // Listen to the form submit event so clicking Send and submitting with the keyboard use the same sendMessage() function.
    document.getElementById("composer").addEventListener("submit", event => {
        // Prevent the browser from submitting/reloading the page; this handler processes the form or Enter key and updates the existing chat screen itself.
        event.preventDefault();
        sendMessage();
    });

    // Press Enter to send a message
    // Listen for keyboard input in the chat textarea. The condition below sends on Enter but allows Shift+Enter to remain available for a new line.
    document.getElementById("text").addEventListener("keydown", event => {
        // // Enter sends the message, while Shift+Enter is left for the browser to insert a line break in the textarea.
        if (event.key === "Enter" && !event.shiftKey) {
            // Prevent the browser from submitting/reloading the page; this handler processes the form or Enter key and updates the existing chat screen itself.
            event.preventDefault();
            sendMessage();
        }
    });

    draw();
} else {
    location.replace("courses.html");
}
