/**
 * OpsMate - Tcpdump & Wireshark Filter Wizard
 */

const FilterWizard = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'filter-wizard',
            title: 'フィルタウィザードの使い方',
            description: '複雑な tcpdump や Wireshark のフィルタ構文を、直感的な UI で生成します。',
            steps: [
                '共通設定（IP、ポート、プロトコル）を入力します',
                'オプションで詳細なフラグや論理演算（AND/OR）を選択します',
                'リアルタイムに生成されるコマンドをコピーして使用します'
            ],
            tips: [
                'tcpdump では -nn オプションを付けると名前解決を無効化し、動作が軽快になります',
                'Wireshark の Display Filter は、キャプチャ後の解析時に使用します',
                '特定の範囲（サブネット）を指定する場合は CIDR 形式（192.168.1.0/24）が使えます'
            ],
            example: {
                title: '活用例',
                code: '特定ホストへの HTTP 通信のみを表示:\nhost 192.168.1.10 and port 80'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="filter" class="w-5 h-5"></i>
                            フィルタ条件設定
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="form-label">ホスト (IP/Host)</label>
                            <input type="text" id="fw-host" class="form-input" placeholder="例: 192.168.1.1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">ポート</label>
                            <input type="text" id="fw-port" class="form-input" placeholder="例: 80, 443">
                        </div>
                        <div class="form-group">
                            <label class="form-label">プロトコル</label>
                            <select id="fw-proto" class="form-select">
                                <option value="">すべて</option>
                                <option value="tcp">TCP</option>
                                <option value="udp">UDP</option>
                                <option value="icmp">ICMP</option>
                                <option value="arp">ARP</option>
                                <option value="http">HTTP</option>
                                <option value="dns">DNS</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">方向</label>
                            <select id="fw-dir" class="form-select">
                                <option value="any">双方向 (src or dst)</option>
                                <option value="src">送信元のみ (src)</option>
                                <option value="dst">宛先のみ (dst)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">インターフェース (tcpdump用)</label>
                            <input type="text" id="fw-interface" class="form-input" placeholder="例: eth0, any">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div class="form-group">
                            <label class="form-label">開始時間 (Wireshark用)</label>
                            <input type="text" id="fw-start-time" class="form-input" placeholder="例: 2026-01-01 12:00:00">
                        </div>
                        <div class="form-group">
                            <label class="form-label">終了時間 (Wireshark用)</label>
                            <input type="text" id="fw-end-time" class="form-input" placeholder="例: 2026-01-01 13:00:00">
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title text-emerald-400">Tcpdump コマンド</h2>
                            <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('fw-output-tcpdump').innerText)">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="code-output p-4 rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center" id="fw-output-tcpdump">
                            tcpdump -ni any
                        </div>
                    </div>

                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title text-blue-400">Wireshark Filter</h2>
                            <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('fw-output-wireshark').innerText)">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="code-output p-4 rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center" id="fw-output-wireshark">
                            eth
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const inputs = ['fw-host', 'fw-port', 'fw-proto', 'fw-dir', 'fw-interface', 'fw-start-time', 'fw-end-time'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.generate());
            }
        });
        this.generate();
    },

    generate() {
        const host = document.getElementById('fw-host').value.trim();
        const port = document.getElementById('fw-port').value.trim();
        const proto = document.getElementById('fw-proto').value;
        const dir = document.getElementById('fw-dir').value;
        const intf = document.getElementById('fw-interface').value.trim() || 'any';
        const startTime = document.getElementById('fw-start-time').value.trim();
        const endTime = document.getElementById('fw-end-time').value.trim();

        // Tcpdump Logic
        let tcpdumpParts = [];
        if (host) {
            const hDir = dir === 'src' ? 'src host' : (dir === 'dst' ? 'dst host' : 'host');
            tcpdumpParts.push(`${hDir} ${host}`);
        }
        if (port) {
            const pDir = dir === 'src' ? 'src port' : (dir === 'dst' ? 'dst port' : 'port');
            tcpdumpParts.push(`${pDir} ${port}`);
        }
        if (proto && !['http', 'dns'].includes(proto)) {
            tcpdumpParts.push(proto);
        } else if (proto === 'http') {
            tcpdumpParts.push('tcp port 80');
        } else if (proto === 'dns') {
            tcpdumpParts.push('udp port 53');
        }

        const tcpdumpFilter = tcpdumpParts.length > 0 ? ` '${tcpdumpParts.join(' and ')}'` : '';
        document.getElementById('fw-output-tcpdump').innerText = `tcpdump -ni ${intf}${tcpdumpFilter}`;

        // Wireshark Logic
        let wsParts = [];
        if (host) {
            const hDir = dir === 'src' ? 'ip.src' : (dir === 'dst' ? 'ip.dst' : 'ip.addr');
            wsParts.push(`${hDir} == ${host}`);
        }
        if (port) {
            const pProto = proto === 'udp' ? 'udp' : 'tcp';
            const fDir = dir === 'src' ? `${pProto}.srcport` : (dir === 'dst' ? `${pProto}.dstport` : `${pProto}.port`);
            wsParts.push(`${fDir} == ${port}`);
        }
        if (proto) {
            if (proto === 'http') wsParts.push('http');
            else if (proto === 'dns') wsParts.push('dns');
            else if (proto === 'icmp') wsParts.push('icmp');
            else if (proto === 'arp') wsParts.push('arp');
            else if (proto === 'tcp' && !port) wsParts.push('tcp');
            else if (proto === 'udp' && !port) wsParts.push('udp');
        }

        // Time Filters for Wireshark
        if (startTime) {
            wsParts.push(`frame.time >= "${startTime}"`);
        }
        if (endTime) {
            wsParts.push(`frame.time <= "${endTime}"`);
        }

        document.getElementById('fw-output-wireshark').innerText = wsParts.length > 0 ? wsParts.join(' && ') : 'eth';
    }
};

window.FilterWizard = FilterWizard;
