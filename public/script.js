// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const burgerMenu = document.getElementById('burger-menu');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');
const body = document.body;
const syncEnabledKey = 'studybuddy-sync-enabled';

const searchLibrary = [
    { title: 'Teknik Belajar Efektif', type: 'Artikel', description: 'Tips fokus dan manajemen waktu dalam 4 langkah.' },
    { title: 'Strategi Ujian', type: 'Template', description: 'Rencana belajar harian untuk persiapan ujian.' },
    { title: 'Seragam Sekolah', type: 'Panduan', description: 'Tips memilih seragam berdasarkan jadwal hari.' },
    { title: 'Manajemen PR', type: 'Fitur', description: 'Kelola tugas dan deadline dengan dashboard pintarmu.' },
    { title: 'Pelajaran Matematika', type: 'Materi', description: 'Ringkasan topik aljabar dan geometri.' }
];

function initTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function handleMobileMenu() {
    if (!burgerMenu || !navLinks || !navActions) return;

    burgerMenu.addEventListener('click', () => {
        const isOpen = !burgerMenu.classList.contains('active');

        burgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
        navActions.classList.toggle('active');
        body.classList.toggle('menu-open', isOpen);
    });

    const closeMenu = () => {
        burgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        navActions.classList.remove('active');
        body.classList.remove('menu-open');
    };

    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') closeMenu();
    });
    navActions.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') closeMenu();
    });
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab-link');
    const panels = document.querySelectorAll('.tab-panel');
    if (!tabs.length || !panels.length) return;

    const showPanel = (targetId) => {
        panels.forEach((panel) => {
            panel.classList.toggle('hidden', panel.id !== targetId);
        });
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.dataset.target;
            if (targetId) {
                showPanel(targetId);
                renderDashboardPanels();
            }
        });
    });

    const activeTab = document.querySelector('.tab-link.active');
    if (activeTab?.dataset.target) {
        showPanel(activeTab.dataset.target);
        renderDashboardPanels();
    }
}

function initSearch() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;

    const searchInput = searchForm.querySelector('input[type="text"]');
    const resultsBox = document.getElementById('search-results');

    const renderSearchResults = (items, query) => {
        if (!resultsBox) return;
        if (!query) {
            resultsBox.classList.add('hidden');
            return;
        }

        if (!items.length) {
            resultsBox.innerHTML = `
                <div class="results-empty">
                    Tidak menemukan apa pun untuk "<strong>${query}</strong>".
                </div>`;
            resultsBox.classList.remove('hidden');
            return;
        }

        const content = items.map((item) => `
            <div class="search-result-item">
                <div class="result-head">
                    <strong>${item.title}</strong>
                    <span>${item.type}</span>
                </div>
                <p>${item.description}</p>
            </div>
        `).join('');

        resultsBox.innerHTML = content;
        resultsBox.classList.remove('hidden');
        showToast(`${items.length} hasil ditemukan untuk "${query}".`, 'success');
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput?.value.trim();
        if (!query) {
            searchInput?.focus();
            showToast('Tolong isi kolom pencarian terlebih dahulu.', 'error');
            return;
        }

        const results = searchLibrary.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())
        );

        renderSearchResults(results, query);
    });
}

function initPasswordToggle() {
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('.input-wrapper input[type="password"]');
    if (!togglePasswordBtn || !passwordInput) return;

    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
}

function calculatePasswordStrength(value) {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
}

function applyPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength .bar');
    if (!strengthBar) return;

    const score = calculatePasswordStrength(password);
    const width = score * 25;
    strengthBar.style.width = `${width}%`;

    if (score <= 1) {
        strengthBar.style.background = '#ef4444';
    } else if (score === 2) {
        strengthBar.style.background = '#f59e0b';
    } else if (score === 3) {
        strengthBar.style.background = '#10b981';
    } else {
        strengthBar.style.background = '#22c55e';
    }
}

function showAuthError(authForm, message) {
    let errorEl = authForm.querySelector('.auth-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'auth-error';
        authForm.prepend(errorEl);
    }
    errorEl.textContent = message || '';
    errorEl.style.display = message ? 'block' : 'none';
}

function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info', duration = 2500) {
    if (!message) return;
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

function getLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-panel">
                <div class="loader"></div>
                <p class="loading-text"></p>
            </div>`;
        document.body.appendChild(overlay);
    }
    return overlay;
}

function showLoading(message = 'Memuat...', visible = true) {
    const overlay = getLoadingOverlay();
    overlay.querySelector('.loading-text').textContent = message;
    overlay.classList.toggle('visible', visible);
}

function initLoginForm() {
    const authForm = document.querySelector('.auth-form');
    if (!authForm) return;

    initPasswordToggle();
    ensureDefaultUser();

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authForm.querySelector('input[type="email"]')?.value.trim();
        const password = authForm.querySelector('input[type="password"]')?.value.trim();

        if (!email || !password) {
            showAuthError(authForm, 'Silakan isi semua kolom untuk masuk.');
            return;
        }

        const users = getUsers();
        const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!user || user.password !== password) {
            showAuthError(authForm, 'Email atau password salah.');
            return;
        }

        setCurrentUser(user);
        showAuthError(authForm, '');
        showToast('Login berhasil. Mengalihkan ke Dashboard...', 'success');
        showLoading('Mengalihkan ke Dashboard...', true);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 700);
    });

    authForm.addEventListener('input', () => {
        showAuthError(authForm, '');
    });
} 

function initSignupForm() {
    const authForm = document.querySelector('.auth-form');
    if (!authForm) return;

    const passwordInput = authForm.querySelector('input[type="password"]');
    const checkbox = authForm.querySelector('input[type="checkbox"]');

    if (passwordInput) {
        applyPasswordStrength(passwordInput.value);
        passwordInput.addEventListener('input', () => {
            applyPasswordStrength(passwordInput.value);
        });
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = authForm.querySelector('input[type="text"]')?.value.trim();
        const email = authForm.querySelector('input[type="email"]')?.value.trim();
        const password = passwordInput?.value.trim();

        if (!name || !email || !password) {
            showAuthError(authForm, 'Silakan isi semua kolom pendaftaran.');
            return;
        }

        if (!checkbox?.checked) {
            showAuthError(authForm, 'Mohon setujui Syarat & Ketentuan terlebih dahulu.');
            return;
        }

        if (calculatePasswordStrength(password) < 3) {
            showAuthError(authForm, 'Password terlalu lemah. Gunakan kombinasi huruf besar, angka, dan simbol.');
            return;
        }

        const users = getUsers();
        const existingUser = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            showAuthError(authForm, 'Email sudah terdaftar.');
            return;
        }

        const newUser = { id: Date.now(), name, email: email.toLowerCase(), password };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);

        showAuthError(authForm, '');
        showToast('Akun berhasil dibuat. Mengalihkan ke Dashboard...', 'success');
        showLoading('Mengalihkan ke Dashboard...', true);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 700);
    });

    authForm.addEventListener('input', () => {
        showAuthError(authForm, '');
    });
}

function initAuthForms() {
    const authHeader = document.querySelector('.auth-header h1');
    if (!authHeader) return;

    const titleText = authHeader.textContent || '';
    if (titleText.toLowerCase().includes('selamat datang kembali')) {
        initLoginForm();
    } else if (titleText.toLowerCase().includes('buat akun baru')) {
        initSignupForm();
    }
}

function getSyncEnabled() {
    return localStorage.getItem(syncEnabledKey) === 'true';
}

function setSyncEnabled(enabled) {
    localStorage.setItem(syncEnabledKey, enabled ? 'true' : 'false');
}

function renderSyncState() {
    const enabled = getSyncEnabled();
    const alertBanner = document.querySelector('.alert-banner');
    const statusBadge = document.querySelector('.status-badge');
    if (!alertBanner) return;

    const title = alertBanner.querySelector('.alert-content h5');
    const description = alertBanner.querySelector('.alert-content p');
    const button = alertBanner.querySelector('button');

    if (enabled) {
        title.textContent = '✔️ Sinkronisasi Aktif';
        description.textContent = 'Data Anda akan tersimpan secara lokal dan siap disinkronkan.';
        button.textContent = 'Putuskan';
        if (statusBadge) {
            statusBadge.textContent = '● Online Sync';
            statusBadge.classList.add('online');
            statusBadge.classList.remove('offline');
        }
    } else {
        title.textContent = '⚠️ Sinkronisasi Terputus';
        description.textContent = 'Data Anda hanya tersimpan secara lokal. Hubungkan untuk sinkron permanen.';
        button.textContent = 'Hubungkan';
        if (statusBadge) {
            statusBadge.textContent = '● Offline';
            statusBadge.classList.add('offline');
            statusBadge.classList.remove('online');
        }
    }
}

function initSyncToggle() {
    const button = document.querySelector('.alert-banner button');
    if (!button) return;

    button.addEventListener('click', () => {
        const enabled = !getSyncEnabled();
        setSyncEnabled(enabled);
        renderSyncState();
        showToast(enabled ? 'Sinkronisasi aktif.' : 'Sinkronisasi dimatikan.', enabled ? 'success' : 'info');
    });

    if (localStorage.getItem(syncEnabledKey) === null) {
        setSyncEnabled(false);
    }
    renderSyncState();
}

function initWorkflowCards() {
    const cards = document.querySelectorAll('.workflow-card');
    if (!cards.length) return;

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            cards.forEach((item) => item.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

function renderDashboardOverview() {
    const user = getCurrentUser();
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const statScheduleCount = document.getElementById('stat-schedule-count');
    const statPRCount = document.getElementById('stat-pr-count');
    const statUniform = document.getElementById('stat-uniform');
    const chartBar = document.getElementById('progress-chart-bar');
    const chartStatus = document.getElementById('chart-status');

    if (profileName) profileName.textContent = user ? user.name : 'Budi';
    if (profileEmail) profileEmail.textContent = user ? user.email : 'budi@test.com';

    const scheduleData = getScheduleData();
    const selectedDay = getSelectedDay();
    const day = scheduleData[selectedDay] || { seragam: 'N/A', tasks: [] };

    const totalSchedule = Object.values(scheduleData).reduce((sum, entry) => sum + (entry.tasks?.length || 0), 0);
    const tasks = getPRTasks();
    const activeCount = tasks.filter((task) => !task.completed).length;
    const completedCount = tasks.filter((task) => task.completed).length;
    const progress = tasks.length === 0 ? 100 : Math.round((completedCount / tasks.length) * 100);

    if (statScheduleCount) statScheduleCount.textContent = totalSchedule;
    if (statPRCount) statPRCount.textContent = activeCount;
    const statCompletedCount = document.getElementById('stat-pr-completed-count');
    if (statCompletedCount) statCompletedCount.textContent = completedCount;
    if (statUniform) statUniform.textContent = day.seragam || 'N/A';
    if (chartBar) chartBar.style.width = `${progress}%`;
    if (chartStatus) chartStatus.textContent = `${progress}% terselesaikan`;

    renderDashboardPanels();
}

function renderDashboardPanels() {
    renderTrackerPanel();
    renderFinancePanel();
    renderRecapPanel();
    renderPRAltList();
    renderNotes();
}

function renderDashboardNotifications() {
    const panel = document.getElementById('dashboard-notifications');
    if (!panel) return;

    const tasks = getPRTasks();
    const selectedDay = getSelectedDay();
    const scheduleData = getScheduleData();
    const today = scheduleData[selectedDay] || { tasks: [] };
    const messages = [];

    if (tasks.length > 0) {
        messages.push(`Kamu punya ${tasks.length} tugas PR aktif.`);
    }

    if (today.tasks.length > 0) {
        messages.push(`Hari ini ada ${today.tasks.length} pelajaran, termasuk ${today.tasks[0].title}.`);
    }

    if (!messages.length) {
        messages.push('Semua tugas tampak rapi hari ini. Siap fokus!');
    }

    panel.innerHTML = messages.map((message) => `<div class="notification-card">${message}</div>`).join('');
    panel.classList.remove('hidden');
}

const usersStorageKey = 'studybuddy-users';
const currentUserKey = 'studybuddy-current-user';
const scheduleStorageKey = 'studybuddy-schedule-data';
const scheduleDayKey = 'studybuddy-selected-day';
const prTasksKey = 'studybuddy-pr-tasks';
const notesStorageKey = 'studybuddy-notes';
const financeStorageKey = 'studybuddy-finance-data';
const defaultFinanceData = {
    saldo: 125000,
    pengeluaran: 35000,
    tabungan: 90000,
    transactions: [
        { id: 'fn-1', description: 'Uang jajan les', type: 'expense', amount: 35000 },
        { id: 'fn-2', description: 'Saldo awal kelas', type: 'income', amount: 125000 },
        { id: 'fn-3', description: 'Simpanan ekstra', type: 'savings', amount: 90000 }
    ]
};

function getUsers() {
    const raw = localStorage.getItem(usersStorageKey);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function getCurrentUser() {
    const raw = localStorage.getItem(currentUserKey);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

function setCurrentUser(user) {
    if (!user) {
        localStorage.removeItem(currentUserKey);
        return;
    }
    localStorage.setItem(currentUserKey, JSON.stringify(user));
}

function ensureDefaultUser() {
    const users = getUsers();
    if (!users.length) {
        users.push({ id: 1, name: 'Budi', email: 'budi@test.com', password: '12345678' });
        saveUsers(users);
    }
}

function updateLoggedInUI() {
    const user = getCurrentUser();
    const welcomeText = document.querySelector('.welcome-text');
    if (welcomeText) {
        welcomeText.textContent = user ? `Halo, ${user.name} 👋` : 'Halo, Budi 👋';
    }
}

const defaultScheduleData = {
    Sen: {
        seragam: 'PRAMUKA',
        tasks: [
            { id: 'sen-1', title: 'Web Development', time: '07:00 - 10:00 WIB' },
            { id: 'sen-2', title: 'Basis Data (MySQL)', time: '10:15 - 12:00 WIB' }
        ]
    },
    Sel: {
        seragam: 'BATIK',
        tasks: [
            { id: 'sel-1', title: 'Presentasi Kelompok', time: '08:00 - 09:30 WIB' },
            { id: 'sel-2', title: 'Latihan Soal IPA', time: '10:00 - 12:00 WIB' }
        ]
    },
    Rab: {
        seragam: 'OLIMPIADE',
        tasks: [
            { id: 'rab-1', title: 'Latihan Matematika', time: '07:30 - 09:30 WIB' },
            { id: 'rab-2', title: 'Proyek Fisika', time: '10:00 - 12:00 WIB' }
        ]
    },
    Kam: {
        seragam: 'PRAMUKA',
        tasks: [
            { id: 'kam-1', title: 'Tugas Bahasa Inggris', time: '08:00 - 10:00 WIB' },
            { id: 'kam-2', title: 'Ujian Kecil', time: '10:30 - 12:00 WIB' }
        ]
    },
    Jum: {
        seragam: 'PUTIH ABU',
        tasks: [
            { id: 'jum-1', title: 'Simulasi Tes', time: '07:00 - 09:00 WIB' },
            { id: 'jum-2', title: 'Review PR', time: '09:30 - 11:00 WIB' }
        ]
    },
    Sab: {
        seragam: 'SERAGAM SEKOLAH',
        tasks: [
            { id: 'sab-1', title: 'Workshop Koding', time: '08:00 - 11:00 WIB' }
        ]
    }
};

function getScheduleData() {
    const raw = localStorage.getItem(scheduleStorageKey);
    if (!raw) return JSON.parse(JSON.stringify(defaultScheduleData));
    try {
        const parsed = JSON.parse(raw);
        return { ...JSON.parse(JSON.stringify(defaultScheduleData)), ...parsed };
    } catch (error) {
        return JSON.parse(JSON.stringify(defaultScheduleData));
    }
}

function saveScheduleData(data) {
    localStorage.setItem(scheduleStorageKey, JSON.stringify(data));
}

function getSelectedDay() {
    return localStorage.getItem(scheduleDayKey) || 'Jum';
}

function setSelectedDay(dayKey) {
    localStorage.setItem(scheduleDayKey, dayKey);
}

function getPRTasks() {
    const raw = localStorage.getItem(prTasksKey);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (error) {
        return [];
    }
}

function savePRTasks(tasks) {
    localStorage.setItem(prTasksKey, JSON.stringify(tasks));
}

function getNotes() {
    const raw = localStorage.getItem(notesStorageKey);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (error) {
        return [];
    }
}

function saveNotes(notes) {
    localStorage.setItem(notesStorageKey, JSON.stringify(notes));
}

const trackerDataKey = 'studybuddy-tracker-data';
const defaultTrackerData = {
    sessionsToday: 0,
    weeklyGoal: 4
};

function getTrackerData() {
    const raw = localStorage.getItem(trackerDataKey);
    if (!raw) return JSON.parse(JSON.stringify(defaultTrackerData));
    try {
        return JSON.parse(raw);
    } catch (error) {
        return JSON.parse(JSON.stringify(defaultTrackerData));
    }
}

function saveTrackerData(data) {
    localStorage.setItem(trackerDataKey, JSON.stringify(data));
}

function ensureTrackerData() {
    if (!localStorage.getItem(trackerDataKey)) {
        saveTrackerData(defaultTrackerData);
    }
}

function formatRupiah(value) {
    if (typeof value !== 'number') return 'Rp 0';
    return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function getFinanceData() {
    const raw = localStorage.getItem(financeStorageKey);
    if (!raw) return JSON.parse(JSON.stringify(defaultFinanceData));
    try {
        return JSON.parse(raw);
    } catch (error) {
        return JSON.parse(JSON.stringify(defaultFinanceData));
    }
}

function saveFinanceData(data) {
    localStorage.setItem(financeStorageKey, JSON.stringify(data));
}

function ensureFinanceData() {
    if (!localStorage.getItem(financeStorageKey)) {
        saveFinanceData(defaultFinanceData);
    }
}

function renderTrackerPanel() {
    const selectedDay = getSelectedDay();
    const scheduleData = getScheduleData();
    const today = scheduleData[selectedDay] || { tasks: [] };
    const tasksToday = today.tasks?.length || 0;
    const trackerFocus = document.getElementById('tracker-focus');
    const trackerStreak = document.getElementById('tracker-streak');
    const trackerGoal = document.getElementById('tracker-goal');
    const trackerData = getTrackerData();

    const dayOrder = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let streakDays = 0;
    for (let i = dayOrder.indexOf(selectedDay); i >= 0; i -= 1) {
        const dayKey = dayOrder[i];
        const dayTasks = getScheduleData()[dayKey]?.tasks || [];
        if (dayTasks.length) {
            streakDays += 1;
        } else {
            break;
        }
    }

    if (trackerFocus) {
        trackerFocus.querySelector('p').textContent = trackerData.sessionsToday
            ? `${trackerData.sessionsToday} sesi belajaran selesai hari ini`
            : 'Tidak ada sesi hari ini';
    }
    if (trackerStreak) {
        trackerStreak.querySelector('p').textContent = streakDays
            ? `${streakDays} hari berturut-turut`
            : 'Mulai hari ini';
    }
    if (trackerGoal) {
        trackerGoal.querySelector('p').textContent = `${trackerData.sessionsToday} dari ${trackerData.weeklyGoal} sesi mingguan`;
    }
}

function initTrackerControls() {
    const addSessionBtn = document.getElementById('tracker-add-session');
    const saveGoalBtn = document.getElementById('tracker-save-goal');
    const weeklyGoalInput = document.getElementById('tracker-weekly-goal');
    if (!addSessionBtn || !saveGoalBtn || !weeklyGoalInput) return;

    const tracker = getTrackerData();
    weeklyGoalInput.value = tracker.weeklyGoal;

    addSessionBtn.addEventListener('click', () => {
        const tracked = getTrackerData();
        tracked.sessionsToday = (tracked.sessionsToday || 0) + 1;
        saveTrackerData(tracked);
        renderTrackerPanel();
        showToast('Sesi belajar berhasil ditambahkan.', 'success');
    });

    saveGoalBtn.addEventListener('click', () => {
        const value = Number(weeklyGoalInput.value);
        if (!value || value < 1) {
            showToast('Masukkan goal mingguan yang valid.', 'error');
            return;
        }
        const tracked = getTrackerData();
        tracked.weeklyGoal = value;
        saveTrackerData(tracked);
        renderTrackerPanel();
        showToast('Goal mingguan berhasil disimpan.', 'success');
    });
}

function renderFinancePanel() {
    const finance = getFinanceData();
    const saldoCard = document.getElementById('finance-saldo');
    const pengeluaranCard = document.getElementById('finance-pengeluaran');
    const tabunganCard = document.getElementById('finance-tabungan');

    if (saldoCard) {
        saldoCard.querySelector('p').textContent = formatRupiah(finance.saldo);
    }
    if (pengeluaranCard) {
        pengeluaranCard.querySelector('p').textContent = formatRupiah(finance.pengeluaran);
    }
    if (tabunganCard) {
        tabunganCard.querySelector('p').textContent = formatRupiah(finance.tabungan);
    }
    renderFinanceTransactions(finance.transactions || []);
}

function renderFinanceTransactions(transactions) {
    const container = document.getElementById('finance-transactions');
    if (!container) return;

    if (!transactions.length) {
        container.innerHTML = '<div class="empty-box"><h6>Tidak ada transaksi keuangan.</h6><p>Tambahkan transaksi untuk melihat riwayat.</p></div>';
        return;
    }

    container.innerHTML = transactions.map((item) => `
        <div class="finance-record ${item.type}">
            <div>
                <strong>${item.description}</strong>
                <span>${item.type === 'income' ? 'Pemasukan' : item.type === 'expense' ? 'Pengeluaran' : 'Tabungan'}</span>
            </div>
            <strong>${formatRupiah(item.amount)}</strong>
        </div>
    `).join('');
}

function initFinanceForm() {
    const descInput = document.getElementById('finance-description');
    const amountInput = document.getElementById('finance-amount');
    const typeSelect = document.getElementById('finance-type');
    const saveButton = document.getElementById('finance-save');
    const resetButton = document.getElementById('finance-reset');
    if (!descInput || !amountInput || !typeSelect || !saveButton || !resetButton) return;

    saveButton.addEventListener('click', () => {
        const description = descInput.value.trim();
        const amount = Number(amountInput.value);
        const type = typeSelect.value;
        if (!description || !amount || amount <= 0) {
            showToast('Isi deskripsi dan jumlah transaksi yang valid.', 'error');
            return;
        }

        const finance = getFinanceData();
        const transaction = {
            id: `fn-${Date.now()}`,
            description,
            type,
            amount
        };
        finance.transactions = finance.transactions || [];
        finance.transactions.unshift(transaction);

        if (type === 'income') {
            finance.saldo += amount;
        } else if (type === 'expense') {
            finance.pengeluaran += amount;
            finance.saldo -= amount;
        } else if (type === 'savings') {
            finance.tabungan += amount;
            finance.saldo -= amount;
        }

        saveFinanceData(finance);
        renderFinancePanel();
        renderRecapPanel();
        descInput.value = '';
        amountInput.value = '';
        showToast('Transaksi keuangan tersimpan.', 'success');
    });

    resetButton.addEventListener('click', () => {
        saveFinanceData(JSON.parse(JSON.stringify(defaultFinanceData)));
        renderFinancePanel();
        renderRecapPanel();
        showToast('Data keuangan dikembalikan ke nilai awal.', 'info');
    });
}

function renderRecapPanel() {
    const recapList = document.getElementById('recap-list');
    if (!recapList) return;

    const scheduleData = getScheduleData();
    const selectedDay = getSelectedDay();
    const today = scheduleData[selectedDay] || { seragam: 'N/A', tasks: [] };
    const totalSchedule = Object.values(scheduleData).reduce((sum, entry) => sum + (entry.tasks?.length || 0), 0);
    const tasks = getPRTasks();
    const completedCount = tasks.filter((task) => task.completed).length;
    const activeCount = tasks.filter((task) => !task.completed).length;
    const noteCount = getNotes().length;

    recapList.innerHTML = `
        <li>Total jadwal minggu ini: ${totalSchedule}</li>
        <li>PR selesai: ${completedCount} dari ${tasks.length}</li>
        <li>PR aktif tersisa: ${activeCount}</li>
        <li>Catatan dibuat: ${noteCount}</li>
        <li>Seragam hari ini: ${today.seragam || 'N/A'}</li>
    `;
}

function renderNotes() {
    const notes = getNotes();
    const notesList = document.getElementById('notes-list');
    const emptyBox = document.getElementById('notes-empty');
    if (!notesList || !emptyBox) return;

    notesList.innerHTML = '';
    if (!notes.length) {
        notesList.style.display = 'none';
        emptyBox.style.display = 'block';
        return;
    }

    notesList.style.display = 'grid';
    emptyBox.style.display = 'none';
    notes.forEach((note) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <strong>${note.title}</strong>
            <p>${note.content}</p>
            <div class="note-actions"></div>
        `;
        const actions = noteCard.querySelector('.note-actions');
        const deleteBtn = createActionButton('Hapus', 'remove-btn', 'Hapus catatan');
        actions.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', () => {
            const updatedNotes = notes.filter((item) => item.id !== note.id);
            saveNotes(updatedNotes);
            renderNotes();
            showToast('Catatan berhasil dihapus.', 'success');
        });
        notesList.appendChild(noteCard);
    });
}

function initNotesPanel() {
    const addButton = document.getElementById('add-note-btn');
    const saveButton = document.getElementById('save-note-btn');
    const cancelButton = document.getElementById('cancel-note-btn');
    const noteForm = document.getElementById('note-add-form');
    const titleInput = document.getElementById('new-note-title');
    const contentInput = document.getElementById('new-note-content');
    if (!addButton || !saveButton || !cancelButton || !noteForm || !titleInput || !contentInput) return;

    addButton.addEventListener('click', () => {
        noteForm.classList.remove('hidden');
        titleInput.focus();
    });
    cancelButton.addEventListener('click', () => {
        titleInput.value = '';
        contentInput.value = '';
        noteForm.classList.add('hidden');
    });
    saveButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !content) {
            showToast('Judul dan isi catatan tidak boleh kosong.', 'error');
            return;
        }
        const notes = getNotes();
        notes.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, content });
        saveNotes(notes);
        titleInput.value = '';
        contentInput.value = '';
        noteForm.classList.add('hidden');
        renderNotes();
        showToast('Catatan berhasil ditambahkan.', 'success');
    });
}

function createActionButton(text, className, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `small-btn ${className}`;
    button.textContent = text;
    if (title) button.title = title;
    return button;
}

function renderSchedule(dayKey) {
    const scheduleItems = document.getElementById('schedule-items');
    const uniformLabel = document.getElementById('schedule-uniform-label');
    if (!scheduleItems || !uniformLabel) return;

    const scheduleData = getScheduleData();
    const day = scheduleData[dayKey] || { seragam: '', tasks: [] };
    uniformLabel.textContent = day.seragam || 'N/A';
    scheduleItems.innerHTML = '';

    if (!day.tasks.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-box';
        empty.style.padding = '1.5rem';
        empty.innerHTML = '<h6>Tidak ada jadwal untuk hari ini.</h6>';
        scheduleItems.appendChild(empty);
        return;
    }

    day.tasks.forEach((task) => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.dataset.id = task.id;

        const content = document.createElement('div');
        content.className = 'schedule-item-content';
        const title = document.createElement('strong');
        title.textContent = task.title;
        const time = document.createElement('span');
        time.textContent = task.time;
        content.appendChild(title);
        content.appendChild(time);

        const actions = document.createElement('div');
        actions.className = 'item-actions';
        const editBtn = createActionButton('Edit', 'edit-btn', 'Edit jadwal');
        const removeBtn = createActionButton('Hapus', 'remove-btn', 'Hapus jadwal');
        actions.appendChild(editBtn);
        actions.appendChild(removeBtn);

        item.appendChild(content);
        item.appendChild(actions);
        scheduleItems.appendChild(item);

        editBtn.addEventListener('click', () => {
            startScheduleEdit(item, dayKey, task);
        });

        removeBtn.addEventListener('click', () => {
            const index = day.tasks.findIndex((entry) => entry.id === task.id);
            if (index >= 0) {
                day.tasks.splice(index, 1);
                saveScheduleData(scheduleData);
                renderSchedule(dayKey);
            }
        });
    });
}

function startScheduleEdit(item, dayKey, task) {
    const scheduleData = getScheduleData();
    const day = scheduleData[dayKey];
    if (!day) return;

    item.innerHTML = '';
    item.classList.add('editing');

    const inputRow = document.createElement('div');
    inputRow.className = 'field-row';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.placeholder = 'Nama pelajaran';
    const timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.value = task.time;
    timeInput.placeholder = 'Waktu (misal 07:00 - 09:00 WIB)';
    inputRow.appendChild(titleInput);
    inputRow.appendChild(timeInput);

    const buttonRow = document.createElement('div');
    buttonRow.className = 'button-row';
    const saveBtn = createActionButton('Simpan', 'save-btn');
    const cancelBtn = createActionButton('Batal', 'cancel-btn');
    buttonRow.appendChild(saveBtn);
    buttonRow.appendChild(cancelBtn);

    item.appendChild(inputRow);
    item.appendChild(buttonRow);

    saveBtn.addEventListener('click', () => {
        const newTitle = titleInput.value.trim();
        const newTime = timeInput.value.trim();
        if (!newTitle || !newTime) {
            showToast('Judul dan waktu tidak boleh kosong.', 'error');
            return;
        }
        task.title = newTitle;
        task.time = newTime;
        saveScheduleData(scheduleData);
        renderSchedule(dayKey);
    });

    cancelBtn.addEventListener('click', () => {
        renderSchedule(dayKey);
    });
}

function toggleScheduleForm(show) {
    const form = document.getElementById('schedule-add-form');
    if (!form) return;
    form.classList.toggle('hidden', !show);
}

function resetScheduleInputs() {
    const uniformInput = document.getElementById('new-schedule-uniform');
    const titleInput = document.getElementById('new-schedule-title');
    const timeInput = document.getElementById('new-schedule-time');
    if (uniformInput) uniformInput.value = '';
    if (titleInput) titleInput.value = '';
    if (timeInput) timeInput.value = '';
}

function initScheduleAddForm() {
    const addButton = document.getElementById('add-schedule-btn');
    const saveButton = document.getElementById('save-schedule-btn');
    const cancelButton = document.getElementById('cancel-schedule-btn');
    const uniformInput = document.getElementById('new-schedule-uniform');
    const titleInput = document.getElementById('new-schedule-title');
    const timeInput = document.getElementById('new-schedule-time');
    if (!addButton || !saveButton || !cancelButton || !uniformInput || !titleInput || !timeInput) return;

    addButton.addEventListener('click', () => {
        const dayKey = getSelectedDay();
        const scheduleData = getScheduleData();
        const day = scheduleData[dayKey] || { seragam: '' };
        uniformInput.value = day.seragam || '';
        titleInput.value = '';
        timeInput.value = '';
        toggleScheduleForm(true);
        uniformInput.focus();
    });

    cancelButton.addEventListener('click', () => {
        resetScheduleInputs();
        toggleScheduleForm(false);
    });

    saveButton.addEventListener('click', () => {
        const uniform = uniformInput.value.trim();
        const title = titleInput.value.trim();
        const time = timeInput.value.trim();
        const dayKey = getSelectedDay();
        if (!title || !time) {
            showToast('Mohon isi nama pelajaran dan waktu.', 'error');
            return;
        }

        const scheduleData = getScheduleData();
        if (!scheduleData[dayKey]) {
            scheduleData[dayKey] = { seragam: 'N/A', tasks: [] };
        }

        if (uniform) {
            scheduleData[dayKey].seragam = uniform;
        }

        scheduleData[dayKey].tasks.push({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title,
            time
        });
        saveScheduleData(scheduleData);
        resetScheduleInputs();
        toggleScheduleForm(false);
        renderSchedule(dayKey);
        renderDashboardOverview();
        renderDashboardNotifications();
    });
}

function resetPRInputs() {
    const titleInput = document.getElementById('new-pr-title');
    const detailInput = document.getElementById('new-pr-detail');
    if (titleInput) titleInput.value = '';
    if (detailInput) detailInput.value = '';
}

function togglePRForm(show) {
    const form = document.getElementById('pr-add-form');
    if (!form) return;
    form.classList.toggle('hidden', !show);
}

function initPRAddForm() {
    const addButton = document.getElementById('add-pr-btn');
    const saveButton = document.getElementById('save-pr-btn');
    const cancelButton = document.getElementById('cancel-pr-btn');
    const titleInput = document.getElementById('new-pr-title');
    const detailInput = document.getElementById('new-pr-detail');
    if (!addButton || !saveButton || !cancelButton || !titleInput || !detailInput) return;

    addButton.addEventListener('click', () => {
        togglePRForm(true);
        titleInput.focus();
    });

    cancelButton.addEventListener('click', () => {
        resetPRInputs();
        togglePRForm(false);
    });

    saveButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const detail = detailInput.value.trim();
        if (!title) {
            showToast('Masukkan judul tugas PR.', 'error');
            titleInput.focus();
            return;
        }

        const tasks = getPRTasks();
        tasks.push({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title,
            detail,
            completed: false
        });
        savePRTasks(tasks);
        resetPRInputs();
        togglePRForm(false);
        renderPRTasks();
        setDashboardProgress();
        renderDashboardOverview();
        renderDashboardNotifications();
        showToast('Tugas PR berhasil ditambahkan.', 'success');
    });
}

function startPREdit(card, task) {
    const tasks = getPRTasks();
    card.innerHTML = '';
    const editRow = document.createElement('div');
    editRow.className = 'field-row';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.placeholder = 'Nama tugas PR';

    const detailInput = document.createElement('textarea');
    detailInput.value = task.detail || '';
    detailInput.placeholder = 'Detail tugas (opsional)';
    detailInput.rows = 3;

    editRow.appendChild(titleInput);
    editRow.appendChild(detailInput);

    const buttonRow = document.createElement('div');
    buttonRow.className = 'button-row';
    const saveBtn = createActionButton('Simpan', 'save-btn');
    const cancelBtn = createActionButton('Batal', 'cancel-btn');
    buttonRow.appendChild(saveBtn);
    buttonRow.appendChild(cancelBtn);

    card.appendChild(editRow);
    card.appendChild(buttonRow);

    saveBtn.addEventListener('click', () => {
        const newTitle = titleInput.value.trim();
        if (!newTitle) {
            showToast('Judul tugas tidak boleh kosong.', 'error');
            titleInput.focus();
            return;
        }
        task.title = newTitle;
        task.detail = detailInput.value.trim();
        savePRTasks(tasks);
        renderPRTasks();
        setDashboardProgress();
        showToast('Tugas PR berhasil diperbarui.', 'success');
    });

    cancelBtn.addEventListener('click', () => {
        renderPRTasks();
    });
}

function updateDaySelection(selectedKey) {
    const dayBoxes = document.querySelectorAll('.day-box');
    dayBoxes.forEach((box) => {
        box.classList.toggle('active', box.textContent.trim() === selectedKey);
    });
    setSelectedDay(selectedKey);
    renderSchedule(selectedKey);
    renderDashboardOverview();
    renderDashboardNotifications();
}

function initScheduleDaySelection() {
    const dayBoxes = document.querySelectorAll('.day-box');
    if (!dayBoxes.length) return;

    dayBoxes.forEach((box) => {
        const dayKey = box.textContent.trim();
        box.addEventListener('click', () => {
            updateDaySelection(dayKey);
        });
    });

    const selectedDay = getSelectedDay();
    updateDaySelection(selectedDay);
}

function createPRCard(task, tasks) {
    const card = document.createElement('div');
    const isCompleted = task.completed === true;
    card.className = `task-card task-item ${isCompleted ? 'completed-task' : ''}`;
    card.dataset.id = task.id;

    const info = document.createElement('div');
    info.className = 'task-info-block';
    const title = document.createElement('strong');
    title.textContent = task.title;
    const detail = document.createElement('span');
    detail.textContent = task.detail || 'Tidak ada detail tambahan.';
    info.appendChild(title);
    info.appendChild(detail);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = createActionButton('Edit', 'edit-btn', 'Edit tugas');
    const removeBtn = createActionButton('Hapus', 'remove-btn', 'Hapus tugas');
    actions.appendChild(editBtn);

    if (!isCompleted) {
        const doneBtn = createActionButton('Selesai', 'done-btn', 'Selesaikan tugas');
        actions.appendChild(doneBtn);
        doneBtn.addEventListener('click', () => {
            task.completed = true;
            savePRTasks(tasks);
            renderPRTasks();
            setDashboardProgress();
            renderDashboardOverview();
            renderDashboardNotifications();
            showToast('Tugas PR berhasil ditandai selesai.', 'success');
        });
    } else {
        const undoBtn = createActionButton('Kembalikan', 'undo-btn', 'Kembalikan tugas');
        actions.appendChild(undoBtn);
        undoBtn.addEventListener('click', () => {
            task.completed = false;
            savePRTasks(tasks);
            renderPRTasks();
            setDashboardProgress();
            renderDashboardOverview();
            renderDashboardNotifications();
            showToast('Tugas PR dikembalikan ke daftar aktif.', 'info');
        });
    }

    actions.appendChild(removeBtn);
    card.appendChild(info);
    card.appendChild(actions);

    editBtn.addEventListener('click', () => {
        startPREdit(card, task);
    });

    removeBtn.addEventListener('click', () => {
        const updatedTasks = tasks.filter((item) => item.id !== task.id);
        savePRTasks(updatedTasks);
        renderPRTasks();
        setDashboardProgress();
        renderDashboardOverview();
        renderDashboardNotifications();
        showToast('Tugas PR berhasil dihapus.', 'success');
    });

    return card;
}

function renderPRTasks() {
    const taskList = document.getElementById('pr-task-list');
    const completedSection = document.getElementById('completed-section');
    const completedList = document.getElementById('pr-completed-list');
    const emptyBox = document.querySelector('#pr-section .empty-box');
    if (!taskList || !emptyBox || !completedSection || !completedList) return;

    const tasks = getPRTasks();
    const activeTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    taskList.innerHTML = '';
    completedList.innerHTML = '';

    if (!activeTasks.length) {
        emptyBox.style.display = completedTasks.length ? 'none' : 'block';
    } else {
        emptyBox.style.display = 'none';
        activeTasks.forEach((task) => {
            taskList.appendChild(createPRCard(task, tasks));
        });
    }

    if (completedTasks.length) {
        completedSection.classList.remove('hidden');
        completedTasks.forEach((task) => {
            completedList.appendChild(createPRCard(task, tasks));
        });
    } else {
        completedSection.classList.add('hidden');
    }

    renderPRAltList();
}

function renderPRAltList() {
    const taskList = document.getElementById('pr-task-list-alt');
    const emptyBox = document.getElementById('pr-alt-empty');
    if (!taskList || !emptyBox) return;

    const tasks = getPRTasks();
    const activeTasks = tasks.filter((task) => !task.completed);
    taskList.innerHTML = '';

    if (!activeTasks.length) {
        taskList.style.display = 'none';
        emptyBox.style.display = 'block';
        return;
    }

    taskList.style.display = 'grid';
    emptyBox.style.display = 'none';
    activeTasks.forEach((task) => {
        const card = createPRCard(task, tasks);
        taskList.appendChild(card);
    });
}

function setDashboardProgress() {
    const progressVal = document.getElementById('progress-val');
    const progressFill = document.getElementById('main-bar');
    if (!progressVal || !progressFill) return;

    const tasks = getPRTasks();
    if (!tasks.length) {
        progressVal.textContent = '100%';
        progressFill.style.width = '100%';
        return;
    }

    const completedCount = tasks.filter((task) => task.completed).length;
    const percent = Math.round((completedCount / tasks.length) * 100);
    progressVal.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
}

function initDashboard() {
    const dashboardBody = document.querySelector('.dash-body');
    if (!dashboardBody) return;
    updateLoggedInUI();
    initSyncToggle();
    ensureFinanceData();
    ensureTrackerData();
    initFinanceForm();
    initTrackerControls();
    renderDashboardOverview();
    renderDashboardNotifications();
    initScheduleDaySelection();
    initScheduleAddForm();
    initPRAddForm();
    initNotesPanel();
    renderNotes();
    renderPRTasks();
    renderPRAltList();
    setDashboardProgress();
}

function initPageInteractions() {
    initSearch();
    initTabs();
    initWorkflowCards();
    initAuthForms();
    initDashboard();
}

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    handleMobileMenu();
    initPageInteractions();
});

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
