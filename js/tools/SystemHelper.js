/**
 * OpsMate - System & Process Helper
 */

const SystemHelper = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'sys-helper',
            title: 'システム・プロセス管理ツールの使い方',
            description: 'サービスの起動停止、プロセスの強制終了、システム情報の確認など、WindowsとLinuxの管理コマンドを生成します。',
            steps: [
                'OS（Windows / Linux）を選択します',
                'カテゴリ（サービス管理、プロセス、ログ等）を選択します',
                '必要なパラメータを入力して、コマンドを生成します'
            ],
            tips: [
                'Linuxの systemctl では、`enable --now` を使うことで「自動起動設定と即時起動」を同時に行えます',
                'Windowsの `sc.exe` はリモートサーバーに対しても使用可能です (`sc \\\\ServerName ...`)',
                '高負荷プロセスの特定には Linuxの `top -b -n 1` や Windowsの `tasklist /v` が便利です'
            ],
            example: {
                title: '活用例',
                code: 'systemctl restart nginx && systemctl status nginx'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="cpu" class="w-5 h-5"></i>
                            System & Process Helper
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div class="form-group">
                            <label class="form-label">ターゲット OS</label>
                            <select id="sh-os" class="form-select">
                                <option value="linux">Linux (Ubuntu/RHEL/CentOS)</option>
                                <option value="windows">Windows (Cmd/PowerShell)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">操作カテゴリ</label>
                            <select id="sh-cat" class="form-select">
                                <option value="service">サービス管理 (Start/Stop/Restart)</option>
                                <option value="process">プロセス管理 (List/Kill)</option>
                                <option value="system">システム情報 (Resource/Info)</option>
                                <option value="disk">ディスク・ファイルシステム (du/df)</option>
                            </select>
                        </div>
                    </div>

                    <div id="sh-params-container" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <!-- Dynamic params -->
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                             <i data-lucide="terminal" class="w-5 h-5"></i>
                            Admin Command
                        </h2>
                        <button class="btn btn-secondary btn-sm" id="sh-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div id="sh-output" class="code-output p-4 rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center">
                        systemctl status nginx
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const ids = ['sh-os', 'sh-cat'];
        ids.forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.renderParams());
        });

        document.getElementById('sh-copy-btn').addEventListener('click', () => {
            const out = document.getElementById('sh-output').innerText;
            OpsMateHelpers.copyToClipboard(out, document.getElementById('sh-copy-btn'));
        });

        this.renderParams();
    },

    renderParams() {
        const os = document.getElementById('sh-os').value;
        const cat = document.getElementById('sh-cat').value;
        const container = document.getElementById('sh-params-container');
        let html = '';

        if (cat === 'service') {
            html = `
                <div class="form-group">
                    <label class="form-label">サービス名</label>
                    <input type="text" id="sh-name" class="form-input" value="nginx" placeholder="nginx, apache2, wuauserv等">
                </div>
                <div class="form-group">
                    <label class="form-label">アクション</label>
                    <select id="sh-act" class="form-select">
                        <option value="status">状態確認 (Status)</option>
                        <option value="start">起動 (Start)</option>
                        <option value="stop">停止 (Stop)</option>
                        <option value="restart">再起動 (Restart)</option>
                        <option value="enable">自動起動有効 (Enable)</option>
                    </select>
                </div>
            `;
        } else if (cat === 'process') {
            html = `
                <div class="form-group">
                    <label class="form-label">プロセス名 / PID</label>
                    <input type="text" id="sh-name" class="form-input" value="java" placeholder="java, python3, PIDなど">
                </div>
                <div class="form-group">
                    <label class="form-label">アクション</label>
                    <select id="sh-act" class="form-select">
                        <option value="list">特定プロセスのリスト</option>
                        <option value="kill">強制終了 (Kill/Terminate)</option>
                    </select>
                </div>
            `;
        } else {
            html = `<div class="col-span-2 text-sm text-slate-500">このカテゴリは追加のパラメータなしで利用可能です。</div>`;
        }

        container.innerHTML = html;
        container.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => this.generate());
            el.addEventListener('change', () => this.generate());
        });

        this.generate();
    },

    generate() {
        const os = document.getElementById('sh-os').value;
        const cat = document.getElementById('sh-cat').value;
        const output = document.getElementById('sh-output');
        let cmd = '';

        const name = document.getElementById('sh-name')?.value || '';
        const act = document.getElementById('sh-act')?.value || '';

        if (os === 'linux') {
            if (cat === 'service') {
                cmd = `systemctl ${act} ${name}`;
            } else if (cat === 'process') {
                cmd = act === 'list' ? `ps aux | grep ${name}` : `kill -9 $(pgrep ${name})`;
            } else if (cat === 'system') {
                cmd = `uname -a; uptime; free -h`;
            } else if (cat === 'disk') {
                cmd = `df -h; du -sh * | sort -hr`;
            }
        } else {
            if (cat === 'service') {
                if (act === 'status') cmd = `sc.exe query "${name}"`;
                else cmd = `net ${act} "${name}"`;
            } else if (cat === 'process') {
                cmd = act === 'list' ? `tasklist /v | findstr /i "${name}"` : `taskkill /f /im "${name}.exe"`;
            } else if (cat === 'system') {
                cmd = `systeminfo | findstr /B /C:"OS Name" /C:"OS Version"`;
            } else if (cat === 'disk') {
                cmd = `wmic logicaldisk get size,freespace,caption`;
            }
        }

        output.innerText = cmd;
    }
};

window.SystemHelper = SystemHelper;
