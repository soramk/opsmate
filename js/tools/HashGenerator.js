/**
 * OpsMate - Hash & Checksum Generator
 */

const HashGenerator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'hash',
            title: 'ハッシュ生成の使い方',
            description: 'テキストからSHA-256、SHA-1、SHA-512のハッシュ値を生成します。ファイルの整合性確認やパスワードハッシュの学習に便利です。',
            steps: [
                '入力テキスト欄にハッシュ化したい文字列を入力',
                '「ハッシュ生成」ボタンをクリック',
                '各アルゴリズムのハッシュ値が表示されます',
                '比較欄に期待するハッシュ値を貼り付けて一致確認も可能'
            ],
            tips: [
                'SHA-256が現在最も一般的に使用されています',
                'SHA-1は脆弱性があるため新規利用は非推奨',
                '同じ入力からは常に同じハッシュ値が生成されます',
                'ハッシュ値から元のテキストを復元することはできません'
            ],
            example: {
                title: 'ハッシュの用途',
                code: 'ファイル整合性確認、パスワード保存、デジタル署名'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="hash" class="w-5 h-5"></i>
                            ハッシュ / チェックサム生成
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">入力テキスト</label>
                        <textarea id="hash-input" class="form-textarea" rows="4" 
                                  placeholder="ハッシュ化したいテキストを入力..."></textarea>
                    </div>

                    <div class="flex gap-2 mb-4">
                        <button class="btn btn-primary" id="hash-generate">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i> ハッシュ生成
                        </button>
                    </div>

                    <div id="hash-results" class="result-grid" style="display: none;"></div>

                    ${helpSection}
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="shield-check" class="w-5 h-5"></i>
                            ハッシュ比較
                        </h2>
                    </div>
                    <div class="form-group">
                        <label class="form-label">比較対象 (期待されるハッシュ値)</label>
                        <input type="text" id="hash-compare-input" class="form-input" placeholder="ここへハッシュ値を貼り付け...">
                    </div>
                    <div id="hash-compare-result" style="display: none;"></div>
                </div>
            </div>
        `;
    },

    async init() {
        document.getElementById('hash-generate')?.addEventListener('click', () => this.generate());
        document.getElementById('hash-compare-input')?.addEventListener('input', () => this.compare());
    },

    async generate() {
        const text = document.getElementById('hash-input').value;
        if (!text) return;

        const results = [
            { label: 'SHA-256', value: await this.hash(text, 'SHA-256') },
            { label: 'SHA-1', value: await this.hash(text, 'SHA-1') },
            { label: 'SHA-512', value: await this.hash(text, 'SHA-512') }
        ];

        const container = document.getElementById('hash-results');
        container.innerHTML = results.map(item => `
            <div class="result-item" data-hash-val="${item.value}">
                <div class="result-label">${item.label}</div>
                <div class="result-value">
                    <span style="font-size: 0.8rem; font-family: monospace;">${item.value}</span>
                    <button class="copy-btn" onclick="OpsMateHelpers.copyToClipboard('${item.value}', this)">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        container.style.display = 'grid';
        lucide.createIcons();
        this.compare(); // Update comparison if input exists
    },

    async hash(text, algo) {
        const msgUint8 = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    compare() {
        const compareVal = document.getElementById('hash-compare-input').value.trim().toLowerCase();
        const resultEl = document.getElementById('hash-compare-result');

        if (!compareVal) {
            resultEl.style.display = 'none';
            return;
        }

        const generatedHashes = Array.from(document.querySelectorAll('.result-item')).map(el => el.dataset.hashVal);
        const match = generatedHashes.includes(compareVal);

        if (match) {
            resultEl.innerHTML = `
                <div class="success-message">
                    <i data-lucide="check-circle" class="w-4 h-4"></i>
                    ハッシュ値が一致しました！
                </div>
            `;
        } else {
            resultEl.innerHTML = `
                <div class="error-message">
                    <i data-lucide="x-circle" class="w-4 h-4"></i>
                    ハッシュ値が一致しません。
                </div>
            `;
        }
        resultEl.style.display = 'block';
        lucide.createIcons();
    }
};

window.HashGenerator = HashGenerator;
