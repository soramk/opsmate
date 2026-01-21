/**
 * OpsMate - DNS Record Generator
 */

const DnsGenerator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'dns-generator',
            title: 'DNSレコード生成器の使い方',
            description: '各種DNSレコード（A, AAAA, CNAME, MX, TXT, SRV等）のゾーンファイル形式の構文を生成します。',
            steps: [
                'レコードタイプを選択します',
                '必要なパラメータ（ホスト名、IPアドレス、TTLなど）を入力します',
                '生成されたレコードをコピーしてDNSサーバーやクラウドDNSに設定します'
            ],
            tips: [
                'TTL（生存時間）は秒単位で指定します。86400 = 1日です',
                'SPF/DKIM/DMARCレコードはTXTタイプで設定します',
                'MXレコードの優先度は小さいほど優先されます'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="globe" class="w-5 h-5"></i>
                            DNSレコード生成
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="form-group">
                            <label class="form-label">レコードタイプ</label>
                            <select id="dns-type" class="form-select">
                                <option value="A">A (IPv4)</option>
                                <option value="AAAA">AAAA (IPv6)</option>
                                <option value="CNAME">CNAME (エイリアス)</option>
                                <option value="MX">MX (メール)</option>
                                <option value="TXT">TXT (テキスト)</option>
                                <option value="NS">NS (ネームサーバー)</option>
                                <option value="SRV">SRV (サービス)</option>
                                <option value="CAA">CAA (証明書認証)</option>
                                <option value="PTR">PTR (逆引き)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ホスト名</label>
                            <input type="text" id="dns-host" class="form-input" placeholder="@ / www / mail">
                        </div>
                        <div class="form-group">
                            <label class="form-label">TTL (秒)</label>
                            <input type="number" id="dns-ttl" class="form-input" value="3600">
                        </div>
                    </div>

                    <!-- Dynamic fields -->
                    <div id="dns-fields" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"></div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="file-text" class="w-5 h-5"></i>
                            生成されたレコード
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('dns-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="dns-output" class="code-output p-4 rounded-lg font-mono text-sm overflow-auto"></pre>
                </div>

                <!-- Common Records -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                            <i data-lucide="bookmark" class="w-5 h-5"></i>
                            よく使うレコード例
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="quick-ref-item p-3 rounded-lg border" style="background: var(--bg-secondary); border-color: var(--border-color);">
                            <div class="text-xs mb-1" style="color: var(--text-muted);">SPF (TXT)</div>
                            <code class="text-xs" style="color: var(--accent-primary);">v=spf1 include:_spf.google.com ~all</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg border" style="background: var(--bg-secondary); border-color: var(--border-color);">
                            <div class="text-xs mb-1" style="color: var(--text-muted);">DMARC (TXT)</div>
                            <code class="text-xs" style="color: var(--accent-primary);">v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg border" style="background: var(--bg-secondary); border-color: var(--border-color);">
                            <div class="text-xs mb-1" style="color: var(--text-muted);">Google Workspace MX</div>
                            <code class="text-xs" style="color: var(--accent-primary);">ASPMX.L.GOOGLE.COM (優先度: 1)</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg border" style="background: var(--bg-secondary); border-color: var(--border-color);">
                            <div class="text-xs mb-1" style="color: var(--text-muted);">Let's Encrypt CAA</div>
                            <code class="text-xs" style="color: var(--accent-primary);">0 issue "letsencrypt.org"</code>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        document.getElementById('dns-type').addEventListener('change', () => this.renderFields());
        document.getElementById('dns-host').addEventListener('input', () => this.generate());
        document.getElementById('dns-ttl').addEventListener('input', () => this.generate());

        this.renderFields();
    },

    renderFields() {
        const type = document.getElementById('dns-type').value;
        const container = document.getElementById('dns-fields');
        let html = '';

        switch (type) {
            case 'A':
                html = `<div class="form-group"><label class="form-label">IPv4アドレス</label><input type="text" id="dns-value" class="form-input" placeholder="192.0.2.1"></div>`;
                break;
            case 'AAAA':
                html = `<div class="form-group"><label class="form-label">IPv6アドレス</label><input type="text" id="dns-value" class="form-input" placeholder="2001:db8::1"></div>`;
                break;
            case 'CNAME':
                html = `<div class="form-group"><label class="form-label">正規名 (FQDN)</label><input type="text" id="dns-value" class="form-input" placeholder="example.com."></div>`;
                break;
            case 'MX':
                html = `
                    <div class="form-group"><label class="form-label">優先度</label><input type="number" id="dns-priority" class="form-input" value="10"></div>
                    <div class="form-group"><label class="form-label">メールサーバー</label><input type="text" id="dns-value" class="form-input" placeholder="mail.example.com."></div>
                `;
                break;
            case 'TXT':
                html = `<div class="form-group col-span-2"><label class="form-label">テキスト値</label><input type="text" id="dns-value" class="form-input" placeholder="v=spf1 include:..."></div>`;
                break;
            case 'NS':
                html = `<div class="form-group"><label class="form-label">ネームサーバー</label><input type="text" id="dns-value" class="form-input" placeholder="ns1.example.com."></div>`;
                break;
            case 'SRV':
                html = `
                    <div class="form-group"><label class="form-label">優先度</label><input type="number" id="dns-priority" class="form-input" value="10"></div>
                    <div class="form-group"><label class="form-label">重み</label><input type="number" id="dns-weight" class="form-input" value="5"></div>
                    <div class="form-group"><label class="form-label">ポート</label><input type="number" id="dns-port" class="form-input" value="443"></div>
                    <div class="form-group"><label class="form-label">ターゲット</label><input type="text" id="dns-value" class="form-input" placeholder="server.example.com."></div>
                `;
                break;
            case 'CAA':
                html = `
                    <div class="form-group"><label class="form-label">タグ</label><select id="dns-caa-tag" class="form-select"><option value="issue">issue</option><option value="issuewild">issuewild</option><option value="iodef">iodef</option></select></div>
                    <div class="form-group"><label class="form-label">値 (CA)</label><input type="text" id="dns-value" class="form-input" placeholder="letsencrypt.org"></div>
                `;
                break;
            case 'PTR':
                html = `<div class="form-group"><label class="form-label">ホスト名 (FQDN)</label><input type="text" id="dns-value" class="form-input" placeholder="server.example.com."></div>`;
                break;
        }

        container.innerHTML = html;
        container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', () => this.generate()));
        this.generate();
    },

    generate() {
        const type = document.getElementById('dns-type').value;
        const host = document.getElementById('dns-host').value || '@';
        const ttl = document.getElementById('dns-ttl').value || '3600';
        const value = document.getElementById('dns-value')?.value || '';
        const output = document.getElementById('dns-output');

        let record = '';

        switch (type) {
            case 'A':
            case 'AAAA':
            case 'CNAME':
            case 'NS':
            case 'PTR':
                record = `${host}\t${ttl}\tIN\t${type}\t${value}`;
                break;
            case 'MX':
                const priority = document.getElementById('dns-priority')?.value || '10';
                record = `${host}\t${ttl}\tIN\tMX\t${priority} ${value}`;
                break;
            case 'TXT':
                record = `${host}\t${ttl}\tIN\tTXT\t"${value}"`;
                break;
            case 'SRV':
                const p = document.getElementById('dns-priority')?.value || '10';
                const w = document.getElementById('dns-weight')?.value || '5';
                const port = document.getElementById('dns-port')?.value || '443';
                record = `${host}\t${ttl}\tIN\tSRV\t${p} ${w} ${port} ${value}`;
                break;
            case 'CAA':
                const tag = document.getElementById('dns-caa-tag')?.value || 'issue';
                record = `${host}\t${ttl}\tIN\tCAA\t0 ${tag} "${value}"`;
                break;
        }

        output.textContent = record;
    }
};

window.DnsGenerator = DnsGenerator;
