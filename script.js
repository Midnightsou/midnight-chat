const socket = io();
const username = localStorage.getItem("username");
const avatar = localStorage.getItem("avatar");
const status = localStorage.getItem("status");

// Set user details in the chat header
document.getElementById("userName").textContent = username;
document.getElementById("userAvatar").src = avatar;
document.getElementById("userStatus").textContent = `(${status})`;

// Listen for incoming messages
socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <img src="${msg.avatar}" class="avatar" alt="User Avatar">
    <strong>${msg.username}</strong>: ${msg.message}
  `;
  document.getElementById("messages").appendChild(li);

  // Scroll to the latest message
  document.getElementById("messages").scrollTo(0, document.getElementById("messages").scrollHeight);
});

// Update the online user count
socket.on("update users", (count) => {
  document.getElementById("userCount").textContent = `Online: ${count}`;
});

// Handle message form submission
document.getElementById("messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("m");
  const message = input.value.trim();
  if (message) {
    // Emit the message to the server
    socket.emit("chat message", {
      username: username,
      avatar: avatar,
      message: message
    });
    input.value = ""; // Clear the input field
    socket.emit("stop typing"); // Notify others that typing has stopped
  }
});

// Typing indicator
const typingIndicator = document.getElementById("typingIndicator");
const inputField = document.getElementById("m");
let typingTimeout;

inputField.addEventListener("input", () => {
  socket.emit("typing", username);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stop typing");
  }, 1000);
});

socket.on("typing", (user) => {
  typingIndicator.textContent = `${user} is typing...`;
});

socket.on("stop typing", () => {
  typingIndicator.textContent = "";
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkMode");
const body = document.body;

// Load saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
});

// Broadcast user status
socket.emit("user status", { username, status });

socket.on("user status", (userStatus) => {
  const statusMessage = `${userStatus.username} is now ${userStatus.status}`;
  const li = document.createElement("li");
  li.textContent = statusMessage;
  li.style.fontStyle = "italic";
  document.getElementById("messages").appendChild(li);
});

// Display the selected file name
const fileInput = document.getElementById('avatar');
const fileNameDisplay = document.getElementById('fileName');

fileInput.addEventListener('change', () => {
  const fileName = fileInput.files[0]?.name || 'No file chosen';
  fileNameDisplay.textContent = fileName;
});

// Handle Login Button Click
document.getElementById('loginButton').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const status = document.getElementById('status').value;

  if (!username) {
    alert('Please enter a username.');
    return;
  }

  // Save user details in localStorage
  localStorage.setItem('username', username);
  localStorage.setItem('status', status);

  // Redirect to chat page
  window.location.href = 'chat.html';
});
