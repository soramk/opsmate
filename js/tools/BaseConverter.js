/**
 * OpsMate - Base Converter (進数変換・ビット計算)
 */

const BaseConverter = {
    render() {
        return `
            <div class="tool-panel">
                <!-- 進数変換セクション -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="binary" class="w-5 h-5"></i>
                            進数変換
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="base-input">入力値</label>
                        <div class="input-group">
                            <input type="text" id="base-input" class="form-input" 
                                   placeholder="255" autocomplete="off">
                            <select id="base-type" class="form-select">
                                <option value="10">10進数 (Decimal)</option>
                                <option value="2">2進数 (Binary)</option>
                                <option value="16">16進数 (Hex)</option>
                                <option value="8">8進数 (Octal)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="base-convert">
                        <i data-lucide="repeat" class="w-4 h-4"></i>
                        変換実行
                    </button>
                    
                    <div id="base-error" class="error-message" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="base-error-text"></span>
                    </div>
                    
                    <div class="result-grid" id="base-results" style="margin-top: 1.5rem; display: none;"></div>
                </div>
                
                <!-- ビットトグルUI -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="toggle-left" class="w-5 h-5"></i>
                            ビットトグル (8-bit / 32-bit)
                        </h2>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" id="bit-8" data-active="true">8-bit</button>
                            <button class="btn btn-secondary btn-sm" id="bit-32">32-bit</button>
                        </div>
                    </div>
                    
                    <div id="bit-container" class="bit-toggle-container"></div>
                    
                    <div class="result-grid" id="bit-results" style="margin-top: 1rem;"></div>
                </div>
            </div>
        `;
    },

    bitCount: 8,

    init() {
        const convertBtn = document.getElementById('base-convert');
        const input = document.getElementById('base-input');
        const bit8 = document.getElementById('bit-8');
        const bit32 = document.getElementById('bit-32');

        if (convertBtn) convertBtn.addEventListener('click', () => this.convert());
        if (input) {
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.convert(); });
            input.addEventListener('input', () => this.hideError());
        }

        if (bit8) bit8.addEventListener('click', () => this.setBitMode(8));
        if (bit32) bit32.addEventListener('click', () => this.setBitMode(32));

        this.renderBitToggle();
    },

    convert() {
        const input = document.getElementById('base-input').value.trim();
        const base = parseInt(document.getElementById('base-type').value);

        if (!input) { this.showError('値を入力してください'); return; }

        let decimal;
        try {
            decimal = parseInt(input, base);
            if (isNaN(decimal) || decimal < 0) throw new Error();
        } catch {
            this.showError('選択した進数として無効な数値です');
            return;
        }

        const results = {
            decimal: decimal.toString(10),
            binary: decimal.toString(2),
            hex: decimal.toString(16).toUpperCase(),
            octal: decimal.toString(8)
        };

        this.displayResults(results);
    },

    displayResults(results) {
        const grid = document.getElementById('base-results');
        const items = [
            { label: '10進数 (Decimal)', value: results.decimal },
            { label: '2進数 (Binary)', value: results.binary },
            { label: '16進数 (Hex)', value: '0x' + results.hex },
            { label: '8進数 (Octal)', value: '0o' + results.octal }
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

        grid.style.display = 'grid';
        lucide.createIcons();
    },

    setBitMode(bits) {
        this.bitCount = bits;
        document.getElementById('bit-8').dataset.active = bits === 8;
        document.getElementById('bit-32').dataset.active = bits === 32;

        document.getElementById('bit-8').className = bits === 8 ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
        document.getElementById('bit-32').className = bits === 32 ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';

        this.renderBitToggle();
    },

    renderBitToggle() {
        const container = document.getElementById('bit-container');
        const bits = this.bitCount;

        let html = '<div class="bit-toggle-grid">';
        for (let i = bits - 1; i >= 0; i--) {
            const isOctetBoundary = bits === 32 && i % 8 === 0 && i !== 0;
            html += `
                <div class="bit-cell ${isOctetBoundary ? 'octet-boundary' : ''}">
                    <span class="bit-position">${i}</span>
                    <button class="bit-btn" data-bit="${i}" data-value="0">0</button>
                </div>
            `;
        }
        html += '</div>';

        container.innerHTML = html;
        this.updateBitResults();

        container.querySelectorAll('.bit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const current = btn.dataset.value;
                btn.dataset.value = current === '0' ? '1' : '0';
                btn.textContent = btn.dataset.value;
                btn.classList.toggle('active', btn.dataset.value === '1');
                this.updateBitResults();
            });
        });
    },

    updateBitResults() {
        const bits = Array.from(document.querySelectorAll('.bit-btn'))
            .map(btn => btn.dataset.value).join('');
        const decimal = parseInt(bits, 2) || 0;

        const grid = document.getElementById('bit-results');

        if (this.bitCount === 32) {
            const octets = bits.match(/.{8}/g) || [];
            const ip = octets.map(o => parseInt(o, 2)).join('.');

            grid.innerHTML = `
                <div class="result-item"><div class="result-label">2進数 (Binary)</div><div class="result-value"><span>${bits}</span></div></div>
                <div class="result-item"><div class="result-label">10進数 (Decimal)</div><div class="result-value"><span>${decimal}</span></div></div>
                <div class="result-item"><div class="result-label">ドット区切り10進数</div><div class="result-value"><span>${ip}</span></div></div>
                <div class="result-item"><div class="result-label">16進数 (Hex)</div><div class="result-value"><span>0x${decimal.toString(16).toUpperCase()}</span></div></div>
            `;
        } else {
            grid.innerHTML = `
                <div class="result-item"><div class="result-label">2進数 (Binary)</div><div class="result-value"><span>${bits}</span></div></div>
                <div class="result-item"><div class="result-label">10進数 (Decimal)</div><div class="result-value"><span>${decimal}</span></div></div>
                <div class="result-item"><div class="result-label">16進数 (Hex)</div><div class="result-value"><span>0x${decimal.toString(16).toUpperCase()}</span></div></div>
            `;
        }
    },

    showError(msg) {
        const el = document.getElementById('base-error');
        const txt = document.getElementById('base-error-text');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
    },

    hideError() {
        const el = document.getElementById('base-error');
        if (el) el.style.display = 'none';
    }
};

window.BaseConverter = BaseConverter;
