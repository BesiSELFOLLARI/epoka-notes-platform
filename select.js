/*
 * FILE PURPOSE: Controls the academic selection screen. The student chooses a faculty, then a department, then a study year. Each choice reveals the next step, is saved for later pages, and determines whether the Next button can be used.
 * CONNECTIONS: Reads the available choices from DATA in data.js and saves or retrieves the current selection with Pick in common.js. It creates buttons inside facList, depList, and yearList, changes the visibility of s-dep and s-year, and enables or disables next. style.css styles the generated choice buttons and their selected state.
 */

const user = Auth.require();

if (user) {

    // // Load the last saved selection so a student who returns to this page can see their previous choices.
    let pick = Pick.get();

    // Create a set of choice buttons inside the supplied HTML container. This same function is reused for faculty, departments, and years, while onPick describes what should happen for the selected value.
    function fill(element, items, selected, onPick) {

        // Clear the previous generated buttons before rebuilding this choice group. innerHTML is used here to remove the old child elements; the student’s text values are added separately with textContent.
        // // Remove only the old choice buttons before creating the current set; otherwise each render would append duplicate buttons.
        element.innerHTML = "";

        // // Create one button for each faculty, department, or year supplied by DATA.
        items.forEach(value => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "choice";

            // Set the visible label as plain text. textContent is suitable for names and labels because it displays the value rather than interpreting it as HTML markup.
            button.textContent =
                typeof value === "number" ? "Year " + value : value;

            button.setAttribute(
                "aria-pressed",
                String(value === selected)
            );

            button.addEventListener("click", () => onPick(value));

            element.appendChild(button);
        });
    }

    // Refresh all three academic selection steps based on the current pick. A faculty choice determines which departments are available, and a department choice determines which years can be shown.
    // // Rebuild the three selection steps from the current pick object. Changing a parent choice resets dependent choices so an old department/year cannot remain selected under a different faculty.
    function render() {

        fill(
            document.getElementById("facList"),
            // // The faculty names are the top-level property names in DATA, so they can be used directly as the first set of buttons.
            Object.keys(DATA),
            pick.fac,
            value => {
                pick = {
                    fac: value,
                    dep: null,
                    year: null
                };

                Pick.set(pick);
                render();
            }
        );

        // // Keep the department step hidden until a faculty has been chosen; the next step appears only when its required parent choice exists.
        document.getElementById("s-dep").hidden = !pick.fac;

        if (pick.fac) {

            fill(
                document.getElementById("depList"),
                // // Read only the departments inside the selected faculty, rather than showing departments from every faculty.
                Object.keys(DATA[pick.fac]),
                pick.dep,
                value => {
                    pick.dep = value;
                    // // Choosing a different department also clears the previous year because available years belong to the selected department.
                    pick.year = null;

                    Pick.set(pick);
                    render();
                }
            );
        }

        document.getElementById("s-year").hidden = !pick.dep;

        if (pick.fac && pick.dep) {

            // // The year keys are read from the selected department, so only years that exist for this department are offered.
            const yearNames = Object.keys(DATA[pick.fac][pick.dep]);
            const years = [];

            // Object.keys() returns property names as strings; convert them to numbers because the year choices are stored and compared as numeric values.
            for (let i = 0; i < yearNames.length; i++) {
                // // Object.keys() returns strings even when the property names look numeric; convert them so the selected year is stored as a number.
                years.push(Number(yearNames[i]));
            }

            fill(
                document.getElementById("yearList"),
                years,
                pick.year,
                value => {
                    pick.year = value;
                    Pick.set(pick);
                    render();
                }
            );
        }

        // // The Next button stays disabled until all three required values have been selected.
        document.getElementById("next").disabled =
            !pick.fac || !pick.dep || !pick.year;
    }

    // Connect the Next button in select.html to navigation. The selection is checked again before moving to courses.html so incomplete choices cannot be submitted.
    document.getElementById("next").addEventListener("click", () => {

        // // Check the full selection again when clicked; this prevents navigation if one of the required choices is missing.
        if (pick.fac && pick.dep && pick.year) {
            location.href = "courses.html";
        }
    });

    render();
}
