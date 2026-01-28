/**
 * OpsMate - Windows Admin Shortcuts Generator
 */

const WinAdminShortcuts = {
    tools: [
        { id: 'eventvwr', name: 'Event Viewer', cmd: 'eventvwr.msc', desc: 'イベントログの確認' },
        { id: 'secpol', name: 'Local Security Policy', cmd: 'secpol.msc', desc: 'セキュリティポリシー設定' },
        { id: 'compmgmt', name: 'Computer Management', cmd: 'compmgmt.msc', desc: 'システム管理全般' },
        { id: 'services', name: 'Services', cmd: 'services.msc', desc: 'バックグラウンドサービス管理' },
        { id: 'taskschd', name: 'Task Scheduler', cmd: 'taskschd.msc', desc: '定期実行タスク管理' },
        { id: 'perfmon', name: 'Performance Monitor', cmd: 'perfmon.msc', desc: 'パフォーマンス監視' },
        { id: 'gpedit', name: 'Group Policy Editor', cmd: 'gpedit.msc', desc: 'グループポリシーエディタ (Pro以上)' },
        { id: 'regedit', name: 'Registry Editor', cmd: 'regedit.exe', desc: 'レジストリエディタ' },
        { id: 'wf', name: 'Windows Firewall', cmd: 'wf.msc', desc: 'ファイアウォール詳細設定' },
        { id: 'msinfo32', name: 'System Information', cmd: 'msinfo32.exe', desc: 'システム詳細情報' },
        { id: 'resmon', name: 'Resource Monitor', cmd: 'resmon.exe', desc: 'リソース使用状況モニター' },
        { id: 'taskmgr', name: 'Task Manager', cmd: 'taskmgr.exe', desc: 'タスクマネージャー' },
        { id: 'control', name: 'Control Panel', cmd: 'control.exe', desc: 'コントロールパネル' },
        { id: 'devmgmt', name: 'Device Manager', cmd: 'devmgmt.msc', desc: 'デバイスマネージャー' },
        { id: 'diskmgmt', name: 'Disk Management', cmd: 'diskmgmt.msc', desc: 'ディスク管理' },
        { id: 'ncpa', name: 'Network Connections', cmd: 'ncpa.cpl', desc: 'ネットワーク接続設定' }
    ],

    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="command" class="w-5 h-5"></i>
                            Windows管理ショートカット作成
                        </h2>
                    </div>
                    <div class="p-4">
                        <p class="text-[var(--text-secondary)] mb-4">
                            選択した管理ツールのショートカットを一括作成するバッチファイルを生成します。<br>
                            作成されたバッチファイルを実行すると、デスクトップに「AdminTools」フォルダが作成され、その中にショートカットが配置されます。
                        </p>
                        
                        <div class="flex gap-2 mb-4">
                            <button id="was-select-all" class="btn btn-sm btn-ghost">全選択</button>
                            <button id="was-deselect-all" class="btn btn-sm btn-ghost">全解除</button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" id="was-tool-list">
                            ${this.tools.map(tool => `
                                <label class="flex items-start p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                                    <input type="checkbox" class="form-checkbox mt-1 mr-3 was-checkbox" value="${tool.id}" checked>
                                    <div>
                                        <div class="font-medium text-[var(--text-primary)]">${tool.name}</div>
                                        <div class="text-xs text-[var(--text-muted)]">${tool.desc}</div>
                                        <div class="text-xs text-[var(--text-muted)] font-mono mt-1 opacity-75">${tool.cmd}</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>

                        <div class="mt-6 flex justify-end">
                            <button id="was-download-btn" class="btn btn-primary">
                                <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                                ショートカット生成バッチをダウンロード
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Event Listeners
        const selectAllBtn = document.getElementById('was-select-all');
        const deselectAllBtn = document.getElementById('was-deselect-all');
        const downloadBtn = document.getElementById('was-download-btn');

        if (selectAllBtn) selectAllBtn.addEventListener('click', () => this.toggleAll(true));
        if (deselectAllBtn) deselectAllBtn.addEventListener('click', () => this.toggleAll(false));
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadBatch());
    },

    toggleAll(checked) {
        document.querySelectorAll('.was-checkbox').forEach(cb => cb.checked = checked);
    },

    downloadBatch() {
        const selectedIds = Array.from(document.querySelectorAll('.was-checkbox:checked')).map(cb => cb.value);

        if (selectedIds.length === 0) {
            OpsMateHelpers.showToast('ツールが選択されていません', 'error');
            return;
        }

        const selectedTools = this.tools.filter(t => selectedIds.includes(t.id));
        const batchContent = this.generateBatchContent(selectedTools);

        OpsMateHelpers.downloadFile('create_admin_shortcuts.bat', batchContent);
        OpsMateHelpers.showToast(`${selectedTools.length} 個のショートカット作成バッチをダウンロードしました`);
    },

    generateBatchContent(tools) {
        let content = `@echo off\r\n`;
        content += `chcp 65001 > nul\r\n`;
        content += `set "DEST=%USERPROFILE%\\Desktop\\AdminTools"\r\n`;
        content += `if not exist "%DEST%" mkdir "%DEST%"\r\n\r\n`;
        content += `echo Use PowerShell to create shortcuts...\r\n\r\n`;

        tools.forEach(tool => {
            const linkName = `${tool.name}.lnk`;
            // PowerShell command to create shortcut
            const psCmd = `$s=(New-Object -COM WScript.Shell).CreateShortcut('${"%DEST%"}\\${linkName}');$s.TargetPath='${tool.cmd}';$s.Save()`;
            content += `echo Creating: ${tool.name}...\r\n`;
            content += `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"\r\n`;
        });

        content += `\r\necho.\r\n`;
        content += `echo ---------------------------------------------------\r\n`;
        content += `echo Shortcuts have been created in: %DEST%\r\n`;
        content += `echo ---------------------------------------------------\r\n`;
        content += `pause\r\n`;

        return content;
    }
};

window.WinAdminShortcuts = WinAdminShortcuts;
