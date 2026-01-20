/**
 * OpsMate - Linux Firewall Command Builder
 * Supports: Debian/Ubuntu (ufw), Red Hat/CentOS (firewalld), and iptables
 */

const FirewalldBuilder = {
    distros: {
        'rhel8': { name: 'RHEL 8+ / CentOS 8+ / Rocky / Alma', fw: 'firewalld', reload: 'firewall-cmd --reload', service: 'systemctl restart firewalld' },
        'rhel7': { name: 'RHEL 7 / CentOS 7', fw: 'firewalld', reload: 'firewall-cmd --reload', service: 'systemctl restart firewalld' },
        'rhel6': { name: 'RHEL 6 / CentOS 6 (iptables)', fw: 'iptables-service', reload: 'service iptables save', service: 'service iptables restart' },
        'fedora': { name: 'Fedora', fw: 'firewalld', reload: 'firewall-cmd --reload', service: 'systemctl restart firewalld' },
        'ubuntu': { name: 'Ubuntu / Debian (ufw)', fw: 'ufw', reload: '', service: 'systemctl restart ufw' },
        'debian-iptables': { name: 'Debian (iptables-persistent)', fw: 'iptables', reload: 'iptables-save > /etc/iptables/rules.v4', service: 'systemctl restart netfilter-persistent' },
        'slackware': { name: 'Slackware (iptables)', fw: 'iptables', reload: 'iptables-save > /etc/iptables.rules', service: '/etc/rc.d/rc.firewall restart' },
        'alpine': { name: 'Alpine Linux', fw: 'iptables', reload: '/etc/init.d/iptables save', service: 'rc-service iptables restart' }
    },

    zones: ['public', 'trusted', 'home', 'work', 'internal', 'external', 'dmz', 'block', 'drop'],

    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'firewall',
            title: 'ファイアウォール設定の使い方',
            description: 'Linux各ディストリビューション向けのファイアウォールコマンドを生成します。firewalld、ufw、iptablesに対応。',
            steps: [
                'ディストリビューションを選択（RHEL, Ubuntu等）',
                'アクション（ポート許可、サービス許可等）を選択',
                'ポート番号、サービス名、送信元IPを入力',
                '「コマンド生成」でコピー可能なコマンドを出力'
            ],
            tips: [
                'firewalld: --permanent オプションで永続化',
                'ufw: シンプルな構文でDebian/Ubuntu向け',
                'iptables: 汎用的だが永続化には別途保存が必要',
                'クイックリファレンスで各コマンドを確認'
            ],
            example: {
                title: 'コマンド例',
                code: 'firewalld: firewall-cmd --add-port=80/tcp --permanent'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="shield" class="w-5 h-5"></i>
                            Linuxファイアウォール構築
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ディストリビューション / ファイアウォール種別</label>
                        <select id="fw-distro" class="form-select">
                            ${Object.entries(this.distros).map(([key, val]) =>
            `<option value="${key}">${val.name}</option>`
        ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">アクション</label>
                        <select id="fw-action" class="form-select">
                            <option value="add-port">ポートの許可 (Allow)</option>
                            <option value="remove-port">ポートの拒否/削除 (Deny/Remove)</option>
                            <option value="add-service">サービスの許可 (Allow)</option>
                            <option value="remove-service">サービスの削除 (Remove)</option>
                            <option value="add-source">送信元IPの許可 (Allow Source)</option>
                            <option value="remove-source">送信元IPの拒否/削除 (Deny/Remove)</option>
                            <option value="list-all">ルール一覧を表示</option>
                            <option value="status">ステータスを表示</option>
                        </select>
                    </div>

                    <div id="fw-port-panel" class="fw-option-panel">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group mb-0">
                                <label class="form-label">ポート番号</label>
                                <input type="text" id="fw-port" class="form-input" placeholder="80 または 8080:8090">
                            </div>
                            <div class="form-group mb-0">
                                <label class="form-label">プロトコル</label>
                                <select id="fw-protocol" class="form-select">
                                    <option value="tcp">TCP</option>
                                    <option value="udp">UDP</option>
                                    <option value="both">TCP + UDPの両方</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div id="fw-service-panel" class="fw-option-panel" style="display: none;">
                        <div class="form-group">
                            <label class="form-label">サービス名</label>
                            <select id="fw-service" class="form-select">
                                <option value="http">HTTP (80)</option>
                                <option value="https">HTTPS (443)</option>
                                <option value="ssh">SSH (22)</option>
                                <option value="ftp">FTP (21)</option>
                                <option value="smtp">SMTP (25)</option>
                                <option value="dns">DNS (53)</option>
                                <option value="mysql">MySQL (3306)</option>
                                <option value="postgresql">PostgreSQL (5432)</option>
                                <option value="nfs">NFS</option>
                                <option value="samba">Samba</option>
                            </select>
                        </div>
                    </div>

                    <div id="fw-source-panel" class="fw-option-panel" style="display: none;">
                        <div class="form-group">
                            <label class="form-label">送信元 IP / CIDR</label>
                            <input type="text" id="fw-source" class="form-input" placeholder="192.168.1.0/24">
                        </div>
                    </div>

                    <!-- Zone (firewalld only) -->
                    <div id="fw-zone-panel">
                        <div class="form-group">
                            <label class="form-label">Zone (firewalld用)</label>
                            <select id="fw-zone" class="form-select">
                                ${this.zones.map(z => `<option value="${z}" ${z === 'public' ? 'selected' : ''}>${z}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="fw-permanent" checked>
                            永続設定にする (Permanent / Persistent)
                        </label>
                    </div>

                    <button class="btn btn-primary" id="fw-generate-btn">
                        <i data-lucide="terminal" class="w-4 h-4"></i> コマンド生成
                    </button>

                    ${helpSection}
                </div>

                <div class="panel-card" id="fw-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">生成されたコマンド</h2>
                        <button class="btn btn-secondary btn-sm" id="fw-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="fw-output" class="json-output" style="white-space: pre-wrap;"></pre>
                    <div id="fw-notes" class="header-description" style="margin-top: 0.75rem;"></div>
                </div>

                <!-- Quick Reference by Distro -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="info" class="w-5 h-5"></i>
                            クイックリファレンス
                        </h2>
                    </div>
                    <div id="fw-quick-ref" class="dc-reference-grid"></div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('fw-distro')?.addEventListener('change', () => this.updateUI());
        document.getElementById('fw-action')?.addEventListener('change', () => this.togglePanels());
        document.getElementById('fw-generate-btn')?.addEventListener('click', () => this.generate());
        document.getElementById('fw-copy-btn')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('fw-output').textContent);
        });
        this.updateUI();
        this.togglePanels();
    },

    updateUI() {
        const distro = document.getElementById('fw-distro').value;
        const info = this.distros[distro];

        // Zone is only for firewalld
        const zonePanel = document.getElementById('fw-zone-panel');
        zonePanel.style.display = (info.fw === 'firewalld') ? 'block' : 'none';

        // Update quick reference
        this.updateQuickRef(distro, info);
    },

    updateQuickRef(distro, info) {
        const container = document.getElementById('fw-quick-ref');
        let refs = [];

        if (info.fw === 'firewalld') {
            refs = [
                { label: 'Reload', value: info.reload },
                { label: 'Service Restart', value: info.service },
                { label: 'Status', value: 'firewall-cmd --state' },
                { label: 'List Zones', value: 'firewall-cmd --get-zones' },
                { label: 'Active Zones', value: 'firewall-cmd --get-active-zones' },
                { label: 'List All (Zone)', value: 'firewall-cmd --zone=public --list-all' }
            ];
        } else if (info.fw === 'ufw') {
            refs = [
                { label: 'Enable', value: 'ufw enable' },
                { label: 'Disable', value: 'ufw disable' },
                { label: 'Status', value: 'ufw status verbose' },
                { label: 'Reset', value: 'ufw reset' },
                { label: 'Reload', value: 'ufw reload' },
                { label: 'Delete Rule', value: 'ufw delete allow 80/tcp' }
            ];
        } else if (info.fw === 'iptables' || info.fw === 'iptables-service') {
            refs = [
                { label: 'List Rules', value: 'iptables -L -n -v' },
                { label: 'Save Rules', value: info.reload },
                { label: 'Restart', value: info.service },
                { label: 'Flush All', value: 'iptables -F' },
                { label: 'Delete Rule', value: 'iptables -D INPUT [line#]' },
                { label: 'Show Line #', value: 'iptables -L --line-numbers' }
            ];
        }

        container.innerHTML = refs.map(r => `
            <div class="dc-ref-item">
                <span class="dc-ref-label">${r.label}</span>
                <span class="dc-ref-value" style="font-size: 0.75rem;">${r.value}</span>
            </div>
        `).join('');
    },

    togglePanels() {
        const action = document.getElementById('fw-action').value;
        document.getElementById('fw-port-panel').style.display = action.includes('port') ? 'block' : 'none';
        document.getElementById('fw-service-panel').style.display = action.includes('service') ? 'block' : 'none';
        document.getElementById('fw-source-panel').style.display = action.includes('source') ? 'block' : 'none';
    },

    generate() {
        const distro = document.getElementById('fw-distro').value;
        const info = this.distros[distro];
        const action = document.getElementById('fw-action').value;
        const zone = document.getElementById('fw-zone').value;
        const permanent = document.getElementById('fw-permanent').checked;
        const port = document.getElementById('fw-port').value.trim();
        const protocol = document.getElementById('fw-protocol').value;
        const service = document.getElementById('fw-service').value;
        const source = document.getElementById('fw-source').value.trim();

        let commands = [];
        let notes = [];

        if (info.fw === 'firewalld') {
            commands = this.generateFirewalld(action, zone, permanent, port, protocol, service, source);
            if (permanent) {
                notes.push('変更を反映するには: ' + info.reload);
            }
        } else if (info.fw === 'ufw') {
            commands = this.generateUfw(action, port, protocol, service, source);
        } else {
            commands = this.generateIptables(action, port, protocol, service, source, info);
            notes.push('ルールを永続化するには: ' + info.reload);
        }

        document.getElementById('fw-output').textContent = commands.join('\n');
        document.getElementById('fw-notes').innerHTML = notes.map(n => `<p>💡 ${n}</p>`).join('');
        document.getElementById('fw-result-panel').style.display = 'block';
        lucide.createIcons();
    },

    generateFirewalld(action, zone, permanent, port, protocol, service, source) {
        let base = 'firewall-cmd';
        if (permanent) base += ' --permanent';
        base += ` --zone=${zone}`;

        const cmds = [];

        switch (action) {
            case 'add-port':
            case 'remove-port':
                if (!port) { OpsMateHelpers.showToast('Port is required', 'error'); return []; }
                if (protocol === 'both') {
                    cmds.push(`${base} --${action}=${port}/tcp`);
                    cmds.push(`${base} --${action}=${port}/udp`);
                } else {
                    cmds.push(`${base} --${action}=${port}/${protocol}`);
                }
                break;
            case 'add-service':
            case 'remove-service':
                cmds.push(`${base} --${action}=${service}`);
                break;
            case 'add-source':
            case 'remove-source':
                if (!source) { OpsMateHelpers.showToast('Source IP is required', 'error'); return []; }
                cmds.push(`${base} --${action}=${source}`);
                break;
            case 'list-all':
                cmds.push(`firewall-cmd --zone=${zone} --list-all`);
                break;
            case 'status':
                cmds.push('firewall-cmd --state');
                cmds.push('systemctl status firewalld');
                break;
        }
        return cmds;
    },

    generateUfw(action, port, protocol, service, source) {
        const cmds = [];
        const svcPorts = { http: '80', https: '443', ssh: '22', ftp: '21', smtp: '25', dns: '53', mysql: '3306', postgresql: '5432' };

        switch (action) {
            case 'add-port':
                if (!port) { OpsMateHelpers.showToast('Port is required', 'error'); return []; }
                if (protocol === 'both') {
                    cmds.push(`ufw allow ${port}/tcp`);
                    cmds.push(`ufw allow ${port}/udp`);
                } else {
                    cmds.push(`ufw allow ${port}/${protocol}`);
                }
                break;
            case 'remove-port':
                if (!port) { OpsMateHelpers.showToast('Port is required', 'error'); return []; }
                if (protocol === 'both') {
                    cmds.push(`ufw delete allow ${port}/tcp`);
                    cmds.push(`ufw delete allow ${port}/udp`);
                } else {
                    cmds.push(`ufw delete allow ${port}/${protocol}`);
                }
                break;
            case 'add-service':
                cmds.push(`ufw allow ${service}`);
                break;
            case 'remove-service':
                cmds.push(`ufw delete allow ${service}`);
                break;
            case 'add-source':
                if (!source) { OpsMateHelpers.showToast('Source IP is required', 'error'); return []; }
                cmds.push(`ufw allow from ${source}`);
                break;
            case 'remove-source':
                if (!source) { OpsMateHelpers.showToast('Source IP is required', 'error'); return []; }
                cmds.push(`ufw delete allow from ${source}`);
                break;
            case 'list-all':
                cmds.push('ufw status numbered');
                break;
            case 'status':
                cmds.push('ufw status verbose');
                break;
        }
        return cmds;
    },

    generateIptables(action, port, protocol, service, source, info) {
        const cmds = [];
        const svcPorts = { http: '80', https: '443', ssh: '22', ftp: '21', smtp: '25', dns: '53', mysql: '3306', postgresql: '5432' };

        const portNum = service ? svcPorts[service] : port;
        const proto = protocol === 'both' ? 'tcp' : protocol;

        switch (action) {
            case 'add-port':
            case 'add-service':
                if (!portNum) { OpsMateHelpers.showToast('Port is required', 'error'); return []; }
                cmds.push(`iptables -A INPUT -p ${proto} --dport ${portNum} -j ACCEPT`);
                if (protocol === 'both') {
                    cmds.push(`iptables -A INPUT -p udp --dport ${portNum} -j ACCEPT`);
                }
                break;
            case 'remove-port':
            case 'remove-service':
                if (!portNum) { OpsMateHelpers.showToast('Port is required', 'error'); return []; }
                cmds.push(`iptables -D INPUT -p ${proto} --dport ${portNum} -j ACCEPT`);
                if (protocol === 'both') {
                    cmds.push(`iptables -D INPUT -p udp --dport ${portNum} -j ACCEPT`);
                }
                break;
            case 'add-source':
                if (!source) { OpsMateHelpers.showToast('Source IP is required', 'error'); return []; }
                cmds.push(`iptables -A INPUT -s ${source} -j ACCEPT`);
                break;
            case 'remove-source':
                if (!source) { OpsMateHelpers.showToast('Source IP is required', 'error'); return []; }
                cmds.push(`iptables -D INPUT -s ${source} -j ACCEPT`);
                break;
            case 'list-all':
                cmds.push('iptables -L -n -v --line-numbers');
                break;
            case 'status':
                cmds.push('iptables -L -n');
                if (info.fw === 'iptables-service') {
                    cmds.push('service iptables status');
                }
                break;
        }
        return cmds;
    }
};

window.FirewalldBuilder = FirewalldBuilder;
