/**
 * OpsMate - Header Component
 * Handles header title updates and theme toggle
 */

const HeaderComponent = {
    /**
     * Initialize the header
     */
    init() {
        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // Theme toggle functionality (for future light mode support)
                OpsMateHelpers.showToast('Dark mode only - designed for terminal users', 'info');
            });
        }
    },

    /**
     * Update the header title and description
     * @param {string} title - Tool title
     * @param {string} description - Tool description
     */
    updateTitle(title, description) {
        const titleEl = document.getElementById('current-tool-title');
        const descEl = document.getElementById('current-tool-description');

        if (titleEl) {
            titleEl.textContent = title;
            titleEl.style.animation = 'none';
            titleEl.offsetHeight; // Trigger reflow
            titleEl.style.animation = 'fadeIn 0.3s ease';
        }

        if (descEl) {
            descEl.textContent = description;
        }
    },

    /**
     * Reset header to welcome state
     */
    resetToWelcome() {
        this.updateTitle('Welcome', 'Select a tool from the sidebar');
    }
};

// Make available globally
window.HeaderComponent = HeaderComponent;
