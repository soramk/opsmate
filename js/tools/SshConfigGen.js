/**
 * OpsMate - SSH Config Generator
 */

const SshConfigGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'ssh',
            title: 'SSH Config生成の使い方',
            description: '複数のホストに対するSSH設定（~/.ssh/config）を一括生成します。踏み台サーバー（ProxyJump）にも対応。',
            steps: [
                'ホスト名を1行ずつ入力',
                '共通オプション（ユーザー、ポート、秘密鍵）を設定',
                '踏み台サーバーを使う場合はチェックを入れて設定',
                '「設定生成」をクリックして結果をコピー'
            ],
            tips: [
                '生成した設定は ~/.ssh/config に追記',
                'ホスト名はワイルドカード（web-*）も使用可能',
                'ProxyJumpで多段SSHを簡単に設定',
                'IdentityFileは鍵ファイルのフルパスを指定'
            ],
            example: {
                title: '生成例',
                code: 'Host web-01\\n    User admin\\n    Port 22\\n    IdentityFile ~/.ssh/id_rsa'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="terminal" class="w-5 h-5"></i>
                            SSH Config 生成
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">ホスト名パターン (1行に1つ)</label>
                            <textarea id="ssh-hosts" class="form-textarea" rows="5" 
                                      placeholder="web-server-01&#10;web-server-02&#10;db-server-01"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">共通オプション</label>
                            <div class="form-group mb-2">
                                <label class="form-label" style="font-size: 0.7rem;">ユーザー (User)</label>
                                <input type="text" id="ssh-user" class="form-input" placeholder="admin">
                            </div>
                            <div class="form-group mb-2">
                                <label class="form-label" style="font-size: 0.7rem;">ポート (Port)</label>
                                <input type="number" id="ssh-port" class="form-input" placeholder="22">
                            </div>
                            <div class="form-group mb-2">
                                <label class="form-label" style="font-size: 0.7rem;">秘密鍵 (IdentityFile)</label>
                                <input type="text" id="ssh-key" class="form-input" placeholder="~/.ssh/id_rsa">
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="ssh-proxy-toggle"> 
                            踏み台サーバーを利用 (ProxyJump)
                        </label>
                        <div id="ssh-proxy-panel" style="display: none; margin-top: 0.5rem; padding-left: 1.5rem; border-left: 2px solid var(--accent-primary);">
                            <label class="form-label">踏み台サーバー名</label>
                            <input type="text" id="ssh-jump-host" class="form-input" placeholder="bastion-server">
                        </div>
                    </div>

                    <button class="btn btn-primary" id="ssh-generate-btn">
                        <i data-lucide="file-code" class="w-4 h-4"></i> 設定生成
                    </button>

                    ${helpSection}
                </div>

                <div class="panel-card" id="ssh-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">生成結果 (~/.ssh/config)</h2>
                        <button class="btn btn-secondary btn-sm" id="ssh-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <textarea id="ssh-output" class="form-textarea code-textarea" rows="12" readonly></textarea>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('ssh-generate-btn')?.addEventListener('click', () => this.generate());
        document.getElementById('ssh-proxy-toggle')?.addEventListener('change', (e) => {
            document.getElementById('ssh-proxy-panel').style.display = e.target.checked ? 'block' : 'none';
        });
        document.getElementById('ssh-copy-btn')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('ssh-output').value);
        });
    },

    generate() {
        const hosts = document.getElementById('ssh-hosts').value.split('\n').filter(h => h.trim());
        const user = document.getElementById('ssh-user').value.trim();
        const port = document.getElementById('ssh-port').value.trim();
        const key = document.getElementById('ssh-key').value.trim();
        const useProxy = document.getElementById('ssh-proxy-toggle').checked;
        const jumpHost = document.getElementById('ssh-jump-host').value.trim();

        if (hosts.length === 0) {
            OpsMateHelpers.showToast('ホスト名を1つ以上入力してください', 'error');
            return;
        }

        let config = '';
        hosts.forEach(host => {
            config += `Host ${host}\n`;
            if (user) config += `    User ${user}\n`;
            if (port && port !== '22') config += `    Port ${port}\n`;
            if (key) config += `    IdentityFile ${key}\n`;
            if (useProxy && jumpHost) config += `    ProxyJump ${jumpHost}\n`;
            config += '\n';
        });

        document.getElementById('ssh-output').value = config.trim();
        document.getElementById('ssh-result-panel').style.display = 'block';
        lucide.createIcons();
    }
};

window.SshConfigGen = SshConfigGen;
