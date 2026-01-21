/**
 * OpsMate - Port Reference (ポート番号リファレンス)
 * ネットワークエンジニア向けのよく使うポート番号クイックリファレンス
 */

const PortReference = {
    ports: [
        // Well-known ports (0-1023)
        { port: 20, protocol: 'TCP', service: 'FTP (Data)', category: 'ファイル転送', description: 'FTPデータ転送' },
        { port: 21, protocol: 'TCP', service: 'FTP (Control)', category: 'ファイル転送', description: 'FTP制御' },
        { port: 22, protocol: 'TCP', service: 'SSH', category: 'リモートアクセス', description: 'セキュアシェル' },
        { port: 23, protocol: 'TCP', service: 'Telnet', category: 'リモートアクセス', description: 'リモートアクセス（非暗号化）' },
        { port: 25, protocol: 'TCP', service: 'SMTP', category: 'メール', description: 'メール送信' },
        { port: 49, protocol: 'TCP/UDP', service: 'TACACS+', category: '認証', description: 'Cisco認証サーバー' },
        { port: 53, protocol: 'TCP/UDP', service: 'DNS', category: 'ネットワーク', description: '名前解決' },
        { port: 67, protocol: 'UDP', service: 'DHCP (Server)', category: 'ネットワーク', description: 'DHCP サーバー' },
        { port: 68, protocol: 'UDP', service: 'DHCP (Client)', category: 'ネットワーク', description: 'DHCP クライアント' },
        { port: 69, protocol: 'UDP', service: 'TFTP', category: 'ファイル転送', description: '簡易ファイル転送' },
        { port: 80, protocol: 'TCP', service: 'HTTP', category: 'Web', description: 'Webサーバー' },
        { port: 88, protocol: 'TCP/UDP', service: 'Kerberos', category: '認証', description: 'Kerberos認証' },
        { port: 110, protocol: 'TCP', service: 'POP3', category: 'メール', description: 'メール受信' },
        { port: 111, protocol: 'TCP/UDP', service: 'RPC', category: 'ネットワーク', description: 'リモートプロシージャコール' },
        { port: 119, protocol: 'TCP', service: 'NNTP', category: 'メール', description: 'ニュース配信' },
        { port: 123, protocol: 'UDP', service: 'NTP', category: 'ネットワーク', description: '時刻同期' },
        { port: 135, protocol: 'TCP', service: 'MS-RPC', category: 'Windows', description: 'Microsoft RPC' },
        { port: 137, protocol: 'UDP', service: 'NetBIOS-NS', category: 'Windows', description: 'NetBIOS名前解決' },
        { port: 138, protocol: 'UDP', service: 'NetBIOS-DGM', category: 'Windows', description: 'NetBIOSデータグラム' },
        { port: 139, protocol: 'TCP', service: 'NetBIOS-SSN', category: 'Windows', description: 'NetBIOSセッション' },
        { port: 143, protocol: 'TCP', service: 'IMAP', category: 'メール', description: 'メール受信' },
        { port: 161, protocol: 'UDP', service: 'SNMP', category: '管理', description: 'ネットワーク監視' },
        { port: 162, protocol: 'UDP', service: 'SNMP Trap', category: '管理', description: 'SNMP通知' },
        { port: 179, protocol: 'TCP', service: 'BGP', category: 'ルーティング', description: 'ルーティングプロトコル' },
        { port: 194, protocol: 'TCP', service: 'IRC', category: 'チャット', description: 'IRCチャット' },
        { port: 389, protocol: 'TCP/UDP', service: 'LDAP', category: 'ディレクトリ', description: 'ディレクトリサービス' },
        { port: 443, protocol: 'TCP', service: 'HTTPS', category: 'Web', description: 'セキュアWebサーバー' },
        { port: 445, protocol: 'TCP', service: 'SMB', category: 'ファイル転送', description: 'Windows ファイル共有' },
        { port: 464, protocol: 'TCP/UDP', service: 'Kerberos Change', category: '認証', description: 'Kerberosパスワード変更' },
        { port: 465, protocol: 'TCP', service: 'SMTPS', category: 'メール', description: 'セキュアメール送信' },
        { port: 500, protocol: 'UDP', service: 'IKE', category: 'VPN', description: 'IPsec鍵交換' },
        { port: 514, protocol: 'UDP', service: 'Syslog', category: '管理', description: 'ログ収集' },
        { port: 515, protocol: 'TCP', service: 'LPD', category: 'プリンタ', description: 'プリンタデーモン' },
        { port: 520, protocol: 'UDP', service: 'RIP', category: 'ルーティング', description: 'RIPルーティング' },
        { port: 546, protocol: 'UDP', service: 'DHCPv6 Client', category: 'ネットワーク', description: 'DHCPv6クライアント' },
        { port: 547, protocol: 'UDP', service: 'DHCPv6 Server', category: 'ネットワーク', description: 'DHCPv6サーバー' },
        { port: 587, protocol: 'TCP', service: 'SMTP (Submission)', category: 'メール', description: 'メール投稿' },
        { port: 636, protocol: 'TCP', service: 'LDAPS', category: 'ディレクトリ', description: 'セキュアLDAP' },
        { port: 646, protocol: 'TCP/UDP', service: 'LDP', category: 'ルーティング', description: 'MPLS LDP' },
        { port: 749, protocol: 'TCP/UDP', service: 'Kerberos Admin', category: '認証', description: 'Kerberos管理' },
        { port: 853, protocol: 'TCP', service: 'DoT', category: 'ネットワーク', description: 'DNS over TLS' },
        { port: 873, protocol: 'TCP', service: 'rsync', category: 'ファイル転送', description: 'ファイル同期' },
        { port: 993, protocol: 'TCP', service: 'IMAPS', category: 'メール', description: 'セキュアIMAP' },
        { port: 995, protocol: 'TCP', service: 'POP3S', category: 'メール', description: 'セキュアPOP3' },
        // Registered ports (1024-49151)
        { port: 1080, protocol: 'TCP', service: 'SOCKS', category: 'プロキシ', description: 'SOCKSプロキシ' },
        { port: 1194, protocol: 'UDP', service: 'OpenVPN', category: 'VPN', description: 'OpenVPN' },
        { port: 1433, protocol: 'TCP', service: 'MSSQL', category: 'データベース', description: 'SQL Server' },
        { port: 1434, protocol: 'UDP', service: 'MSSQL Browser', category: 'データベース', description: 'SQL Server Browser' },
        { port: 1521, protocol: 'TCP', service: 'Oracle', category: 'データベース', description: 'Oracle DB' },
        { port: 1701, protocol: 'UDP', service: 'L2TP', category: 'VPN', description: 'L2TP VPN' },
        { port: 1723, protocol: 'TCP', service: 'PPTP', category: 'VPN', description: 'PPTP VPN' },
        { port: 1812, protocol: 'UDP', service: 'RADIUS Auth', category: '認証', description: 'RADIUS認証' },
        { port: 1813, protocol: 'UDP', service: 'RADIUS Acct', category: '認証', description: 'RADIUSアカウンティング' },
        { port: 2049, protocol: 'TCP/UDP', service: 'NFS', category: 'ファイル転送', description: 'ネットワークファイル' },
        { port: 2181, protocol: 'TCP', service: 'ZooKeeper', category: 'ミドルウェア', description: 'Apache ZooKeeper' },
        { port: 2222, protocol: 'TCP', service: 'SSH Alt', category: 'リモートアクセス', description: '代替SSH' },
        { port: 2375, protocol: 'TCP', service: 'Docker', category: 'コンテナ', description: 'Docker API' },
        { port: 2376, protocol: 'TCP', service: 'Docker TLS', category: 'コンテナ', description: 'セキュアDocker API' },
        { port: 3000, protocol: 'TCP', service: 'Grafana/Node', category: '監視', description: 'Grafana/Node.js' },
        { port: 3128, protocol: 'TCP', service: 'Squid', category: 'プロキシ', description: 'Squidプロキシ' },
        { port: 3268, protocol: 'TCP', service: 'LDAP GC', category: 'ディレクトリ', description: 'AD グローバルカタログ' },
        { port: 3306, protocol: 'TCP', service: 'MySQL', category: 'データベース', description: 'MySQL/MariaDB' },
        { port: 3389, protocol: 'TCP', service: 'RDP', category: 'リモートアクセス', description: 'リモートデスクトップ' },
        { port: 4443, protocol: 'TCP', service: 'Kubernetes', category: 'コンテナ', description: 'Kubernetes API' },
        { port: 4500, protocol: 'UDP', service: 'NAT-T', category: 'VPN', description: 'IPsec NAT Traversal' },
        { port: 5000, protocol: 'TCP', service: 'UPnP/Flask', category: 'Web', description: 'UPnP/Flask開発' },
        { port: 5432, protocol: 'TCP', service: 'PostgreSQL', category: 'データベース', description: 'PostgreSQL' },
        { port: 5601, protocol: 'TCP', service: 'Kibana', category: '監視', description: 'Kibana UI' },
        { port: 5672, protocol: 'TCP', service: 'RabbitMQ', category: 'メッセージング', description: 'RabbitMQ AMQP' },
        { port: 5900, protocol: 'TCP', service: 'VNC', category: 'リモートアクセス', description: 'VNCリモート' },
        { port: 5985, protocol: 'TCP', service: 'WinRM HTTP', category: 'Windows', description: 'Windows Remote' },
        { port: 5986, protocol: 'TCP', service: 'WinRM HTTPS', category: 'Windows', description: 'セキュアWinRM' },
        { port: 6379, protocol: 'TCP', service: 'Redis', category: 'データベース', description: 'Redis' },
        { port: 6443, protocol: 'TCP', service: 'Kubernetes', category: 'コンテナ', description: 'Kubernetes API (TLS)' },
        { port: 6666, protocol: 'TCP', service: 'IRC Alt', category: 'チャット', description: '代替IRC' },
        { port: 7001, protocol: 'TCP', service: 'WebLogic', category: 'アプリサーバー', description: 'Oracle WebLogic' },
        { port: 8000, protocol: 'TCP', service: 'HTTP Alt', category: 'Web', description: '代替HTTP/開発用' },
        { port: 8080, protocol: 'TCP', service: 'HTTP Proxy', category: 'Web', description: 'プロキシ/代替HTTP' },
        { port: 8081, protocol: 'TCP', service: 'Nexus/Admin', category: 'Web', description: 'Nexus/管理UI' },
        { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', category: 'Web', description: '代替HTTPS' },
        { port: 9000, protocol: 'TCP', service: 'SonarQube', category: '監視', description: 'SonarQube' },
        { port: 9090, protocol: 'TCP', service: 'Prometheus', category: '監視', description: 'Prometheus UI' },
        { port: 9092, protocol: 'TCP', service: 'Kafka', category: 'メッセージング', description: 'Apache Kafka' },
        { port: 9093, protocol: 'TCP', service: 'Alertmanager', category: '監視', description: 'Alertmanager' },
        { port: 9100, protocol: 'TCP', service: 'Node Exporter', category: '監視', description: 'Prometheus Node' },
        { port: 9200, protocol: 'TCP', service: 'Elasticsearch', category: 'データベース', description: 'Elasticsearch API' },
        { port: 9300, protocol: 'TCP', service: 'ES Transport', category: 'データベース', description: 'ES内部通信' },
        { port: 10250, protocol: 'TCP', service: 'kubelet', category: 'コンテナ', description: 'Kubelet API' },
        { port: 11211, protocol: 'TCP/UDP', service: 'Memcached', category: 'データベース', description: 'Memcached' },
        { port: 15672, protocol: 'TCP', service: 'RabbitMQ UI', category: 'メッセージング', description: 'RabbitMQ管理UI' },
        { port: 27017, protocol: 'TCP', service: 'MongoDB', category: 'データベース', description: 'MongoDB' },
        { port: 50000, protocol: 'TCP', service: 'Jenkins', category: 'CI/CD', description: 'Jenkinsエージェント' },
        { port: 51820, protocol: 'UDP', service: 'WireGuard', category: 'VPN', description: 'WireGuard VPN' }
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
