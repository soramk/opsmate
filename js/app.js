/**
 * OpsMate - Main Application
 * Network Engineer's Toolkit
 * 
 * Client-side only, secure, fast.
 */

const OpsMateApp = {
    version: '1.0.0',

    /**
     * Initialize the application
     */
    init() {
        console.log(`OpsMate v${this.version} initializing...`);

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bootstrap());
        } else {
            this.bootstrap();
        }
    },

    /**
     * Bootstrap all components
     */
    bootstrap() {
        // Initialize Lucide icons
        lucide.createIcons();

        // Initialize components
        SidebarComponent.init();
        HeaderComponent.init();
        MainContentComponent.init();

        // Handle URL hash for direct tool linking
        this.handleHashNavigation();
        window.addEventListener('hashchange', () => this.handleHashNavigation());

        console.log('OpsMate ready!');
    },

    /**
     * Handle hash-based navigation
     */
    handleHashNavigation() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            SidebarComponent.selectTool(hash);
        }
    }
};

// Start the app
OpsMateApp.init();
