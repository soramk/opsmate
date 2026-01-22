/**
 * OpsMate - Overhead & MSS Calculator
 */

const OverheadCalculator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'mtu-calc',
            title: 'MTU / MSS 計算機の使い方',
            description: '各種カプセル化（VLAN, GRE, IPsec, VXLAN等）によるオーバーヘッドを考慮した、最適な MSS (Maximum Segment Size) を算出します。',
            steps: [
                'ベースとなる物理 MTU を入力します（通常は1500）',
                '通信に使用する IP バージョンとトランスポートプロトコルを選択します',
                '経路上で発生するカプセル化方式にチェックを入れます',
                '「推奨 MSS 設定」に表示された値を、ルーターやサーバーの MSS クランプ設定に使用します'
            ],
            tips: [
                'MSS = MTU - (IP Header) - (TCP Header) - (Encapsulation Headers)',
                'フレッツ光などの PPPoE 環境では MTU 1454 / MSS 1414 が一般的です',
                'VPN (IPsec/GRE) や VXLAN を使用する場合、フラグメンテーションを防ぐために MSS を小さく設定する必要があります',
                'Efficiency は、パケット全体に対するデータ部（ペイロード）の割合を示します'
            ],
            example: {
                title: 'VXLAN 構成の例',
                code: 'Base MTU: 1500\nIPv4 + TCP + VXLAN\nOverhead: 20 + 20 + 50 = 90 bytes\nResult MSS: 1410'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="calculator" class="w-5 h-5"></i>
                            Overhead & MSS Calculator
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        <div class="space-y-6">
                            <div class="form-group">
                                <label class="form-label">物理 MTU (L3 MTU)</label>
                                <div class="flex space-x-2">
                                    <input type="number" id="oc-mtu" class="form-input" value="1500">
                                    <select id="oc-mtu-preset" class="form-select w-40">
                                        <option value="1500">Standard (1500)</option>
                                        <option value="1492">PPPoE (1492)</option>
                                        <option value="1454">PPPoE JP (1454)</option>
                                        <option value="9000">Jumbo (9000)</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label class="form-label">L3 Protocol</label>
                                    <select id="oc-ip-ver" class="form-select">
                                        <option value="20">IPv4 (20B)</option>
                                        <option value="40">IPv6 (40B)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">L4 Protocol</label>
                                    <select id="oc-transport" class="form-select">
                                        <option value="20">TCP (20B)</option>
                                        <option value="8">UDP (8B)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label mb-3">Encapsulation / Options</label>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="VLAN (802.1Q)" data-bytes="4">
                                        <div class="text-sm">
                                            <div class="font-medium">VLAN (4B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="QinQ (Double Tag)" data-bytes="4">
                                        <div class="text-sm">
                                            <div class="font-medium">QinQ (+4B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="PPPoE" data-bytes="8">
                                        <div class="text-sm">
                                            <div class="font-medium">PPPoE (8B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="MPLS (Single Label)" data-bytes="4">
                                        <div class="text-sm">
                                            <div class="font-medium">MPLS (4B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="GRE (over IPv4)" data-bytes="24">
                                        <div class="text-sm">
                                            <div class="font-medium">GRE (24B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="VXLAN" data-bytes="50">
                                        <div class="text-sm">
                                            <div class="font-medium">VXLAN (50B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="IPsec ESP (Est.)" data-bytes="56">
                                        <div class="text-sm">
                                            <div class="font-medium">IPsec ESP (~56B)</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="oc-opt mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700" data-label="WireGuard" data-bytes="60">
                                        <div class="text-sm">
                                            <div class="font-medium">WireGuard (60B)</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex-grow">
                                <div class="text-center mb-8">
                                    <h3 class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Recommended MSS</h3>
                                    <div class="text-6xl font-mono font-bold text-emerald-400" id="oc-res-mss">1460</div>
                                </div>

                                <div class="grid grid-cols-2 gap-4 mb-8">
                                    <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                                        <div class="text-xs text-slate-500 uppercase mb-1">Total Overhead</div>
                                        <div class="text-2xl font-mono text-slate-200" id="oc-res-overhead">40 B</div>
                                    </div>
                                    <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                                        <div class="text-xs text-slate-500 uppercase mb-1">Efficiency</div>
                                        <div class="text-2xl font-mono text-slate-200" id="oc-res-eff">97.3%</div>
                                    </div>
                                </div>

                                <div class="space-y-3">
                                    <div class="text-xs text-slate-500 uppercase font-semibold">Header Breakdown</div>
                                    <div id="oc-breakdown" class="space-y-2">
                                        <!-- Breakdown dynamic -->
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
        const inputs = ['oc-mtu', 'oc-ip-ver', 'oc-transport'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.calculate());
            document.getElementById(id).addEventListener('input', () => this.calculate());
        });

        document.getElementById('oc-mtu-preset').addEventListener('change', (e) => {
            if (e.target.value !== 'custom') {
                document.getElementById('oc-mtu').value = e.target.value;
                this.calculate();
            }
        });

        document.querySelectorAll('.oc-opt').forEach(opt => {
            opt.addEventListener('change', () => this.calculate());
        });

        this.calculate();
    },

    calculate() {
        const mtu = parseInt(document.getElementById('oc-mtu').value) || 0;
        const l3 = parseInt(document.getElementById('oc-ip-ver').value);
        const l4 = parseInt(document.getElementById('oc-transport').value);

        let totalOverhead = l3 + l4;
        const breakdown = [
            { label: 'Layer 3 (IP)', bytes: l3 },
            { label: 'Layer 4 (Transport)', bytes: l4 }
        ];

        document.querySelectorAll('.oc-opt:checked').forEach(opt => {
            const bytes = parseInt(opt.dataset.bytes);
            const label = opt.dataset.label;
            totalOverhead += bytes;
            breakdown.push({ label, bytes });
        });

        const mss = Math.max(0, mtu - totalOverhead);
        const efficiency = mtu > 0 ? ((mss / mtu) * 100).toFixed(1) : 0;

        // Update UI
        document.getElementById('oc-res-mss').textContent = mss;
        document.getElementById('oc-res-overhead').textContent = totalOverhead + ' B';
        document.getElementById('oc-res-eff').textContent = efficiency + '%';

        const breakdownContainer = document.getElementById('oc-breakdown');
        breakdownContainer.innerHTML = breakdown.map(item => `
            <div class="flex justify-between items-center text-sm p-2 rounded bg-slate-800/30">
                <span class="text-slate-400">${item.label}</span>
                <span class="font-mono text-slate-200">${item.bytes} B</span>
            </div>
        `).join('');
    }
};

window.OverheadCalculator = OverheadCalculator;
