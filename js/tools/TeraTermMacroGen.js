/**
 * OpsMate - Tera Term Macro Generator
 */

const TeraTermMacroGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'tt-macro',
            title: 'Tera Term マクロ生成器の使い方',
            description: 'Tera Term で使用できるマクロファイル（.ttl）を生成します。インフラ運用中の定期ログインや定型作業を自動化できます。',
            steps: [
                '接続先（ホスト名/IP）とポート番号を入力',
                '認証方式（パスワード または 秘密鍵）を選択',
                'ログ保存設定や、ログイン後に実行したいコマンドを入力',
                '「マクロ生成」をクリックし、内容を .ttl ファイルとして保存'
            ],
            tips: [
                '生成されたコードは Unicode (UTF-8) 形式で保存してください',
                'パスワードは暗号化されません。共有には注意してください',
                '秘密鍵を使用する場合、鍵のパスを正しく指定してください',
                'wait / sendln コマンドで対話的な操作を自動化できます'
            ],
            example: {
                title: '実行例',
                code: 'ttpmacro.exe my_macro.ttl'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="terminal" class="w-5 h-5"></i>
                            基本接続設定
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group mb-0">
                            <label class="form-label">ホスト名 / IPアドレス</label>
                            <input type="text" id="tt-host" class="form-input" placeholder="192.168.1.1">
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">ポート番号</label>
                            <input type="number" id="tt-port" class="form-input" value="22">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div class="form-group mb-0">
                            <label class="form-label">ユーザー名</label>
                            <input type="text" id="tt-user" class="form-input" placeholder="admin">
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">認証方式</label>
                            <select id="tt-auth" class="form-select">
                                <option value="password">パスワード認証</option>
                                <option value="key">秘密鍵認証 (Public Key)</option>
                            </select>
                        </div>
                    </div>

                    <div id="tt-pass-panel" class="form-group mt-4">
                        <label class="form-label">パスワード</label>
                        <input type="password" id="tt-pass" class="form-input" placeholder="••••••••">
                    </div>

                    <div id="tt-key-panel" class="form-group mt-4" style="display: none;">
                        <label class="form-label">秘密鍵のパス (Tera Term実行環境からのパス)</label>
                        <input type="text" id="tt-key" class="form-input" placeholder="C:\\Users\\name\\.ssh\\id_rsa">
                    </div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="settings" class="w-5 h-5"></i>
                            拡張設定
                        </h2>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="tt-logging" checked>
                            接続時に自動的にログを開始する
                        </label>
                    </div>

                    <div id="tt-log-panel" class="form-group">
                        <label class="form-label">ログ保存パス (例: log\\&h_%Y%m%d_%H%M%S.log)</label>
                        <input type="text" id="tt-logpath" class="form-input" value="logs\\&h_%Y%m%d_%H%M%S.log">
                    </div>

                    <div class="form-group">
                        <label class="form-label">ログイン完了後に実行するコマンド (1行に1つ)</label>
                        <textarea id="tt-commands" class="form-textarea" rows="4" placeholder="ls -la&#10;df -h"></textarea>
                    </div>

                    <button class="btn btn-primary" id="tt-generate-btn">
                        <i data-lucide="file-code" class="w-4 h-4"></i> マクロ生成
                    </button>

                    ${helpSection}
                </div>

                <div class="panel-card" id="tt-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">生成されたマクロ (.ttl)</h2>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="tt-copy-btn">
                                <i data-lucide="copy" class="w-4 h-4"></i> コピー
                            </button>
                            <button class="btn btn-secondary btn-sm" id="tt-download-btn">
                                <i data-lucide="download" class="w-4 h-4"></i> ダウンロード
                            </button>
                        </div>
                    </div>
                    <pre id="tt-output" class="json-output" style="white-space: pre-wrap; font-family: 'Courier New', Courier, monospace;"></pre>
                </div>
            </div>
        `;
    },

    init() {
        const authSelect = document.getElementById('tt-auth');
        const passPanel = document.getElementById('tt-pass-panel');
        const keyPanel = document.getElementById('tt-key-panel');
        const loggingCheck = document.getElementById('tt-logging');
        const logPanel = document.getElementById('tt-log-panel');
        const generateBtn = document.getElementById('tt-generate-btn');
        const copyBtn = document.getElementById('tt-copy-btn');
        const downloadBtn = document.getElementById('tt-download-btn');

        if (authSelect) {
            authSelect.addEventListener('change', () => {
                if (authSelect.value === 'password') {
                    passPanel.style.display = 'block';
                    keyPanel.style.display = 'none';
                } else {
                    passPanel.style.display = 'none';
                    keyPanel.style.display = 'block';
                }
            });
        }

        if (loggingCheck) {
            loggingCheck.addEventListener('change', () => {
                logPanel.style.display = loggingCheck.checked ? 'block' : 'none';
            });
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const output = document.getElementById('tt-output').textContent;
                OpsMateHelpers.copyToClipboard(output, copyBtn);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.download());
        }
    },

    generate() {
        const host = document.getElementById('tt-host').value || '192.168.1.1';
        const port = document.getElementById('tt-port').value || '22';
        const user = document.getElementById('tt-user').value || 'admin';
        const auth = document.getElementById('tt-auth').value;
        const pass = document.getElementById('tt-pass').value;
        const keyPath = document.getElementById('tt-key').value;
        const isLogging = document.getElementById('tt-logging').checked;
        const logPath = document.getElementById('tt-logpath').value;
        const commandsRaw = document.getElementById('tt-commands').value;

        const commands = commandsRaw.split('\n').filter(line => line.trim() !== '');

        let ttl = `; Tera Term Macro generated by OpsMate
; Created: ${new Date().toLocaleString()}

HOSTADDR = '${host}'
PORTNUM = '${port}'
USERNAME = '${user}'
`;

        if (auth === 'password') {
            ttl += `PASSWORD = '${pass || ''}'
COMMAND = HOSTADDR
strconcat COMMAND ':'
strconcat COMMAND PORTNUM
strconcat COMMAND ' /ssh /2 /auth=password /user='
strconcat COMMAND USERNAME
strconcat COMMAND ' /passwd='
strconcat COMMAND PASSWORD
`;
        } else {
            ttl += `KEYFILE = '${keyPath || ''}'
COMMAND = HOSTADDR
strconcat COMMAND ':'
strconcat COMMAND PORTNUM
strconcat COMMAND ' /ssh /2 /auth=publickey /user='
strconcat COMMAND USERNAME
strconcat COMMAND ' /keyfile='
strconcat COMMAND KEYFILE
`;
        }

        ttl += `
; Connect to host
connect COMMAND

; Check connection
if result <> 2 then
    messagebox 'Failed to connect' 'Error'
    end
endif

; Wait for prompt (general adjustment)
wait '$' '#' '>' ']'
`;

        if (isLogging) {
            ttl += `
; Auto Logging
logopen '${logPath}' 0 1
logwrite '*** Tera Term Log Start ***'#13#10
`;
        }

        if (commands.length > 0) {
            ttl += `
; Execute Custom Commands
`;
            commands.forEach(cmd => {
                ttl += `sendln '${cmd}'\nwait '$' '#' '>' ']' \n`;
            });
        }

        ttl += `
; End of Macro
; logclose ; uncomment to auto-close log on macro exit
`;

        const output = document.getElementById('tt-output');
        const panel = document.getElementById('tt-result-panel');
        output.textContent = ttl;
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth' });
    },

    download() {
        const ttl = document.getElementById('tt-output').textContent;
        const host = document.getElementById('tt-host').value || 'macro';
        const blob = new Blob([ttl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `connect_${host}.ttl`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

window.TeraTermMacroGen = TeraTermMacroGen;
