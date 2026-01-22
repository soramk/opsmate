/**
 * OpsMate - Network Troubleshooting One-liners
 */

const NetTroubleshoot = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'net-trouble',
            title: 'ネットワークトラブルシューティング定型文の使い方',
            description: '現場でよく使われる導通確認、ポートスキャン、ルーティング確認のコマンドを OS 別に生成します。',
            steps: [
                '目的（ポート確認、経路確認等）を選択します',
                'ホスト名やポート番号を入力します',
                '環境に合わせて OS (Linux/Windows) やツール (nc, telnet, powershell) を切り替えます'
            ],
            tips: [
                'Linuxの nc (netcat) はポート開放確認のデファクトスタンダードです',
                'Windowsでは Test-NetConnection (TNC) が非常に強力で、トレースルートも同時に行えます',
                'サーバーに telnet がない環境でも、Powershell や Bash の特殊なリダイレクトを使ってポート確認が可能です'
            ],
            example: {
                title: '活用例',
                code: 'Test-NetConnection -ComputerName google.com -Port 443'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="activity" class="w-5 h-5"></i>
                            Net Troubleshooting One-liners
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div class="form-group">
                            <label class="form-label">目的 / ツール</label>
                            <select id="nt-type" class="form-select">
                                <optgroup label="ポート疎通確認">
                                    <option value="ps-tnc">PowerShell (Test-NetConnection)</option>
                                    <option value="linux-nc">Linux (nc / netcat)</option>
                                    <option value="linux-bash">Linux (Bash sockets - non-root)</option>
                                    <option value="common-telnet">Common (telnet)</option>
                                </optgroup>
                                <optgroup label="経路・DNS確認">
                                    <option value="win-tracert">Windows (tracert / pathping)</option>
                                    <option value="linux-mtr">Linux (mtr / traceroute)</option>
                                    <option value="common-nslookup">Common (nslookup / dig)</option>
                                </optgroup>
                                <optgroup label="近隣・インターフェース">
                                    <option value="linux-ip">Linux (ip addr / ip route / ip neigh)</option>
                                    <option value="win-netstat">Windows (netstat / Get-NetTCPConnection)</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ホスト / IP / ポート</label>
                            <div class="flex space-x-2">
                                <input type="text" id="nt-host" class="form-input" value="192.168.1.1" placeholder="example.com">
                                <input type="number" id="nt-port" class="form-input w-24" value="80" placeholder="80">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-[var(--accent-primary)]">
                             <i data-lucide="terminal" class="w-5 h-5"></i>
                            Command One-liner
                        </h2>
                        <button class="btn btn-secondary btn-sm" id="nt-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div id="nt-output" class="code-output p-4 rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center">
                        Test-NetConnection -ComputerName 192.168.1.1 -Port 80
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const ids = ['nt-type', 'nt-host', 'nt-port'];
        ids.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.generate());
            document.getElementById(id).addEventListener('change', () => this.generate());
        });

        document.getElementById('nt-copy-btn').addEventListener('click', () => {
            const out = document.getElementById('nt-output').innerText;
            OpsMateHelpers.copyToClipboard(out, document.getElementById('nt-copy-btn'));
        });

        this.generate();
    },

    generate() {
        const type = document.getElementById('nt-type').value;
        const host = document.getElementById('nt-host').value || '127.0.0.1';
        const port = document.getElementById('nt-port').value || '80';
        const output = document.getElementById('nt-output');
        let cmd = '';

        switch (type) {
            case 'ps-tnc':
                cmd = `Test-NetConnection -ComputerName ${host} -Port ${port}`;
                break;
            case 'linux-nc':
                cmd = `nc -zv ${host} ${port}`;
                break;
            case 'linux-bash':
                cmd = `timeout 2 bash -c "</dev/tcp/${host}/${port}" && echo "Port is open" || echo "Port is closed"`;
                break;
            case 'common-telnet':
                cmd = `telnet ${host} ${port}`;
                break;
            case 'win-tracert':
                cmd = `tracert -d ${host}`;
                break;
            case 'linux-mtr':
                cmd = `mtr -rw ${host}`;
                break;
            case 'common-nslookup':
                cmd = `nslookup ${host}`;
                break;
            case 'linux-ip':
                cmd = `ip addr show; ip route show; ip neigh show`;
                break;
            case 'win-netstat':
                cmd = `netstat -ano | findstr :${port}`;
                break;
        }

        output.innerText = cmd;
    }
};

window.NetTroubleshoot = NetTroubleshoot;
