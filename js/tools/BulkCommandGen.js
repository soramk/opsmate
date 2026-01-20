/**
 * OpsMate - Bulk Command Generator
 */

const BulkCommandGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'bulk-cmd',
            title: '一括コマンド生成の使い方',
            description: '複数のサーバーやプレフィックスなどに対して、テンプレートに基づいたコマンドを一括生成します。xargs やシェルスクリプトの元データー作成に最適です。',
            steps: [
                '対象リスト（サーバー名、IP、IDなど）を1行に1つずつ入力します',
                'コマンドテンプレートを入力します（対象リストの要素は {{item}}, {{n}} 等で参照）',
                '「生成実行」をクリックすると、全要素分のコマンドが展開されます'
            ],
            tips: [
                '{{item}} は入力した行の内容そのものに置換されます',
                '{{n}} は 1 から始まる連番に置換されます',
                '{{item.split(".")[0]}} のようにドットで分割した最初の要素、といった高度な置換は未対応ですが、シンプルな置換で十分強力です',
                '生成されたテキストはそのままターミナルに貼り付けたり、スクリプトとして保存できます'
            ],
            example: {
                title: 'プレースホルダーの例',
                code: 'リスト: server1, server2\nテンプレート: ssh {{item}} "df -h"\n出力: ssh server1 "df -h"\\nssh server2 "df -h"'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="layers" class="w-5 h-5"></i>
                            入力データ
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">対象リスト (1行に1要素)</label>
                        <textarea id="bulk-list" class="form-textarea code-textarea" rows="6" placeholder="server-01&#10;server-02&#10;server-03"></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">コマンドテンプレート</label>
                        <input type="text" id="bulk-tpl" class="form-input" placeholder="ssh {{item}} 'uptime'" value="ssh {{item}} 'uptime'">
                        <div class="help-tips-list mt-2" style="font-size: 0.75rem;">
                            <li>{{item}} : 行の内容</li>
                            <li>{{n}} : 1から始まる連番</li>
                        </div>
                    </div>

                    <button class="btn btn-primary" id="bulk-gen-btn">
                        <i data-lucide="play" class="w-4 h-4"></i> 生成実行
                    </button>
                </div>

                <div class="panel-card" id="bulk-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            生成結果 (<span id="bulk-count">0</span> Lines)
                        </h2>
                        <button class="btn btn-secondary btn-sm" id="bulk-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> 全てコピー
                        </button>
                    </div>
                    <textarea id="bulk-output" class="form-textarea code-textarea" rows="10" readonly></textarea>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const genBtn = document.getElementById('bulk-gen-btn');
        const copyBtn = document.getElementById('bulk-copy-btn');

        if (genBtn) genBtn.addEventListener('click', () => this.generate());
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const out = document.getElementById('bulk-output').value;
                OpsMateHelpers.copyToClipboard(out, copyBtn);
            });
        }
    },

    generate() {
        const listRaw = document.getElementById('bulk-list').value.trim();
        const tpl = document.getElementById('bulk-tpl').value;
        const panel = document.getElementById('bulk-result-panel');

        if (!listRaw || !tpl) return;

        const items = listRaw.split('\n').map(line => line.trim()).filter(line => line !== '');

        const results = items.map((item, index) => {
            let line = tpl;
            line = line.replace(/\{\{item\}\}/g, item);
            line = line.replace(/\{\{n\}\}/g, (index + 1).toString());
            return line;
        });

        document.getElementById('bulk-output').value = results.join('\n');
        document.getElementById('bulk-count').textContent = results.length;
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth' });
    }
};

window.BulkCommandGen = BulkCommandGen;
