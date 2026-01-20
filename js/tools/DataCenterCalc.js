/**
 * OpsMate - Data Center Calculator (電力・熱量計算)
 */

const DataCenterCalc = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'datacenter',
            title: 'データセンター計算の使い方',
            description: '電力（W/VA）、発熱量（BTU/h）、ラック電力の計算ができます。データセンターの設計やキャパシティプランニングに便利です。',
            steps: [
                '【電力変換】WattsまたはBTU/hを入力すると自動変換',
                '【電力計算】電圧、電流、力率、相を入力して計算',
                '【ラック電力】デバイスの電力を1行ずつ入力して合計を計算',
                '各結果はコピー可能'
            ],
            tips: [
                '1W = 3.41214 BTU/h',
                '三相電力: √3 × V × A',
                'PUE 1.4 = IT機器電力の1.4倍が設備全体の電力',
                '42Uラックは通常5〜20kWの電力容量'
            ],
            example: {
                title: '電力計算例',
                code: '100V × 10A × PF0.9 = 900W = 3,071 BTU/h'
            }
        });

        return `
            <div class="tool-panel">
                <!-- Watts ⇔ BTU/h 変換 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="thermometer" class="w-5 h-5"></i>
                            Watts ⇔ BTU/h 相互変換
                        </h2>
                    </div>
                    
                    <div class="dc-converter-row">
                        <div class="form-group">
                            <label class="form-label">電力 (Watts)</label>
                            <input type="number" id="dc-watts" class="form-input" placeholder="1000" step="any">
                        </div>
                        <div class="dc-arrow">
                            <i data-lucide="arrow-left-right" class="w-6 h-6"></i>
                        </div>
                        <div class="form-group">
                            <label class="form-label">BTU/h</label>
                            <input type="number" id="dc-btu" class="form-input" placeholder="3412" step="any">
                        </div>
                    </div>
                    <p class="dc-formula">1 W = 3.41214 BTU/h</p>

                    ${helpSection}
                </div>
                
                <!-- 電力計算 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="zap" class="w-5 h-5"></i>
                            電力計算 (VA / Watts)
                        </h2>
                    </div>
                    
                    <div class="calc-grid">
                        <div class="form-group">
                            <label class="form-label">電圧 (V)</label>
                            <input type="number" id="dc-voltage" class="form-input" placeholder="100" value="100" step="any">
                        </div>
                        <div class="form-group">
                            <label class="form-label">電流 (A)</label>
                            <input type="number" id="dc-amps" class="form-input" placeholder="10" step="any">
                        </div>
                        <div class="form-group">
                            <label class="form-label">力率 (Power Factor)</label>
                            <input type="number" id="dc-pf" class="form-input" placeholder="0.9" value="0.9" min="0" max="1" step="0.01">
                        </div>
                        <div class="form-group">
                            <label class="form-label">相 (Phase)</label>
                            <select id="dc-phase" class="form-select">
                                <option value="1">単相 (Single Phase)</option>
                                <option value="3">三相 (Three Phase)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="dc-calc-power">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        計算実行
                    </button>
                    
                    <div class="result-grid" id="dc-power-results" style="margin-top: 1.5rem; display: none;"></div>
                </div>
                
                <!-- ラック電力計算 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="server" class="w-5 h-5"></i>
                            ラック電力サマリー
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">デバイス電力リスト (1行に1台分、Watts単位)</label>
                        <textarea id="dc-devices" class="form-textarea" rows="5" 
                                  placeholder="500&#10;750&#10;300&#10;1200"></textarea>
                    </div>
                    
                    <button class="btn btn-primary" id="dc-calc-rack">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        合計計算
                    </button>
                    
                    <div class="result-grid" id="dc-rack-results" style="margin-top: 1.5rem; display: none;"></div>
                </div>
                
                <!-- クイックリファレンス -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="info" class="w-5 h-5"></i>
                            クイックリファレンス
                        </h2>
                    </div>
                    <div class="dc-reference-grid">
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">一般的なサーバー</span>
                            <span class="dc-ref-value">300-500W</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">ハイエンドサーバー</span>
                            <span class="dc-ref-value">500-1500W</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">L2/L3スイッチ (48p)</span>
                            <span class="dc-ref-value">150-400W</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">ストレージ配列 (SAN/NAS)</span>
                            <span class="dc-ref-value">500-2000W</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">42U ラック電力上限</span>
                            <span class="dc-ref-value">5-20kW</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">PUE (Efficient DC)</span>
                            <span class="dc-ref-value">1.2-1.4</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Watts ⇔ BTU bidirectional conversion
        const watts = document.getElementById('dc-watts');
        const btu = document.getElementById('dc-btu');

        watts?.addEventListener('input', () => {
            const w = parseFloat(watts.value);
            if (!isNaN(w)) {
                btu.value = (w * 3.41214).toFixed(2);
            }
        });

        btu?.addEventListener('input', () => {
            const b = parseFloat(btu.value);
            if (!isNaN(b)) {
                watts.value = (b / 3.41214).toFixed(2);
            }
        });

        document.getElementById('dc-calc-power')?.addEventListener('click', () => this.calcPower());
        document.getElementById('dc-calc-rack')?.addEventListener('click', () => this.calcRack());
    },

    calcPower() {
        const voltage = parseFloat(document.getElementById('dc-voltage').value) || 0;
        const amps = parseFloat(document.getElementById('dc-amps').value) || 0;
        const pf = parseFloat(document.getElementById('dc-pf').value) || 1;
        const phase = parseInt(document.getElementById('dc-phase').value);

        let va, watts;

        if (phase === 3) {
            va = Math.sqrt(3) * voltage * amps;
        } else {
            va = voltage * amps;
        }

        watts = va * pf;
        const btu = watts * 3.41214;

        const results = [
            { label: '皮相電力 (VA)', value: va.toFixed(2) + ' VA' },
            { label: '有効電力 (W)', value: watts.toFixed(2) + ' W' },
            { label: '発熱量', value: btu.toFixed(2) + ' BTU/h' }
        ];

        this.displayResults('dc-power-results', results);
    },

    calcRack() {
        const input = document.getElementById('dc-devices').value;
        const lines = input.split('\n').filter(l => l.trim());

        let total = 0;
        let count = 0;

        lines.forEach(line => {
            const watts = parseFloat(line.trim());
            if (!isNaN(watts)) {
                total += watts;
                count++;
            }
        });

        const btu = total * 3.41214;
        const kw = total / 1000;

        const results = [
            { label: 'デバイス数', value: count.toString() + ' 台' },
            { label: '消費電力合計', value: total.toFixed(0) + ' W (' + kw.toFixed(2) + ' kW)' },
            { label: '発熱量合計', value: btu.toFixed(0) + ' BTU/h' },
            { label: 'PUE 1.4換算 (設備合計)', value: (total * 1.4).toFixed(0) + ' W' }
        ];

        this.displayResults('dc-rack-results', results);
    },

    displayResults(containerId, results) {
        const grid = document.getElementById(containerId);
        grid.innerHTML = results.map(item => `
            <div class="result-item">
                <div class="result-label">${item.label}</div>
                <div class="result-value">
                    <span>${item.value}</span>
                    <button class="copy-btn" onclick="OpsMateHelpers.copyToClipboard('${item.value}', this)">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        grid.style.display = 'grid';
        lucide.createIcons();
    }
};

window.DataCenterCalc = DataCenterCalc;
