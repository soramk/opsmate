/**
 * OpsMate - Incident Timeline Generator
 */

const IncidentTimeline = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'incident-timeline',
            title: 'インシデントタイムライン生成の使い方',
            description: '障害対応や作業実施のタイムラインを記録し、報告書やポストモーテムに使えるフォーマットで出力します。',
            steps: [
                '「新規イベント」でタイムラインにエントリを追加します',
                '時刻、内容、担当者を入力して記録します',
                '「Markdown出力」または「テーブル出力」で報告書用フォーマットを取得します'
            ],
            tips: [
                '時刻は自動で現在時刻が入力されますが、手動で変更も可能です',
                'タイプを選択すると、色分けされて視覚的にわかりやすくなります',
                'ブラウザを閉じるとデータは消えるので、定期的にエクスポートしてください'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="plus-circle" class="w-5 h-5"></i>
                            新規イベント追加
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="form-group">
                            <label class="form-label">時刻</label>
                            <input type="datetime-local" id="tl-time" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">タイプ</label>
                            <select id="tl-type" class="form-select">
                                <option value="detect">🔴 検知</option>
                                <option value="action">🔧 対応</option>
                                <option value="escalate">📢 エスカレ</option>
                                <option value="resolve">✅ 解決</option>
                                <option value="info">ℹ️ 情報</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">担当者</label>
                            <input type="text" id="tl-owner" class="form-input" placeholder="田中">
                        </div>
                        <div class="form-group flex items-end">
                            <button class="btn btn-primary w-full" id="tl-add-btn">
                                <i data-lucide="plus" class="w-4 h-4"></i> 追加
                            </button>
                        </div>
                    </div>
                    <div class="form-group mt-4">
                        <label class="form-label">内容</label>
                        <input type="text" id="tl-content" class="form-input" placeholder="監視アラート発報: CPU使用率 95% 超過">
                    </div>
                </div>

                <!-- Timeline List -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                            <i data-lucide="list" class="w-5 h-5"></i>
                            タイムライン
                        </h2>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="tl-clear-btn">
                                <i data-lucide="trash-2" class="w-4 h-4"></i> クリア
                            </button>
                        </div>
                    </div>
                    <div id="tl-list" class="space-y-2 max-h-[400px] overflow-auto"></div>
                </div>

                <!-- Export -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="download" class="w-5 h-5"></i>
                            エクスポート
                        </h2>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="tl-export-md">Markdown</button>
                            <button class="btn btn-secondary btn-sm" id="tl-export-table">テーブル</button>
                        </div>
                    </div>
                    <pre id="tl-output" class="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-auto max-h-[300px] whitespace-pre-wrap"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    events: [],

    init() {
        // Set current time
        const now = new Date();
        const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('tl-time').value = localISO;

        document.getElementById('tl-add-btn').addEventListener('click', () => this.addEvent());
        document.getElementById('tl-clear-btn').addEventListener('click', () => this.clearEvents());
        document.getElementById('tl-export-md').addEventListener('click', () => this.exportMarkdown());
        document.getElementById('tl-export-table').addEventListener('click', () => this.exportTable());

        this.renderList();
    },

    addEvent() {
        const time = document.getElementById('tl-time').value;
        const type = document.getElementById('tl-type').value;
        const owner = document.getElementById('tl-owner').value || '-';
        const content = document.getElementById('tl-content').value;

        if (!time || !content) {
            OpsMateHelpers.showToast('時刻と内容を入力してください', 'error');
            return;
        }

        this.events.push({ time, type, owner, content });
        this.events.sort((a, b) => new Date(a.time) - new Date(b.time));

        document.getElementById('tl-content').value = '';
        const now = new Date();
        document.getElementById('tl-time').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

        this.renderList();
        OpsMateHelpers.showToast('イベントを追加しました', 'success');
    },

    clearEvents() {
        if (confirm('すべてのイベントを削除しますか？')) {
            this.events = [];
            this.renderList();
        }
    },

    renderList() {
        const list = document.getElementById('tl-list');
        if (this.events.length === 0) {
            list.innerHTML = '<p class="text-slate-500 text-center py-4">イベントがありません</p>';
            return;
        }

        const typeColors = {
            detect: 'border-l-rose-500 bg-rose-500/10',
            action: 'border-l-amber-500 bg-amber-500/10',
            escalate: 'border-l-purple-500 bg-purple-500/10',
            resolve: 'border-l-emerald-500 bg-emerald-500/10',
            info: 'border-l-blue-500 bg-blue-500/10'
        };

        list.innerHTML = this.events.map((ev, i) => {
            const dt = new Date(ev.time);
            const timeStr = dt.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            return `
                <div class="border-l-4 ${typeColors[ev.type]} p-3 rounded-r-lg flex justify-between items-start">
                    <div>
                        <span class="text-xs text-slate-400 font-mono">${timeStr}</span>
                        <span class="text-xs text-slate-500 ml-2">[${ev.owner}]</span>
                        <div class="text-sm text-slate-200 mt-1">${ev.content}</div>
                    </div>
                    <button class="text-slate-500 hover:text-rose-400" onclick="IncidentTimeline.deleteEvent(${i})">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    },

    deleteEvent(index) {
        this.events.splice(index, 1);
        this.renderList();
    },

    exportMarkdown() {
        const output = document.getElementById('tl-output');
        const lines = this.events.map(ev => {
            const dt = new Date(ev.time);
            const timeStr = dt.toLocaleString('ja-JP');
            return `- **${timeStr}** [${ev.owner}] ${ev.content}`;
        });
        output.textContent = '## インシデントタイムライン\n\n' + lines.join('\n');
    },

    exportTable() {
        const output = document.getElementById('tl-output');
        let table = '| 時刻 | 担当 | 内容 |\n|------|------|------|\n';
        this.events.forEach(ev => {
            const dt = new Date(ev.time);
            const timeStr = dt.toLocaleString('ja-JP');
            table += `| ${timeStr} | ${ev.owner} | ${ev.content} |\n`;
        });
        output.textContent = table;
    }
};

window.IncidentTimeline = IncidentTimeline;
