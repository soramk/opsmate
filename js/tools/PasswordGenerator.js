/**
 * OpsMate - Password & Key Generator
 */

const PasswordGenerator = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="key" class="w-5 h-5"></i>
                            パスワード生成
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">長さ: <span id="pwd-length-display">16</span> 文字</label>
                        <input type="range" id="pwd-length" class="form-range" min="8" max="128" value="16">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">使用文字</label>
                        <div class="checkbox-grid">
                            <label class="checkbox-label"><input type="checkbox" id="pwd-upper" checked> 大文字 (A-Z)</label>
                            <label class="checkbox-label"><input type="checkbox" id="pwd-lower" checked> 小文字 (a-z)</label>
                            <label class="checkbox-label"><input type="checkbox" id="pwd-numbers" checked> 数字 (0-9)</label>
                            <label class="checkbox-label"><input type="checkbox" id="pwd-symbols" checked> 記号 (!@#$...)</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="pwd-exclude-ambiguous">
                            紛らわしい文字を除外 (I, l, 1, O, 0, |)
                        </label>
                    </div>
                    
                    <button class="btn btn-primary" id="pwd-generate">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        パスワード生成
                    </button>
                    
                    <div id="pwd-error" class="error-message" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="pwd-error-text"></span>
                    </div>
                    
                    <div id="pwd-result" class="password-result" style="display: none;">
                        <div class="password-display" id="pwd-display"></div>
                        <div class="password-actions">
                            <button class="btn btn-secondary" id="pwd-copy">
                                <i data-lucide="copy" class="w-4 h-4"></i> コピー
                            </button>
                            <button class="btn btn-secondary" id="pwd-regenerate">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i> 再生成
                            </button>
                        </div>
                        <div class="password-strength" id="pwd-strength"></div>
                    </div>
                </div>
                
                <!-- Pre-Shared Key生成 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="shield" class="w-5 h-5"></i>
                            事前共有鍵 (PSK) 生成
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">キー形式</label>
                        <select id="psk-type" class="form-select">
                            <option value="hex64">WPA2 Hex (64文字)</option>
                            <option value="ascii63">WPA2 ASCII (63文字)</option>
                            <option value="hex32">IPsec/VPN (32文字)</option>
                            <option value="hex16">簡易キー (16文字)</option>
                        </select>
                    </div>
                    
                    <button class="btn btn-primary" id="psk-generate">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        PSK 生成
                    </button>
                    
                    <div id="psk-result" class="password-result" style="display: none;">
                        <div class="password-display monospace" id="psk-display"></div>
                        <button class="btn btn-secondary" id="psk-copy">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const lengthSlider = document.getElementById('pwd-length');
        const lengthDisplay = document.getElementById('pwd-length-display');

        if (lengthSlider) {
            lengthSlider.addEventListener('input', () => {
                lengthDisplay.textContent = lengthSlider.value;
            });
        }

        document.getElementById('pwd-generate')?.addEventListener('click', () => this.generatePassword());
        document.getElementById('pwd-regenerate')?.addEventListener('click', () => this.generatePassword());
        document.getElementById('pwd-copy')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('pwd-display').textContent);
        });

        document.getElementById('psk-generate')?.addEventListener('click', () => this.generatePSK());
        document.getElementById('psk-copy')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('psk-display').textContent);
        });
    },

    generatePassword() {
        const length = parseInt(document.getElementById('pwd-length').value);
        const useUpper = document.getElementById('pwd-upper').checked;
        const useLower = document.getElementById('pwd-lower').checked;
        const useNumbers = document.getElementById('pwd-numbers').checked;
        const useSymbols = document.getElementById('pwd-symbols').checked;
        const excludeAmbiguous = document.getElementById('pwd-exclude-ambiguous').checked;

        if (!useUpper && !useLower && !useNumbers && !useSymbols) {
            this.showError('少なくとも1つの文字タイプを選択してください');
            return;
        }

        let chars = '';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const ambiguous = 'Il1O0|';

        if (useUpper) chars += upper;
        if (useLower) chars += lower;
        if (useNumbers) chars += numbers;
        if (useSymbols) chars += symbols;

        if (excludeAmbiguous) {
            chars = chars.split('').filter(c => !ambiguous.includes(c)).join('');
        }

        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        document.getElementById('pwd-display').textContent = password;
        document.getElementById('pwd-result').style.display = 'block';
        this.hideError();

        this.showStrength(password);
        lucide.createIcons();
    },

    generatePSK() {
        const type = document.getElementById('psk-type').value;
        let key = '';

        const hexChars = '0123456789abcdef';
        const asciiChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

        const lengths = { hex64: 64, ascii63: 63, hex32: 32, hex16: 16 };
        const length = lengths[type];
        const chars = type === 'ascii63' ? asciiChars : hexChars;

        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            key += chars[array[i] % chars.length];
        }

        document.getElementById('psk-display').textContent = key;
        document.getElementById('psk-result').style.display = 'block';
        lucide.createIcons();
    },

    showStrength(password) {
        let score = 0;
        if (password.length >= 12) score++;
        if (password.length >= 16) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = ['非常に弱い', '弱い', '普通', '良好', '強い', '非常に強い'];
        const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981'];

        const el = document.getElementById('pwd-strength');
        el.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${(score / 6) * 100}%; background: ${colors[score - 1] || colors[0]};"></div>
            </div>
            <span style="color: ${colors[score - 1] || colors[0]}">${levels[score - 1] || levels[0]}</span>
        `;
    },

    showError(msg) {
        const el = document.getElementById('pwd-error');
        const txt = document.getElementById('pwd-error-text');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
    },

    hideError() {
        const el = document.getElementById('pwd-error');
        if (el) el.style.display = 'none';
    }
};

window.PasswordGenerator = PasswordGenerator;
