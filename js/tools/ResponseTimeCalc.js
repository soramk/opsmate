/**
 * OpsMate - Response Time Percentile Calculator
 */

const ResponseTimeCalc = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'response-time-calc',
            title: 'レスポンスタイム分析の使い方',
            description: 'APIやWebページのレスポンスタイムからP50, P90, P95, P99などのパーセンタイルを計算します。',
            steps: [
                'レスポンスタイムのデータを1行1件で入力します（単位: ms）',
                'パーセンタイル値と統計情報が自動計算されます',
                'SLO（目標値）を設定すると達成率も確認できます'
            ],
            tips: [
                'P99は「99%のリクエストはこの時間以内に完了する」という指標です',
                '平均値（Mean）よりも中央値（P50）や高パーセンタイルが重要です',
                '外れ値（極端に遅いリクエスト）の影響を確認しましょう'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <i data-lucide="timer" class="w-5 h-5"></i>
                                レスポンスタイム入力
                            </h2>
                            <button class="btn btn-secondary btn-sm" id="rt-sample-btn">サンプルデータ</button>
                        </div>
                        <div class="form-group">
                            <label class="form-label">データ (1行1件, 単位: ms)</label>
                            <textarea id="rt-data" class="form-textarea font-mono" rows="12" placeholder="120&#10;85&#10;230&#10;95&#10;..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">SLO目標 (ms)</label>
                            <input type="number" id="rt-slo" class="form-input" value="200" placeholder="200">
                        </div>
                    </div>

                    <div>
                        <!-- Percentiles -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <h2 class="panel-title text-emerald-400">
                                    <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                                    パーセンタイル
                                </h2>
                            </div>
                            <div class="grid grid-cols-2 gap-3" id="rt-percentiles"></div>
                        </div>

                        <!-- Statistics -->
                        <div class="panel-card mt-6">
                            <div class="panel-header">
                                <h2 class="panel-title text-slate-300">
                                    <i data-lucide="sigma" class="w-5 h-5"></i>
                                    統計情報
                                </h2>
                            </div>
                            <div class="grid grid-cols-2 gap-3" id="rt-stats"></div>
                        </div>

                        <!-- SLO Achievement -->
                        <div class="panel-card mt-6">
                            <div class="panel-header">
                                <h2 class="panel-title text-slate-300">
                                    <i data-lucide="target" class="w-5 h-5"></i>
                                    SLO達成率
                                </h2>
                            </div>
                            <div id="rt-slo-result" class="text-center py-4"></div>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        document.getElementById('rt-data').addEventListener('input', () => this.calculate());
        document.getElementById('rt-slo').addEventListener('input', () => this.calculate());
        document.getElementById('rt-sample-btn').addEventListener('click', () => this.loadSample());
        this.calculate();
    },

    loadSample() {
        // Generate realistic sample data
        const samples = [];
        for (let i = 0; i < 100; i++) {
            // Most requests are fast (50-150ms)
            let val = 80 + Math.random() * 70;
            // Some are medium (150-300ms)
            if (Math.random() > 0.8) val = 150 + Math.random() * 150;
            // Few are slow (300-1000ms)
            if (Math.random() > 0.95) val = 300 + Math.random() * 700;
            samples.push(Math.round(val));
        }
        document.getElementById('rt-data').value = samples.join('\n');
        this.calculate();
    },

    calculate() {
        const dataStr = document.getElementById('rt-data').value;
        const slo = parseFloat(document.getElementById('rt-slo').value) || 200;
        const percentilesEl = document.getElementById('rt-percentiles');
        const statsEl = document.getElementById('rt-stats');
        const sloEl = document.getElementById('rt-slo-result');

        const values = dataStr.split('\n')
            .map(s => parseFloat(s.trim()))
            .filter(n => !isNaN(n) && n >= 0)
            .sort((a, b) => a - b);

        if (values.length === 0) {
            percentilesEl.innerHTML = '<p class="text-slate-500 col-span-2 text-center py-4">データを入力してください</p>';
            statsEl.innerHTML = '';
            sloEl.innerHTML = '';
            return;
        }

        // Calculate percentiles
        const percentiles = [50, 75, 90, 95, 99, 99.9];
        const pValues = percentiles.map(p => {
            const idx = Math.ceil((p / 100) * values.length) - 1;
            return { p, val: values[Math.max(0, idx)] };
        });

        percentilesEl.innerHTML = pValues.map(pv => `
            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                <div class="text-xs" style="color: var(--text-muted);">P${pv.p}</div>
                <div class="text-lg font-mono ${pv.val > slo ? 'text-amber-500' : 'text-emerald-500'}">${pv.val.toFixed(0)} ms</div>
            </div>
        `).join('');

        // Calculate statistics
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const min = values[0];
        const max = values[values.length - 1];
        const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        statsEl.innerHTML = `
            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                <div class="text-xs" style="color: var(--text-muted);">サンプル数</div>
                <div class="text-lg font-mono" style="color: var(--text-primary);">${values.length.toLocaleString()}</div>
            </div>
            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                <div class="text-xs" style="color: var(--text-muted);">平均値</div>
                <div class="text-lg font-mono" style="color: var(--text-primary);">${mean.toFixed(1)} ms</div>
            </div>
            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                <div class="text-xs" style="color: var(--text-muted);">最小値</div>
                <div class="text-lg font-mono text-emerald-500">${min.toFixed(0)} ms</div>
            </div>
            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                <div class="text-xs" style="color: var(--text-muted);">最大値</div>
                <div class="text-lg font-mono text-rose-500">${max.toFixed(0)} ms</div>
            </div>
            <div class="p-3 rounded-lg col-span-2" style="background: var(--bg-secondary);">
                <div class="text-xs" style="color: var(--text-muted);">標準偏差</div>
                <div class="text-lg font-mono" style="color: var(--text-primary);">${stdDev.toFixed(1)} ms</div>
            </div>
        `;

        // SLO achievement
        const withinSlo = values.filter(v => v <= slo).length;
        const sloRate = (withinSlo / values.length) * 100;

        sloEl.innerHTML = `
            <div class="text-4xl font-bold ${sloRate >= 99 ? 'text-emerald-500' : sloRate >= 95 ? 'text-amber-500' : 'text-rose-500'}">
                ${sloRate.toFixed(2)}%
            </div>
            <div class="text-sm mt-2" style="color: var(--text-muted);">
                ${withinSlo.toLocaleString()} / ${values.length.toLocaleString()} リクエストが ${slo}ms 以内
            </div>
            <div class="w-full h-3 rounded-full mt-4 overflow-hidden" style="background: var(--bg-tertiary);">
                <div class="h-full ${sloRate >= 99 ? 'bg-emerald-500' : sloRate >= 95 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${sloRate}%"></div>
            </div>
        `;
    }
};

window.ResponseTimeCalc = ResponseTimeCalc;
