/**
 * OpsMate - Permission Wizard (chmod & icacls)
 */

const PermissionWizard = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'perm-wizard',
            title: 'パーミッション・ウィザードの使い方',
            description: 'Linuxの chmod (数値/符号) と Windowsの icacls コマンドを、チェックボックスによる権限選択で生成します。',
            steps: [
                'OSタイプ（Linux / Windows）を選択します',
                '対象とするユーザー（Owner/Group/Others または User名）に対して権限を選択します',
                '生成されたコマンドをコピーして実行します'
            ],
            tips: [
                'Linuxでは、ディレクトリに対しては「実行(x)」権限がないと中に入ることができません',
                'Windowsの icacls では、継承(Inheritance)の設定も重要です',
                'GUIで設定するよりも、コマンドで一括処理する方が確実で再現性があります'
            ],
            example: {
                title: 'Linux rwxr-xr-x',
                code: 'chmod 755 filename'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="shield" class="w-5 h-5"></i>
                            Permission Wizard
                        </h2>
                    </div>
                    
                    <div class="form-group mb-6">
                        <label class="form-label">ターゲット OS</label>
                        <div class="flex space-x-4">
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="perm-os" value="linux" class="form-radio mr-2" checked>
                                <span>Linux (chmod)</span>
                            </label>
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="perm-os" value="windows" class="form-radio mr-2">
                                <span>Windows (icacls)</span>
                            </label>
                        </div>
                    </div>

                    <div id="perm-linux-group" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${this.renderLinuxGroup('Owner (User)', 'u')}
                        ${this.renderLinuxGroup('Group', 'g')}
                        ${this.renderLinuxGroup('Others', 'o')}
                    </div>

                    <div id="perm-win-group" class="space-y-4 hidden">
                        <div class="form-group">
                            <label class="form-label">対象ユーザー・グループ名</label>
                            <input type="text" id="perm-win-user" class="form-input" value="Everyone" placeholder="Administrators, Users等">
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            ${this.renderWinCheck('Full Control (F)', 'F')}
                            ${this.renderWinCheck('Modify (M)', 'M')}
                            ${this.renderWinCheck('Read & Execute (RX)', 'RX')}
                            ${this.renderWinCheck('Read (R)', 'R')}
                            ${this.renderWinCheck('Write (W)', 'W')}
                        </div>
                    </div>

                    <div class="form-group mt-6">
                        <label class="form-label">対象パス</label>
                        <input type="text" id="perm-path" class="form-input" value="/path/to/file" placeholder="C:\\path\\to\\file">
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-[var(--accent-primary)]">
                             <i data-lucide="terminal" class="w-5 h-5"></i>
                            Generated Command
                        </h2>
                        <button class="btn btn-secondary btn-sm" id="perm-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div id="perm-output" class="code-output p-4 rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center">
                        chmod 644 /path/to/file
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    renderLinuxGroup(title, prefix) {
        return `
            <div class="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                <div class="text-sm font-semibold text-[var(--text-secondary)] mb-3">${title}</div>
                <div class="space-y-2">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" class="linux-bit mr-2 h-4 w-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)]" data-prefix="${prefix}" data-val="4" ${prefix === 'u' ? 'checked' : ''}>
                        <span class="text-sm text-[var(--text-primary)]">Read (r)</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" class="linux-bit mr-2 h-4 w-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)]" data-prefix="${prefix}" data-val="2" ${prefix === 'u' ? 'checked' : ''}>
                        <span class="text-sm text-[var(--text-primary)]">Write (w)</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" class="linux-bit mr-2 h-4 w-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)]" data-prefix="${prefix}" data-val="1">
                        <span class="text-sm text-[var(--text-primary)]">Execute (x)</span>
                    </label>
                </div>
            </div>
        `;
    },

    renderWinCheck(label, code) {
        return `
             <label class="flex items-center p-2 rounded border border-[var(--border-color)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                <input type="checkbox" class="win-perm mr-2 h-4 w-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)]" data-code="${code}" ${code === 'R' ? 'checked' : ''}>
                <span class="text-xs text-[var(--text-primary)]">${label}</span>
            </label>
        `;
    },

    init() {
        const osRadios = document.getElementsByName('perm-os');
        osRadios.forEach(r => r.addEventListener('change', (e) => {
            const isLinux = e.target.value === 'linux';
            document.getElementById('perm-linux-group').classList.toggle('hidden', !isLinux);
            document.getElementById('perm-win-group').classList.toggle('hidden', isLinux);
            this.generate();
        }));

        document.querySelectorAll('.linux-bit, .win-perm').forEach(el => {
            el.addEventListener('change', () => this.generate());
        });

        document.getElementById('perm-win-user').addEventListener('input', () => this.generate());
        document.getElementById('perm-path').addEventListener('input', () => this.generate());

        document.getElementById('perm-copy-btn').addEventListener('click', () => {
            const out = document.getElementById('perm-output').innerText;
            OpsMateHelpers.copyToClipboard(out, document.getElementById('perm-copy-btn'));
        });

        this.generate();
    },

    generate() {
        const os = document.querySelector('input[name="perm-os"]:checked').value;
        const path = document.getElementById('perm-path').value || 'file';
        const output = document.getElementById('perm-output');
        let cmd = '';

        if (os === 'linux') {
            const bits = { u: 0, g: 0, o: 0 };
            document.querySelectorAll('.linux-bit:checked').forEach(cb => {
                bits[cb.dataset.prefix] += parseInt(cb.dataset.val);
            });
            cmd = `chmod ${bits.u}${bits.g}${bits.o} ${path}`;
        } else {
            const user = document.getElementById('perm-win-user').value || 'Everyone';
            const perms = Array.from(document.querySelectorAll('.win-perm:checked')).map(cb => cb.dataset.code);
            const permStr = perms.length > 0 ? `(${perms.join(',')})` : '';
            cmd = `icacls "${path}" /grant "${user}":${permStr}`;
        }

        output.innerText = cmd;
    }
};

window.PermissionWizard = PermissionWizard;
