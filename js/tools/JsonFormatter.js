/**
 * OpsMate - JSON/YAML Formatter (JSON整形・検証)
 */

const JsonFormatter = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="braces" class="w-5 h-5"></i>
                            JSON 整形 & 検証
                        </h2>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" id="json-minify">圧縮 (Minify)</button>
                            <button class="btn btn-secondary btn-sm" id="json-clear">クリア</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">入力 JSON</label>
                        <textarea id="json-input" class="form-textarea code-textarea" rows="10" 
                                  placeholder='{"key": "value", "array": [1, 2, 3]}'></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <button class="btn btn-primary" id="json-format">
                            <i data-lucide="wand-2" class="w-4 h-4"></i>
                            整形実行
                        </button>
                        <label class="form-label" style="margin: 0;">インデント:</label>
                        <select id="json-indent" class="form-select" style="width: auto;">
                            <option value="2">スペース 2</option>
                            <option value="4">スペース 4</option>
                            <option value="tab">タブ</option>
                        </select>
                    </div>
                    
                    <div id="json-error" class="error-message" style="display: none; margin-top: 1rem;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="json-error-text"></span>
                    </div>
                    
                    <div id="json-success" class="success-message" style="display: none; margin-top: 1rem;">
                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                        <span>有効な JSON です</span>
                    </div>
                </div>
                
                <div class="panel-card" id="json-output-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="file-code" class="w-5 h-5"></i>
                            整形結果
                        </h2>
                        <button class="btn btn-secondary btn-sm" id="json-copy">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="json-output" class="json-output"></pre>
                    
                    <div class="json-stats" id="json-stats"></div>
                </div>
                
                <!-- JSON Path Finder -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="search" class="w-5 h-5"></i>
                            JSON パス検索
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">JSON パス (例: data.users[0].name)</label>
                        <div class="input-group">
                            <input type="text" id="json-path-input" class="form-input" placeholder="data.key">
                            <button class="btn btn-primary" id="json-path-find">
                                <i data-lucide="search" class="w-4 h-4"></i>
                                検索
                            </button>
                        </div>
                    </div>
                    
                    <div id="json-path-result" style="display: none;"></div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('json-format')?.addEventListener('click', () => this.format());
        document.getElementById('json-minify')?.addEventListener('click', () => this.minify());
        document.getElementById('json-clear')?.addEventListener('click', () => this.clear());
        document.getElementById('json-copy')?.addEventListener('click', () => this.copy());
        document.getElementById('json-path-find')?.addEventListener('click', () => this.findPath());

        document.getElementById('json-input')?.addEventListener('input', () => {
            this.hideMessages();
        });
    },

    format() {
        const input = document.getElementById('json-input').value.trim();
        const indentType = document.getElementById('json-indent').value;

        if (!input) {
            this.showError('JSON を入力してください');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const indent = indentType === 'tab' ? '\t' : parseInt(indentType);
            const formatted = JSON.stringify(parsed, null, indent);

            this.displayOutput(formatted, parsed);
            this.showSuccess();
        } catch (e) {
            this.showError('Invalid JSON: ' + e.message);
        }
    },

    minify() {
        const input = document.getElementById('json-input').value.trim();

        if (!input) return;

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            document.getElementById('json-input').value = minified;
            this.showSuccess();
        } catch (e) {
            this.showError('Invalid JSON: ' + e.message);
        }
    },

    displayOutput(formatted, parsed) {
        const output = document.getElementById('json-output');
        const panel = document.getElementById('json-output-panel');
        const stats = document.getElementById('json-stats');

        output.textContent = formatted;
        panel.style.display = 'block';

        // Calculate stats
        const jsonStats = this.getStats(parsed);
        stats.innerHTML = `
            <span>キー数: ${jsonStats.keys}</span>
            <span>配列数: ${jsonStats.arrays}</span>
            <span>オブジェクト数: ${jsonStats.objects}</span>
            <span>サイズ: ${this.formatSize(formatted.length)}</span>
        `;
    },

    getStats(obj, stats = { keys: 0, arrays: 0, objects: 0 }) {
        if (Array.isArray(obj)) {
            stats.arrays++;
            obj.forEach(item => this.getStats(item, stats));
        } else if (obj && typeof obj === 'object') {
            stats.objects++;
            Object.keys(obj).forEach(key => {
                stats.keys++;
                this.getStats(obj[key], stats);
            });
        }
        return stats;
    },

    findPath() {
        const input = document.getElementById('json-input').value.trim();
        const path = document.getElementById('json-path-input').value.trim();
        const result = document.getElementById('json-path-result');

        if (!input || !path) return;

        try {
            const parsed = JSON.parse(input);
            const value = this.getValueByPath(parsed, path);

            if (value === undefined) {
                result.innerHTML = '<div class="error-message"><i data-lucide="x-circle" class="w-4 h-4"></i> パスが見つかりません</div>';
            } else {
                const display = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
                result.innerHTML = `
                    <div class="result-item" style="margin-top: 0.5rem;">
                        <div class="result-label">"${path}" の値</div>
                        <pre style="margin: 0; color: var(--accent-secondary);">${this.escapeHtml(display)}</pre>
                    </div>
                `;
            }
            result.style.display = 'block';
            lucide.createIcons();
        } catch (e) {
            result.innerHTML = '<div class="error-message"><i data-lucide="alert-circle" class="w-4 h-4"></i> 無効な JSON です</div>';
            result.style.display = 'block';
            lucide.createIcons();
        }
    },

    getValueByPath(obj, path) {
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            current = current[part];
        }

        return current;
    },

    copy() {
        const output = document.getElementById('json-output').textContent;
        OpsMateHelpers.copyToClipboard(output);
    },

    clear() {
        document.getElementById('json-input').value = '';
        document.getElementById('json-output-panel').style.display = 'none';
        document.getElementById('json-path-result').style.display = 'none';
        this.hideMessages();
    },

    showError(msg) {
        const el = document.getElementById('json-error');
        const txt = document.getElementById('json-error-text');
        const success = document.getElementById('json-success');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
        if (success) success.style.display = 'none';
        lucide.createIcons();
    },

    showSuccess() {
        const success = document.getElementById('json-success');
        const error = document.getElementById('json-error');
        if (success) success.style.display = 'flex';
        if (error) error.style.display = 'none';
        lucide.createIcons();
    },

    hideMessages() {
        document.getElementById('json-error').style.display = 'none';
        document.getElementById('json-success').style.display = 'none';
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        return (bytes / 1024).toFixed(2) + ' KB';
    },

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
};

window.JsonFormatter = JsonFormatter;
