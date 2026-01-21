/**
 * OpsMate - BDP & TCP Throughput Calculator
 */

const BdpCalculator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'bdp-calculator',
            title: 'BDP & スループット計算機の使い方',
            description: '帯域幅と遅延（RTT）から帯域遅延積（BDP）を算出し、論理的な最大スループットや最適な TCP ウィンドウサイズを求めます。',
            steps: [
                'ネットワークの帯域幅（Bandwidth）を入力します',
                '往復遅延時間（RTT）をミリ秒単位で入力します',
                'リアルタイムに表示される各計算結果を確認します'
            ],
            tips: [
                'BDP（Bandwidth-Delay Product）は、ネットワークの「パイプの太さ」を表します',
                'TCP スループットが上がらない場合、TCP ウィンドウサイズが BDP より小さいことが原因の可能性があります',
                'スループット = Window Size / RTT の式で計算されます'
            ],
            example: {
                title: '計算例',
                code: '帯域: 1Gbps, RTT: 20ms\nBDP: 2,500,000 Bytes (約 2.5MB)\nウィンドウサイズが 64KB の場合、スループットは約 25.6 Mbps に制限されます'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="calculator" class="w-5 h-5"></i>
                            パラメータ入力
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label">帯域幅 (Bandwidth)</label>
                            <div class="input-group">
                                <input type="number" id="bdp-bw" class="form-input" value="1000" step="any">
                                <select id="bdp-bw-unit" class="form-select w-24">
                                    <option value="1">bps</option>
                                    <option value="1000">Kbps</option>
                                    <option value="1000000" selected>Mbps</option>
                                    <option value="1000000000">Gbps</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">往復遅延 (RTT)</label>
                            <div class="input-group">
                                <input type="number" id="bdp-rtt" class="form-input" value="20" step="any">
                                <span class="input-group-text">ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <!-- BDP Results -->
                    <div class="panel-card border-t-4 border-emerald-500">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <i data-lucide="box" class="w-5 h-5"></i>
                                BDP (帯域遅延積)
                            </h2>
                        </div>
                        <div class="space-y-4">
                            <div class="result-item">
                                <span class="result-label">BDP (Bytes)</span>
                                <span class="result-value text-emerald-400" id="bdp-bytes">0</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">BDP (MB)</span>
                                <span class="result-value" id="bdp-mb">0</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">最適な TCP Window Size</span>
                                <span class="result-value text-accent" id="bdp-window">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Throughput Estimation -->
                    <div class="panel-card border-t-4 border-blue-500">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <i data-lucide="zap" class="w-5 h-5"></i>
                                スループット推定
                            </h2>
                        </div>
                         <div class="form-group mb-4">
                            <label class="form-label text-xs">現在の TCP Window Size 指定 (KB)</label>
                            <input type="number" id="bdp-current-win" class="form-input py-1 text-sm text-center" value="64">
                        </div>
                        <div class="space-y-4">
                            <div class="result-item">
                                <span class="result-label">推定最大スループット</span>
                                <span class="result-value text-blue-400" id="bdp-throughput">0</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">帯域利用率</span>
                                <div class="w-full bg-slate-800 rounded-full h-2.5 mt-2">
                                    <div id="bdp-util-bar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                                </div>
                                <span class="text-xs text-muted block mt-1 text-right" id="bdp-util-text">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const ids = ['bdp-bw', 'bdp-bw-unit', 'bdp-rtt', 'bdp-current-win'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.calculate());
        });
        this.calculate();
    },

    calculate() {
        const bwValue = parseFloat(document.getElementById('bdp-bw').value) || 0;
        const bwUnit = parseFloat(document.getElementById('bdp-bw-unit').value);
        const rtt = parseFloat(document.getElementById('bdp-rtt').value) / 1000 || 0; // ms to s
        const currentWinKb = parseFloat(document.getElementById('bdp-current-win').value) || 0;

        const bwBps = bwValue * bwUnit;

        // BDP = Bandwidth (bps) * RTT (s) / 8 (bits to bytes)
        const bdpBytes = (bwBps * rtt) / 8;
        const bdpMb = bdpBytes / (1024 * 1024);

        // Max Throughput (bps) = Window Size (bits) / RTT (s)
        const currentWinBits = currentWinKb * 1024 * 8;
        let throughputBps = rtt > 0 ? currentWinBits / rtt : 0;

        // Cap throughput at physical bandwidth
        if (throughputBps > bwBps) throughputBps = bwBps;

        const utilPercent = bwBps > 0 ? (throughputBps / bwBps) * 100 : 0;

        // Display results
        document.getElementById('bdp-bytes').innerText = Math.round(bdpBytes).toLocaleString() + ' Bytes';
        document.getElementById('bdp-mb').innerText = bdpMb.toFixed(2) + ' MB';
        document.getElementById('bdp-window').innerText = (bdpBytes > 1024 * 1024)
            ? Math.ceil(bdpMb * 1024) + ' KB'
            : Math.ceil(bdpBytes / 1024) + ' KB';

        document.getElementById('bdp-throughput').innerText = OpsMateHelpers.formatBandwidth(throughputBps);
        document.getElementById('bdp-util-bar').style.width = utilPercent + '%';
        document.getElementById('bdp-util-text').innerText = utilPercent.toFixed(1) + '%';
    }
};

window.BdpCalculator = BdpCalculator;
