/**
 * OpsMate - Log Statistics Analyzer
 */

const LogAnalyzer = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'log-analyzer',
            title: 'ログ解析ツールの使い方',
            description: '貼り付けたログテキストからキーワード（ERROR, WARN等）の出現頻度を抽出し、統計を表示します。',
            steps: [
                '解析したいログ（サーバーログ、アプリケーションログ等）をテキストエリアに貼り付けます',
                '抽出したいキーワードをカンマ区切りで入力します（デフォルトで一般的なキーワードを設定済み）',
                '「解析実行」をクリックすると、キーワードごとのカウントと比率が表示されます'
            ],
            tips: [
                '大文字小文字は区別されません',
                '正規表現での抽出には対応していませんが、特定の識別子（"exception"等）を探すのに適しています',
                '時間ごとの集計は今後のアップデートで検討中です'
            ],
            example: {
                title: '活用例',
                code: 'ERROR: 120 (30%)\nWARN: 45 (11%)\nINFO: 235 (59%)'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="bar-chart-2" class="w-5 h-5"></i>
                            Log Statistics Analyzer
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ログテキスト</label>
                        <textarea id="la-input" class="form-textarea code-textarea" rows="12" placeholder="ここにログを貼り付けてください..."></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">抽出キーワード (カンマ区切り)</label>
                        <input type="text" id="la-keywords" class="form-input" value="ERROR, WARN, INFO, DEBUG, FATAL, CRITICAL, Exception, Timeout">
                    </div>

                    <button class="btn btn-primary" id="la-run-btn">
                        <i data-lucide="play" class="w-4 h-4"></i> 解析実行
                    </button>
                </div>

                <div class="panel-card" id="la-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">解析結果</h2>
                        <div class="text-xs text-[var(--text-muted)]">Total Lines: <span id="la-total-lines">0</span></div>
                    </div>
                    
                    <div id="la-stats-container" class="space-y-4">
                        <!-- Stats dynamic -->
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const runBtn = document.getElementById('la-run-btn');
        if (runBtn) runBtn.addEventListener('click', () => this.analyze());
    },

    analyze() {
        const input = document.getElementById('la-input').value;
        const keywordsInput = document.getElementById('la-keywords').value;
        const resultPanel = document.getElementById('la-result-panel');
        const statsContainer = document.getElementById('la-stats-container');

        if (!input) return;

        const lines = input.split('\n');
        const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k !== '');

        const counts = {};
        keywords.forEach(k => counts[k] = 0);

        lines.forEach(line => {
            keywords.forEach(k => {
                const regex = new RegExp(this.escapeRegExp(k), 'gi');
                const matches = line.match(regex);
                if (matches) {
                    counts[k] += matches.length;
                }
            });
        });

        const sortedKeywords = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        const maxCount = Math.max(...Object.values(counts));

        statsContainer.innerHTML = sortedKeywords.map(k => {
            const count = counts[k];
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
            const colorClass = this.getColorForKeyword(k);

            return `
                <div class="space-y-1">
                    <div class="flex justify-between text-sm">
                        <span class="font-medium text-[var(--text-primary)]">${k}</span>
                        <span class="font-mono text-[var(--text-secondary)]">${count.toLocaleString()} occurrences</span>
                    </div>
                    <div class="w-full bg-[var(--bg-tertiary)] rounded-full h-4 overflow-hidden border border-[var(--border-color)]">
                        <div class="h-full ${colorClass} transition-all duration-500" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('la-total-lines').textContent = lines.length.toLocaleString();
        resultPanel.style.display = 'block';
        resultPanel.scrollIntoView({ behavior: 'smooth' });
    },

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    getColorForKeyword(k) {
        const upper = k.toUpperCase();
        if (upper.includes('ERROR') || upper.includes('FATAL') || upper.includes('CRITICAL')) return 'bg-red-500';
        if (upper.includes('WARN')) return 'bg-amber-500';
        if (upper.includes('INFO')) return 'bg-emerald-500';
        if (upper.includes('DEBUG')) return 'bg-blue-500';
        return 'bg-slate-600';
    }
};

window.LogAnalyzer = LogAnalyzer;
