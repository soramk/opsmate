/**
 * OpsMate - RAID & Storage Capacity Calculator
 */

const RaidCalculator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'raid-calc',
            title: 'RAID計算機の使い方',
            description: 'ディスク容量、本数、RAIDレベルから、システムで利用可能な実効容量と冗長性を算出します。',
            steps: [
                'ディスク1本の容量（GB/TB）を入力します',
                'ディスクの合計本数を選択します（RAIDレベルにより最小本数が異なります）',
                'RAIDレベル（0, 1, 5, 6, 10）を選択します',
                '実効容量、ホットスペアを考慮した結果を確認します'
            ],
            tips: [
                'RAID 5 は最低3本、RAID 6 は最低4本必要です',
                'RAID 10 は偶数本（最低4本）必要です',
                'ホットスペアを設定すると、その分さらに実効容量が減少しますが、耐障害性が向上します',
                '1000MB=1GB計算か、1024MiB=1GiB計算かによってOS上の表示容量は変わります'
            ],
            example: {
                title: 'RAID 10構成の例',
                code: 'Disk: 8TB x 4本\nRAID 10\nResult: 16TB (50% Efficiency)'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="database" class="w-5 h-5"></i>
                            RAID & Storage Calculator
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        <div class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label class="form-label">ディスク容量</label>
                                    <input type="number" id="raid-size" class="form-input" value="1000">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">単位</label>
                                    <select id="raid-unit" class="form-select">
                                        <option value="GB">GB</option>
                                        <option value="TB">TB</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">ディスク本数 (<span id="raid-count-val">4</span> 本)</label>
                                <input type="range" id="raid-count" class="form-range" min="1" max="64" value="4">
                                <div class="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>2</span>
                                    <span>64</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">RAID レベル</label>
                                <select id="raid-level" class="form-select">
                                    <option value="0">RAID 0 (Striping)</option>
                                    <option value="1">RAID 1 (Mirroring)</option>
                                    <option value="5">RAID 5 (Parity)</option>
                                    <option value="6">RAID 6 (Double Parity)</option>
                                    <option value="10">RAID 10 (1+0)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">ホットスペア数</label>
                                <input type="number" id="raid-spare" class="form-input" value="0" min="0">
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex-grow">
                                <div class="text-center mb-8">
                                    <h3 class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Usable Capacity</h3>
                                    <div class="text-6xl font-mono font-bold text-emerald-400" id="raid-res-usable">2000</div>
                                    <div class="text-slate-500 font-mono mt-1" id="raid-res-unit">GB</div>
                                </div>

                                <div class="space-y-4">
                                    <div class="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                                        <span class="text-slate-400">Total Raw Capacity</span>
                                        <span class="font-mono text-slate-200" id="raid-res-raw">4000 GB</span>
                                    </div>
                                    <div class="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                                        <span class="text-slate-400">Fault Tolerance</span>
                                        <span class="font-mono text-slate-200" id="raid-res-fault">0 Disks</span>
                                    </div>
                                    <div class="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                                        <span class="text-slate-400">Space Efficiency</span>
                                        <span class="font-mono text-slate-200" id="raid-res-eff">50%</span>
                                    </div>
                                    <div id="raid-error" class="text-red-400 text-sm hidden">
                                        <i data-lucide="alert-circle" class="w-4 h-4 inline mr-1"></i>
                                        <span id="raid-error-msg"></span>
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
        const ids = ['raid-size', 'raid-unit', 'raid-count', 'raid-level', 'raid-spare'];
        ids.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.calculate());
            document.getElementById(id).addEventListener('change', () => this.calculate());
        });

        this.calculate();
    },

    calculate() {
        const size = parseFloat(document.getElementById('raid-size').value) || 0;
        const unit = document.getElementById('raid-unit').value;
        const count = parseInt(document.getElementById('raid-count').value);
        const level = document.getElementById('raid-level').value;
        const spare = parseInt(document.getElementById('raid-spare').value) || 0;

        document.getElementById('raid-count-val').textContent = count;
        const totalDisks = count - spare;

        let usableCount = 0;
        let faultTolerance = 0;
        let error = "";

        if (totalDisks <= 0) {
            error = "ディスク本数が不足しています（ホットスペア除外後）";
        } else {
            switch (level) {
                case "0":
                    if (totalDisks < 2) error = "RAID 0 は最低2本のディスクが必要です";
                    usableCount = totalDisks;
                    faultTolerance = 0;
                    break;
                case "1":
                    if (totalDisks < 2) error = "RAID 1 は2本のディスクが必要です";
                    usableCount = 1;
                    faultTolerance = 1;
                    break;
                case "5":
                    if (totalDisks < 3) error = "RAID 5 は最低3本のディスクが必要です";
                    usableCount = totalDisks - 1;
                    faultTolerance = 1;
                    break;
                case "6":
                    if (totalDisks < 4) error = "RAID 6 は最低4本のディスクが必要です";
                    usableCount = totalDisks - 2;
                    faultTolerance = 2;
                    break;
                case "10":
                    if (totalDisks < 4 || totalDisks % 2 !== 0) error = "RAID 10 は最低4本かつ偶数本のディスクが必要です";
                    usableCount = totalDisks / 2;
                    faultTolerance = 1; // 1 per mirror set
                    break;
            }
        }

        const errorEl = document.getElementById('raid-error');
        const msgEl = document.getElementById('raid-error-msg');

        if (error) {
            errorEl.classList.remove('hidden');
            msgEl.textContent = error;
            document.getElementById('raid-res-usable').textContent = "---";
        } else {
            errorEl.classList.add('hidden');
            const usableCapacity = usableCount * size;
            const rawCapacity = count * size;
            const efficiency = rawCapacity > 0 ? (usableCapacity / rawCapacity * 100).toFixed(1) : 0;

            document.getElementById('raid-res-usable').textContent = usableCapacity.toLocaleString();
            document.getElementById('raid-res-unit').textContent = unit;
            document.getElementById('raid-res-raw').textContent = `${rawCapacity.toLocaleString()} ${unit}`;
            document.getElementById('raid-res-fault').textContent = `${faultTolerance + spare} Disks (incl. Spares)`;
            document.getElementById('raid-res-eff').textContent = `${efficiency}%`;
        }
    }
};

window.RaidCalculator = RaidCalculator;
