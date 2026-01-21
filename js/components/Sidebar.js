/**
 * OpsMate - Sidebar Component
 * Handles sidebar navigation and mobile menu
 */

const SidebarComponent = {
    // Tool definitions
    tools: {
        network: {
            title: 'ネットワーク管理',
            items: [
                {
                    id: 'subnet-calculator',
                    name: 'IPサブネット計算機',
                    icon: 'network',
                    description: 'IPv4サブネット分割・ホスト数計算'
                },
                {
                    id: 'network-diagram',
                    name: 'ネットワーク構成図',
                    icon: 'share-2',
                    description: 'Mermaid構文によるテキストベースの構成図描画'
                },
                {
                    id: 'filter-wizard',
                    name: 'フィルタウィザード',
                    icon: 'filter',
                    description: 'tcpdump / Wireshark フィルタ生成'
                },
                {
                    id: 'ipv6-toolkit',
                    name: 'IPv6 ツールキット',
                    icon: 'globe-2',
                    description: 'IPv6計算・短縮・展開'
                },
                {
                    id: 'cidr-reference',
                    name: 'CIDRリファレンス',
                    icon: 'table',
                    description: 'CIDR一覧・サブネット分割'
                },
                {
                    id: 'mac-converter',
                    name: 'MACアドレス変換',
                    icon: 'barcode',
                    description: '各種形式（コロン、ハイフン等）への変換'
                },
                {
                    id: 'port-reference',
                    name: 'ポート番号検索',
                    icon: 'list',
                    description: '主要なTCP/UDPポート番号検索'
                },
                {
                    id: 'ip-list-gen',
                    name: 'IPアドレスリスト生成',
                    icon: 'list-ordered',
                    description: 'CIDR/範囲から全IPを展開出力'
                }
            ]
        },
        infra: {
            title: 'サーバー・インフラ設定',
            items: [
                {
                    id: 'ssh-config-gen',
                    name: 'SSH Config生成',
                    icon: 'terminal',
                    description: 'SSH設定（~/.ssh/config）のテンプレート生成'
                },
                {
                    id: 'firewalld-builder',
                    name: 'ファイアウォール構築',
                    icon: 'shield',
                    description: 'firewall-cmd / ufw / iptables コマンド生成'
                },
                {
                    id: 'systemd-unit-gen',
                    name: 'Systemdユニット生成',
                    icon: 'cog',
                    description: 'サービスユニットファイルの生成'
                },
                {
                    id: 'nginx-snippet',
                    name: 'Nginx設定スニペット',
                    icon: 'file-code',
                    description: 'プロキシ、SSL、CORS等の設定生成'
                },
                {
                    id: 'cert-tool',
                    name: 'SSL/TLS 証明書ヘルパー',
                    icon: 'lock',
                    description: '証明書確認・opensslコマンド生成'
                },
                {
                    id: 'datacenter-calc',
                    name: 'DC電力・熱量計算',
                    icon: 'server',
                    description: 'ラック電力・熱量変換計算'
                },
                {
                    id: 'tera-term-macro',
                    name: 'Tera Term マクロ生成',
                    icon: 'terminal-square',
                    description: 'ログイン自動化 .ttl マクロ生成'
                },
                {
                    id: 'rdp-config-gen',
                    name: 'RDP 設定ファイル生成',
                    icon: 'monitor-play',
                    description: 'リモートデスクトップ用 .rdp ファイル生成'
                },
                {
                    id: 'iac-generator',
                    name: 'IaC スニペット生成',
                    icon: 'code-2',
                    description: 'Terraform / Ansible コード生成'
                }
            ]
        },
        dev: {
            title: '開発ツール・データ処理',
            items: [
                {
                    id: 'json-formatter',
                    name: 'JSON 整形',
                    icon: 'braces',
                    description: 'JSON整形・検証'
                },
                {
                    id: 'jwt-decoder',
                    name: 'JWT デコーダー',
                    icon: 'shield-check',
                    description: 'JWTトークンのデコード・整形'
                },
                {
                    id: 'yaml-json',
                    name: 'YAML ↔ JSON 変換',
                    icon: 'repeat',
                    description: 'YAMLとJSONの相互変換'
                },
                {
                    id: 'url-toolkit',
                    name: 'URL 解析・構築',
                    icon: 'link',
                    description: 'URLの分解、パラメータ編集、再構築'
                },
                {
                    id: 'regex-tester',
                    name: '正規表現テスター',
                    icon: 'regex',
                    description: '正規表現テスター'
                },
                {
                    id: 'hash-gen',
                    name: 'ハッシュ生成',
                    icon: 'hash',
                    description: 'SHA-256 / SHA-1 ハッシュ生成・比較'
                },
                {
                    id: 'encoding-converter',
                    name: '文字エンコード変換',
                    icon: 'file-code-2',
                    description: 'Base64 / URL / Hex / HTML 変換'
                },
                {
                    id: 'base-converter',
                    name: '進数変換・ビット計算',
                    icon: 'binary',
                    description: '10進/16進/2進変換とビット操作'
                },
                {
                    id: 'uuid-generator',
                    name: 'UUID / ULID 生成',
                    icon: 'fingerprint',
                    description: 'UUID v4 / ULID の一括生成'
                }
            ]
        },
        utils: {
            title: '運用ユーティリティ',
            items: [
                {
                    id: 'config-diff',
                    name: 'Config 差分比較',
                    icon: 'file-diff',
                    description: 'Config差分比較'
                },
                {
                    id: 'text-utility',
                    name: 'テキスト一括処理',
                    icon: 'type',
                    description: 'ソート、重複排除、プレフィックス一括付与'
                },
                {
                    id: 'unix-timestamp',
                    name: '時刻・Unix時間変換',
                    icon: 'calendar-clock',
                    description: 'Unix Timestamp と日時の相互変換'
                },
                {
                    id: 'cron-master',
                    name: 'Cron 設定作成',
                    icon: 'alarm-clock',
                    description: 'Cron設定解説・生成'
                },
                {
                    id: 'password-generator',
                    name: 'パスワード生成',
                    icon: 'key',
                    description: '強固なパスワード・PSKの一括生成'
                },
                {
                    id: 'transfer-calculator',
                    name: 'ファイル転送時間計算',
                    icon: 'clock',
                    description: '帯域とデータ量から転送時間を推定'
                },
                {
                    id: 'bdp-calculator',
                    name: 'BDP・スループット計算',
                    icon: 'gauge',
                    description: '帯域遅延積とTCPスループット推定'
                },
                {
                    id: 'op-bookmarks',
                    name: '運用ブックマーク',
                    icon: 'bookmark',
                    description: '管理画面やWikiのURL保存・整理'
                },
                {
                    id: 'bulk-cmd-gen',
                    name: '一括コマンド生成',
                    icon: 'layers',
                    description: 'リストとテンプレートから実行コマンドを量産'
                },
                {
                    id: 'log-masker',
                    name: 'ログ匿名化・マスク',
                    icon: 'eye-off',
                    description: 'ログ内のIPや個人情報を自動マスク'
                },
                {
                    id: 'syslog-highlighter',
                    name: 'Syslogカラー解析',
                    icon: 'align-left',
                    description: 'SyslogのSeverity色分け表示とフィルタ'
                },
                {
                    id: 'http-status',
                    name: 'HTTPステータス',
                    icon: 'globe',
                    description: 'HTTPステータスコード一覧'
                }
            ]
        }
    },

    currentTool: null,

    /**
     * Initialize the sidebar
     */
    init() {
        this.renderNavigation();
        this.bindEvents();
    },

    /**
     * Render navigation items
     */
    renderNavigation() {
        const navContainer = document.getElementById('sidebar-nav');
        if (!navContainer) return;

        let html = '';

        for (const categoryId in this.tools) {
            const category = this.tools[categoryId];
            html += `
                <div class="nav-section">
                    <span class="nav-section-title">${category.title}</span>
                    <ul class="nav-list">
                        ${category.items.map(tool => this.renderNavItem(tool)).join('')}
                    </ul>
                </div>
            `;
        }

        navContainer.innerHTML = html;

        // Refresh Lucide icons
        lucide.createIcons();
    },

    /**
     * Render a single navigation item
     * @param {Object} tool - Tool definition
     * @returns {string} - HTML string
     */
    renderNavItem(tool) {
        const badge = tool.comingSoon
            ? '<span class="nav-badge coming-soon">近日公開</span>'
            : '';

        return `
            <li class="nav-item">
                <a class="nav-link" data-tool="${tool.id}" ${tool.comingSoon ? 'data-disabled="true"' : ''}>
                    <i data-lucide="${tool.icon}" class="nav-icon"></i>
                    <span class="nav-label">${tool.name}</span>
                    ${badge}
                </a>
            </li>
        `;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation clicks
        document.querySelectorAll('.nav-link[data-tool]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                if (link.dataset.disabled === 'true') {
                    OpsMateHelpers.showToast('このツールは近日公開予定です！', 'info');
                    return;
                }

                this.selectTool(link.dataset.tool);
            });
        });

        // Feature card clicks on welcome screen
        document.querySelectorAll('.feature-card[data-tool]').forEach(card => {
            card.addEventListener('click', () => {
                this.selectTool(card.dataset.tool);
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.openSidebar();
            });
        }

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });
    },

    /**
     * Select a tool
     * @param {string} toolId - Tool identifier
     */
    selectTool(toolId) {
        // Update active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`.nav-link[data-tool="${toolId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Find tool info
        const allTools = Object.values(this.tools).flatMap(category => category.items);
        const tool = allTools.find(t => t.id === toolId);

        if (tool) {
            // Update header
            HeaderComponent.updateTitle(tool.name, tool.description);

            // Load tool content
            MainContentComponent.loadTool(toolId);

            this.currentTool = toolId;
        }

        // Close mobile sidebar
        this.closeSidebar();
    },

    /**
     * Open mobile sidebar
     */
    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close mobile sidebar
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Get current tool ID
     * @returns {string|null}
     */
    getCurrentTool() {
        return this.currentTool;
    }
};

// Make available globally
window.SidebarComponent = SidebarComponent;
