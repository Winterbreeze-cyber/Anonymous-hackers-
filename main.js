// Matrix code animation
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let chars = "01/\\|█▓▒░@#$%&*-=+".split("");
let fontSize = 14;
let columns = canvas.width / fontSize;
let drops = Array(Math.floor(columns)).fill(1);
function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#33ff33";
  ctx.font = fontSize + "px Courier New";
  for (let i = 0; i < drops.length; i++) {
    let text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 33);

// Typewriter intro
const introText = `
[Welcome to the Hackers Collective]
Initializing node handshake...
Verifying connection...
Access granted to public interface.`;
let index = 0;
function typeWriter() {
  const typeBox = document.getElementById("typewriter");
  if (index < introText.length) {
    typeBox.textContent += introText.charAt(index);
    index++;
    setTimeout(typeWriter, 40);
  }
}
window.onload = () => {
  typeWriter();
};

// Terminal log
function logToTerminal(message) {
  const terminal = document.getElementById("terminal-output");
  const timestamp = new Date().toLocaleTimeString();
  terminal.textContent += `[${timestamp}] ${message}\n`;
  terminal.scrollTop = terminal.scrollHeight;
}

// DintAudioFX
const keyAudio = new Audio("keyboard.mp3");
keyAudio.volume = 0.1;
document.addEventListener("keydown", () => {
  keyAudio.currentTime = 0;
  keyAudio.play();
});

// Auth system
let authMode = "login";
let currentUser = null;

function switchAuth(mode) {
  authMode = mode;
  logToTerminal(`[MODE] Switched to ${mode.toUpperCase()} mode`);
  document.getElementById("error-message").textContent = "";
}

function authAction() {
  const handle = document.getElementById("handle").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("error-message");
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (handle.length < 3 || password.length < 4) {
    error.textContent = "Handle or password too short.";
    return;
  }

  if (authMode === "register") {
    if (users[handle]) {
      error.textContent = "User already exists.";
      return;
    }
    users[handle] = password;
    localStorage.setItem("users", JSON.stringify(users));
    logToTerminal("[+] User registered successfully.");
    error.textContent = "User registered. You may now login.";
  } else {
    if (!users[handle] || users[handle] !== password) {
      error.textContent = "Invalid credentials.";
      return;
    }
    currentUser = handle;
    startSession(handle);
  }
}

function startSession(handle) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("user-handle").textContent = handle;
  document.getElementById("avatar").src = generateAvatar(handle);
  renderMessages();
  renderUsers();
  logToTerminal(`[+] Logged in as ${handle}`);
}

function generateAvatar(handle) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const hash = Array.from(handle).reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if ((x + y + hash) % 2 === 0) {
        ctx.fillStyle = "#33ff33";
        ctx.fillRect(x * 8, y * 8, 8, 8);
      }
    }
  }

  return canvas.toDataURL();
}

// Messages
function postMessage() {
  const input = document.getElementById("new-message");
  const content = input.value.trim();
  if (!content) return;

  const messages = JSON.parse(localStorage.getItem("messages") || "[]");
  const newMsg = `[COMM] ${currentUser}: ${content}`;
  messages.push(newMsg);
  localStorage.setItem("messages", JSON.stringify(messages));
  input.value = "";
  renderMessages();
}

function renderMessages() {
  const messages = JSON.parse(localStorage.getItem("messages") || "[]");
  const list = document.getElementById("messages");
  list.innerHTML = "";
  messages.forEach(msg => {
    const li = document.createElement("li");
    li.textContent = msg;
    list.appendChild(li);
  });
}

// Tools
function launchTool(tool) {
  const output = document.getElementById("tool-terminal");
  output.textContent = "";
  document.getElementById("tool-output").classList.remove("hidden");

  const scripts = {
    brute: [
      "Initializing brute force attack...",
      "Trying password: 123456",
      "Trying password: qwerty",
      "Trying password: hunter2",
      "[+] Password found: !p@ssw0rd!",
      "[OK] Access granted to remote shell."
    ],
    hash: [
      "Starting hash cracking engine...",
      "Loading hashlist.txt...",
      "Cracking MD5: e99a18c428cb38d5f260853678922e03",
      "[+] Match found: abc123",
      "Cracking SHA256: ...",
      "[!] Not found in dictionary."
    ],
    ports: [
      "Initiating scan on 192.168.0.1...",
      "Scanning ports 1–1000...",
      "[+] Port 22 open (SSH)",
      "[+] Port 80 open (HTTP)",
      "[!] Port 445 filtered",
      "[OK] Scan complete."
    ]
  };

  let i = 0;
  const lines = scripts[tool];

  function animateLine() {
    if (i < lines.length) {
      output.textContent += lines[i] + "\n";
      i++;
      setTimeout(animateLine, 600);
    }
  }
  animateLine();
}

function closeTool() {
  document.getElementById("tool-output").classList.add("hidden");
}

// Peer Chat
function renderUsers() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const select = document.getElementById("peer-handle");
  select.innerHTML = "";
  Object.keys(users).forEach(user => {
    if (user !== currentUser) {
      const option = document.createElement("option");
      option.value = user;
      option.textContent = user;
      select.appendChild(option);
    }
  });
  renderPeerMessages();
}

function sendPeerMessage() {
  const peer = document.getElementById("peer-handle").value;
  const msg = document.getElementById("peer-message").value.trim();
  if (!peer || !msg) return;

  const threadKey = `chat_${currentUser}_${peer}`;
  const thread = JSON.parse(localStorage.getItem(threadKey) || "[]");
  thread.push({ from: currentUser, text: msg });
  localStorage.setItem(threadKey, JSON.stringify(thread));
  document.getElementById("peer-message").value = "";
  renderPeerMessages();
}

function renderPeerMessages() {
  const peer = document.getElementById("peer-handle").value;
  const threadKey = `chat_${currentUser}_${peer}`;
  const thread = JSON.parse(localStorage.getItem(threadKey) || "[]");
  const list = document.getElementById("peer-thread");
  list.innerHTML = "";

  thread.forEach(msg => {
    const li = document.createElement("li");
    li.textContent = `${msg.from}: ${msg.text}`;
    list.appendChild(li);
  });
}

document.getElementById("peer-handle").addEventListener("change", renderPeerMessages);

// Prevent snooping
document.addEventListener("contextmenu", e => e.preventDefault());
document.onkeydown = function (e) {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
    (e.ctrlKey && e.key === "U")
  ) {
    alert("Console access is restricted.");
    return false;
  }
};

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => logToTerminal("[*] Service worker activated. Offline access ready."))
      .catch(err => console.error("SW error", err));
  });
        }
