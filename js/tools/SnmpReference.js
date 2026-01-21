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
                'ベンダーボタンでフィルタするか、検索窓にキーワードを入力します',
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
                    <div class="form-group mb-4">
                        <input type="text" id="snmp-search" class="form-input" placeholder="例: CPU, Memory, Traffic, Interface...">
                    </div>
                    <div class="flex flex-wrap gap-2" id="vendor-filters">
                        <button class="vendor-btn active" data-vendor="all">すべて</button>
                        <button class="vendor-btn" data-vendor="RFC">RFC (共通)</button>
                        <button class="vendor-btn" data-vendor="Cisco">Cisco</button>
                        <button class="vendor-btn" data-vendor="Juniper">Juniper</button>
                        <button class="vendor-btn" data-vendor="Fortinet">Fortinet</button>
                        <button class="vendor-btn" data-vendor="PaloAlto">Palo Alto</button>
                        <button class="vendor-btn" data-vendor="Arista">Arista</button>
                        <button class="vendor-btn" data-vendor="HP">HP/Aruba</button>
                        <button class="vendor-btn" data-vendor="Linux">Linux</button>
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                             <i data-lucide="list" class="w-5 h-5"></i>
                            OID リスト <span id="oid-count" class="text-xs text-slate-500 ml-2"></span>
                        </h2>
                    </div>
                    <div id="snmp-list" class="space-y-3 max-h-[600px] overflow-auto pr-2">
                        <!-- 動的に生成されます -->
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    currentVendor: 'all',

    oidData: [
        // RFC / Common MIBs
        { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr', vendor: 'RFC', desc: 'システムの説明' },
        { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime', vendor: 'RFC', desc: 'システム稼働時間 (1/100秒)' },
        { oid: '.1.3.6.1.2.1.1.4.0', name: 'sysContact', vendor: 'RFC', desc: '管理者連絡先' },
        { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName', vendor: 'RFC', desc: 'ホスト名' },
        { oid: '.1.3.6.1.2.1.1.6.0', name: 'sysLocation', vendor: 'RFC', desc: '設置場所' },
        { oid: '.1.3.6.1.2.1.2.1.0', name: 'ifNumber', vendor: 'RFC', desc: 'インターフェース総数' },
        { oid: '.1.3.6.1.2.1.2.2.1.2.x', name: 'ifDescr', vendor: 'RFC', desc: 'インターフェース名' },
        { oid: '.1.3.6.1.2.1.2.2.1.5.x', name: 'ifSpeed', vendor: 'RFC', desc: 'インターフェース速度 (bps)' },
        { oid: '.1.3.6.1.2.1.2.2.1.7.x', name: 'ifAdminStatus', vendor: 'RFC', desc: '管理ステータス (1=up, 2=down)' },
        { oid: '.1.3.6.1.2.1.2.2.1.8.x', name: 'ifOperStatus', vendor: 'RFC', desc: '操作ステータス (1=up, 2=down)' },
        { oid: '.1.3.6.1.2.1.2.2.1.10.x', name: 'ifInOctets', vendor: 'RFC', desc: '受信バイト数 (32bit)' },
        { oid: '.1.3.6.1.2.1.2.2.1.14.x', name: 'ifInErrors', vendor: 'RFC', desc: '受信エラー数' },
        { oid: '.1.3.6.1.2.1.2.2.1.16.x', name: 'ifOutOctets', vendor: 'RFC', desc: '送信バイト数 (32bit)' },
        { oid: '.1.3.6.1.2.1.2.2.1.20.x', name: 'ifOutErrors', vendor: 'RFC', desc: '送信エラー数' },
        { oid: '.1.3.6.1.2.1.31.1.1.1.1.x', name: 'ifName', vendor: 'RFC', desc: 'インターフェース名 (短縮形)' },
        { oid: '.1.3.6.1.2.1.31.1.1.1.6.x', name: 'ifHCInOctets', vendor: 'RFC', desc: '受信トラフィック (64bit)' },
        { oid: '.1.3.6.1.2.1.31.1.1.1.10.x', name: 'ifHCOutOctets', vendor: 'RFC', desc: '送信トラフィック (64bit)' },
        { oid: '.1.3.6.1.2.1.31.1.1.1.15.x', name: 'ifHighSpeed', vendor: 'RFC', desc: 'インターフェース速度 (Mbps)' },

        // Cisco
        { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.3.x', name: 'cpmCPUTotalPhysicalIndex', vendor: 'Cisco', desc: 'CPU 物理インデックス' },
        { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.6.x', name: 'cpmCPUTotal5sec', vendor: 'Cisco', desc: 'CPU負荷 (5秒平均) %' },
        { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.7.x', name: 'cpmCPUTotal1min', vendor: 'Cisco', desc: 'CPU負荷 (1分平均) %' },
        { oid: '.1.3.6.1.4.1.9.9.109.1.1.1.1.8.x', name: 'cpmCPUTotal5minRev', vendor: 'Cisco', desc: 'CPU負荷 (5分平均) %' },
        { oid: '.1.3.6.1.4.1.9.9.48.1.1.1.5.x', name: 'ciscoMemoryPoolUsed', vendor: 'Cisco', desc: '使用中メモリ (Bytes)' },
        { oid: '.1.3.6.1.4.1.9.9.48.1.1.1.6.x', name: 'ciscoMemoryPoolFree', vendor: 'Cisco', desc: '空きメモリ (Bytes)' },
        { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.3.x', name: 'ciscoEnvMonTemperatureStatusValue', vendor: 'Cisco', desc: '温度センサー値' },
        { oid: '.1.3.6.1.4.1.9.9.13.1.5.1.3.x', name: 'ciscoEnvMonSupplyState', vendor: 'Cisco', desc: '電源ステータス' },
        { oid: '.1.3.6.1.4.1.9.9.13.1.4.1.3.x', name: 'ciscoEnvMonFanState', vendor: 'Cisco', desc: 'ファンステータス' },
        { oid: '.1.3.6.1.4.1.9.9.46.1.3.1.1.4.x', name: 'vtpVlanState', vendor: 'Cisco', desc: 'VLANステート' },
        { oid: '.1.3.6.1.4.1.9.2.1.56.0', name: 'avgBusy1', vendor: 'Cisco', desc: 'CPU (1分平均) - 旧MIB' },
        { oid: '.1.3.6.1.4.1.9.2.1.57.0', name: 'avgBusy5', vendor: 'Cisco', desc: 'CPU (5分平均) - 旧MIB' },

        // Juniper
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.5.x', name: 'jnxOperatingDescr', vendor: 'Juniper', desc: 'コンポーネント説明' },
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.6.x', name: 'jnxOperatingState', vendor: 'Juniper', desc: '動作状態 (1=unknown, 2=running...)' },
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.7.x', name: 'jnxOperatingTemp', vendor: 'Juniper', desc: '温度 (℃)' },
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.8.x', name: 'jnxOperatingCPU', vendor: 'Juniper', desc: 'CPU使用率 (%)' },
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.11.x', name: 'jnxOperatingBuffer', vendor: 'Juniper', desc: 'バッファ使用率 (%)' },
        { oid: '.1.3.6.1.4.1.2636.3.1.13.1.15.x', name: 'jnxOperatingMemory', vendor: 'Juniper', desc: 'メモリ使用率 (%)' },
        { oid: '.1.3.6.1.4.1.2636.3.4.1.3.1.1.x', name: 'jnxFruState', vendor: 'Juniper', desc: 'FRU状態 (電源/ファン等)' },
        { oid: '.1.3.6.1.4.1.2636.3.40.1.4.1.1.1.5', name: 'jnxJsSessionsCount', vendor: 'Juniper', desc: 'SRX同時セッション数' },

        // Fortinet
        { oid: '.1.3.6.1.4.1.12356.101.4.1.3.0', name: 'fgSysCpuUsage', vendor: 'Fortinet', desc: 'CPU使用率 (%)' },
        { oid: '.1.3.6.1.4.1.12356.101.4.1.4.0', name: 'fgSysMemUsage', vendor: 'Fortinet', desc: 'メモリ使用率 (%)' },
        { oid: '.1.3.6.1.4.1.12356.101.4.1.5.0', name: 'fgSysMemCapacity', vendor: 'Fortinet', desc: '総メモリ容量 (KB)' },
        { oid: '.1.3.6.1.4.1.12356.101.4.1.8.0', name: 'fgSysSesCount', vendor: 'Fortinet', desc: '現在のセッション数' },
        { oid: '.1.3.6.1.4.1.12356.101.4.1.11.0', name: 'fgSysSesRate1', vendor: 'Fortinet', desc: 'セッション/秒 (1分平均)' },
        { oid: '.1.3.6.1.4.1.12356.101.4.4.2.1.2.x', name: 'fgHwSensorEntValue', vendor: 'Fortinet', desc: 'ハードウェアセンサー値 (温度等)' },
        { oid: '.1.3.6.1.4.1.12356.101.13.2.1.1.5.x', name: 'fgVdEntCpuUsage', vendor: 'Fortinet', desc: 'VDOM別CPU使用率' },
        { oid: '.1.3.6.1.4.1.12356.101.13.2.1.1.6.x', name: 'fgVdEntMemUsage', vendor: 'Fortinet', desc: 'VDOM別メモリ使用率' },

        // Palo Alto
        { oid: '.1.3.6.1.4.1.25461.2.1.2.3.1.0', name: 'panSessionUtilization', vendor: 'PaloAlto', desc: 'セッション使用率 (%)' },
        { oid: '.1.3.6.1.4.1.25461.2.1.2.3.3.0', name: 'panSessionMax', vendor: 'PaloAlto', desc: '最大セッション数' },
        { oid: '.1.3.6.1.4.1.25461.2.1.2.1.1.0', name: 'panSysSwVersion', vendor: 'PaloAlto', desc: 'PAN-OS バージョン' },
        { oid: '.1.3.6.1.4.1.25461.2.1.2.1.4.0', name: 'panSysCpuMgmt', vendor: 'PaloAlto', desc: '管理プレーンCPU (%)' },
        { oid: '.1.3.6.1.4.1.25461.2.1.2.1.5.0', name: 'panSysCpuData', vendor: 'PaloAlto', desc: 'データプレーンCPU (%)' },

        // Arista
        { oid: '.1.3.6.1.4.1.30065.3.12.1.1.x', name: 'aristaSwFwdIpv4NumRoutes', vendor: 'Arista', desc: 'IPv4 ルート数' },
        { oid: '.1.3.6.1.4.1.30065.3.9.1.1.0', name: 'aristaHardwareUtilizationCpu', vendor: 'Arista', desc: 'CPU使用率' },

        // HP / Aruba
        { oid: '.1.3.6.1.4.1.11.2.14.11.5.1.9.6.1.0', name: 'hpicfSensorStatus', vendor: 'HP', desc: 'センサーステータス' },
        { oid: '.1.3.6.1.4.1.11.2.14.11.5.1.9.6.2.0', name: 'hpicfSensorDescr', vendor: 'HP', desc: 'センサー説明' },
        { oid: '.1.3.6.1.4.1.14823.2.2.1.1.1.9.0', name: 'wlsxSysCpuUsage', vendor: 'HP', desc: 'Aruba CPU使用率 (%)' },
        { oid: '.1.3.6.1.4.1.14823.2.2.1.1.1.10.0', name: 'wlsxSysMemoryUsed', vendor: 'HP', desc: 'Aruba メモリ使用量' },

        // Linux (Net-SNMP / HOST-RESOURCES)
        { oid: '.1.3.6.1.4.1.2021.11.9.0', name: 'ssCpuUser', vendor: 'Linux', desc: 'User CPU (%)' },
        { oid: '.1.3.6.1.4.1.2021.11.10.0', name: 'ssCpuSystem', vendor: 'Linux', desc: 'System CPU (%)' },
        { oid: '.1.3.6.1.4.1.2021.11.11.0', name: 'ssCpuIdle', vendor: 'Linux', desc: 'Idle CPU (%)' },
        { oid: '.1.3.6.1.4.1.2021.4.5.0', name: 'memTotalReal', vendor: 'Linux', desc: '総物理メモリ (KB)' },
        { oid: '.1.3.6.1.4.1.2021.4.6.0', name: 'memAvailReal', vendor: 'Linux', desc: '利用可能メモリ (KB)' },
        { oid: '.1.3.6.1.4.1.2021.4.11.0', name: 'memTotalFree', vendor: 'Linux', desc: '空きメモリ (KB)' },
        { oid: '.1.3.6.1.4.1.2021.4.14.0', name: 'memBuffer', vendor: 'Linux', desc: 'バッファメモリ (KB)' },
        { oid: '.1.3.6.1.4.1.2021.4.15.0', name: 'memCached', vendor: 'Linux', desc: 'キャッシュメモリ (KB)' },
        { oid: '.1.3.6.1.4.1.2021.9.1.6.x', name: 'dskTotal', vendor: 'Linux', desc: 'ディスク総容量 (KB)' },
        { oid: '.1.3.6.1.4.1.2021.9.1.7.x', name: 'dskAvail', vendor: 'Linux', desc: 'ディスク空き容量 (KB)' },
        { oid: '.1.3.6.1.4.1.2021.9.1.9.x', name: 'dskPercent', vendor: 'Linux', desc: 'ディスク使用率 (%)' },
        { oid: '.1.3.6.1.2.1.25.2.3.1.5.x', name: 'hrStorageSize', vendor: 'Linux', desc: 'ストレージサイズ (HOST-RESOURCES)' },
        { oid: '.1.3.6.1.2.1.25.2.3.1.6.x', name: 'hrStorageUsed', vendor: 'Linux', desc: 'ストレージ使用量 (HOST-RESOURCES)' },
        { oid: '.1.3.6.1.2.1.25.3.3.1.2.x', name: 'hrProcessorLoad', vendor: 'Linux', desc: 'プロセッサ負荷 (HOST-RESOURCES)' }
    ],

    init() {
        const searchInput = document.getElementById('snmp-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterList());
        }

        // Vendor filter buttons
        document.querySelectorAll('.vendor-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.vendor-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentVendor = btn.dataset.vendor;
                this.filterList();
            });
        });

        this.filterList();
    },

    filterList() {
        const query = (document.getElementById('snmp-search')?.value || '').toLowerCase();
        const container = document.getElementById('snmp-list');
        const countEl = document.getElementById('oid-count');
        if (!container) return;

        let filtered = this.oidData;

        // Vendor filter
        if (this.currentVendor !== 'all') {
            filtered = filtered.filter(item => item.vendor === this.currentVendor);
        }

        // Keyword filter
        if (query) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.oid.toLowerCase().includes(query) ||
                item.vendor.toLowerCase().includes(query) ||
                item.desc.toLowerCase().includes(query)
            );
        }

        if (countEl) {
            countEl.textContent = `(${filtered.length} 件)`;
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-slate-500 italic py-4 text-center">該当する OID が見つかりませんでした</p>';
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
