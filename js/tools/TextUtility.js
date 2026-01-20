/**
 * OpsMate - Text Multi-Tool (Batch processing)
 */

const TextUtility = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'text',
            title: 'テキスト一括処理の使い方',
            description: 'IPアドレス一覧やホスト名リストなど、複数行のテキストを一括処理します。ソート、重複削除、接頭辞付与などが可能です。',
            steps: [
                'テキストを入力欄に貼り付け（1行1項目）',
                'ユーティリティボタンから処理を選択（ソート、重複削除など）',
                '接頭辞・接尾辞を入力して「適用」でコマンド生成にも対応',
                '結果をコピーして利用'
            ],
            tips: [
                'IPアドレス一覧を貼り付けてソートや重複削除',
                '接頭辞に「ping 」を付けてpingコマンド一覧を生成',
                '接尾辞に「 -c 4」を付けてオプションを追加',
                '処理後の行数、文字数も表示'
            ],
            example: {
                title: '一括処理例',
                code: '192.168.1.1 + Prefix: "ping " → ping 192.168.1.1'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="type" class="w-5 h-5"></i>
                            テキスト一括処理ツール
                        </h2>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" id="text-clear">クリア</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">入力テキスト (IP一覧、ホスト名など)</label>
                        <textarea id="text-input" class="form-textarea code-textarea" rows="10" 
                                  placeholder="192.168.1.1&#10;192.168.1.2&#10;192.168.1.3"></textarea>
                    </div>

                    <div class="panel-header" style="border: none; margin: 0; padding: 0.5rem 0;">
                        <h3 class="panel-title" style="font-size: 0.85rem;">ユーティリティ</h3>
                    </div>

                    <div class="quick-patterns mb-4">
                        <button class="btn btn-secondary btn-sm" id="text-sort">昇順ソート</button>
                        <button class="btn btn-secondary btn-sm" id="text-reverse">反転</button>
                        <button class="btn btn-secondary btn-sm" id="text-unique">重複削除</button>
                        <button class="btn btn-secondary btn-sm" id="text-trim">空白トリム</button>
                        <button class="btn btn-secondary btn-sm" id="text-upper">大文字</button>
                        <button class="btn btn-secondary btn-sm" id="text-lower">小文字</button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="form-group mb-0">
                            <label class="form-label">接頭辞を付与 (Prefix)</label>
                            <div class="input-group">
                                <input type="text" id="text-prefix" class="form-input" placeholder="例: ping ">
                                <button class="btn btn-primary btn-sm" id="apply-prefix">適用</button>
                            </div>
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">接尾辞を付与 (Suffix)</label>
                            <div class="input-group">
                                <input type="text" id="text-suffix" class="form-input" placeholder="例: -c 4">
                                <button class="btn btn-primary btn-sm" id="apply-suffix">適用</button>
                            </div>
                        </div>
                    </div>

                    ${helpSection}
                </div>

                <div class="panel-card" id="text-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">処理結果</h2>
                        <button class="btn btn-primary btn-sm" id="text-copy">
                            <i data-lucide="copy" class="w-4 h-4"></i> 全てコピー
                        </button>
                    </div>
                    <textarea id="text-output" class="form-textarea code-textarea" rows="10" readonly></textarea>
                    <div class="json-stats" id="text-stats"></div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('text-sort')?.addEventListener('click', () => this.process(lines => [...lines].sort()));
        document.getElementById('text-reverse')?.addEventListener('click', () => this.process(lines => [...lines].reverse()));
        document.getElementById('text-unique')?.addEventListener('click', () => this.process(lines => [...new Set(lines)]));
        document.getElementById('text-trim')?.addEventListener('click', () => this.process(lines => lines.map(l => l.trim())));
        document.getElementById('text-upper')?.addEventListener('click', () => this.process(lines => lines.map(l => l.toUpperCase())));
        document.getElementById('text-lower')?.addEventListener('click', () => this.process(lines => lines.map(l => l.toLowerCase())));

        document.getElementById('apply-prefix')?.addEventListener('click', () => {
            const prefix = document.getElementById('text-prefix').value;
            this.process(lines => lines.map(l => prefix + l));
        });

        document.getElementById('apply-suffix')?.addEventListener('click', () => {
            const suffix = document.getElementById('text-suffix').value;
            this.process(lines => lines.map(l => l + suffix));
        });

        document.getElementById('text-clear')?.addEventListener('click', () => {
            document.getElementById('text-input').value = '';
            document.getElementById('text-result-panel').style.display = 'none';
        });

        document.getElementById('text-copy')?.addEventListener('click', () => {
            const output = document.getElementById('text-output').value;
            OpsMateHelpers.copyToClipboard(output);
        });
    },

    process(transformFn) {
        const input = document.getElementById('text-input').value;
        if (!input) return;

        const lines = input.split('\n');
        const result = transformFn(lines);

        const outputEl = document.getElementById('text-output');
        const panel = document.getElementById('text-result-panel');
        const stats = document.getElementById('text-stats');

        outputEl.value = result.join('\n');
        panel.style.display = 'block';

        stats.innerHTML = `
            <span>行数: ${result.length}</span>
            <span>単語数: ${result.join(' ').split(/\s+/).filter(w => w).length}</span>
            <span>文字数: ${result.join('\n').length}</span>
        `;

        lucide.createIcons();
    }
};

window.TextUtility = TextUtility;
