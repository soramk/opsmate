/**
 * OpsMate - On-call/Shift Generator
 */

const ShiftGenerator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'shift-gen',
            title: 'シフトジェネレーターの使い方',
            description: '運用メンバーと対象期間を入力して、公平な当番スケジュールを生成します。',
            steps: [
                'メンバー名を1行に1人ずつ入力します',
                '開始日を選択します',
                '期間（日数）を選択します',
                '「生成実行」をクリックすると、ローテーションに基づいた表が生成されます'
            ],
            tips: [
                '生成されたスケジュールは Markdown 形式でコピーできるので、Wikiなどにそのまま貼り付けられます',
                'メンバーの順番を入れ替えることで、ローテーションの開始位置を調整できます'
            ],
            example: {
                title: '活用例',
                code: '| 日付 | 担当者 |\n| :--- | :--- |\n| 2024-01-01 | 田中 |\n| 2024-01-02 | 佐藤 |'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                            On-call / Shift Generator
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        <div class="space-y-6">
                            <div class="form-group">
                                <label class="form-label">メンバーリスト (1行1名)</label>
                                <textarea id="sg-members" class="form-textarea" rows="6" placeholder="田中&#10;佐藤&#10;鈴木&#10;高橋"></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label class="form-label">開始日</label>
                                    <input type="date" id="sg-start-date" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">期間 (日数)</label>
                                    <input type="number" id="sg-duration" class="form-input" value="14" min="1">
                                </div>
                            </div>

                            <button class="btn btn-primary" id="sg-run-btn">
                                <i data-lucide="play" class="w-4 h-4"></i> スケジュール生成
                            </button>
                        </div>

                        <div class="flex flex-col">
                            <div class="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6 flex-grow overflow-auto max-h-[500px]">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-[var(--text-secondary)] text-sm font-medium uppercase">Schedule Preview</h3>
                                    <button class="btn btn-secondary btn-sm" id="sg-copy-btn" style="display: none;">
                                        <i data-lucide="copy" class="w-4 h-4"></i> MDコピー
                                    </button>
                                </div>
                                <div id="sg-result-table" class="text-sm">
                                    <div class="text-center text-[var(--text-muted)] py-10">
                                        パラメーターを入力して生成してください
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sg-start-date').value = today;

        const runBtn = document.getElementById('sg-run-btn');
        const copyBtn = document.getElementById('sg-copy-btn');

        if (runBtn) runBtn.addEventListener('click', () => this.generate());
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const md = this.generateMarkdown();
                OpsMateHelpers.copyToClipboard(md, copyBtn);
            });
        }
    },

    generate() {
        const membersRaw = document.getElementById('sg-members').value.trim();
        const startDateStr = document.getElementById('sg-start-date').value;
        const duration = parseInt(document.getElementById('sg-duration').value);
        const resultTable = document.getElementById('sg-result-table');
        const copyBtn = document.getElementById('sg-copy-btn');

        if (!membersRaw || !startDateStr || !duration) return;

        const members = membersRaw.split('\n').map(m => m.trim()).filter(m => m !== '');
        if (members.length === 0) return;

        const startDate = new Date(startDateStr);
        let html = `
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-[var(--border-color)]">
                        <th class="py-2 px-4 text-[var(--text-secondary)] font-medium">日付</th>
                        <th class="py-2 px-4 text-[var(--text-secondary)] font-medium">曜日</th>
                        <th class="py-2 px-4 text-[var(--text-secondary)] font-medium">担当者</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

        for (let i = 0; i < duration; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dateStr = currentDate.toISOString().split('T')[0];
            const dayStr = dayLabels[currentDate.getDay()];
            const member = members[i % members.length];

            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const rowClass = isWeekend ? 'bg-[var(--bg-secondary)]/50' : '';
            const dayClass = currentDate.getDay() === 0 ? 'text-[var(--error-color)]' : (currentDate.getDay() === 6 ? 'text-[var(--info-color)]' : '');

            html += `
                <tr class="border-b border-[var(--border-color)]/50 ${rowClass}">
                    <td class="py-2 px-4 font-mono text-[var(--text-primary)]">${dateStr}</td>
                    <td class="py-2 px-4 ${dayClass}">${dayStr}</td>
                    <td class="py-2 px-4 text-[var(--accent-primary)] font-medium">${member}</td>
                </tr>
            `;
        }

        html += `</tbody></table>`;
        resultTable.innerHTML = html;
        copyBtn.style.display = 'flex';
    },

    generateMarkdown() {
        const membersRaw = document.getElementById('sg-members').value.trim();
        const startDateStr = document.getElementById('sg-start-date').value;
        const duration = parseInt(document.getElementById('sg-duration').value);

        const members = membersRaw.split('\n').map(m => m.trim()).filter(m => m !== '');
        const startDate = new Date(startDateStr);
        const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

        let md = '| 日付 | 曜日 | 担当者 |\n| :--- | :--- | :--- |\n';

        for (let i = 0; i < duration; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dateStr = currentDate.toISOString().split('T')[0];
            const dayStr = dayLabels[currentDate.getDay()];
            const member = members[i % members.length];

            md += `| ${dateStr} | ${dayStr} | ${member} |\n`;
        }

        return md;
    }
};

window.ShiftGenerator = ShiftGenerator;
