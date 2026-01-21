/**
 * OpsMate - Sidebar Component
 * Handles 2-pane sidebar navigation and mobile menu
 */

const SidebarComponent = {
    // Tool definitions
    tools: {
        network: {
            title: 'ネットワーク管理',
            icon: 'network',
            items: [
                { id: 'subnet-calculator', name: 'IPサブネット計算機', icon: 'network', description: 'IPv4サブネット分割・ホスト数計算' },
                { id: 'network-diagram', name: 'ネットワーク構成図', icon: 'share-2', description: 'アイコン選択による簡単描画とMermaid編集' },
                { id: 'filter-wizard', name: 'フィルタウィザード', icon: 'filter', description: 'tcpdump / Wireshark フィルタ生成' },
                { id: 'dns-generator', name: 'DNSレコード生成', icon: 'globe', description: 'A/MX/TXT/SRV等の構文生成' },
                { id: 'ipv6-toolkit', name: 'IPv6 ツールキット', icon: 'globe-2', description: 'IPv6計算・短縮・展開' },
                { id: 'cidr-reference', name: 'CIDRリファレンス', icon: 'table', description: 'CIDR一覧・サブネット分割' },
                { id: 'vlsm-calculator', name: 'VLSM計算機', icon: 'git-branch', description: '可変長サブネット分割' },
                { id: 'mac-converter', name: 'MACアドレス変換', icon: 'barcode', description: '各種形式への変換' },
                { id: 'port-reference', name: 'ポート番号検索', icon: 'list', description: '主要なTCP/UDPポート検索' },
                { id: 'ip-list-gen', name: 'IPアドレスリスト生成', icon: 'list-ordered', description: 'CIDRから全IPを展開出力' },
                { id: 'snmp-reference', name: 'SNMP OID 検索', icon: 'search', description: '主要機器のOIDリファレンス' }
            ]
        },
        infra: {
            title: 'インフラ・サーバー',
            icon: 'server',
            items: [
                { id: 'ssh-config-gen', name: 'SSH Config生成', icon: 'terminal', description: 'SSH設定テンプレート生成' },
                { id: 'firewalld-builder', name: 'ファイアウォール構築', icon: 'shield', description: 'firewall-cmd / ufw 生成' },
                { id: 'systemd-unit-gen', name: 'Systemdユニット生成', icon: 'cog', description: 'サービスユニットファイルの生成' },
                { id: 'nginx-snippet', name: 'Nginx設定スニペット', icon: 'file-code', description: 'プロキシ、SSL等の設定生成' },
                { id: 'cert-helper', name: 'SSL/TLS 証明書', icon: 'lock', description: '証明書確認・opensslコマンド生成' },
                { id: 'iac-generator', name: 'IaC スニペット生成', icon: 'code-2', description: 'Terraform / Ansible コード生成' },
                { id: 'docker-compose-gen', name: 'Docker Compose 生成', icon: 'container', description: '各種サービスのテンプレート' },
                { id: 'cloud-cli-gen', name: 'クラウドCLI生成', icon: 'cloud', description: 'AWS/Azure/GCPコマンド生成' },
                { id: 'k8s-yaml-gen', name: 'Kubernetes YAML', icon: 'box', description: 'K8sマニフェスト生成' },
                { id: 'datacenter-calc', name: 'DC電力・熱量計算', icon: 'zap', description: 'ラック電力・熱量変換計算' },
                { id: 'tera-term-macro', name: 'Tera Term マクロ', icon: 'terminal-square', description: 'ログイン自動化マクロ生成' },
                { id: 'rdp-config-gen', name: 'RDP 設定生成', icon: 'monitor-play', description: 'リモートデスクトップ設定生成' }
            ]
        },
        dev: {
            title: 'データ処理・開発',
            icon: 'braces',
            items: [
                { id: 'json-formatter', name: 'JSON 整形', icon: 'braces', description: 'JSON整形・検証' },
                { id: 'jwt-decoder', name: 'JWT デコーダー', icon: 'shield-check', description: 'JWTトークンのデコード' },
                { id: 'yaml-json', name: 'YAML ↔ JSON 変換', icon: 'repeat', description: 'YAMLとJSONの相互変換' },
                { id: 'url-toolkit', name: 'URL 解析・構築', icon: 'link', description: 'URL分解・再構築' },
                { id: 'regex-tester', name: '正規表現テスター', icon: 'regex', description: '正規表現テスター' },
                { id: 'mdtable-gen', name: 'Markdownテーブル', icon: 'table-2', description: 'MD形式の表作成' },
                { id: 'excel-formula', name: 'Excel関数ビルダー', icon: 'function-square', description: '文字操作・VLOOKUP等' },
                { id: 'git-cmd-builder', name: 'Gitコマンド', icon: 'git-branch', description: 'Gitコマンド生成' },
                { id: 'hash-gen', name: 'ハッシュ生成', icon: 'hash', description: 'SHA-256 / SHA-1 生成' },
                { id: 'encoding-converter', name: '文字エンコード変換', icon: 'file-code-2', description: 'Base64 / URL / Hex 変換' },
                { id: 'base-converter', name: '進数・ビット計算', icon: 'binary', description: '進数変換とビット操作' },
                { id: 'uuid-generator', name: 'UUID / ULID 生成', icon: 'fingerprint', description: 'UUID 一括生成' }
            ]
        },
        utils: {
            title: 'ユーティリティ',
            icon: 'wrench',
            items: [
                { id: 'config-diff', name: 'Config 差分比較', icon: 'file-diff', description: 'Config差分比較' },
                { id: 'text-utility', name: 'テキスト一括処理', icon: 'type', description: 'ソート、重複排除など' },
                { id: 'unix-timestamp', name: 'Unix時間変換', icon: 'calendar-clock', description: 'Unix時刻の相互変換' },
                { id: 'cron-master', name: 'Cron 設定', icon: 'alarm-clock', description: 'Cron設定生成' },
                { id: 'password-generator', name: 'パスワード生成', icon: 'key', description: '強固なパスワード生成' },
                { id: 'transfer-calculator', name: '転送時間計算', icon: 'clock', description: '転送時間の推定' },
                { id: 'bdp-calculator', name: 'BDP・スループット', icon: 'gauge', description: '帯域遅延積の推定' },
                { id: 'sla-calculator', name: 'SLA稼働率計算', icon: 'percent', description: '稼働率↔ダウンタイム計算' },
                { id: 'capacity-planner', name: 'キャパシティ計画', icon: 'trending-up', description: 'リソース増加予測' },
                { id: 'response-time-calc', name: 'レスポンス分析', icon: 'timer', description: 'P50/P99パーセンタイル' },
                { id: 'incident-timeline', name: 'インシデントTL', icon: 'list-ordered', description: '障害対応の時系列記録' },
                { id: 'maintenance-calc', name: 'メンテナンスウィンドウ', icon: 'wrench', description: '複数TZでの作業時間計算' },
                { id: 'op-bookmarks', name: '運用ブックマーク', icon: 'bookmark', description: 'URLの整理・保存' },
                { id: 'bulk-cmd-gen', name: '一括コマンド生成', icon: 'layers', description: '実行コマンドの量産' },
                { id: 'log-masker', name: 'ログ匿名化', icon: 'eye-off', description: 'ログの自動マスク' },
                { id: 'syslog-highlighter', name: 'Syslogカラー解析', icon: 'align-left', description: 'Severity色分け表示' },
                { id: 'quick-note', name: 'クイックメモ', icon: 'sticky-note', description: '作業中のメモ帳' },
                { id: 'wbs-generator', name: 'WBSジェネレーター', icon: 'gantt-chart', description: 'WBSテンプレート生成' },
                { id: 'http-status', name: 'HTTPステータス', icon: 'globe', description: 'ステータスコード一覧' }
            ]
        }
    },

    currentTool: null,
    currentCategory: 'network',

    /**
     * Initialize the sidebar
     */
    init() {
        this.renderSidebarLayout();
        this.renderCategories();
        this.renderToolList('network');
        this.bindEvents();
    },

    /**
     * Render the basic sidebar structure for 2-pane
     */
    renderSidebarLayout() {
        const navContainer = document.getElementById('sidebar-nav');
        if (!navContainer) return;

        navContainer.innerHTML = `
            <div class="category-list" id="category-list"></div>
            <div class="tool-list-container">
                <div class="tool-list-header" id="tool-list-header">ネットワーク管理</div>
                <ul class="nav-list" id="tool-list"></ul>
            </div>
        `;
    },

    /**
     * Render category icons
     */
    renderCategories() {
        const catList = document.getElementById('category-list');
        if (!catList) return;

        let html = '';
        for (const catId in this.tools) {
            const cat = this.tools[catId];
            const activeClass = catId === this.currentCategory ? 'active' : '';
            html += `
                <div class="category-item ${activeClass}" data-category="${catId}" title="${cat.title}">
                    <i data-lucide="${cat.icon}" class="w-6 h-6"></i>
                </div>
            `;
        }
        catList.innerHTML = html;
        lucide.createIcons();
    },

    /**
     * Render tools for a specific category
     */
    renderToolList(catId) {
        const list = document.getElementById('tool-list');
        const header = document.getElementById('tool-list-header');
        if (!list || !this.tools[catId]) return;

        this.currentCategory = catId;
        header.textContent = this.tools[catId].title;

        list.innerHTML = this.tools[catId].items.map(tool => `
            <li class="nav-item">
                <a class="nav-link ${this.currentTool === tool.id ? 'active' : ''}" data-tool="${tool.id}">
                    <i data-lucide="${tool.icon}" class="nav-icon"></i>
                    <span class="nav-label">${tool.name}</span>
                </a>
            </li>
        `).join('');

        lucide.createIcons();
        this.bindToolEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Category clicks
        document.getElementById('category-list').addEventListener('click', (e) => {
            const item = e.target.closest('.category-item');
            if (!item) return;

            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            this.renderToolList(item.dataset.category);
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const overlay = document.getElementById('sidebar-overlay');

        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => this.openSidebar());
        if (sidebarToggle) sidebarToggle.addEventListener('click', () => this.closeSidebar());
        if (overlay) overlay.addEventListener('click', () => this.closeSidebar());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSidebar();
        });
    },

    /**
     * Bind tool click events after list re-render
     */
    bindToolEvents() {
        document.querySelectorAll('.nav-link[data-tool]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectTool(link.dataset.tool);
            });
        });
    },

    /**
     * Select a tool
     */
    selectTool(toolId) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-tool="${toolId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Find tool info across all categories
        let tool = null;
        for (const catId in this.tools) {
            tool = this.tools[catId].items.find(t => t.id === toolId);
            if (tool) break;
        }

        if (tool) {
            HeaderComponent.updateTitle(tool.name, tool.description);
            MainContentComponent.loadTool(toolId);
            this.currentTool = toolId;
        }
        this.closeSidebar();
    },

    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.SidebarComponent = SidebarComponent;
