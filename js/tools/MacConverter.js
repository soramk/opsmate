/**
 * OpsMate - MAC Address Converter
 */

const MacConverter = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="barcode" class="w-5 h-5"></i>
                            入力
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="mac-input">MAC アドレス</label>
                        <input type="text" id="mac-input" class="form-input" 
                               placeholder="00:1A:2B:3C:4D:5E または 001A.2B3C.4D5E" autocomplete="off">
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                            コロン、ハイフン、ドット、または区切り文字なしの形式に対応
                        </p>
                    </div>
                    
                    <button class="btn btn-primary" id="mac-convert">
                        <i data-lucide="repeat" class="w-4 h-4"></i>
                        変換実行
                    </button>
                    
                    <div id="mac-error" class="error-message" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="mac-error-text"></span>
                    </div>
                </div>
                
                <div class="panel-card" id="mac-results" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="list" class="w-5 h-5"></i>
                            変換後の形式
                        </h2>
                    </div>
                    <div class="result-grid" id="mac-result-grid"></div>
                </div>
            </div>
        `;
    },

    init() {
        const btn = document.getElementById('mac-convert');
        const input = document.getElementById('mac-input');

        if (btn) btn.addEventListener('click', () => this.convert());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.convert();
            });
            input.addEventListener('input', () => this.hideError());
        }
    },

    convert() {
        const input = document.getElementById('mac-input').value.trim();

        if (!input) {
            this.showError('MAC アドレスを入力してください');
            return;
        }

        // Remove all separators and validate
        const raw = input.replace(/[:\-.\s]/g, '').toLowerCase();

        if (!/^[0-9a-f]{12}$/i.test(raw)) {
            this.showError('無効な MAC アドレスです (16進数で12文字必要です)');
            return;
        }

        const formats = this.formatMac(raw);
        this.displayResults(formats);
    },

    formatMac(raw) {
        const upper = raw.toUpperCase();
        const lower = raw.toLowerCase();

        // Split into pairs
        const pairs = raw.match(/.{2}/g);
        const pairsUpper = upper.match(/.{2}/g);

        // Split into quads (for Cisco)
        const quads = lower.match(/.{4}/g);

        return {
            colon: pairsUpper.join(':'),
            hyphen: pairsUpper.join('-'),
            cisco: quads.join('.'),
            raw: lower,
            rawUpper: upper
        };
    },

    displayResults(formats) {
        const grid = document.getElementById('mac-result-grid');
        const container = document.getElementById('mac-results');

        const items = [
            { label: 'コロン区切り (Linux/Unix)', value: formats.colon },
            { label: 'ハイフン区切り (Windows)', value: formats.hyphen },
            { label: 'ドット区切り (Cisco)', value: formats.cisco },
            { label: '区切りなし (小文字)', value: formats.raw },
            { label: '区切りなし (大文字)', value: formats.rawUpper }
        ];

        grid.innerHTML = items.map(item => `
            <div class="result-item">
                <div class="result-label">${item.label}</div>
                <div class="result-value">
                    <span>${item.value}</span>
                    <button class="copy-btn" onclick="OpsMateHelpers.copyToClipboard('${item.value}', this)">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.style.display = 'block';
        lucide.createIcons();
    },

    showError(msg) {
        const el = document.getElementById('mac-error');
        const txt = document.getElementById('mac-error-text');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
    },

    hideError() {
        const el = document.getElementById('mac-error');
        if (el) el.style.display = 'none';
    }
};

window.MacConverter = MacConverter;
