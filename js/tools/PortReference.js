/**
 * OpsMate - Port Reference (ポート番号リファレンス)
 * ネットワークエンジニア向けのよく使うポート番号クイックリファレンス
 */

const PortReference = {
    ports: [
        // Well-known ports
        { port: 20, protocol: 'TCP', service: 'FTP (Data)', category: 'ファイル転送', description: 'FTPデータ転送' },
        { port: 21, protocol: 'TCP', service: 'FTP (Control)', category: 'ファイル転送', description: 'FTP制御' },
        { port: 22, protocol: 'TCP', service: 'SSH', category: 'リモートアクセス', description: 'セキュアシェル' },
        { port: 23, protocol: 'TCP', service: 'Telnet', category: 'リモートアクセス', description: 'リモートアクセス（非暗号化）' },
        { port: 25, protocol: 'TCP', service: 'SMTP', category: 'メール', description: 'メール送信' },
        { port: 53, protocol: 'TCP/UDP', service: 'DNS', category: 'ネットワーク', description: '名前解決' },
        { port: 67, protocol: 'UDP', service: 'DHCP (Server)', category: 'ネットワーク', description: 'DHCP サーバー' },
        { port: 68, protocol: 'UDP', service: 'DHCP (Client)', category: 'ネットワーク', description: 'DHCP クライアント' },
        { port: 69, protocol: 'UDP', service: 'TFTP', category: 'ファイル転送', description: '簡易ファイル転送' },
        { port: 80, protocol: 'TCP', service: 'HTTP', category: 'Web', description: 'Webサーバー' },
        { port: 110, protocol: 'TCP', service: 'POP3', category: 'メール', description: 'メール受信' },
        { port: 123, protocol: 'UDP', service: 'NTP', category: 'ネットワーク', description: '時刻同期' },
        { port: 143, protocol: 'TCP', service: 'IMAP', category: 'メール', description: 'メール受信' },
        { port: 161, protocol: 'UDP', service: 'SNMP', category: '管理', description: 'ネットワーク監視' },
        { port: 162, protocol: 'UDP', service: 'SNMP Trap', category: '管理', description: 'SNMP通知' },
        { port: 179, protocol: 'TCP', service: 'BGP', category: 'ルーティング', description: 'ルーティングプロトコル' },
        { port: 389, protocol: 'TCP/UDP', service: 'LDAP', category: 'ディレクトリ', description: 'ディレクトリサービス' },
        { port: 443, protocol: 'TCP', service: 'HTTPS', category: 'Web', description: 'セキュアWebサーバー' },
        { port: 445, protocol: 'TCP', service: 'SMB', category: 'ファイル転送', description: 'Windows ファイル共有' },
        { port: 465, protocol: 'TCP', service: 'SMTPS', category: 'メール', description: 'セキュアメール送信' },
        { port: 500, protocol: 'UDP', service: 'IKE', category: 'VPN', description: 'IPsec鍵交換' },
        { port: 514, protocol: 'UDP', service: 'Syslog', category: '管理', description: 'ログ収集' },
        { port: 587, protocol: 'TCP', service: 'SMTP (Submission)', category: 'メール', description: 'メール投稿' },
        { port: 636, protocol: 'TCP', service: 'LDAPS', category: 'ディレクトリ', description: 'セキュアLDAP' },
        { port: 993, protocol: 'TCP', service: 'IMAPS', category: 'メール', description: 'セキュアIMAP' },
        { port: 995, protocol: 'TCP', service: 'POP3S', category: 'メール', description: 'セキュアPOP3' },
        { port: 1194, protocol: 'UDP', service: 'OpenVPN', category: 'VPN', description: 'OpenVPN' },
        { port: 1433, protocol: 'TCP', service: 'MSSQL', category: 'データベース', description: 'SQL Server' },
        { port: 1521, protocol: 'TCP', service: 'Oracle', category: 'データベース', description: 'Oracle DB' },
        { port: 1723, protocol: 'TCP', service: 'PPTP', category: 'VPN', description: 'PPTP VPN' },
        { port: 3306, protocol: 'TCP', service: 'MySQL', category: 'データベース', description: 'MySQL/MariaDB' },
        { port: 3389, protocol: 'TCP', service: 'RDP', category: 'リモートアクセス', description: 'リモートデスクトップ' },
        { port: 4500, protocol: 'UDP', service: 'NAT-T', category: 'VPN', description: 'IPsec NAT Traversal' },
        { port: 5432, protocol: 'TCP', service: 'PostgreSQL', category: 'データベース', description: 'PostgreSQL' },
        { port: 5900, protocol: 'TCP', service: 'VNC', category: 'リモートアクセス', description: 'VNCリモート' },
        { port: 6379, protocol: 'TCP', service: 'Redis', category: 'データベース', description: 'Redis' },
        { port: 8080, protocol: 'TCP', service: 'HTTP Proxy', category: 'Web', description: 'プロキシ/代替HTTP' },
        { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', category: 'Web', description: '代替HTTPS' },
        { port: 27017, protocol: 'TCP', service: 'MongoDB', category: 'データベース', description: 'MongoDB' }
    ],

    render() {
        const categories = [...new Set(this.ports.map(p => p.category))];

        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'port',
            title: 'ポートリファレンスの使い方',
            description: 'ネットワークでよく使われるポート番号とサービスの一覧です。ファイアウォール設定やトラブルシューティングに便利です。',
            steps: [
                '検索欄でポート番号、サービス名、キーワードを検索',
                'カテゴリ（Web、メール、VPN等）でフィルタリング',
                '個別ポート照会で特定のポート情報を確認',
                'ウェルノウン、登録済、動的ポートの範囲も表示'
            ],
            tips: [
                'ウェルノウンポート: 0-1023（管理者権限が必要）',
                '登録済ポート: 1024-49151',
                '動的/プライベートポート: 49152-65535',
                'TCP/UDPの両方で使用されるポートもあり'
            ],
            example: {
                title: 'よく使うポート',
                code: '22=SSH, 80=HTTP, 443=HTTPS, 3306=MySQL'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="list" class="w-5 h-5"></i>
                            ポート番号リファレンス
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="text" id="port-search" class="form-input" 
                                   placeholder="ポート、サービス、またはキーワードで検索..." autocomplete="off">
                            <select id="port-category" class="form-select">
                                <option value="">全てのカテゴリ</option>
                                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="port-table-container">
                        <table class="port-table" id="port-table">
                            <thead>
                                <tr>
                                    <th>ポート</th>
                                    <th>プロトコル</th>
                                    <th>サービス</th>
                                    <th>カテゴリ</th>
                                    <th>説明</th>
                                </tr>
                            </thead>
                            <tbody id="port-table-body"></tbody>
                        </table>
                    </div>

                    ${helpSection}
                </div>
                
                <!-- ポート検索 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="search" class="w-5 h-5"></i>
                            個別ポート照会
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">指定ポートの情報を確認</label>
                        <div class="input-group">
                            <input type="number" id="port-lookup" class="form-input" 
                                   placeholder="ポート番号 (1-65535)" min="1" max="65535">
                            <button class="btn btn-primary" id="port-lookup-btn">
                                <i data-lucide="search" class="w-4 h-4"></i>
                                照会
                            </button>
                        </div>
                    </div>
                    
                    <div id="port-lookup-result" style="display: none;"></div>
                </div>
            </div>
        `;
    },

    init() {
        this.renderTable(this.ports);

        const search = document.getElementById('port-search');
        const category = document.getElementById('port-category');
        const lookup = document.getElementById('port-lookup-btn');

        const filter = () => {
            const query = search.value.toLowerCase();
            const cat = category.value;

            const filtered = this.ports.filter(p => {
                const matchQuery = !query ||
                    p.port.toString().includes(query) ||
                    p.service.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query);
                const matchCat = !cat || p.category === cat;
                return matchQuery && matchCat;
            });

            this.renderTable(filtered);
        };

        search?.addEventListener('input', filter);
        category?.addEventListener('change', filter);
        lookup?.addEventListener('click', () => this.lookupPort());
        document.getElementById('port-lookup')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.lookupPort();
        });
    },

    renderTable(ports) {
        const tbody = document.getElementById('port-table-body');
        if (!tbody) return;

        tbody.innerHTML = ports.map(p => `
            <tr>
                <td class="port-number">${p.port}</td>
                <td><span class="protocol-badge">${p.protocol}</span></td>
                <td class="service-name">${p.service}</td>
                <td><span class="category-badge">${p.category}</span></td>
                <td class="port-desc">${p.description}</td>
            </tr>
        `).join('');
    },

    lookupPort() {
        const input = document.getElementById('port-lookup').value;
        const result = document.getElementById('port-lookup-result');

        if (!input) return;

        const port = parseInt(input);
        if (port < 1 || port > 65535) {
            result.innerHTML = '<div class="error-message"><i data-lucide="alert-circle" class="w-4 h-4"></i> ポート番号は1から65535の間で入力してください</div>';
            result.style.display = 'block';
            lucide.createIcons();
            return;
        }

        const found = this.ports.find(p => p.port === port);

        if (found) {
            result.innerHTML = `
                <div class="result-item" style="margin-top: 1rem;">
                    <div class="result-label">${found.service} (${found.protocol})</div>
                    <div class="result-value"><span>Port ${found.port} - ${found.description}</span></div>
                </div>
            `;
        } else {
            const rangeInfo = this.getPortRange(port);
            result.innerHTML = `
                <div class="result-item" style="margin-top: 1rem;">
                    <div class="result-label">Port ${port}</div>
                    <div class="result-value"><span>データベース未登録です。 ${rangeInfo}</span></div>
                </div>
            `;
        }

        result.style.display = 'block';
    },

    getPortRange(port) {
        if (port <= 1023) return 'ウェルノウンポート (0-1023)';
        if (port <= 49151) return 'エフェメラル/登録済ポート (1024-49151)';
        return '動的/プライベートポート (49152-65535)';
    }
};

window.PortReference = PortReference;
