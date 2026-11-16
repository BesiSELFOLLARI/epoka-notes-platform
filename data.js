/*
 * FILE PURPOSE: Stores the sample academic information used by the website: faculties contain departments, departments contain study years, and each year contains an array of course names. This file supplies data only; it does not create page elements or handle clicks.
 * CONNECTIONS: select.js reads the faculty and department names to create the selection buttons. courses.js uses the saved faculty, department, and year to find and display the matching course array. The DATA variable must be loaded before those scripts use it.
 */
// This is the website’s academic data source. select.js reads its faculty and department names to build the selection buttons, and courses.js reads the selected year’s array to display the course list.
// // The nested object is arranged in the same order as the selection process: faculty name → department name → year number → array of course names.
const DATA = {

    "Faculty of Architecture and Engineering": {

        // // Each department is a property inside its faculty. The year numbers below are keys whose values are arrays of course names.
        "Computer Engineering": {
            1: ["Programming I", "Calculus I", "Physics", "Introduction to Computer Engineering", "Academic English"],
            2: ["Data Structures", "Object-Oriented Programming", "Discrete Mathematics", "Digital Logic", "Databases"],
            3: ["Artificial Intelligence", "Web Technologies", "Data Mining", "Computer Networks", "Software Engineering"],
            4: ["Cybersecurity", "Machine Learning", "Operating Systems", "Cloud Computing", "Graduation Project"]
        },

        "Software Engineering": {
            1: ["Programming I", "Mathematics I", "Introduction to Software Engineering"],
            2: ["Object-Oriented Programming", "Data Structures", "Databases"],
            3: ["Web Development", "Software Testing", "Computer Networks"],
            4: ["Mobile Applications", "Cloud Computing", "Graduation Project"]
        },

        "Architecture": {
            1: ["Design Studio I", "Mathematics", "History of Architecture", "Technical Drawing"],
            2: ["Building Materials", "Architectural Design", "Structures"],
            3: ["Urban Planning", "Interior Architecture", "Sustainable Design"],
            4: ["Advanced Design Studio", "Professional Practice", "Graduation Project"]
        },

        "Civil Engineering": {
            1: ["Mathematics I", "Physics", "Engineering Drawing"],
            2: ["Statics", "Building Materials", "Surveying"],
            3: ["Structural Analysis", "Geotechnics", "Hydraulics"],
            4: ["Concrete Structures", "Transportation Engineering", "Graduation Project"]
        }
    },

    "Faculty of Economics and Administrative Sciences": {

        "Business Administration": {
            1: ["Introduction to Business", "Microeconomics", "Mathematics"],
            2: ["Management", "Macroeconomics", "Accounting"],
            3: ["Marketing", "Human Resources", "Business Statistics"],
            4: ["Strategic Management", "Entrepreneurship", "Graduation Project"]
        },

        "Banking and Finance": {
            1: ["Introduction to Economics", "Mathematics", "Accounting"],
            2: ["Financial Markets", "Banking", "Statistics"],
            3: ["Corporate Finance", "Investment Analysis", "Risk Management"],
            4: ["International Finance", "Financial Technology", "Graduation Project"]
        },

        "International Relations": {
            1: ["Introduction to Politics", "World History", "Academic English"],
            2: ["International Law", "Political Theory", "Economics"],
            3: ["Diplomacy", "European Studies", "International Organizations"],
            4: ["Foreign Policy", "Global Security", "Graduation Project"]
        }
    },

    "Faculty of Law and Social Sciences": {

        "Law": {
            1: ["Introduction to Law", "Roman Law", "Constitutional Principles"],
            2: ["Constitutional Law", "Civil Law", "Criminal Law"],
            3: ["Administrative Law", "International Law", "Contract Law"],
            4: ["Commercial Law", "Human Rights", "Graduation Project"]
        },

        "Psychology": {
            1: ["Introduction to Psychology", "Biology", "Academic Writing"],
            2: ["Developmental Psychology", "Social Psychology", "Research Methods"],
            3: ["Cognitive Psychology", "Personality Psychology", "Statistics"],
            4: ["Clinical Psychology", "Ethics", "Graduation Project"]
        },

        "Political Science": {
            1: ["Introduction to Politics", "History", "Political Ideas"],
            2: ["Comparative Politics", "Public Administration", "Political Theory"],
            3: ["European Politics", "Public Policy", "Research Methods"],
            4: ["International Security", "Governance", "Graduation Project"]
        }
    }

};

