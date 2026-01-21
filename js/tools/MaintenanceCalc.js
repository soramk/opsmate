/**
 * OpsMate - Maintenance Window Calculator
 */

const MaintenanceCalc = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'maintenance-calc',
            title: 'メンテナンスウィンドウ計算の使い方',
            description: '深夜メンテナンスやグローバル拠点間の作業時間を計算・調整します。',
            steps: [
                '作業開始時刻と所要時間を入力します',
                '複数のタイムゾーンでの時刻を確認できます',
                '影響範囲の確認に活用してください'
            ],
            tips: [
                'UTC基準で計画すると複数拠点との調整がスムーズです',
                '日本時間(JST)はUTC+9です',
                '夏時間の切り替え時期は特に注意してください'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="wrench" class="w-5 h-5"></i>
                            メンテナンスウィンドウ計算
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="form-group">
                            <label class="form-label">日付</label>
                            <input type="date" id="maint-date" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">開始時刻</label>
                            <input type="time" id="maint-start" class="form-input" value="02:00">
                        </div>
                        <div class="form-group">
                            <label class="form-label">所要時間（分）</label>
                            <input type="number" id="maint-duration" class="form-input" value="60" min="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">基準TZ</label>
                            <select id="maint-tz" class="form-select">
                                <option value="Asia/Tokyo">JST (東京)</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">EST (ニューヨーク)</option>
                                <option value="America/Los_Angeles">PST (ロサンゼルス)</option>
                                <option value="Europe/London">GMT (ロンドン)</option>
                                <option value="Asia/Singapore">SGT (シンガポール)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="globe" class="w-5 h-5"></i>
                            各タイムゾーンでの時刻
                        </h2>
                    </div>
                    <div id="maint-result" class="space-y-3"></div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                            <i data-lucide="file-text" class="w-5 h-5"></i>
                            通知文テンプレート
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('maint-template').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="maint-template" class="code-output p-4 rounded-lg font-mono text-xs whitespace-pre-wrap"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    timezones: [
        { id: 'Asia/Tokyo', name: '東京 (JST)', offset: '+09:00' },
        { id: 'UTC', name: 'UTC', offset: '+00:00' },
        { id: 'America/New_York', name: 'ニューヨーク (EST/EDT)', offset: '-05:00' },
        { id: 'America/Los_Angeles', name: 'ロサンゼルス (PST/PDT)', offset: '-08:00' },
        { id: 'Europe/London', name: 'ロンドン (GMT/BST)', offset: '+00:00' },
        { id: 'Asia/Singapore', name: 'シンガポール (SGT)', offset: '+08:00' },
        { id: 'Asia/Shanghai', name: '上海 (CST)', offset: '+08:00' },
        { id: 'Europe/Paris', name: 'パリ (CET/CEST)', offset: '+01:00' }
    ],

    init() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('maint-date').value = today;

        ['maint-date', 'maint-start', 'maint-duration', 'maint-tz'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.calculate());
            document.getElementById(id).addEventListener('input', () => this.calculate());
        });

        this.calculate();
    },

    calculate() {
        const date = document.getElementById('maint-date').value;
        const startTime = document.getElementById('maint-start').value;
        const duration = parseInt(document.getElementById('maint-duration').value) || 60;
        const baseTz = document.getElementById('maint-tz').value;

        if (!date || !startTime) return;

        const startStr = `${date}T${startTime}:00`;
        const startDate = new Date(startStr);

        // Get offset for base timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: baseTz,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });

        const endDate = new Date(startDate.getTime() + duration * 60000);

        const resultEl = document.getElementById('maint-result');
        resultEl.innerHTML = this.timezones.map(tz => {
            const startLocal = startDate.toLocaleString('ja-JP', { timeZone: tz.id, hour: '2-digit', minute: '2-digit', hour12: false });
            const endLocal = endDate.toLocaleString('ja-JP', { timeZone: tz.id, hour: '2-digit', minute: '2-digit', hour12: false });
            const dateLocal = startDate.toLocaleString('ja-JP', { timeZone: tz.id, month: '2-digit', day: '2-digit', weekday: 'short' });

            const isBase = tz.id === baseTz;

            return `
                <div class="flex items-center justify-between p-3 rounded-lg border" style="background: ${isBase ? 'var(--accent-primary-bg)' : 'var(--bg-secondary)'}; border-color: ${isBase ? 'var(--accent-primary)' : 'var(--border-color)'};">
                    <div>
                        <div class="text-sm font-medium" style="color: ${isBase ? 'var(--accent-primary)' : 'var(--text-primary)'};">${tz.name}</div>
                        <div class="text-xs" style="color: var(--text-muted);">${tz.offset}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-mono" style="color: ${isBase ? 'var(--accent-primary)' : 'var(--text-primary)'};">${startLocal} - ${endLocal}</div>
                        <div class="text-xs" style="color: var(--text-muted);">${dateLocal}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Generate notification template
        const jstStart = startDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const jstEnd = endDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' });
        const utcStart = startDate.toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
        const utcEnd = endDate.toLocaleString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false });

        document.getElementById('maint-template').textContent = `【メンテナンスのお知らせ】

下記の日程でシステムメンテナンスを実施いたします。

■ 日時
  JST: ${jstStart} ～ ${jstEnd}
  UTC: ${utcStart} - ${utcEnd}

■ 所要時間
  約${duration}分

■ 影響
  メンテナンス中、サービスへのアクセスができなくなります。

ご不便をおかけしますが、何卒ご了承ください。`;
    }
};

window.MaintenanceCalc = MaintenanceCalc;
