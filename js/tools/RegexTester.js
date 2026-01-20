/**
 * OpsMate - Regex Tester (正規表現テスター)
 * ログ解析やパターンマッチング向け
 */

const RegexTester = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'regex',
            title: '正規表現テスターの使い方',
            description: '正規表現パターンをテストし、マッチした箇所を確認できます。ログ解析やデータ抽出に便利です。',
            steps: [
                '正規表現欄にパターンを入力します',
                'フラグ（g=グローバル、i=大文字小文字無視、m=複数行）を設定',
                'テスト文字列欄にログやテキストを貼り付けます',
                '「テスト実行」をクリックしてマッチ結果を確認'
            ],
            tips: [
                'よく使うパターンは「クイックパターン」から選択できます',
                'IPアドレス、MACアドレス、URL等のプリセットあり',
                'バックスラッシュは1つで入力（入力: \\d 表示: \\d）',
                '最大500件までマッチを表示'
            ],
            example: {
                title: 'パターン例',
                code: 'IPv4: \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="regex" class="w-5 h-5"></i>
                            正規表現テスター
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">正規表現 (Regular Expression)</label>
                        <div class="input-group">
                            <span class="regex-slash">/</span>
                            <input type="text" id="regex-pattern" class="form-input" 
                                   placeholder="\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}" autocomplete="off">
                            <span class="regex-slash">/</span>
                            <input type="text" id="regex-flags" class="form-input regex-flags" 
                                   placeholder="gim" value="gm" maxlength="6">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">テスト文字列</label>
                        <textarea id="regex-test" class="form-textarea" rows="6" 
                                  placeholder="ここにログやテキストを貼り付けてください..."></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" id="regex-run">
                            <i data-lucide="play" class="w-4 h-4"></i>
                            テスト実行
                        </button>
                        <button class="btn btn-secondary" id="regex-clear">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                            クリア
                        </button>
                    </div>
                    
                    <div id="regex-error" class="error-message" style="display: none; margin-top: 1rem;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="regex-error-text"></span>
                    </div>

                    ${helpSection}
                </div>
                
                <div class="panel-card" id="regex-results" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="check-circle" class="w-5 h-5"></i>
                            マッチ結果 (<span id="regex-match-count">0</span> 件)
                        </h2>
                    </div>
                    <div id="regex-match-list" class="match-list"></div>
                </div>
                
                <!-- クイックパターン -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="bookmark" class="w-5 h-5"></i>
                            クイックパターン
                        </h2>
                    </div>
                    <div class="quick-patterns" id="quick-patterns"></div>
                </div>
            </div>
        `;
    },

    patterns: [
        { name: 'IPv4 アドレス', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', flags: 'g' },
        { name: 'IPv4 (CIDR付)', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\/\\d{1,2}\\b', flags: 'g' },
        { name: 'MAC アドレス', pattern: '([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{4}\\.[0-9A-Fa-f]{4}\\.[0-9A-Fa-f]{4}', flags: 'gi' },
        { name: 'メールアドレス', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
        { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'gi' },
        { name: 'タイムスタンプ (ISO)', pattern: '\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}', flags: 'g' },
        { name: 'Syslog 日付表記', pattern: '[A-Z][a-z]{2}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2}', flags: 'g' },
        { name: 'IF名称 (Cisco等)', pattern: '(Gi|Fa|Te|Et|Vl|Po|Lo)\\d+(\\/\\d+)*', flags: 'gi' },
        { name: 'Hex 文字列', pattern: '0x[0-9A-Fa-f]+|[0-9A-Fa-f]{8,}', flags: 'gi' }
    ],

    init() {
        document.getElementById('regex-run')?.addEventListener('click', () => this.runTest());
        document.getElementById('regex-clear')?.addEventListener('click', () => this.clear());
        document.getElementById('regex-pattern')?.addEventListener('input', () => this.hideError());

        this.renderQuickPatterns();
    },

    renderQuickPatterns() {
        const container = document.getElementById('quick-patterns');
        if (!container) return;

        container.innerHTML = this.patterns.map(p => `
            <button class="quick-pattern-btn" data-pattern="${this.escapeHtml(p.pattern)}" data-flags="${p.flags}">
                ${p.name}
            </button>
        `).join('');

        container.querySelectorAll('.quick-pattern-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('regex-pattern').value = btn.dataset.pattern;
                document.getElementById('regex-flags').value = btn.dataset.flags;
                this.runTest();
            });
        });
    },

    runTest() {
        const pattern = document.getElementById('regex-pattern').value;
        const flags = document.getElementById('regex-flags').value;
        const testStr = document.getElementById('regex-test').value;

        if (!pattern) {
            this.showError('正規表現を入力してください');
            return;
        }

        let regex;
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            this.showError('無効な正規表現です: ' + e.message);
            return;
        }

        const matches = [];
        let match;

        if (flags.includes('g')) {
            while ((match = regex.exec(testStr)) !== null) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    groups: match.slice(1)
                });
                if (matches.length > 500) break; // Limit
            }
        } else {
            match = regex.exec(testStr);
            if (match) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    groups: match.slice(1)
                });
            }
        }

        this.displayResults(matches);
        this.hideError();
    },

    displayResults(matches) {
        const container = document.getElementById('regex-results');
        const list = document.getElementById('regex-match-list');
        const count = document.getElementById('regex-match-count');

        count.textContent = matches.length;

        if (matches.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted);">マッチする箇所が見つかりませんでした</p>';
        } else {
            list.innerHTML = matches.slice(0, 100).map((m, i) => `
                <div class="match-item">
                    <span class="match-index">#${i + 1}</span>
                    <span class="match-value">${this.escapeHtml(m.value)}</span>
                    <span class="match-pos">@ ${m.index}</span>
                    <button class="copy-btn visible" onclick="OpsMateHelpers.copyToClipboard('${this.escapeJs(m.value)}', this)">
                        <i data-lucide="copy" class="w-3 h-3"></i>
                    </button>
                </div>
            `).join('');

            if (matches.length > 100) {
                list.innerHTML += `<p style="color: var(--text-muted);">... 他 ${matches.length - 100} 件</p>`;
            }
        }

        container.style.display = 'block';
        lucide.createIcons();
    },

    clear() {
        document.getElementById('regex-pattern').value = '';
        document.getElementById('regex-test').value = '';
        document.getElementById('regex-results').style.display = 'none';
        this.hideError();
    },

    showError(msg) {
        const el = document.getElementById('regex-error');
        const txt = document.getElementById('regex-error-text');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
        lucide.createIcons();
    },

    hideError() {
        const el = document.getElementById('regex-error');
        if (el) el.style.display = 'none';
    },

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    escapeJs(str) {
        return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    }
};

window.RegexTester = RegexTester;
