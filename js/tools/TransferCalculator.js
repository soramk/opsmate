/**
 * OpsMate - Transfer Time Calculator
 */

const TransferCalculator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'transfer',
            title: '転送時間計算機の使い方',
            description: 'ファイルサイズと転送速度から、データ転送にかかる時間を計算します。バックアップ計画やデータ移行の見積もりに活用できます。',
            steps: [
                'ファイルサイズを入力し、単位（B/KB/MB/GB/TB）を選択します',
                '転送速度を入力し、単位（bps/Kbps/Mbps/Gbps）を選択します',
                '「計算実行」ボタンをクリックするか、Enterキーを押します',
                '推定転送時間が表示されます'
            ],
            tips: [
                '結果は理論値です。実際はプロトコルオーバーヘッドで10-20%長くなります',
                '100Mbps回線で1GBのファイルは約80秒（理論値）',
                '1Gbps回線で1TBのファイルは約2.2時間（理論値）',
                'ネットワーク速度はbps（ビット/秒）、ストレージはB（バイト）なので注意'
            ],
            example: {
                title: '計算例',
                code: '1GB @ 100Mbps → 約80秒 (1GB × 8 = 8Gb ÷ 100Mbps = 80秒)'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                            入力
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="transfer-size">ファイルサイズ</label>
                        <div class="input-group">
                            <input type="number" id="transfer-size" class="form-input" 
                                   placeholder="100" min="0" step="any">
                            <select id="transfer-size-unit" class="form-select">
                                <option value="B">B</option>
                                <option value="KB">KB</option>
                                <option value="MB" selected>MB</option>
                                <option value="GB">GB</option>
                                <option value="TB">TB</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="transfer-speed">転送速度</label>
                        <div class="input-group">
                            <input type="number" id="transfer-speed" class="form-input" 
                                   placeholder="100" min="0" step="any">
                            <select id="transfer-speed-unit" class="form-select">
                                <option value="bps">bps</option>
                                <option value="Kbps">Kbps</option>
                                <option value="Mbps" selected>Mbps</option>
                                <option value="Gbps">Gbps</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="transfer-calculate">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        計算実行
                    </button>
                    
                    <div id="transfer-error" class="error-message" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="transfer-error-text"></span>
                    </div>

                    ${helpSection}
                </div>
                
                <div class="panel-card" id="transfer-results" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="timer" class="w-5 h-5"></i>
                            転送時間の見積もり
                        </h2>
                    </div>
                    <div class="result-grid" id="transfer-result-grid"></div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem;">
                        * 理論値です。実際の転送時間はオーバーヘッドにより異なります。
                    </p>
                </div>
            </div>
        `;
    },

    init() {
        const btn = document.getElementById('transfer-calculate');
        const inputs = ['transfer-size', 'transfer-speed'];

        if (btn) btn.addEventListener('click', () => this.calculate());

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.calculate();
                });
                el.addEventListener('input', () => this.hideError());
            }
        });
    },

    calculate() {
        const size = parseFloat(document.getElementById('transfer-size').value);
        const sizeUnit = document.getElementById('transfer-size-unit').value;
        const speed = parseFloat(document.getElementById('transfer-speed').value);
        const speedUnit = document.getElementById('transfer-speed-unit').value;

        if (isNaN(size) || size <= 0) {
            this.showError('有効なファイルサイズを入力してください');
            return;
        }

        if (isNaN(speed) || speed <= 0) {
            this.showError('有効な転送速度を入力してください');
            return;
        }

        const bytes = OpsMateHelpers.toBytes(size, sizeUnit);
        const bits = bytes * 8;
        const bps = OpsMateHelpers.toBps(speed, speedUnit);
        const seconds = bits / bps;

        this.displayResults(seconds, bytes, bps);
    },

    displayResults(seconds, bytes, bps) {
        const grid = document.getElementById('transfer-result-grid');
        const container = document.getElementById('transfer-results');

        const items = [
            { label: '推定時間', value: OpsMateHelpers.formatDuration(seconds) },
            { label: '秒数換算', value: seconds.toFixed(2) + ' 秒' },
            { label: 'データ量 (ビット)', value: OpsMateHelpers.formatNumber(bytes * 8) + ' bits' },
            { label: '転送速度 (bps)', value: OpsMateHelpers.formatNumber(bps) + ' bps' }
        ];

        grid.innerHTML = items.map(item => `
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

        container.style.display = 'block';
        lucide.createIcons();
    },

    showError(msg) {
        const el = document.getElementById('transfer-error');
        const txt = document.getElementById('transfer-error-text');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
    },

    hideError() {
        const el = document.getElementById('transfer-error');
        if (el) el.style.display = 'none';
    }
};

window.TransferCalculator = TransferCalculator;
