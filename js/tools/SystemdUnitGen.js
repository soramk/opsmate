/**
 * OpsMate - Systemd Unit Generator
 */

const SystemdUnitGen = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="cog" class="w-5 h-5"></i>
                            Systemd ユニット生成
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group mb-0">
                            <label class="form-label">サービス名</label>
                            <input type="text" id="sd-name" class="form-input" placeholder="myapp">
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">説明 (Description)</label>
                            <input type="text" id="sd-desc" class="form-input" placeholder="My Application Service">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">起動コマンド (ExecStart)</label>
                        <input type="text" id="sd-exec" class="form-input" placeholder="/usr/bin/node /opt/myapp/server.js">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group mb-0">
                            <label class="form-label">作業ディレクトリ (WorkingDirectory)</label>
                            <input type="text" id="sd-workdir" class="form-input" placeholder="/opt/myapp">
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">実行ユーザー (User)</label>
                            <input type="text" id="sd-user" class="form-input" placeholder="www-data">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group mb-0">
                            <label class="form-label">再起動ポリシー (Restart)</label>
                            <select id="sd-restart" class="form-select">
                                <option value="always">always</option>
                                <option value="on-failure">on-failure</option>
                                <option value="on-abnormal">on-abnormal</option>
                                <option value="no">no</option>
                            </select>
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">起動順序 (After)</label>
                            <select id="sd-after" class="form-select">
                                <option value="network.target">network.target</option>
                                <option value="network-online.target">network-online.target</option>
                                <option value="multi-user.target">multi-user.target</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">環境変数 (Environment) (1行に1つ、KEY=value)</label>
                        <textarea id="sd-env" class="form-textarea" rows="3" placeholder="NODE_ENV=production&#10;PORT=3000"></textarea>
                    </div>

                    <button class="btn btn-primary" id="sd-generate-btn">
                        <i data-lucide="file-code" class="w-4 h-4"></i> ユニットファイル生成
                    </button>
                </div>

                <div class="panel-card" id="sd-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">生成されたユニットファイル</h2>
                        <button class="btn btn-secondary btn-sm" id="sd-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="sd-output" class="json-output" style="white-space: pre-wrap;"></pre>
                    <p class="header-description" style="margin-top: 0.75rem;">
                        ファイルを <code>/etc/systemd/system/&lt;name&gt;.service</code> に保存し、<br>
                        <code>systemctl daemon-reload && systemctl enable --now &lt;name&gt;</code> で起動します。
                    </p>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('sd-generate-btn')?.addEventListener('click', () => this.generate());
        document.getElementById('sd-copy-btn')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('sd-output').textContent);
        });
    },

    generate() {
        const name = document.getElementById('sd-name').value.trim() || 'myapp';
        const desc = document.getElementById('sd-desc').value.trim() || 'My Service';
        const exec = document.getElementById('sd-exec').value.trim();
        const workdir = document.getElementById('sd-workdir').value.trim();
        const user = document.getElementById('sd-user').value.trim();
        const restart = document.getElementById('sd-restart').value;
        const after = document.getElementById('sd-after').value;
        const envRaw = document.getElementById('sd-env').value.trim();

        if (!exec) {
            OpsMateHelpers.showToast('起動コマンド (ExecStart) を入力してください', 'error');
            return;
        }

        let unit = `[Unit]\nDescription=${desc}\nAfter=${after}\n\n[Service]\nType=simple\nExecStart=${exec}\n`;

        if (workdir) unit += `WorkingDirectory=${workdir}\n`;
        if (user) unit += `User=${user}\n`;
        unit += `Restart=${restart}\nRestartSec=5\n`;

        if (envRaw) {
            const envLines = envRaw.split('\n').filter(l => l.trim());
            envLines.forEach(line => {
                unit += `Environment="${line.trim()}"\n`;
            });
        }

        unit += `\n[Install]\nWantedBy=multi-user.target`;

        document.getElementById('sd-output').textContent = unit;
        document.getElementById('sd-result-panel').style.display = 'block';
        lucide.createIcons();
    }
};

window.SystemdUnitGen = SystemdUnitGen;
