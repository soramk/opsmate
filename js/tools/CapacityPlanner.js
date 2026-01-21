/**
 * OpsMate - Capacity Planning Calculator
 */

const CapacityPlanner = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'capacity-planner',
            title: 'キャパシティプランニングの使い方',
            description: 'ストレージやリソースの使用量増加を予測し、いつ増設が必要になるかを計算します。',
            steps: [
                '現在の使用量と総容量を入力します',
                '過去のデータから日次/月次の増加量を入力します',
                '閾値（例: 80%到達時）までの残り日数が計算されます'
            ],
            tips: [
                '監視システムから過去30日間の増加量を抽出すると精度が上がります',
                '閾値は余裕を持って70-80%を設定することを推奨します',
                'バーストトラフィックを考慮した計画を立てましょう'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="trending-up" class="w-5 h-5"></i>
                            キャパシティプランニング
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="form-group">
                            <label class="form-label">総容量</label>
                            <div class="flex gap-2">
                                <input type="number" id="cap-total" class="form-input" value="1000">
                                <select id="cap-unit" class="form-select w-24">
                                    <option value="GB">GB</option>
                                    <option value="TB">TB</option>
                                    <option value="件">件</option>
                                    <option value="ユーザー">ユーザー</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">現在の使用量</label>
                            <input type="number" id="cap-used" class="form-input" value="650">
                        </div>
                        <div class="form-group">
                            <label class="form-label">日次増加量</label>
                            <input type="number" id="cap-daily" class="form-input" value="2" step="0.1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">警告閾値 (%)</label>
                            <input type="number" id="cap-threshold" class="form-input" value="80" min="1" max="100">
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div class="panel-card">
                        <div class="result-card h-full">
                            <div class="result-label">現在の使用率</div>
                            <div class="result-value text-3xl" id="cap-current-pct"></div>
                            <div class="mt-3">
                                <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div id="cap-bar" class="h-full bg-emerald-500 transition-all"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-card">
                        <div class="result-card h-full">
                            <div class="result-label">閾値到達まで</div>
                            <div class="result-value text-3xl" id="cap-days-to-threshold"></div>
                            <div class="text-xs text-slate-500 mt-2" id="cap-threshold-date"></div>
                        </div>
                    </div>
                    <div class="panel-card">
                        <div class="result-card h-full">
                            <div class="result-label">100%到達まで</div>
                            <div class="result-value text-3xl" id="cap-days-to-full"></div>
                            <div class="text-xs text-slate-500 mt-2" id="cap-full-date"></div>
                        </div>
                    </div>
                </div>

                <!-- Forecast Table -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                            月次予測
                        </h2>
                    </div>
                    <div id="cap-forecast" class="overflow-x-auto"></div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        ['cap-total', 'cap-used', 'cap-daily', 'cap-threshold', 'cap-unit'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.calculate());
        });
        this.calculate();
    },

    calculate() {
        const total = parseFloat(document.getElementById('cap-total').value) || 1000;
        const used = parseFloat(document.getElementById('cap-used').value) || 0;
        const daily = parseFloat(document.getElementById('cap-daily').value) || 1;
        const threshold = parseFloat(document.getElementById('cap-threshold').value) || 80;
        const unit = document.getElementById('cap-unit').value;

        const currentPct = (used / total) * 100;
        const thresholdValue = total * (threshold / 100);
        const remaining = total - used;

        let daysToThreshold = daily > 0 ? Math.max(0, Math.floor((thresholdValue - used) / daily)) : '∞';
        let daysToFull = daily > 0 ? Math.max(0, Math.floor(remaining / daily)) : '∞';

        // Update current percentage
        document.getElementById('cap-current-pct').textContent = currentPct.toFixed(1) + '%';
        document.getElementById('cap-bar').style.width = Math.min(100, currentPct) + '%';

        const bar = document.getElementById('cap-bar');
        bar.classList.remove('bg-emerald-500', 'bg-amber-500', 'bg-rose-500');
        if (currentPct >= 90) bar.classList.add('bg-rose-500');
        else if (currentPct >= threshold) bar.classList.add('bg-amber-500');
        else bar.classList.add('bg-emerald-500');

        // Days to threshold
        document.getElementById('cap-days-to-threshold').textContent = daysToThreshold === '∞' ? '∞' : daysToThreshold + '日';
        if (typeof daysToThreshold === 'number') {
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() + daysToThreshold);
            document.getElementById('cap-threshold-date').textContent = thresholdDate.toLocaleDateString('ja-JP');
        } else {
            document.getElementById('cap-threshold-date').textContent = '';
        }

        // Days to full
        document.getElementById('cap-days-to-full').textContent = daysToFull === '∞' ? '∞' : daysToFull + '日';
        if (typeof daysToFull === 'number') {
            const fullDate = new Date();
            fullDate.setDate(fullDate.getDate() + daysToFull);
            document.getElementById('cap-full-date').textContent = fullDate.toLocaleDateString('ja-JP');
        } else {
            document.getElementById('cap-full-date').textContent = '';
        }

        // Monthly forecast
        this.renderForecast(used, daily, total, threshold, unit);
    },

    renderForecast(used, daily, total, threshold, unit) {
        const forecast = document.getElementById('cap-forecast');
        const months = [];
        let current = used;
        const monthlyGrowth = daily * 30;
        const thresholdValue = total * (threshold / 100);

        for (let i = 0; i <= 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            const monthName = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
            const pct = (current / total) * 100;
            const status = current >= total ? 'full' : current >= thresholdValue ? 'warning' : 'ok';
            months.push({ month: monthName, value: Math.min(current, total), pct: Math.min(pct, 100), status });
            current += monthlyGrowth;
        }

        forecast.innerHTML = `
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-700 text-left">
                        <th class="py-2 px-3 text-slate-400">月</th>
                        <th class="py-2 px-3 text-slate-400">予測使用量</th>
                        <th class="py-2 px-3 text-slate-400">使用率</th>
                        <th class="py-2 px-3 text-slate-400">状態</th>
                    </tr>
                </thead>
                <tbody>
                    ${months.map(m => `
                        <tr class="border-b border-slate-800">
                            <td class="py-2 px-3 text-slate-300">${m.month}</td>
                            <td class="py-2 px-3 font-mono text-slate-200">${m.value.toFixed(1)} ${unit}</td>
                            <td class="py-2 px-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div class="h-full ${m.status === 'full' ? 'bg-rose-500' : m.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${m.pct}%"></div>
                                    </div>
                                    <span class="text-xs text-slate-400">${m.pct.toFixed(1)}%</span>
                                </div>
                            </td>
                            <td class="py-2 px-3">
                                ${m.status === 'full' ? '<span class="text-rose-400 text-xs font-bold">容量超過</span>' :
                m.status === 'warning' ? '<span class="text-amber-400 text-xs">閾値超過</span>' :
                    '<span class="text-emerald-400 text-xs">正常</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

window.CapacityPlanner = CapacityPlanner;
