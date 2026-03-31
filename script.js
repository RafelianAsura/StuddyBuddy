// Tema toggle
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Add event listener to theme toggle button
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initTheme);

// Initialize theme immediately for better UX
initTheme();

// Mobile Menu Toggle
const burgerMenu = document.getElementById('burger-menu');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');
const body = document.body;

if (burgerMenu) {
    burgerMenu.addEventListener('click', () => {
        const isOpen = !burgerMenu.classList.contains('active');

        burgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
        navActions.classList.toggle('active');

        // Prevent body scroll when menu is open (fix "bocor" / content bleeding)
        body.classList.toggle('menu-open', isOpen);
    });
}

// Close mobile menu when a link is clicked - optimized with event delegation
if (navLinks && navActions) {
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

        document.addEventListener('DOMContentLoaded', () => {
            // Animasi Progress Bar saat halaman dimuat
            setTimeout(() => {
                const bar = document.getElementById('main-bar');
                const val = document.getElementById('progress-val');
                bar.style.width = '65%';
            }, 500);

            // Logic Tab Sederhana
            const tabs = document.querySelectorAll('.tab-link');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                });
            });
        });