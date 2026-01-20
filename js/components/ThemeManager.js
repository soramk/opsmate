/**
 * OpsMate Theme Manager
 * Handles theme switching and persistence
 */

const ThemeManager = {
    themes: [
        { id: 'emerald', name: 'エメラルド', icon: 'leaf', color: '#10b981' },
        { id: 'ocean', name: 'オーシャン', icon: 'waves', color: '#0ea5e9' },
        { id: 'sunset', name: 'サンセット', icon: 'sun', color: '#f97316' },
        { id: 'lavender', name: 'ラベンダー', icon: 'sparkles', color: '#a78bfa' },
        { id: 'crimson', name: 'クリムゾン', icon: 'flame', color: '#ef4444' },
        { id: 'rose', name: 'ローズ', icon: 'flower-2', color: '#f472b6' }
    ],

    currentTheme: 'emerald',
    dropdownOpen: false,

    /**
     * Initialize the theme manager
     */
    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('opsmate-theme');
        if (savedTheme && this.themes.find(t => t.id === savedTheme)) {
            this.currentTheme = savedTheme;
        }

        // Apply the theme
        this.applyTheme(this.currentTheme);

        // Render the theme selector
        this.renderThemeSelector();

        // Setup event listeners
        this.setupEventListeners();
    },

    /**
     * Apply a theme by ID
     */
    applyTheme(themeId) {
        document.documentElement.setAttribute('data-theme', themeId);
        this.currentTheme = themeId;
        localStorage.setItem('opsmate-theme', themeId);

        // Update the theme button icon
        this.updateThemeButton();
    },

    /**
     * Render the theme selector dropdown
     */
    renderThemeSelector() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Create theme selector container
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.id = 'theme-selector';

        // Create the toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'icon-btn theme-toggle-btn';
        toggleBtn.id = 'theme-selector-btn';
        toggleBtn.setAttribute('aria-label', 'テーマを選択');
        toggleBtn.innerHTML = `<i data-lucide="palette"></i>`;

        // Create the dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'theme-dropdown';
        dropdown.id = 'theme-dropdown';

        // Create dropdown content
        const dropdownHeader = document.createElement('div');
        dropdownHeader.className = 'theme-dropdown-header';
        dropdownHeader.innerHTML = `
            <i data-lucide="palette" class="theme-dropdown-icon"></i>
            <span>テーマを選択</span>
        `;

        const themeGrid = document.createElement('div');
        themeGrid.className = 'theme-grid';

        this.themes.forEach(theme => {
            const themeItem = document.createElement('button');
            themeItem.className = `theme-item ${theme.id === this.currentTheme ? 'active' : ''}`;
            themeItem.setAttribute('data-theme-id', theme.id);
            themeItem.innerHTML = `
                <span class="theme-color" style="background: ${theme.color}"></span>
                <span class="theme-name">${theme.name}</span>
                <i data-lucide="check" class="theme-check"></i>
            `;
            themeGrid.appendChild(themeItem);
        });

        dropdown.appendChild(dropdownHeader);
        dropdown.appendChild(themeGrid);

        themeSelector.appendChild(toggleBtn);
        themeSelector.appendChild(dropdown);

        // Insert before the existing theme toggle button
        const existingToggle = document.getElementById('theme-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }
        headerActions.insertBefore(themeSelector, headerActions.firstChild);

        // Re-render Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Update the theme button appearance
     */
    updateThemeButton() {
        const activeItems = document.querySelectorAll('.theme-item');
        activeItems.forEach(item => {
            if (item.getAttribute('data-theme-id') === this.currentTheme) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    /**
     * Toggle the dropdown visibility
     */
    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        const dropdown = document.getElementById('theme-dropdown');
        const btn = document.getElementById('theme-selector-btn');

        if (this.dropdownOpen) {
            dropdown.classList.add('open');
            btn.classList.add('active');
        } else {
            dropdown.classList.remove('open');
            btn.classList.remove('active');
        }
    },

    /**
     * Close the dropdown
     */
    closeDropdown() {
        this.dropdownOpen = false;
        const dropdown = document.getElementById('theme-dropdown');
        const btn = document.getElementById('theme-selector-btn');

        if (dropdown) dropdown.classList.remove('open');
        if (btn) btn.classList.remove('active');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle button click
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('#theme-selector-btn');
            const themeItem = e.target.closest('.theme-item');
            const themeSelector = e.target.closest('.theme-selector');

            if (toggleBtn) {
                e.preventDefault();
                this.toggleDropdown();
                return;
            }

            if (themeItem) {
                e.preventDefault();
                const themeId = themeItem.getAttribute('data-theme-id');
                this.applyTheme(themeId);
                this.closeDropdown();

                // Show toast notification
                if (typeof OpsMateApp !== 'undefined' && OpsMateApp.showToast) {
                    const theme = this.themes.find(t => t.id === themeId);
                    OpsMateApp.showToast(`テーマを「${theme.name}」に変更しました`, 'success');
                }
                return;
            }

            // Close dropdown when clicking outside
            if (!themeSelector && this.dropdownOpen) {
                this.closeDropdown();
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dropdownOpen) {
                this.closeDropdown();
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
