/**
 * OpsMate Theme, Font & Mode Manager
 * Handles theme, font, and light/dark mode switching with persistence
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

    fonts: [
        { id: 'jetbrains', name: 'JetBrains Mono', family: "'JetBrains Mono'", sample: 'AaBbCc 123' },
        { id: 'firacode', name: 'Fira Code', family: "'Fira Code'", sample: 'AaBbCc 123' },
        { id: 'sourcecodepro', name: 'Source Code Pro', family: "'Source Code Pro'", sample: 'AaBbCc 123' },
        { id: 'ibmplexmono', name: 'IBM Plex Mono', family: "'IBM Plex Mono'", sample: 'AaBbCc 123' },
        { id: 'inconsolata', name: 'Inconsolata', family: "'Inconsolata'", sample: 'AaBbCc 123' },
        { id: 'robotomono', name: 'Roboto Mono', family: "'Roboto Mono'", sample: 'AaBbCc 123' }
    ],

    currentTheme: 'emerald',
    currentFont: 'jetbrains',
    currentMode: 'dark',
    themeDropdownOpen: false,
    fontDropdownOpen: false,

    /**
     * Initialize the theme manager
     */
    init() {
        // Load saved settings
        const savedTheme = localStorage.getItem('opsmate-theme');
        if (savedTheme && this.themes.find(t => t.id === savedTheme)) {
            this.currentTheme = savedTheme;
        }

        const savedFont = localStorage.getItem('opsmate-font');
        if (savedFont && this.fonts.find(f => f.id === savedFont)) {
            this.currentFont = savedFont;
        }

        const savedMode = localStorage.getItem('opsmate-mode');
        if (savedMode && ['dark', 'light'].includes(savedMode)) {
            this.currentMode = savedMode;
        }

        // Apply settings
        this.applyTheme(this.currentTheme);
        this.applyFont(this.currentFont);
        this.applyMode(this.currentMode);

        // Render selectors
        this.renderModeToggle();
        this.renderThemeSelector();
        this.renderFontSelector();

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
        this.updateThemeButton();
    },

    /**
     * Apply a font by ID
     */
    applyFont(fontId) {
        document.documentElement.setAttribute('data-font', fontId);
        this.currentFont = fontId;
        localStorage.setItem('opsmate-font', fontId);
        this.updateFontButton();
    },

    /**
     * Apply mode (dark/light)
     */
    applyMode(mode) {
        document.documentElement.setAttribute('data-mode', mode);
        this.currentMode = mode;
        localStorage.setItem('opsmate-mode', mode);
        this.updateModeButton();
    },

    /**
     * Toggle between dark and light mode
     */
    toggleMode() {
        const newMode = this.currentMode === 'dark' ? 'light' : 'dark';
        this.applyMode(newMode);

        if (typeof OpsMateApp !== 'undefined' && OpsMateApp.showToast) {
            const modeName = newMode === 'dark' ? 'ダークモード' : 'ライトモード';
            OpsMateApp.showToast(`${modeName}に切り替えました`, 'success');
        }
    },

    /**
     * Render the mode toggle button
     */
    renderModeToggle() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        const modeBtn = document.createElement('button');
        modeBtn.className = 'icon-btn mode-toggle-btn';
        modeBtn.id = 'mode-toggle-btn';
        modeBtn.setAttribute('aria-label', 'モード切替');
        modeBtn.innerHTML = this.currentMode === 'dark'
            ? '<i data-lucide="sun"></i>'
            : '<i data-lucide="moon"></i>';

        headerActions.insertBefore(modeBtn, headerActions.firstChild);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Update the mode toggle button
     */
    updateModeButton() {
        const btn = document.getElementById('mode-toggle-btn');
        if (btn) {
            btn.innerHTML = this.currentMode === 'dark'
                ? '<i data-lucide="sun"></i>'
                : '<i data-lucide="moon"></i>';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    },

    /**
     * Render the theme selector dropdown
     */
    renderThemeSelector() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.id = 'theme-selector';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'icon-btn theme-toggle-btn';
        toggleBtn.id = 'theme-selector-btn';
        toggleBtn.setAttribute('aria-label', 'テーマを選択');
        toggleBtn.innerHTML = `<i data-lucide="palette"></i>`;

        const dropdown = document.createElement('div');
        dropdown.className = 'theme-dropdown';
        dropdown.id = 'theme-dropdown';

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

        const existingToggle = document.getElementById('theme-toggle');
        if (existingToggle) existingToggle.remove();

        const modeBtn = document.getElementById('mode-toggle-btn');
        if (modeBtn && modeBtn.nextSibling) {
            headerActions.insertBefore(themeSelector, modeBtn.nextSibling);
        } else {
            headerActions.appendChild(themeSelector);
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Render the font selector dropdown
     */
    renderFontSelector() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        const fontSelector = document.createElement('div');
        fontSelector.className = 'font-selector';
        fontSelector.id = 'font-selector';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'icon-btn font-toggle-btn';
        toggleBtn.id = 'font-selector-btn';
        toggleBtn.setAttribute('aria-label', 'フォントを選択');
        toggleBtn.innerHTML = `<i data-lucide="type"></i>`;

        const dropdown = document.createElement('div');
        dropdown.className = 'font-dropdown';
        dropdown.id = 'font-dropdown';

        const dropdownHeader = document.createElement('div');
        dropdownHeader.className = 'font-dropdown-header';
        dropdownHeader.innerHTML = `
            <i data-lucide="type" class="font-dropdown-icon"></i>
            <span>フォントを選択</span>
        `;

        const fontGrid = document.createElement('div');
        fontGrid.className = 'font-grid';

        this.fonts.forEach(font => {
            const fontItem = document.createElement('button');
            fontItem.className = `font-item ${font.id === this.currentFont ? 'active' : ''}`;
            fontItem.setAttribute('data-font-id', font.id);
            fontItem.innerHTML = `
                <div class="font-preview">
                    <span class="font-name" style="font-family: ${font.family}, monospace">${font.name}</span>
                    <span class="font-sample" style="font-family: ${font.family}, monospace">${font.sample}</span>
                </div>
                <i data-lucide="check" class="font-check"></i>
            `;
            fontGrid.appendChild(fontItem);
        });

        dropdown.appendChild(dropdownHeader);
        dropdown.appendChild(fontGrid);
        fontSelector.appendChild(toggleBtn);
        fontSelector.appendChild(dropdown);

        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector && themeSelector.nextSibling) {
            headerActions.insertBefore(fontSelector, themeSelector.nextSibling);
        } else {
            headerActions.appendChild(fontSelector);
        }

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
     * Update the font button appearance
     */
    updateFontButton() {
        const activeItems = document.querySelectorAll('.font-item');
        activeItems.forEach(item => {
            if (item.getAttribute('data-font-id') === this.currentFont) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    /**
     * Toggle the theme dropdown visibility
     */
    toggleThemeDropdown() {
        this.closeFontDropdown();
        this.themeDropdownOpen = !this.themeDropdownOpen;
        const dropdown = document.getElementById('theme-dropdown');
        const btn = document.getElementById('theme-selector-btn');

        if (this.themeDropdownOpen) {
            dropdown.classList.add('open');
            btn.classList.add('active');
        } else {
            dropdown.classList.remove('open');
            btn.classList.remove('active');
        }
    },

    /**
     * Toggle the font dropdown visibility
     */
    toggleFontDropdown() {
        this.closeThemeDropdown();
        this.fontDropdownOpen = !this.fontDropdownOpen;
        const dropdown = document.getElementById('font-dropdown');
        const btn = document.getElementById('font-selector-btn');

        if (this.fontDropdownOpen) {
            dropdown.classList.add('open');
            btn.classList.add('active');
        } else {
            dropdown.classList.remove('open');
            btn.classList.remove('active');
        }
    },

    /**
     * Close the theme dropdown
     */
    closeThemeDropdown() {
        this.themeDropdownOpen = false;
        const dropdown = document.getElementById('theme-dropdown');
        const btn = document.getElementById('theme-selector-btn');
        if (dropdown) dropdown.classList.remove('open');
        if (btn) btn.classList.remove('active');
    },

    /**
     * Close the font dropdown
     */
    closeFontDropdown() {
        this.fontDropdownOpen = false;
        const dropdown = document.getElementById('font-dropdown');
        const btn = document.getElementById('font-selector-btn');
        if (dropdown) dropdown.classList.remove('open');
        if (btn) btn.classList.remove('active');
    },

    /**
     * Close all dropdowns
     */
    closeAllDropdowns() {
        this.closeThemeDropdown();
        this.closeFontDropdown();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Mode toggle
            const modeBtn = e.target.closest('#mode-toggle-btn');
            if (modeBtn) {
                e.preventDefault();
                this.toggleMode();
                return;
            }

            // Theme selector toggle
            const themeSelectorBtn = e.target.closest('#theme-selector-btn');
            if (themeSelectorBtn) {
                e.preventDefault();
                this.toggleThemeDropdown();
                return;
            }

            // Font selector toggle
            const fontSelectorBtn = e.target.closest('#font-selector-btn');
            if (fontSelectorBtn) {
                e.preventDefault();
                this.toggleFontDropdown();
                return;
            }

            // Theme item selection
            const themeItem = e.target.closest('.theme-item');
            if (themeItem) {
                e.preventDefault();
                const themeId = themeItem.getAttribute('data-theme-id');
                this.applyTheme(themeId);
                this.closeThemeDropdown();

                if (typeof OpsMateApp !== 'undefined' && OpsMateApp.showToast) {
                    const theme = this.themes.find(t => t.id === themeId);
                    OpsMateApp.showToast(`テーマを「${theme.name}」に変更しました`, 'success');
                }
                return;
            }

            // Font item selection
            const fontItem = e.target.closest('.font-item');
            if (fontItem) {
                e.preventDefault();
                const fontId = fontItem.getAttribute('data-font-id');
                this.applyFont(fontId);
                this.closeFontDropdown();

                if (typeof OpsMateApp !== 'undefined' && OpsMateApp.showToast) {
                    const font = this.fonts.find(f => f.id === fontId);
                    OpsMateApp.showToast(`フォントを「${font.name}」に変更しました`, 'success');
                }
                return;
            }

            // Close dropdowns when clicking outside
            const themeSelector = e.target.closest('.theme-selector');
            const fontSelector = e.target.closest('.font-selector');

            if (!themeSelector && this.themeDropdownOpen) {
                this.closeThemeDropdown();
            }
            if (!fontSelector && this.fontDropdownOpen) {
                this.closeFontDropdown();
            }
        });

        // Close dropdowns on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
