const API_BASE_URL = week-4-mega-project-production-c8b9.up.railway.app

// Pagination ke liye global variables
let currentPage = 1;
let currentSearch = "";
let totalPages = 1;

document.addEventListener("click", async function(e) {
    const button = e.target.closest("button") || e.target.closest("input[type=submit]");
    if (button && (button.innerText.includes("Sign In") || button.innerText.includes("Login"))) {
        e.preventDefault();
        await executeLogin();
    }
});

document.addEventListener("submit", async function(e) {
    e.preventDefault();
    await executeLogin();
});

async function executeLogin() {
    const inputs = document.querySelectorAll("input");
    let email = "";
    let password = "";

    inputs.forEach(input => {
        const val = input.value.trim();
        if (input.type === "email" || val.includes("@") || (input.placeholder && input.placeholder.toLowerCase().includes("email"))) {
            email = val;
        } else if (input.type === "password" || (input.placeholder && input.placeholder.toLowerCase().includes("password"))) {
            password = val;
        }
    });

    if (!email || !password) {
        const visibleInputs = Array.from(inputs).filter(i => i.type !== "hidden" && i.type !== "submit" && i.type !== "button");
        if (visibleInputs.length >= 2) {
            email = visibleInputs[0].value.trim();
            password = visibleInputs[1].value.trim();
        }
    }

    if (!email || !password) {
        alert("Please enter both email and password!");
        return;
    }

    try {
        const response = await fetch(API_BASE_URL + "/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        alert("Login Successful! 🎉");

        const allElements = document.querySelectorAll("div, section, form");
        allElements.forEach(el => {
            if (el.innerText && (el.innerText.includes("Welcome Back") || el.innerText.includes("Secure Sign In"))) {
                el.style.display = "none";
            }
        });

        const loginModal = document.getElementById("loginModal") || document.getElementById("authModal") || document.querySelector(".login-container") || document.querySelector(".modal");
        if (loginModal) {
            loginModal.style.display = "none";
        }

        loadDashboardData(1, "");

    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Failed: " + error.message);
    }
}

async function loadDashboardData(page = 1, search = "") {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found. Please login first.");
        return;
    }

    try {
        currentPage = page;
        currentSearch = search;

        // Backend pagination aur search parameters ke sath endpoint call
        const endpoint = `${API_BASE_URL}/api/data?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        // Backend response se items aur totalPages nikalna
        const items = result.items || (Array.isArray(result) ? result : [result]);
        totalPages = result.totalPages || 1;
const pageIndicator = document.getElementById("pageIndicator");
if (pageIndicator) {
    pageIndicator.innerText =  `Page ${currentPage} of ${totalPages}`;
}
        const dataObj = items[0] || result;

        if (dataObj) {
            const cards = document.querySelectorAll(".card, .metric-card");
            
            // 1. Total Records Card
            if (cards[0]) {
                const valEl = cards[0].querySelector("p, span, h2, h3:last-child");
                const val = result.totalRecords !== undefined ? result.totalRecords : (dataObj.totalRecords || 10);
                if (valEl) valEl.innerText = val;
            }

            // 2. Active Sessions Card
            if (cards[1]) {
                const valEl = cards[1].querySelector("p, span, h2, h3:last-child");
                const val = dataObj.activeSessions !== undefined ? dataObj.activeSessions : 7;
                if (valEl) valEl.innerText = val;
            }

            // 3. Growth Rate Card
            if (cards[2]) {
                const valEl = cards[2].querySelector("p, span, h2, h3:last-child");
                const val = dataObj.growthRate !== undefined ? dataObj.growthRate : "+14.5%";
                if (valEl) valEl.innerText = val;
            }
        }

        // Chart render function call
        if (typeof renderChart === "function") {
            renderChart(result);
        } else {
            initDefaultChart(dataObj);
        }

        // Table ya data grid render karne ke liye items pass karna
        if (typeof renderTable === "function") {
            renderTable(items);
        }

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

// Default Chart Initialization
function initDefaultChart(data) {
    const canvas = document.getElementById("chart") || document.querySelector("canvas");
    if (!canvas) return;

    if (typeof Chart !== "undefined") {
        if (window.myDashboardChart) {
            window.myDashboardChart.destroy();
        }
        
        const ctx = canvas.getContext("2d");
        window.myDashboardChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Records Overview',
                    data: [12, 19, 3, 5, 2, 3, data.totalRecords || 10],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    if (token) {
    }
});
// Pagination Buttons Event Listeners
document.addEventListener("click", function(e) {
    if (e.target && e.target.id === "prevBtn") {
        if (currentPage > 1) {
            loadDashboardData(currentPage - 1, currentSearch);
        }
    }
    if (e.target && e.target.id === "nextBtn") {
        if (currentPage < totalPages) {
            loadDashboardData(currentPage + 1, currentSearch);
        }
    }

});
// Table Render Function
function renderTable(items) {
    const tableBody = document.getElementById("tableBody");
    if (!tableBody) return;

    tableBody.innerHTML = ""; // Purana data clear karein

    if (!items || items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" style="padding: 10px; text-align: center;">No records found</td></tr>`;
        return;
    }

    items.forEach(item => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #eee";
        
        row.innerHTML = `
            <td style="padding: 10px;">${item.name || "N/A"}</td>
            <td style="padding: 10px;">${item.email || "N/A"}</td>
        `;
        tableBody.appendChild(row);
    });
}
// Real-time Search Input Listener
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", function(e) {
        const searchTerm = e.target.value.trim();
        loadDashboardData(1, searchTerm);
    });
}
// 1. Update Profile Form Submission
const updateProfileForm = document.getElementById("updateProfileForm");
if (updateProfileForm) {
    updateProfileForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const name = document.getElementById("updateName").value;
        const email = document.getElementById("updateEmail").value;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Profile updated successfully!");
            } else {
                alert(data.error || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while updating profile.");
        }
    });
}

// 2. Change Password Form Submission
const changePasswordForm = document.getElementById("changePasswordForm");
if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/auth/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Password changed successfully!");
                changePasswordForm.reset();
            } else {
                alert(data.error || "Failed to change password");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while changing password.");
        }
    });
}