/**
 * OpsMate - SNMP OID Reference & Finder
 */

const SnmpReference = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'snmp-reference',
            title: 'SNMP OID リファレンスの使い方',
            description: 'ネットワーク機器の監視設計で頻繁に使用される主要な OID を検索・確認できます。',
            steps: [
                '検索窓に「ベンダー名」や「CPU」「Traffic」などのキーワードを入力します',
                '該当する OID と説明がリストアップされます',
                'コピーボタンで OID をクリップボードにコピーして監視設定に使用します'
            ],
            tips: [
                'IF-MIB (1.3.6.1.2.1.2.2.1.10など) はベンダーを問わず共通で使えることが多いです',
                'Cisco や Juniper などの独自 MIB は、その機器特有の情報を取得する際に必要です',
                'バルクで取得する場合は、親パス（.1.3.6.1.2.1.x）を確認しておくと便利です'
            ],
            example: {
                title: '活用例',
                code: 'Cisco CPU負荷 (5分平均): .1.3.6.1.4.1.9.9.109.1.1.1.1.8'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="search" class="w-5 h-5"></i>
                            OID 検索
                        </h2>
                    </div>
                    <div class="form-group">
                        <input type="text" id="snmp-search" class="form-input" placeholder="例: Cisco, CPU, 1.3.6.1...">
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                             <i data-lucide="list" class="w-5 h-5"></i>
                            OID リスト
                        </h2>
                    </div>
                    <div id="snmp-list" class="space-y-2 max-h-[600px] overflow-auto pr-2">
                        <!-- 動的に生成されます -->
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    oidData: [
        { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr', vendor: 'RFC1213-MIB', desc: 'システムの説明' },
        { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime', vendor: 'RFC1213-MIB', desc: 'システムの稼働時間' },
        { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName', vendor: 'RFC1213-MIB', desc: 'ホスト名' },
        { oid: '.1.3.6.1.2.1.2.2.1.10.x', name: 'ifInOctets', vendor: 'IF-MIB', desc: 'インターフェース受信バイト数' },
        { oid: '.1.3.6.1.2.1.2.2.1.16.x', name: 'ifOutOctets', vendor: 'IF-MIB', desc: 'インターフェース送信バイト数' },
        { oid: '.1.3.6.1.2.1.31.1.1.1.6.x', name: 'ifHCInOctets', vendor: 'IF-MIB', desc: '受信トラフィック (64bit)' },
        { oid: '.1.3.6.1.2.1.31.1.1.1.10.x', name: 'ifHCOutOctets', vendor: 'IF-MIB', desc: '送信トラフィック (64bit)' },

        { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.7', name: 'cpmCPUTotal1minRev', vendor: 'Cisco', desc: 'CPU負荷 (1分平均)' },
        { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.8', name: 'cpmCPUTotal5minRev', vendor: 'Cisco', desc: 'CPU負荷 (5分平均)' },
        { oid: '.1.3.6.1.4.1.9.9.48.1.1.1.5', name: 'ciscoMemoryPoolUsed', vendor: 'Cisco', desc: '使用中メモリ' },
        { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.3', name: 'ciscoEnvMonTemperatureStatusValue', vendor: 'Cisco', desc: '温度' },

        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.8.x', name: 'jnxOperatingCPU', vendor: 'Juniper', desc: 'CPU使用率 (%)' },
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.11.x', name: 'jnxOperatingMemory', vendor: 'Juniper', desc: 'メモリ使用率 (%)' },

        { oid: '.1.3.6.1.4.1.12356.101.4.1.3.0', name: 'fgSysCpuUsage', vendor: 'Fortinet', desc: 'CPU使用率' },
        { oid: '.1.3.6.1.4.1.12356.101.4.1.4.0', name: 'fgSysMemUsage', vendor: 'Fortinet', desc: 'メモリ使用率' },
        { oid: '.1.3.6.1.4.1.12356.101.4.1.11.0', name: 'fgSysSesCount', vendor: 'Fortinet', desc: 'セッション数' }
    ],

    init() {
        const searchInput = document.getElementById('snmp-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterList());
        }
        this.filterList();
    },

    filterList() {
        const query = (document.getElementById('snmp-search')?.value || '').toLowerCase();
        const container = document.getElementById('snmp-list');
        if (!container) return;

        const filtered = this.oidData.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.oid.toLowerCase().includes(query) ||
            item.vendor.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-muted italic py-4 text-center">該当する OID が見つかりませんでした</p>';
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div class="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/50 transition-colors group">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${item.vendor}</span>
                    <button class="opacity-0 group-hover:opacity-100 btn btn-secondary btn-xs h-7 px-3" onclick="OpsMateHelpers.copyToClipboard('${item.oid}')">
                        <i data-lucide="copy" class="w-3.5 h-3.5 mr-1"></i> コピー
                    </button>
                </div>
                <div class="text-base font-bold text-slate-100 mb-1">${item.name}</div>
                <div class="text-sm font-mono text-emerald-400 bg-slate-950/50 p-2 rounded border border-slate-800 break-all mb-2 selection:bg-emerald-500/30">${item.oid}</div>
                <div class="text-xs text-slate-400 leading-relaxed">${item.desc}</div>
            </div>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

window.SnmpReference = SnmpReference;
