/**
 * OpsMate - WBS Generator
 */

const WbsGenerator = {
    phases: [],
    projectInfo: {
        name: '',
        pm: '',
        startDate: ''
    },

    defaultPhases: [
        { id: 1, name: '計画' },
        { id: 2, name: '要件定義' },
        { id: 3, name: '基本設計' },
        { id: 4, name: '詳細設計' },
        { id: 5, name: '開発・実装' },
        { id: 6, name: '単体テスト' },
        { id: 7, name: '結合テスト' },
        { id: 8, name: '総合テスト' },
        { id: 9, name: 'リリース' }
    ],

    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'wbs-generator',
            title: 'WBS Generatorの使い方',
            description: 'プロジェクトのWBS（作業分解構成図）テンプレートをExcel形式で自動生成します。',
            steps: [
                'プロジェクト名、PM、開始予定日などの基本情報を入力します',
                '工程（フェーズ）を追加・編集・並び替えでカスタマイズします',
                '「Excelダウンロード」ボタンでテンプレートを生成します'
            ],
            tips: [
                '標準的なウォーターフォール工程がプリセットされています',
                'フェーズ名はダブルクリックで直接編集できます',
                '生成されたExcelにはタスク入力用のサンプル行が含まれます'
            ]
        });

        return `
            <div class="tool-panel">
                <!-- Project Info -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="folder" class="w-5 h-5"></i>
                            プロジェクト基本情報
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="form-label">プロジェクト名</label>
                            <input type="text" id="wbs-project-name" class="form-input" placeholder="新規システム開発プロジェクト">
                        </div>
                        <div class="form-group">
                            <label class="form-label">プロジェクトマネージャー</label>
                            <input type="text" id="wbs-pm" class="form-input" placeholder="山田 太郎">
                        </div>
                        <div class="form-group">
                            <label class="form-label">開始予定日</label>
                            <input type="date" id="wbs-start-date" class="form-input">
                        </div>
                    </div>
                </div>

                <!-- Phase Management -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="layers" class="w-5 h-5"></i>
                            工程（フェーズ）管理
                        </h2>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="wbs-reset-btn">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i> リセット
                            </button>
                            <button class="btn btn-primary btn-sm" id="wbs-add-phase-btn">
                                <i data-lucide="plus" class="w-4 h-4"></i> 工程追加
                            </button>
                        </div>
                    </div>
                    <div id="wbs-phases" class="space-y-2"></div>
                </div>

                <!-- Download -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="download" class="w-5 h-5"></i>
                            Excel出力
                        </h2>
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="btn btn-primary" id="wbs-download-btn">
                            <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                            Excelテンプレートをダウンロード
                        </button>
                        <span class="text-sm" style="color: var(--text-muted);">
                            ※ SheetJS (xlsx) ライブラリを使用してExcelファイルを生成します
                        </span>
                    </div>
                </div>

                <!-- Preview -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title" style="color: var(--text-secondary);">
                            <i data-lucide="eye" class="w-5 h-5"></i>
                            プレビュー
                        </h2>
                    </div>
                    <div id="wbs-preview" class="overflow-x-auto"></div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        // Set default start date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('wbs-start-date').value = today;

        // Load default phases
        this.phases = JSON.parse(JSON.stringify(this.defaultPhases));
        this.renderPhases();
        this.updatePreview();

        // Event listeners
        document.getElementById('wbs-add-phase-btn').addEventListener('click', () => this.addPhase());
        document.getElementById('wbs-reset-btn').addEventListener('click', () => this.resetPhases());
        document.getElementById('wbs-download-btn').addEventListener('click', () => this.downloadExcel());

        ['wbs-project-name', 'wbs-pm', 'wbs-start-date'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updatePreview());
        });
    },

    renderPhases() {
        const container = document.getElementById('wbs-phases');
        if (this.phases.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);" class="text-center py-4">工程がありません。「工程追加」ボタンで追加してください。</p>';
            return;
        }

        container.innerHTML = this.phases.map((phase, i) => `
            <div class="flex items-center gap-2 p-3 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);" data-phase-id="${phase.id}">
                <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold" style="background: var(--accent-primary); color: var(--bg-primary);">${i + 1}</span>
                <input type="text" class="form-input flex-grow phase-name" value="${phase.name}" data-id="${phase.id}">
                <div class="flex gap-1">
                    <button class="btn btn-secondary btn-xs phase-up" data-id="${phase.id}" ${i === 0 ? 'disabled' : ''}>
                        <i data-lucide="chevron-up" class="w-4 h-4"></i>
                    </button>
                    <button class="btn btn-secondary btn-xs phase-down" data-id="${phase.id}" ${i === this.phases.length - 1 ? 'disabled' : ''}>
                        <i data-lucide="chevron-down" class="w-4 h-4"></i>
                    </button>
                    <button class="btn btn-secondary btn-xs phase-delete" data-id="${phase.id}" style="color: var(--error-color);">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();

        // Bind events
        container.querySelectorAll('.phase-name').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.id);
                const phase = this.phases.find(p => p.id === id);
                if (phase) phase.name = e.target.value;
                this.updatePreview();
            });
        });

        container.querySelectorAll('.phase-up').forEach(btn => {
            btn.addEventListener('click', () => this.movePhase(parseInt(btn.dataset.id), -1));
        });

        container.querySelectorAll('.phase-down').forEach(btn => {
            btn.addEventListener('click', () => this.movePhase(parseInt(btn.dataset.id), 1));
        });

        container.querySelectorAll('.phase-delete').forEach(btn => {
            btn.addEventListener('click', () => this.deletePhase(parseInt(btn.dataset.id)));
        });
    },

    addPhase() {
        const newId = Math.max(0, ...this.phases.map(p => p.id)) + 1;
        this.phases.push({ id: newId, name: '新規工程' });
        this.renderPhases();
        this.updatePreview();
    },

    deletePhase(id) {
        this.phases = this.phases.filter(p => p.id !== id);
        this.renderPhases();
        this.updatePreview();
    },

    movePhase(id, direction) {
        const idx = this.phases.findIndex(p => p.id === id);
        if (idx < 0) return;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= this.phases.length) return;
        [this.phases[idx], this.phases[newIdx]] = [this.phases[newIdx], this.phases[idx]];
        this.renderPhases();
        this.updatePreview();
    },

    resetPhases() {
        if (!confirm('工程をデフォルトに戻しますか？')) return;
        this.phases = JSON.parse(JSON.stringify(this.defaultPhases));
        this.renderPhases();
        this.updatePreview();
    },

    updatePreview() {
        const preview = document.getElementById('wbs-preview');
        const projectName = document.getElementById('wbs-project-name').value || '（未設定）';
        const pm = document.getElementById('wbs-pm').value || '（未設定）';
        const startDate = document.getElementById('wbs-start-date').value || '（未設定）';

        let html = `
            <div class="mb-4 p-3 rounded-lg" style="background: var(--bg-secondary);">
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div><span style="color: var(--text-muted);">プロジェクト:</span> <strong style="color: var(--text-primary);">${projectName}</strong></div>
                    <div><span style="color: var(--text-muted);">PM:</span> <strong style="color: var(--text-primary);">${pm}</strong></div>
                    <div><span style="color: var(--text-muted);">開始日:</span> <strong style="color: var(--text-primary);">${startDate}</strong></div>
                </div>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>カテゴリ</th>
                        <th>タスク名</th>
                        <th>担当者</th>
                        <th>工数</th>
                        <th>開始予定</th>
                        <th>終了予定</th>
                        <th>開始実績</th>
                        <th>終了実績</th>
                        <th>進捗率</th>
                        <th>ステータス</th>
                        <th>備考</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let no = 1;
        this.phases.forEach(phase => {
            html += `
                <tr style="background: var(--bg-tertiary);">
                    <td class="font-bold text-accent">${no}</td>
                    <td class="font-bold" style="color: var(--accent-primary);" colspan="11">${phase.name}</td>
                </tr>
                <tr>
                    <td class="text-muted">${no}.1</td>
                    <td class="text-muted">${phase.name}</td>
                    <td>（タスク1）</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>0%</td>
                    <td>未着手</td>
                    <td></td>
                </tr>
                <tr>
                    <td class="text-muted">${no}.2</td>
                    <td class="text-muted">${phase.name}</td>
                    <td>（タスク2）</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>0%</td>
                    <td>未着手</td>
                    <td></td>
                </tr>
            `;
            no++;
        });

        html += '</tbody></table>';
        preview.innerHTML = html;
    },

    async downloadExcel() {
        // Load SheetJS if not loaded
        if (typeof XLSX === 'undefined') {
            OpsMateHelpers.showToast('SheetJSライブラリを読み込み中...', 'info');
            await this.loadSheetJS();
        }

        const projectName = document.getElementById('wbs-project-name').value || 'プロジェクト';
        const pm = document.getElementById('wbs-pm').value || '';
        const startDate = document.getElementById('wbs-start-date').value || '';

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Header rows
        const data = [
            ['WBS - ' + projectName],
            ['プロジェクトマネージャー:', pm, '', '開始予定日:', startDate],
            [],
            ['No', 'カテゴリ', 'タスク名', '担当者', '工数(h)', '開始予定', '終了予定', '開始実績', '終了実績', '進捗率', 'ステータス', '備考']
        ];

        // Add phases and sample tasks
        let no = 1;
        this.phases.forEach(phase => {
            data.push([no, phase.name, '', '', '', '', '', '', '', '', '', '']);
            data.push([`${no}.1`, phase.name, '（タスク詳細を入力）', '', '', '', '', '', '', '0%', '未着手', '']);
            data.push([`${no}.2`, phase.name, '（タスク詳細を入力）', '', '', '', '', '', '', '0%', '未着手', '']);
            no++;
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Set column widths
        ws['!cols'] = [
            { wch: 6 },   // No
            { wch: 12 },  // カテゴリ
            { wch: 30 },  // タスク名
            { wch: 10 },  // 担当者
            { wch: 8 },   // 工数
            { wch: 12 },  // 開始予定
            { wch: 12 },  // 終了予定
            { wch: 12 },  // 開始実績
            { wch: 12 },  // 終了実績
            { wch: 8 },   // 進捗率
            { wch: 10 },  // ステータス
            { wch: 20 }   // 備考
        ];

        // Merge header cell
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];

        XLSX.utils.book_append_sheet(wb, ws, 'WBS');

        // Download
        const fileName = `WBS_${projectName.replace(/[\/\\?%*:|"<>]/g, '')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
        OpsMateHelpers.showToast('Excelファイルをダウンロードしました', 'success');
    },

    loadSheetJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
};

window.WbsGenerator = WbsGenerator;
