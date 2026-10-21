// ---------- Dummy data (no backend, so everything lives here) ----------
const accounts = [
  { id: "HX-100231", type: "Standard", currency: "USD", balance: 12450.75, status: "Active" },
  { id: "HX-100232", type: "Islamic",  currency: "USD", balance: 3200.0,   status: "Active" },
  { id: "HX-100877", type: "Standard", currency: "EUR", balance: 0,        status: "Pending" },
];

let transactions = [
  { date: "2026-10-14", ref: "DEP-4821", method: "Bank transfer", amount: 5000, status: "Completed" },
  { date: "2026-10-02", ref: "DEP-4710", method: "Card",          amount: 1500, status: "Completed" },
  { date: "2026-09-21", ref: "DEP-4602", method: "Bank transfer", amount: 800,  status: "Pending" },
];

const tickets = [
  { id: "SUP-311", subject: "Update phone number", status: "Open" },
  { id: "SUP-298", subject: "Deposit not showing", status: "Closed" },
];

const app = document.getElementById("app");

// ---------- Small helper functions ----------
function money(n, cur = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(n);
}

function badge(status) {
  const cls = { Active: "ok", Completed: "ok", Closed: "ok", Pending: "wait", Open: "wait" }[status] || "no";
  return `<span class="badge ${cls}">${status}</span>`;
}

function isLoggedIn() {
  return sessionStorage.getItem("user") !== null;
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ---------- Pieces shared by the auth pages ----------
function topbar() {
  return `
    <header class="topbar">
      <span><span class="logo">HX</span></span>
      <div class="topbar-links">
        <a href="#/login">Sign in</a>
        <a href="#/register">Create account</a>
        <select aria-label="Language" style="width:auto">
          <option>English</option><option>हिन्दी</option><option>मराठी</option>
        </select>
      </div>
    </header>`;
}

const footer = `<p class="footer">HX Nexus trader workspace — Broker-managed / Identity-bound / No trading incentives</p>`;

// ---------- Pages ----------
function loginPage() {
  app.innerHTML = `
    ${topbar()}
    <main class="auth">
      <section class="auth-left">
        <small>Trader portal</small>
        <h2>Your accounts. One clear view.</h2>
        <p>Balances, funding and onboarding stay in this CRM view. No dealing or order tools.</p>
        <ul>
          <li><span>01</span> Accounts</li>
          <li><span>02</span> Fund</li>
          <li><span>03</span> Support</li>
        </ul>
      </section>
      <section class="auth-right">
        <form class="auth-box" id="loginForm">
          <small class="sub">Welcome back</small>
          <h1>Sign in to your workspace</h1>
          <p class="sub">Use your account details to continue.</p>
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" required>
          <label for="password">Password</label>
          <input id="password" type="password" required>
          <p class="error" id="loginError"></p>
          <button class="btn full" type="submit">Sign in →</button>
          <p class="switch">New here? <a href="#/register">Create a trader account</a></p>
        </form>
      </section>
    </main>
    ${footer}`;

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    // Demo only: accept any non-empty password of 4+ characters
    if (password.length < 4) {
      document.getElementById("loginError").textContent = "Password must be at least 4 characters.";
      return;
    }
    sessionStorage.setItem("user", email);
    location.hash = "#/accounts";
  });
}

function registerPage() {
  app.innerHTML = `
    ${topbar()}
    <main class="auth">
      <section class="auth-left">
        <small>Trader portal</small>
        <h2>Open your trader account</h2>
        <p>Tell us who you are. Your broker verifies your identity before funding is enabled.</p>
      </section>
      <section class="auth-right">
        <form class="auth-box" id="registerForm">
          <h1>Create a trader account</h1>
          <p class="sub">It takes about two minutes.</p>
          <label for="name">Full name</label>
          <input id="name" required>
          <label for="remail">Email</label>
          <input id="remail" type="email" required>
          <label for="country">Country</label>
          <select id="country"><option>India</option><option>United Kingdom</option><option>UAE</option><option>Other</option></select>
          <label for="rpass">Password</label>
          <input id="rpass" type="password" minlength="6" required>
          <button class="btn full" type="submit">Create account →</button>
          <p class="switch">Already registered? <a href="#/login">Sign in</a></p>
        </form>
      </section>
    </main>
    ${footer}`;

  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sessionStorage.setItem("user", document.getElementById("remail").value);
    location.hash = "#/accounts";
  });
}

// Layout used by every logged-in page: sidebar + main area
function dashboardShell(active, title, subtitle, content) {
  const link = (hash, label) =>
    `<a href="#/${hash}" class="${active === hash ? "active" : ""}">${label}</a>`;

  app.innerHTML = `
    <div class="shell">
      <nav class="sidebar" id="sidebar">
        <div class="brand"><span class="logo">HX</span> HX Nexus</div>
        ${link("accounts", "Accounts")}
        ${link("fund", "Fund")}
        ${link("support", "Support")}
        <button class="logout" id="logout">Sign out</button>
      </nav>
      <main class="main">
        <div class="main-head">
          <div>
            <h1>${title}</h1>
            <p>${subtitle}</p>
          </div>
          <button class="btn light menu-btn" id="menuBtn">☰ Menu</button>
        </div>
        ${content}
      </main>
    </div>`;

  document.getElementById("logout").addEventListener("click", () => {
    sessionStorage.removeItem("user");
    location.hash = "#/login";
  });
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
}

function accountsPage() {
  const total = accounts.reduce((sum, a) => sum + (a.currency === "USD" ? a.balance : 0), 0);
  const rows = accounts.map((a) => `
    <tr>
      <td>${a.id}</td><td>${a.type}</td><td>${a.currency}</td>
      <td>${money(a.balance, a.currency)}</td><td>${badge(a.status)}</td>
    </tr>`).join("");

  dashboardShell("accounts", "Accounts", "Balances and onboarding status", `
    <div class="stats">
      <div class="stat"><div class="label">Total balance (USD)</div><div class="value">${money(total)}</div></div>
      <div class="stat"><div class="label">Active accounts</div><div class="value">${accounts.filter(a => a.status === "Active").length}</div></div>
      <div class="stat"><div class="label">Pending</div><div class="value">${accounts.filter(a => a.status === "Pending").length}</div></div>
    </div>
    <div class="card">
      <h3>Your trading accounts</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Account</th><th>Type</th><th>Currency</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`);
}

function fundPage() {
  const options = accounts.filter(a => a.status === "Active")
    .map(a => `<option>${a.id} (${a.currency})</option>`).join("");

  function historyRows() {
    return transactions.map(t => `
      <tr><td>${t.date}</td><td>${t.ref}</td><td>${t.method}</td>
      <td>${money(t.amount)}</td><td>${badge(t.status)}</td></tr>`).join("");
  }

  dashboardShell("fund", "Fund", "Add money to your account", `
    <div class="notice">Funding is managed by your broker. Deposits can take up to one business day.</div>
    <div class="row">
      <form class="card" id="fundForm">
        <h3>New deposit</h3>
        <label for="acc">Account</label>
        <select id="acc">${options}</select>
        <label for="method">Method</label>
        <select id="method"><option>Bank transfer</option><option>Card</option></select>
        <label for="amount">Amount (USD)</label>
        <input id="amount" type="number" min="10" step="0.01" placeholder="100.00" required>
        <button class="btn full" type="submit">Submit deposit</button>
      </form>
      <div class="card">
        <h3>Deposit history</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Ref</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody id="history">${historyRows()}</tbody>
          </table>
        </div>
      </div>
    </div>`);

  document.getElementById("fundForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    transactions.unshift({
      date: new Date().toISOString().slice(0, 10),
      ref: "DEP-" + Math.floor(1000 + Math.random() * 9000),
      method: document.getElementById("method").value,
      amount: amount,
      status: "Pending",
    });
    document.getElementById("history").innerHTML = historyRows();
    e.target.reset();
    showToast("Deposit request sent");
  });
}

function supportPage() {
  function ticketRows() {
    return tickets.map(t => `<tr><td>${t.id}</td><td>${t.subject}</td><td>${badge(t.status)}</td></tr>`).join("");
  }

  dashboardShell("support", "Support", "Ask us anything about your account", `
    <div class="row">
      <form class="card" id="ticketForm">
        <h3>Open a request</h3>
        <label for="subject">Subject</label>
        <input id="subject" required>
        <label for="message">Message</label>
        <textarea id="message" rows="5" required></textarea>
        <button class="btn full" type="submit">Send request</button>
      </form>
      <div class="card">
        <h3>Your requests</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Subject</th><th>Status</th></tr></thead>
            <tbody id="tickets">${ticketRows()}</tbody>
          </table>
        </div>
      </div>
    </div>`);

  document.getElementById("ticketForm").addEventListener("submit", (e) => {
    e.preventDefault();
    tickets.unshift({
      id: "SUP-" + Math.floor(100 + Math.random() * 900),
      subject: document.getElementById("subject").value,
      status: "Open",
    });
    document.getElementById("tickets").innerHTML = ticketRows();
    e.target.reset();
    showToast("Request sent");
  });
}

// ---------- Router: picks a page based on the URL hash ----------
function router() {
  const page = location.hash.replace("#/", "") || "login";
  const protectedPages = { accounts: accountsPage, fund: fundPage, support: supportPage };

  if (protectedPages[page]) {
    // Not signed in? Send to login.
    if (!isLoggedIn()) { location.hash = "#/login"; return; }
    protectedPages[page]();
  } else if (page === "register") {
    registerPage();
  } else {
    loginPage();
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
router();
