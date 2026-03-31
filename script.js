<![CDATA[
/* StudyBuddy - Complete Client-Side App */

class StudyBuddy {
  constructor() {
    this.usersKey = 'studybuddy_users';
    this.currentUserKey = 'studybuddy_currentUser';
    this.tasksKey = 'studybuddy_tasks';
    this.scheduleKey = 'studybuddy_schedule';
    this.init();
  }

  init() {
    this.loadTheme();
    this.setupUI();
    this.checkAuth();
    this.handlePageSpecific();
  }

  // === AUTH ===
  hashPassword(password) {
    // Simple hash for demo (not production-ready)
    return btoa(password + 'studybuddy_salt');
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
  }

  saveUsers(users) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  getCurrentUser() {
    const email = localStorage.getItem(this.currentUserKey);
    if (!email) return null;
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  setCurrentUser(email) {
    localStorage.setItem(this.currentUserKey, email);
  }

  signup(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, msg: 'Email sudah terdaftar' };
    }
    const hashed = this.hashPassword(password);
    const user = { name, email, password: hashed, tasks: [], streak: 0 };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser(email);
    return { success: true };
  }

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    if (!user || user.password !== this.hashPassword(password)) {
      return { success: false, msg: 'Email/password salah' };
    }
    this.setCurrentUser(email);
    return { success: true };
  }

  logout() {
    localStorage.removeItem(this.currentUserKey);
    this.redirectToLogin();
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  checkAuth() {
    if (window.location.pathname.includes('dashboard.html') && !this.isAuthenticated()) {
      this.redirectToLogin();
    } else if (this.isAuthenticated() && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
      window.location.href = 'dashboard.html';
    }
  }

  redirectToLogin() {
    window.location.href = 'login.html';
  }

  // === DATA CRUD ===
  getTasks() {
    const user = this.getCurrentUser();
    return user ? JSON.parse(user.tasks || '[]') : [];
  }

  saveTasks(tasks) {
    const user = this.getCurrentUser();
    if (user) {
      user.tasks = JSON.stringify(tasks);
      const users = this.getUsers();
      const index = users.findIndex(u => u.email === user.email);
      users[index] = user;
      this.saveUsers(users);
    }
  }

  addTask(title, due, progress = 0, complete = false) {
    const tasks = this.getTasks();
    const task = {
      id: Date.now(),
      title,
      due,
      progress: parseInt(progress),
      complete,
      created: new Date().toISOString()
    };
    tasks.unshift(task); // Newest first
    this.saveTasks(tasks);
    this.renderTasks();
    this.updateProgress();
  }

  toggleTask(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.complete = !task.complete;
      this.saveTasks(tasks);
      this.renderTasks();
      this.updateProgress();
    }
  }

  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
    this.renderTasks();
    this.updateProgress();
  }

  updateProgress() {
    const tasks = this.getTasks();
    const total = tasks.length;
    if (total === 0) return;
    const completed = tasks.filter(t => t.complete).length;
    const percent = Math.round((completed / total) * 100);
    const bar = document.getElementById('main-bar');
    const val = document.getElementById('progress-val');
    if (bar && val) {
      bar.style.width = percent + '%';
      val.textContent = percent + '%';
    }
  }

  // === SCHEDULE ===
  getSchedule() {
    return JSON.parse(localStorage.getItem(this.scheduleKey) || '[]');
  }

  addSchedule(title, time) {
    const schedule = this.getSchedule();
    schedule.push({ title, time, day: new Date().getDay() });
    localStorage.setItem(this.scheduleKey, JSON.stringify(schedule));
  }

  renderSchedule() {
    // Demo schedule
    const demoItems = [
      {title: 'Web Development', time: '07:00 - 10:00 WIB', color: 'var(--primary)'},
      {title: 'Basis Data (MySQL)', time: '10:15 - 12:00 WIB', color: 'var(--accent)'}
    ];
    const container = document.querySelector('.schedule-list');
    if (container) {
      container.innerHTML = demoItems.map(item => `
        <div class="schedule-item" style="border-left-color: ${item.color}">
          <strong>${item.title}</strong>
          <span>${item.time}</span>
        </div>
      `).join('');
    }
  }

  // === UI RENDER ===
  renderTasks() {
    const tasks = this.getTasks();
    const container = document.getElementById('task-list');
    if (container) {
      container.innerHTML = tasks.map(task => `
        <div class="task-item" data-id="${task.id}">
          <div class="task-header">
            <div class="check-box ${task.complete ? 'active' : ''}" onclick="app.toggleTask(${task.id})"></div>
            <div class="task-info">
              <h6>${task.title}</h6>
              <p>${task.due} • ${task.progress}%</p>
            </div>
            <button class="delete-btn" onclick="app.deleteTask(${task.id})">🗑️</button>
          </div>
          ${task.complete ? '<div class="complete-overlay"></div>' : ''}
        </div>
      `).join('') || `
        <div class="empty-box">
          <span class="empty-icon">📂</span>
          <h6>No tasks yet</h6>
          <p>Add a task to get started!</p>
        </div>
      `;
    }
    // Update welcome
    const user = this.getCurrentUser();
    const welcome = document.querySelector('.welcome-text');
    if (welcome && user) {
      welcome.innerHTML = `Halo, ${user.name} 👋`;
    }
  }

  renderDashboard() {
    this.renderTasks();
    this.updateProgress();
    this.renderSchedule();
    // Guest mode
    const banner = document.querySelector('.alert-banner');
    if (banner && this.isAuthenticated()) {
      banner.style.display = 'none';
    }
  }

  // === EVENT HANDLERS ===
  setupAuthForms() {
    const loginForm = document.querySelector('.auth-form');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const result = this.login(email, password);
        this.showMessage(result.msg || 'Login successful!', result.success);
        if (result.success) {
          window.location.href = 'dashboard.html';
        }
      };
    }

    const signupForm = document.querySelector('.auth-form');
    if (signupForm && window.location.pathname.includes('signup.html')) {
      signupForm.onsubmit = (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const result = this.signup(name, email, password);
        this.showMessage(result.msg || 'Account created!', result.success);
        if (result.success) {
          window.location.href = 'dashboard.html';
        }
      };
    }
  }

  setupTaskForm() {
    const form = document.getElementById('add-task-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const title = form.querySelector('#task-title').value;
        const due = form.querySelector('#task-due').value;
        this.addTask(title, due);
        form.reset();
      };
    }
  }

  showMessage(msg, isSuccess = true) {
    // Add error/success div if not exist
    let msgDiv = document.getElementById('auth-message');
    if (!msgDiv) {
      msgDiv = document.createElement('div');
      msgDiv.id = 'auth-message';
      msgDiv.style.cssText = 'padding: 1rem; margin: 1rem 0; border-radius: 8px; font-weight: 600;';
      const form = document.querySelector('.auth-form');
      if (form) form.parentNode.insertBefore(msgDiv, form);
    }
    msgDiv.textContent = msg;
    msgDiv.style.background = isSuccess ? '#10b981' : '#ef4444';
    msgDiv.style.color = 'white';
    setTimeout(() => msgDiv.remove(), 3000);
  }

  // === SHARED UI ===
  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.onclick = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      };
    }
  }

  setupMobileMenu() {
    const burger = document.getElementById('burger-menu');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const body = document.body;
    if (burger) {
      burger.onclick = () => {
        [burger, navLinks, navActions].forEach(el => el.classList.toggle('active'));
        body.classList.toggle('menu-open');
      };
    }
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Future: load tab content
      };
    });
  }

  setupUI() {
    this.setupThemeToggle();
    this.setupMobileMenu();
    this.setupTabs();
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.onclick = () => {
        const input = btn.parentNode.querySelector('input');
        input.type = input.type === 'password' ? 'text' : 'password';
      };
    });
  }

  handlePageSpecific() {
    if (window.location.pathname.includes('dashboard.html')) {
      this.renderDashboard();
      this.setupTaskForm();
    } else {
      this.setupAuthForms();
    }
  }
}

// Global app instance
const app = new StudyBuddy();

document.addEventListener('DOMContentLoaded', () => {
  // Page load renders
  if (app.isAuthenticated()) {
    document.querySelectorAll('.status-badge').forEach(b => b.textContent = 'Authenticated');
  }
});
]]>
