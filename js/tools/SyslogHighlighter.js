/**
 * OpsMate - Syslog Color Highlighter
 */

const SyslogHighlighter = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'syslog-highlighter',
            title: 'Syslog カラーハイライターの使い方',
            description: '大量の Syslog テキストを Severity (緊急度) ごとに色分けし、重要なイベントを素早く見つけ出します。',
            steps: [
                '解析したい Syslog テキストをテキストエリアに貼り付けます',
                '「解析」ボタンをクリックすると、色分けされた結果が表示されます',
                'キーワード入力欄で、特定の文字列を含む行のみを表示（フィルタ）できます'
            ],
            tips: [
                'Emergency/Alert/Critical は赤、Error はオレンジ、Warning は黄色で強調されます',
                '標準的な RFC5424 形式や Cisco 形式のログに対応しています',
                'ブラウザ上でのみ処理されるため、機密性の高いログも安全に解析できます'
            ],
            example: {
                title: '対応フォーマット例',
                code: 'Jun 15 10:20:30 router1 %SYS-5-CONFIG_I: Configured from console by console\n<134>1 2023-06-15T10:20:30Z host1 app1 - - [meta] Message'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="align-left" class="w-5 h-5"></i>
                            ログ入力
                        </h2>
                        <div class="flex gap-2">
                             <button class="btn btn-secondary btn-sm" id="syslog-clear-btn">
                                クリア
                            </button>
                            <button class="btn btn-primary btn-sm" id="syslog-analyze-btn">
                                <i data-lucide="zap" class="w-4 h-4"></i> 解析
                            </button>
                        </div>
                    </div>
                    <textarea id="syslog-input" class="form-textarea h-48 font-mono text-sm p-4 w-full" placeholder="ここに Syslog を貼り付けてください..."></textarea>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="eye" class="w-5 h-5"></i>
                            解析結果
                        </h2>
                        <div class="flex gap-2 items-center">
                            <label class="text-xs text-muted">フィルタ:</label>
                            <input type="text" id="syslog-filter" class="form-input text-xs py-1" placeholder="キーワードでフィルタ...">
                        </div>
                    </div>
                    <div id="syslog-output" class="rounded-lg p-4 font-mono text-sm overflow-auto max-h-[600px] whitespace-pre-wrap leading-relaxed" style="background: var(--bg-tertiary);">
                        <p class="text-muted italic" style="color: var(--text-muted);">ログを解析するとここに色分け表示されます</p>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const input = document.getElementById('syslog-input');
        const output = document.getElementById('syslog-output');
        const analyzeBtn = document.getElementById('syslog-analyze-btn');
        const clearBtn = document.getElementById('syslog-clear-btn');
        const filterInput = document.getElementById('syslog-filter');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyze());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                output.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">ログを解析するとここに色分け表示されます</p>';
            });
        }

        if (filterInput) {
            filterInput.addEventListener('input', () => this.applyFilter());
        }
    },

    analyze() {
        const input = document.getElementById('syslog-input').value;
        if (!input.trim()) {
            OpsMateHelpers.showToast('ログを入力してください', 'info');
            return;
        }

        this.applyFilter();
    },

    applyFilter() {
        const input = document.getElementById('syslog-input').value;
        const filterText = document.getElementById('syslog-filter').value.toLowerCase();
        const output = document.getElementById('syslog-output');

        const lines = input.split('\n');
        let html = '';

        lines.forEach(line => {
            if (!line.trim()) return;
            if (filterText && !line.toLowerCase().includes(filterText)) return;

            const severity = this.detectSeverity(line);
            const colorClass = this.getSeverityColorClass(severity);

            html += `<div class="syslog-line py-0.5 border-b border-slate-900/50 hover:bg-slate-900 duration-150 ${colorClass}">
                        <span class="opacity-70 mr-2 text-[10px] w-4 inline-block text-center">${severity !== null ? severity : '-'}</span>
                        <span>${this.escapeHtml(line)}</span>
                     </div>`;
        });

        output.innerHTML = html || '<p style="color: var(--text-muted); font-style: italic;">一致するログがありません</p>';
    },

    detectSeverity(line) {
        // pattern 1: RFC5424 <PRI> (e.g., <134>) -> PRI % 8 = Severity
        const rfc5424 = line.match(/^<(\d+)>/);
        if (rfc5424) {
            return parseInt(rfc5424[1]) % 8;
        }

        // pattern 2: Cisco %FACILITY-SEVERITY-MNEMONIC:
        const cisco = line.match(/%-(\d)-/);
        if (cisco) {
            return parseInt(cisco[1]);
        }

        // pattern 3: Keywords
        const l = line.toLowerCase();
        if (l.includes('emerg') || l.includes('panic')) return 0;
        if (l.includes('alert')) return 1;
        if (l.includes('crit')) return 2;
        if (l.includes('error') || l.includes('err')) return 3;
        if (l.includes('warn')) return 4;
        if (l.includes('notice')) return 5;
        if (l.includes('info')) return 6;
        if (l.includes('debug')) return 7;

        return null;
    },

    getSeverityColorClass(severity) {
        if (severity === null) return '';
        switch (severity) {
            case 0: // Emergency
            case 1: // Alert
            case 2: // Critical
                return 'text-rose-600 font-bold bg-rose-500/10';
            case 3: // Error
                return 'text-orange-600 font-medium bg-orange-500/10';
            case 4: // Warning
                return 'text-amber-600 bg-amber-400/5';
            case 5: // Notice
                return 'text-emerald-600';
            case 6: // Info
                return 'text-blue-600';
            case 7: // Debug
                return 'opacity-70';
            default:
                return '';
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.SyslogHighlighter = SyslogHighlighter;
