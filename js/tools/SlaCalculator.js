/**
 * OpsMate - SLA / Uptime Calculator
 */

const SlaCalculator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'sla-calculator',
            title: 'SLA / 稼働率計算機の使い方',
            description: 'SLA（サービスレベル合意）の稼働率から許容ダウンタイムを計算したり、実際のダウンタイムから稼働率を逆算します。',
            steps: [
                'SLA稼働率（例: 99.9%）を入力すると、許容ダウンタイムが表示されます',
                '逆に、実際のダウンタイム時間を入力すると、稼働率が計算されます',
                '月間・年間の両方で確認できます'
            ],
            tips: [
                '99.9% (スリーナイン) は月間約43分のダウンタイムを許容します',
                '99.99% (フォーナイン) は月間約4.3分、非常にシビアな目標です',
                'クラウドサービスのSLAを検討する際の参考にしてください'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- SLA to Downtime -->
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <i data-lucide="percent" class="w-5 h-5"></i>
                                SLA稼働率 → 許容ダウンタイム
                            </h2>
                        </div>
                        <div class="form-group">
                            <label class="form-label">SLA 稼働率 (%)</label>
                            <input type="number" id="sla-percent" class="form-input" value="99.9" step="0.001" min="0" max="100">
                        </div>
                        <div class="mt-4 space-y-3">
                            <div class="result-card">
                                <div class="result-label">年間ダウンタイム上限</div>
                                <div class="result-value text-xl" id="sla-year"></div>
                            </div>
                            <div class="result-card">
                                <div class="result-label">月間ダウンタイム上限</div>
                                <div class="result-value text-xl" id="sla-month"></div>
                            </div>
                            <div class="result-card">
                                <div class="result-label">週間ダウンタイム上限</div>
                                <div class="result-value text-xl" id="sla-week"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Downtime to SLA -->
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <i data-lucide="clock" class="w-5 h-5"></i>
                                ダウンタイム → 稼働率
                            </h2>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="form-label">ダウンタイム</label>
                                <input type="number" id="dt-value" class="form-input" value="60" min="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">単位</label>
                                <select id="dt-unit" class="form-select">
                                    <option value="minutes">分</option>
                                    <option value="hours">時間</option>
                                    <option value="days">日</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">期間</label>
                            <select id="dt-period" class="form-select">
                                <option value="month">月間 (30日)</option>
                                <option value="year">年間 (365日)</option>
                            </select>
                        </div>
                        <div class="mt-4">
                            <div class="result-card">
                                <div class="result-label">実際の稼働率</div>
                                <div class="result-value text-2xl" id="dt-result"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Reference Table -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                            <i data-lucide="table" class="w-5 h-5"></i>
                            SLA クイックリファレンス
                        </h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>SLA</th>
                                    <th>呼称</th>
                                    <th>年間</th>
                                    <th>月間</th>
                                    <th>日間</th>
                                </tr>
                            </thead>
                            <tbody id="sla-table">
                            </tbody>
                        </table>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    slaData: [
        { percent: 99, name: 'ツーナイン', year: '3.65日', month: '7.31時間', day: '14.4分' },
        { percent: 99.5, name: '-', year: '1.83日', month: '3.65時間', day: '7.2分' },
        { percent: 99.9, name: 'スリーナイン', year: '8.77時間', month: '43.8分', day: '1.44分' },
        { percent: 99.95, name: '-', year: '4.38時間', month: '21.9分', day: '43秒' },
        { percent: 99.99, name: 'フォーナイン', year: '52.6分', month: '4.38分', day: '8.6秒' },
        { percent: 99.999, name: 'ファイブナイン', year: '5.26分', month: '26.3秒', day: '0.86秒' }
    ],

    init() {
        document.getElementById('sla-percent').addEventListener('input', () => this.calcFromSla());
        document.getElementById('dt-value').addEventListener('input', () => this.calcFromDowntime());
        document.getElementById('dt-unit').addEventListener('change', () => this.calcFromDowntime());
        document.getElementById('dt-period').addEventListener('change', () => this.calcFromDowntime());

        this.renderTable();
        this.calcFromSla();
        this.calcFromDowntime();
    },

    calcFromSla() {
        const percent = parseFloat(document.getElementById('sla-percent').value) || 0;
        const downtime = (100 - percent) / 100;

        const yearMin = 365 * 24 * 60 * downtime;
        const monthMin = 30 * 24 * 60 * downtime;
        const weekMin = 7 * 24 * 60 * downtime;

        document.getElementById('sla-year').textContent = this.formatMinutes(yearMin);
        document.getElementById('sla-month').textContent = this.formatMinutes(monthMin);
        document.getElementById('sla-week').textContent = this.formatMinutes(weekMin);
    },

    calcFromDowntime() {
        const value = parseFloat(document.getElementById('dt-value').value) || 0;
        const unit = document.getElementById('dt-unit').value;
        const period = document.getElementById('dt-period').value;

        let minutes = value;
        if (unit === 'hours') minutes = value * 60;
        if (unit === 'days') minutes = value * 24 * 60;

        const totalMin = period === 'year' ? 365 * 24 * 60 : 30 * 24 * 60;
        const uptime = ((totalMin - minutes) / totalMin) * 100;

        document.getElementById('dt-result').textContent = uptime.toFixed(4) + ' %';
    },

    formatMinutes(min) {
        if (min < 1) return (min * 60).toFixed(1) + ' 秒';
        if (min < 60) return min.toFixed(1) + ' 分';
        if (min < 1440) return (min / 60).toFixed(2) + ' 時間';
        return (min / 1440).toFixed(2) + ' 日';
    },

    renderTable() {
        const tbody = document.getElementById('sla-table');
        tbody.innerHTML = this.slaData.map(row => `
            <tr>
                <td class="font-mono text-accent">${row.percent}%</td>
                <td>${row.name}</td>
                <td>${row.year}</td>
                <td>${row.month}</td>
                <td>${row.day}</td>
            </tr>
        `).join('');
    }
};

window.SlaCalculator = SlaCalculator;
