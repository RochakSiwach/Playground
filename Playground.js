
//notification js
 let notifications = [];
    const maxNotifications = 10;

    function toggleNotifications() {
      const box = document.getElementById("notificationBox");
      const badge = document.getElementById("notificationBadge");

      if (box.style.display === "block") {
        box.style.display = "none";
      } else {
        box.style.display = "block";
        badge.style.display = "none";
      }
    }

    function addNotification(message) {
      const time = new Date().toLocaleTimeString();
      notifications.unshift(`${message} (${time})`);
      if (notifications.length > maxNotifications) notifications.pop();
      updateNotificationList();
    }

    function updateNotificationList() {
      const list = document.getElementById("notificationList");
      const badge = document.getElementById("notificationBadge");

      list.innerHTML = "";

      if (notifications.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No notifications yet.";
        list.appendChild(li);
        badge.style.display = "none";
      } else {
        notifications.forEach(note => {
          const li = document.createElement("li");
          li.textContent = note;
          list.appendChild(li);
        });
        badge.textContent = notifications.length;
        badge.style.display = "inline-block";
      }
    }

    // This Add new notification every 5 seconds
    const sampleMessages = [
      "You have a new message.",
      "Trial confirmed!",
      "Match result updated.",
      "Reminder: Event starts soon.",
      "Store: New gear available."
    ];

    setInterval(() => {
      const msg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      addNotification(msg);
    }, 5000);







// --- Global State ---
let eventUserRole = null; 
/**
 * Shows the specified page section and hides all others.
 * Also handles page-specific initialization and access control.
 * @param {string} pageId The ID of the page section to show.
 */
function showPage(pageId) {
    if (pageId === 'events-page' && !eventUserRole) {
        alert("Please log in to access the events page.");
        showPage('login-register-page'); // Redirect to login
        return;
    }
    document.body.style.backgroundColor = '#f4f4f4'; 
    document.body.style.backgroundImage = 'none'; 
    document.body.style.background = '#f4f4f4'; 

    if (pageId === 'login-register-page') {
        document.body.style.backgroundColor = '#000';
        document.body.style.backgroundImage = 'url("https://placehold.co/1920x1080/000000/FFFFFF?text=Cricket+Background")'; // Placeholder for cricket.jpg
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else if (pageId === 'leaderboard-page') {
        document.body.style.background = 'linear-gradient(120deg, #232526, #414345)'; // Leaderboard specific background
    }

    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    const activePage = document.getElementById(pageId);
    if(activePage) {
        activePage.classList.add('active');
    }

    if (pageId === 'store-page') {
        renderProducts(); 
        document.getElementById("cart-panel").style.display = "none";
    } else if (pageId === 'leaderboard-page') {
        initLeaderboard(); 
    } else if (pageId === 'events-page') {
        initEventsPage(); 
    } else if (pageId === 'login-register-page') {
        switchTab('login'); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showPage('home-page');
});





// --- Login/Register Page JS ---
/**
 * @param {string} tab The tab to activate ('login' or 'signup').
 */
function switchTab(tab) {
    const login = document.getElementById("loginForm");
    const signup = document.getElementById("signupForm");
    const tabs = document.querySelectorAll(".login-register-section .tab"); // Select tabs within the specific section

    tabs.forEach(btn => btn.classList.remove("active"));
    const clickedTab = document.querySelector(`.tab[onclick="switchTab('${tab}')"]`);
    if (clickedTab) {
        clickedTab.classList.add("active");
    }

    if (tab === "login") {
        login.classList.add("active");
        signup.classList.remove("active");
    } else {
        signup.classList.add("active");
        login.classList.remove("active");
    }
}

/**
 * @param {Event} e The submit event object.
 * @returns {boolean} False to prevent default form submission.
 */
function handleLogin(e) {
    e.preventDefault(); // Prevent the browser's default form submission behavior
    const emailInput = document.querySelector('#loginForm input[type="email"]').value;
    const passwordInput = document.querySelector('#loginForm input[type="password"]').value;
    const role = document.querySelector('input[name="loginRole"]:checked').value;

    if (emailInput === "" || passwordInput === "") {
        alert("Please enter both email and password.");
        return false;
    }
    
    eventUserRole = role; // Set the global user role
    alert(`Successfully logged in as ${role}!`);
    showPage('events-page'); // Redirect to the events page after successful login
    return false; // Prevent further form actions
}

/**
 * @param {Event} e The submit event object.
 * @returns {boolean} False to prevent default form submission.
 */
function handleSignup(e) {
    e.preventDefault(); 
    const fullNameInput = document.querySelector('#signupForm input[type="text"]').value;
    const emailInput = document.querySelector('#signupForm input[type="email"]').value;
    const passwordInput = document.querySelector('#signupForm input[type="password"]').value;
    const role = document.querySelector('input[name="signupRole"]:checked').value;

    if (fullNameInput === "" || emailInput === "" || passwordInput === "") {
        alert("Please fill all fields for registration.");
        return false;
    }

    alert(`Successfully registered as ${role}! Please log in.`);
    switchTab('login'); // After signup, prompt user to login
    return false; // Prevent further form actions
}




// --- Event Page JS ---
let events = []; // Array to store event data
let trials = []; // Array to store trial bookings
let newsUpdates = [ // Sample news updates
    { email: "student1@example.com", message: "You have been selected for Match A!" },
    { email: "student2@example.com", message: "Training rescheduled to Monday." },
];


function initEventsPage() {
    if (!eventUserRole) {
        showPage('login-register-page'); 
        return;
    }

    const userRoleLabel = document.getElementById('eventUserRoleLabel');
    if (userRoleLabel) {
        userRoleLabel.innerText = `Logged in as: ${eventUserRole.charAt(0).toUpperCase() + eventUserRole.slice(1)}`;
    }

    const coachForm = document.getElementById('coachForm');
    if (coachForm) {
        if (eventUserRole === 'coach') {
            coachForm.classList.remove('hidden');
        } else {
            coachForm.classList.add('hidden');
        }
    }
    
    showEventSection('eventPanel');
    updateEventList();
    updateEventDropdown();
}

/**
 * @param {string} id The ID of the event sub-section to display.
 */
function showEventSection(id) {
    const sections = ['eventPanel', 'trialSection', 'newsSection'];
    sections.forEach(sectionId => {
        const el = document.getElementById(sectionId);
        if(el) el.classList.add('hidden'); // Hide all other event sub-sections
    });
    const activeSection = document.getElementById(id);
    if(activeSection) activeSection.classList.remove('hidden');
}


function postEvent() {
    const title = document.getElementById('eventTitle').value;
    const details = document.getElementById('eventDetails').value;
    if (!title || !details) {
        alert("Please fill all fields.");
        return;
    }
    events.push({ title, details }); // Add new event to the in-memory array
    updateEventList(); // Refresh the displayed list of events
    updateEventDropdown(); // Update the dropdown for trial bookings
    // Clear input fields after posting
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDetails').value = '';
    alert("Event posted successfully!");
}

function updateEventList() {
    const list = document.getElementById('eventList');
    list.innerHTML = ''; // Clear existing list items to prevent duplicates
    events.forEach(e => {
        const li = document.createElement('li');
        li.textContent = `${e.title}: ${e.details}`;
        list.appendChild(li); // Add each event as a new list item
    });
}

function updateEventDropdown() {
    const dropdown = document.getElementById('eventSelect');
    dropdown.innerHTML = '<option disabled selected>Select an Event</option>'; // Reset dropdown with default option
    events.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.title;
        opt.innerText = e.title;
        dropdown.appendChild(opt); // Add each event to the dropdown options
    });
}

function bookTrial() {
    const name = document.getElementById('studentName').value;
    const event = document.getElementById('eventSelect').value;
    if (!name || !event || event === 'Select an Event') { // Check for empty fields or default dropdown selection
        alert('Please enter your name and select an event.');
        return;
    }
    const entry = `${name} booked trial for ${event}`;
    trials.push(entry); // Add trial booking to in-memory array
    const li = document.createElement('li');
    li.innerText = entry;
    const trialList = document.getElementById('trialList');
    if (trialList) {
        trialList.appendChild(li); // Display the new trial booking
    }
    document.getElementById('studentName').value = ''; // Clear input field
    alert("Trial booked successfully!");
}

function showUpdates() {
    const email = document.getElementById('searchEmail').value;
    const found = newsUpdates.find(n => n.email === email); // Find updates for the given email
    const userUpdatesElement = document.getElementById('userUpdates');
    if (userUpdatesElement) {
        userUpdatesElement.innerText = found ? found.message : 'No updates for this email.';
    }
}



// --- Store Page JS ---
let cart = [];
const cartCountSpan = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartModal = document.getElementById("cart-modal");

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.closest(".product");
    const title = product.querySelector("h2").innerText;
    const price = parseFloat(product.querySelector(".price").innerText.replace("₹", ""));

    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ title, price, quantity: 1 });
    }
    updateCartUI();
  });
});

function updateCartUI() {
  cartItemsList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.title} (x${item.quantity})</span>
      <button onclick="removeItem(${index})">Remove</button>
    `;
    cartItemsList.appendChild(li);
  });

  cartCountSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.innerText = `Total: ₹${total}`;
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartUI();
}

document.querySelector(".cart-button").addEventListener("click", () => {
  cartModal.style.display = "block";
});

document.getElementById("close-cart-btn").addEventListener("click", () => {
  cartModal.style.display = "none";
});

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  const paymentMethod = document.getElementById("payment-method").value;
  alert(`Order placed using ${paymentMethod.toUpperCase()}!`);
  cart = [];
  updateCartUI();
  cartModal.style.display = "none";
});

// 🔍 Search functionality
const searchBox = document.querySelector(".search-box");
searchBox.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const products = document.querySelectorAll(".product");

  products.forEach((product) => {
    const title = product.querySelector("h2").innerText.toLowerCase();
    const description = product.querySelector("p").innerText.toLowerCase();
    
    if (title.includes(query) || description.includes(query)) {
      product.style.display = "flex"; // make sure flex matches your layout
    } else {
      product.style.display = "none";
    }
  });
});


// --- Leaderboard Page JS ---

const indianStatesleaderboard = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman & Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

let players = [
  { id: 'p1', name: "Virat Kohli", state: "Delhi", role: "Batsman", matchesPlayed: 10, runs: 850, centuries: 3, wickets: 2, catches: 10, stumpings: 0, points: 0 },
  { id: 'p2', name: "Rohit Sharma", state: "Maharashtra", role: "Batsman", matchesPlayed: 9, runs: 780, centuries: 2, wickets: 0, catches: 5, stumpings: 0, points: 0 },
  { id: 'p3', name: "Jasprit Bumrah", state: "Gujarat", role: "Bowler", matchesPlayed: 10, runs: 50, centuries: 0, wickets: 25, catches: 3, stumpings: 0, points: 0 },
  { id: 'p4', name: "Ravindra Jadeja", state: "Gujarat", role: "All-rounder", matchesPlayed: 10, runs: 320, centuries: 0, wickets: 18, catches: 8, stumpings: 0, points: 0 },
  { id: 'p5', name: "Rishabh Pant", state: "Uttarakhand", role: "Wicketkeeper", matchesPlayed: 8, runs: 450, centuries: 1, wickets: 0, catches: 15, stumpings: 8, points: 0 },
  { id: 'p6', name: "KL Rahul", state: "Karnataka", role: "Batsman", matchesPlayed: 7, runs: 610, centuries: 2, wickets: 0, catches: 7, stumpings: 0, points: 0 },
  { id: 'p7', name: "Hardik Pandya", state: "Gujarat", role: "All-rounder", matchesPlayed: 8, runs: 420, centuries: 1, wickets: 12, catches: 6, stumpings: 0, points: 0 },
  { id: 'p8', name: "Sanju Samson", state: "Kerala", role: "Wicketkeeper", matchesPlayed: 7, runs: 360, centuries: 0, wickets: 0, catches: 10, stumpings: 4, points: 0 },
  { id: 'p9', name: "Yuzvendra Chahal", state: "Haryana", role: "Bowler", matchesPlayed: 9, runs: 25, centuries: 0, wickets: 19, catches: 2, stumpings: 0, points: 0 },
  { id: 'p10', name: "Suryakumar Yadav", state: "Maharashtra", role: "Batsman", matchesPlayed: 9, runs: 690, centuries: 2, wickets: 0, catches: 5, stumpings: 0, points: 0 }
];

let teams = [
  { id: 't1', name: "Delhi Daredevils", wins: 7, losses: 3, draws: 0, points: 14 },
  { id: 't2', name: "Mumbai Indians", wins: 6, losses: 4, draws: 0, points: 12 },
  { id: 't3', name: "Gujarat Titans", wins: 8, losses: 2, draws: 0, points: 16 }
];

let currentCategory = 'overall';
let currentFilterState = 'all';
let updateIntervalId;
const UPDATE_FREQUENCY_SECONDS = 5;

function populateStateFilter() {
  const stateFilter = document.getElementById('stateFilter');
  stateFilter.innerHTML = '<option value="all">All States</option>';
  indianStatesleaderboard.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateFilter.appendChild(option);
  });
  stateFilter.addEventListener('change', e => {
    currentFilterState = e.target.value;
    renderLeaderboard();
  });
}

function updateTimestamps() {
  const lastUpdatedSpan = document.getElementById('lastUpdated');
  const nextUpdateSpan = document.getElementById('nextUpdate');
  if (lastUpdatedSpan) {
    lastUpdatedSpan.textContent = new Date().toLocaleTimeString();
  }
  if (nextUpdateSpan) {
    let countdown = UPDATE_FREQUENCY_SECONDS;
    if (nextUpdateSpan.dataset.countdownInterval) {
      clearInterval(parseInt(nextUpdateSpan.dataset.countdownInterval));
    }
    const interval = setInterval(() => {
      countdown--;
      nextUpdateSpan.textContent = countdown >= 0 ? countdown : UPDATE_FREQUENCY_SECONDS;
      if (countdown < 0) clearInterval(interval);
    }, 1000);
    nextUpdateSpan.dataset.countdownInterval = interval.toString();
  }
}

function simulateUpdates() {
  players.forEach(p => {
    p.runs += Math.floor(Math.random() * 20);
    p.wickets += Math.floor(Math.random() * 3);
    if (Math.random() < 0.05) {
      p.centuries += 1;
      p.runs += 100;
    }
    p.catches += Math.floor(Math.random() * 2);
    p.stumpings += Math.floor(Math.random() * 1);
  });
  teams.forEach(t => {
    const roll = Math.random();
    if (roll < 0.4) { t.wins++; t.points += 2; }
    else if (roll < 0.7) { t.losses++; }
    else { t.draws++; t.points += 1; }
  });
  renderLeaderboard();
  updateTimestamps();
}

function getFilteredPlayers(data) {
  return currentFilterState === 'all'
    ? [...data]
    : data.filter(p => p.state === currentFilterState);
}

function renderLeaderboard() {
  const leaderboardContentDiv = document.getElementById('leaderboard-content');
  if (!leaderboardContentDiv) return;

  let headers = [];
  let data = [];
  let tableType = 'player';
  const filteredPlayers = getFilteredPlayers(players);

  switch (currentCategory) {
    case 'overall':
      headers = ['Player Name', 'State', 'Role', 'Matches Played', 'Runs', 'Wickets', 'Catches', 'Stumpings'];
      data = [...filteredPlayers].sort((a, b) => (b.runs + b.wickets * 10) - (a.runs + a.wickets * 10));
      break;
    case 'batsman':
      headers = ['Player Name', 'State', 'Matches Played', 'Runs', 'Centuries'];
      data = filteredPlayers.filter(p => p.role.includes('Batsman') || p.role.includes('All')).sort((a, b) => b.runs - a.runs);
      break;
    case 'bowler':
      headers = ['Player Name', 'State', 'Matches Played', 'Wickets'];
      data = filteredPlayers.filter(p => p.role.includes('Bowler') || p.role.includes('All')).sort((a, b) => b.wickets - a.wickets);
      break;
    case 'mostRuns':
      headers = ['Player Name', 'State', 'Matches Played', 'Runs', 'Centuries'];
      data = [...filteredPlayers].sort((a, b) => b.runs - a.runs);
      break;
    case 'mostWickets':
      headers = ['Player Name', 'State', 'Matches Played', 'Wickets'];
      data = [...filteredPlayers].sort((a, b) => b.wickets - a.wickets);
      break;
    case 'mostCenturies':
      headers = ['Player Name', 'State', 'Matches Played', 'Centuries', 'Runs'];
      data = [...filteredPlayers].sort((a, b) => b.centuries - a.centuries);
      break;
    case 'wicketkeeper':
      headers = ['Player Name', 'State', 'Matches Played', 'Catches', 'Stumpings'];
      data = filteredPlayers.filter(p => p.role === 'Wicketkeeper').sort((a, b) => (b.catches + b.stumpings) - (a.catches + a.stumpings));
      break;
    case 'teams':
      headers = ['Team Name', 'Wins', 'Losses', 'Draws', 'Points'];
      data = [...teams].sort((a, b) => b.points - a.points);
      tableType = 'team';
      break;
  }

  leaderboardContentDiv.innerHTML = createTableHTML(headers, data, tableType);
}

function createTableHTML(headers, dataRows, type) {
  let html = `<table><thead><tr><th>Rank</th>`;
  headers.forEach(h => html += `<th>${h}</th>`);
  html += `</tr></thead><tbody>`;
  dataRows.forEach((row, index) => {
    const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
    html += `<tr class="${rankClass}"><td>${index + 1}</td>`;
    headers.forEach(h => {
      let val = '-';
      switch (h) {
        case 'Player Name': case 'Team Name': val = `<span class="player-name">${row.name}</span>`; break;
        default: val = row[h.replace(/\s/g, '').charAt(0).toLowerCase() + h.replace(/\s/g, '').slice(1)] ?? '-';
      }
      html += `<td>${val}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

function initializeLeaderboard() {
  populateStateFilter();
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderLeaderboard();
    });
  });
  renderLeaderboard();
  updateTimestamps();
  updateIntervalId = setInterval(simulateUpdates, UPDATE_FREQUENCY_SECONDS * 1000);
}

document.addEventListener('DOMContentLoaded', initializeLeaderboard);



const predefinedUsers = [
    { email: "coach@runbhumi.com", password: "coach123", role: "coach", id: "COACH001" },
    { email: "admin@runbhumi.com", password: "admin123", role: "admin", id: "ADMIN001" }
    // Student accounts are NOT predefined here; they are "registered" via the signup form.
];

// Array of Indian states for the dropdown
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman & Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// --- Form Interaction Functions ---

/**
 * @param {string} tabId The ID of the tab to activate ('login' or 'signup').
 */
function switchTab(tabId) {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const tabs = document.querySelectorAll(".tab"); // All tab buttons

    tabs.forEach(btn => btn.classList.remove("active"));

    const activeTabButton = document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`);
    if (activeTabButton) {
        activeTabButton.classList.add("active");
    }

    if (tabId === "login") {
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
        toggleLoginIdField();
    } else { // tabId === "signup"
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
        toggleSignupFields();
    }
}

function toggleLoginIdField() {
    const selectedRole = document.querySelector('input[name="loginRole"]:checked').value;
    const loginIdFieldContainer = document.getElementById("loginIdField");
    const loginUserIdInput = document.getElementById("loginUserId");

    if (selectedRole === "coach" || selectedRole === "admin") {
        loginIdFieldContainer.classList.add("show");
        loginUserIdInput.setAttribute("required", true);
        loginUserIdInput.placeholder = `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} ID`;
        // Removed: loginUserIdInput.value = userToPrefill.id;
        loginUserIdInput.value = ""; // Ensure it's clear for user input
    } else { // selectedRole === "student"
        loginIdFieldContainer.classList.remove("show");
        loginUserIdInput.removeAttribute("required");
        loginUserIdInput.value = ""; // Clear value when hidden
    }
}

function toggleSignupFields() {
    const selectedRole = document.querySelector('input[name="signupRole"]:checked').value;
    const additionalFieldsContainer = document.getElementById("additionalSignupFields");
    const signupExperience = document.getElementById("signupExperience");
    const signupDOB = document.getElementById("signupDOB");
    const signupState = document.getElementById("signupState"); // Now a select element
    const signupDOBInputBox = document.getElementById("signupDOBInputBox"); // Parent div for DOB
    const signupStateInputBox = document.getElementById("signupStateInputBox"); // Parent div for State
    const signupExperienceInputBox = document.getElementById("signupExperienceInputBox"); // Parent div for Experience


    signupExperience.value = "";
    signupExperience.removeAttribute("required");
    signupDOB.value = "";
    signupDOB.removeAttribute("required");
    signupState.value = "";
    signupState.removeAttribute("required");

    if (selectedRole === "coach") {
        additionalFieldsContainer.classList.add("show");
        signupDOBInputBox.classList.add("show-inline"); // Show DOB
        signupStateInputBox.classList.add("show-inline"); // Show State
        signupExperienceInputBox.classList.add("show-inline"); // Show Experience

        signupExperience.setAttribute("required", true);
        signupDOB.setAttribute("required", true);
        signupState.setAttribute("required", true);
    } else if (selectedRole === "admin") {

        additionalFieldsContainer.classList.remove("show"); // Hide the container
        signupDOBInputBox.classList.remove("show-inline"); // Hide DOB for admin
        signupStateInputBox.classList.remove("show-inline"); // Hide State for admin
        signupExperienceInputBox.classList.remove("show-inline"); // Hide Experience for admin

        signupExperience.removeAttribute("required");
        signupDOB.removeAttribute("required");
        signupState.removeAttribute("required");
    } else { // selectedRole === "student"
        additionalFieldsContainer.classList.add("show");
        signupDOBInputBox.classList.add("show-inline"); // Show DOB
        signupStateInputBox.classList.add("show-inline"); // Show State
        signupExperienceInputBox.classList.remove("show-inline"); // Hide Experience for student

        signupDOB.setAttribute("required", true);
        signupState.setAttribute("required", true);
        signupExperience.removeAttribute("required"); // Experience is optional for student
    }
}


/**
 * @param {Event} e The submit event object to prevent default form behavior.
 * @returns {boolean} False to prevent default form submission and page reload.
 */
function handleLogin(e) {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const selectedRole = document.querySelector('input[name="loginRole"]:checked').value;
    const loginUserId = document.getElementById("loginUserId").value.trim(); // Get the ID field value

    if (!email || !password) {
        alert("Please enter both email and password.");
        return false;
    }

    let authenticated = false;
    let actualRole = null;
    let userDetails = {};

    for (let user of predefinedUsers) {
        if (user.email === email && user.password === password && user.role === selectedRole) {
            // If coach/admin, also check the ID
            if ((selectedRole === 'coach' && user.id === loginUserId) ||
                (selectedRole === 'admin' && user.id === loginUserId)) {
                authenticated = true;
                actualRole = user.role;
                userDetails = { email: user.email, id: user.id };
                break;
            } else if (selectedRole === 'coach' || selectedRole === 'admin') {
                // If role matches but ID is wrong
                alert("Login failed! Invalid ID for the selected role.");
                return false;
            }
        }
    }

    if (!authenticated && selectedRole === 'student') {

        authenticated = true;
        actualRole = 'student';
        userDetails = { email: email, name: "Student User" }; // Mock student name
    }

    if (authenticated) {
        let alertMessage = `Login successful! Role: ${actualRole.charAt(0).toUpperCase() + actualRole.slice(1)}\n`;
        if (actualRole === 'coach' || actualRole === 'admin') {
            alertMessage += `ID: ${userDetails.id}\nEmail: ${userDetails.email}`;
        } else if (actualRole === 'student') {
            alertMessage += `Email: ${userDetails.email}`;
        }
        alert(alertMessage);
        document.getElementById("loginForm").reset(); // Clear form fields
        toggleLoginIdField(); // Hide ID field after reset

        console.log(`User logged in: Email: ${email}, Role: ${actualRole}, ID: ${loginUserId}`);
    } else {
        alert("Login failed! Invalid email, password, or role.");
    }
    return false; // Prevent page reload
}

/**
 * @param {Event} e The submit event object to prevent default form behavior.
 * @returns {boolean} False to prevent default form submission and page reload.
 */
function handleSignup(e) {
    e.preventDefault(); // Prevent default form submission

    const fullName = document.getElementById("signupFullName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const dob = document.getElementById("signupDOB").value; // Date value
    const selectedRole = document.querySelector('input[name="signupRole"]:checked').value;
    let experience = document.getElementById("signupExperience").value.trim();
    let state = document.getElementById("signupState").value; // Get value from select

    if (!fullName || !email || !password || !phone) {
        alert("Please fill in all common registration fields.");
        return false;
    }

    let registeredUserData = {
        fullName,
        email,
        password, // In a real app, hash this password before sending/storing!
        phone,
        role: selectedRole
    };

    if (selectedRole === 'coach') {
        if (!dob || !experience || !state) {
            alert("Please fill in Date of Birth, Experience and State for Coach registration.");
            return false;
        }
        registeredUserData.dob = dob;
        registeredUserData.experience = experience;
        registeredUserData.state = state;
        alert("Coach accounts are predefined. You cannot register as a Coach via this form.");
        return false;
    } else if (selectedRole === 'admin') {
        alert("Admin accounts are predefined. You cannot register as an Admin via this form.");
        return false;
    } else { // selectedRole === 'student'
        if (!dob || !state) { // DOB and State are required for students
             alert("Please fill in Date of Birth and select your State for Student registration.");
             return false;
        }
        registeredUserData.dob = dob;
        registeredUserData.state = state;
        registeredUserData.experience = undefined;
    }

    alert(`Registration successful for ${registeredUserData.fullName} (${registeredUserData.role})! You can now log in.`);
    console.log("Registered User Data:", registeredUserData);

    document.getElementById("signupForm").reset(); // Clear the signup form fields
    switchTab('login'); // Automatically switch to the login tab after successful registration
    toggleSignupFields(); // Reset signup fields visibility
    return false; // Prevent page reload
}


function populateStatesDropdown() {
    const stateSelect = document.getElementById("signupState");
    if (stateSelect) {
        stateSelect.innerHTML = '<option value="" disabled selected>Select State</option>'; // Default option
        indianStates.forEach(state => {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateStatesDropdown(); // Populate states when DOM is ready
    switchTab('login'); // Activate login tab
    toggleLoginIdField(); // Initialize login ID field visibility (will hide for student, show empty for others)
    toggleSignupFields(); // Initialize signup fields visibility
});
