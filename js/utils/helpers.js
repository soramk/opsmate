/**
 * OpsMate - Utility Helper Functions
 * Common utilities used across all tools
 */

const OpsMateHelpers = {
    /**
     * Copy text to clipboard and show feedback
     * @param {string} text - Text to copy
     * @param {HTMLElement} button - Button element for visual feedback
     */
    async copyToClipboard(text, button = null) {
        try {
            await navigator.clipboard.writeText(text);

            if (button) {
                button.classList.add('copied');
                const originalIcon = button.innerHTML;
                button.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
                lucide.createIcons();

                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = originalIcon;
                    lucide.createIcons();
                }, 1500);
            }

            OpsMateHelpers.showToast('クリップボードにコピーしました！', 'success');
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            OpsMateHelpers.showToast('コピーに失敗しました', 'error');
            return false;
        }
    },

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type: 'success', 'error', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i data-lucide="${iconMap[type]}" class="toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Validate IP address format
     * @param {string} ip - IP address string
     * @returns {boolean} - True if valid
     */
    isValidIPv4(ip) {
        const pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = ip.match(pattern);

        if (!match) return false;

        for (let i = 1; i <= 4; i++) {
            const octet = parseInt(match[i], 10);
            if (octet < 0 || octet > 255) return false;
        }

        return true;
    },

    /**
     * Validate CIDR prefix
     * @param {number} cidr - CIDR value
     * @returns {boolean} - True if valid (0-32)
     */
    isValidCIDR(cidr) {
        const num = parseInt(cidr, 10);
        return !isNaN(num) && num >= 0 && num <= 32;
    },

    /**
     * Convert IP string to 32-bit integer
     * @param {string} ip - IP address string
     * @returns {number} - 32-bit integer representation
     */
    ipToInt(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    },

    /**
     * Convert 32-bit integer to IP string
     * @param {number} int - 32-bit integer
     * @returns {string} - IP address string
     */
    intToIp(int) {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
    },

    /**
     * Format large numbers with commas
     * @param {number} num - Number to format
     * @returns {string} - Formatted string
     */
    formatNumber(num) {
        return num.toLocaleString('ja-JP');
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format time duration to human readable string
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatDuration(seconds) {
        if (seconds < 1) {
            return `${Math.round(seconds * 1000)} ミリ秒`;
        }
        if (seconds < 60) {
            return `${seconds.toFixed(2)} 秒`;
        }
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${mins} 分 ${secs} 秒`;
        }
        if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.round((seconds % 3600) / 60);
            return `${hours} 時間 ${mins} 分`;
        }
        const days = Math.floor(seconds / 86400);
        const hours = Math.round((seconds % 86400) / 3600);
        return `${days} 日 ${hours} 時間`;
    },

    /**
     * Convert file size to bytes
     * @param {number} size - Size value
     * @param {string} unit - Unit (KB, MB, GB, TB)
     * @returns {number} - Size in bytes
     */
    toBytes(size, unit) {
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 ** 2,
            'GB': 1024 ** 3,
            'TB': 1024 ** 4
        };
        return size * (units[unit] || 1);
    },

    /**
     * Convert speed to bits per second
     * @param {number} speed - Speed value
     * @param {string} unit - Unit (Kbps, Mbps, Gbps)
     * @returns {number} - Speed in bps
     */
    toBps(speed, unit) {
        const units = {
            'bps': 1,
            'Kbps': 1000,
            'Mbps': 1000 ** 2,
            'Gbps': 1000 ** 3
        };
        return speed * (units[unit] || 1);
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} - Sanitized string
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Generate unique ID
     * @returns {string} - Unique ID string
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }
};

// Make available globally
window.OpsMateHelpers = OpsMateHelpers;
