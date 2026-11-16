/*
 * FILE PURPOSE: Builds the course list for the selected faculty, department, and year, and builds a second list of other registered students who can be contacted privately. It also filters courses as the student types in the search field.
 * CONNECTIONS: Reads course names from DATA in data.js and account/selection information from Auth and Pick in common.js. It saves the selected course or private-chat recipient in localStorage before navigating. The HTML containers courseList and studentList receive generated cards; their classes are styled in style.css.
 */

const user = Auth.require();
const pick = Pick.require();

if (user && pick) {
    document.getElementById("crumbs").textContent =
        pick.fac + " / " + pick.dep + " / Year " + pick.year;

    // // Follow the selected faculty → department → year path through DATA. The empty array is a fallback if that path has no course list.
    const allCourses = DATA[pick.fac][pick.dep][pick.year] || [];

    // Display the courses
    // Create the visible course list for the selected faculty, department, and year. The search field is read first, then the course array is filtered and matching course cards are added to the HTML container.
    function renderCourses() {
        // // Read the current search text, remove extra spaces, and use lowercase so the search is not affected by capital letters.
        const query = document.getElementById("q").value.trim().toLowerCase();
        // // filter() makes a new array containing only course names that include the search text; the original DATA list remains unchanged.
        const courses = allCourses.filter(course =>
            course.toLowerCase().includes(query)
        );

        const box = document.getElementById("courseList");
        // Clear the generated list before rebuilding it from the latest data, preventing duplicate cards when the render function runs again.
        // // Clear only the generated course cards, not the search input or page structure, before drawing the filtered results.
        box.innerHTML = "";
        document.getElementById("courseCount").textContent = courses.length + " courses";

        // // Show a helpful empty state when the search has no matches instead of leaving a blank list.
        if (courses.length === 0) {
            box.innerHTML = '<p class="empty">No courses found.</p>';
            return;
        }

        courses.forEach(course => {
            // // Each course is an anchor because selecting it navigates to course.html; JavaScript saves which course was chosen before navigation.
            const link = document.createElement("a");
            link.className = "course";
            link.href = "course.html";

            // Save the selected course before opening its page
            link.addEventListener("click", () => {
                store.set("epoka_current_course", course);
            });

            const info = document.createElement("span");
            const name = document.createElement("b");
            name.textContent = course;

            const detail = document.createElement("small");
            // // Read the message array using the same key as chat.js, allowing the card to show the actual discussion count for this course.
            const messages = store.get(courseChatKey(pick, course), []);
            detail.textContent = messages.length
                ? messages.length + " messages in discussion"
                : "Open notes and discussion";

            info.appendChild(name);
            info.appendChild(detail);

            const arrow = document.createElement("span");
            arrow.className = "arrow";
            arrow.textContent = "→";

            link.appendChild(info);
            link.appendChild(arrow);
            box.appendChild(link);
        });
    }

    // Display other registered students
    // Build the list of other registered students who can be contacted privately. The click handler saves the selected student’s email and marks the next chat screen as a private conversation.
    function renderStudents() {
        const box = document.getElementById("studentList");
        // // Start with all registered accounts and remove the current student, because the private-chat list should contain other students only.
        const students = Auth.users().filter(student =>
            student.email !== user.email
        );

        // Clear the generated list before rebuilding it from the latest data, preventing duplicate cards when the render function runs again.
        box.innerHTML = "";

        if (students.length === 0) {
            box.innerHTML =
                '<p class="empty">There are no other registered students in this browser yet. Create another account to try the chat feature.</p>';
            return;
        }

        students.forEach(student => {
            const link = document.createElement("a");
            link.className = "student";
            link.href = "chat.html";

            // Save who the private chat is with
            link.addEventListener("click", () => {
                // // Tell chat.js that the next chat screen is private rather than a public course discussion.
                store.set("epoka_chat_type", "private");
                // // Save the selected student's email so chat.js can find that account and build the shared private conversation key.
                store.set("epoka_chat_email", student.email);
            });

            const avatar = document.createElement("span");
            avatar.className = "avatar";
            avatar.textContent = student.name.charAt(0).toUpperCase();

            const info = document.createElement("span");
            info.className = "student-info";

            const name = document.createElement("b");
            name.textContent = student.name;

            const email = document.createElement("small");
            email.textContent = student.email;

            info.appendChild(name);
            info.appendChild(email);

            const arrow = document.createElement("span");
            arrow.className = "arrow";
            arrow.textContent = "→";

            link.appendChild(avatar);
            link.appendChild(info);
            link.appendChild(arrow);
            box.appendChild(link);
        });
    }

    // // The input event runs after each change to the search field, so the course list updates while the student types without a separate Search button.
    document.getElementById("q").addEventListener("input", renderCourses);
    renderCourses();
    renderStudents();
}
