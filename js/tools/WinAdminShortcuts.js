/**
 * OpsMate - Windows Admin Shortcuts Generator
 */

const WinAdminShortcuts = {
    // Categorized tools definition
    categories: [
        {
            id: 'management',
            title: '管理ツール (MSC)',
            items: [
                { id: 'compmgmt', name: 'Computer Management', cmd: 'compmgmt.msc', desc: 'システム管理全般' },
                { id: 'services', name: 'Services', cmd: 'services.msc', desc: 'バックグラウンドサービス管理' },
                { id: 'eventvwr', name: 'Event Viewer', cmd: 'eventvwr.msc', desc: 'イベントログの確認' },
                { id: 'taskschd', name: 'Task Scheduler', cmd: 'taskschd.msc', desc: '定期実行タスク管理' },
                { id: 'devmgmt', name: 'Device Manager', cmd: 'devmgmt.msc', desc: 'デバイスマネージャー' },
                { id: 'diskmgmt', name: 'Disk Management', cmd: 'diskmgmt.msc', desc: 'ディスク管理' },
                { id: 'perfmon', name: 'Performance Monitor', cmd: 'perfmon.msc', desc: 'パフォーマンス監視' },
                { id: 'wf', name: 'Windows Firewall', cmd: 'wf.msc', desc: 'ファイアウォール詳細設定' },
                { id: 'secpol', name: 'Local Security Policy', cmd: 'secpol.msc', desc: 'セキュリティポリシー設定' },
                { id: 'gpedit', name: 'Group Policy Editor', cmd: 'gpedit.msc', desc: 'グループポリシーエディタ (Pro以上)' }
            ]
        },
        {
            id: 'system',
            title: 'システム・ユーティリティ',
            items: [
                { id: 'control', name: 'Control Panel', cmd: 'control.exe', desc: 'コントロールパネル' },
                { id: 'taskmgr', name: 'Task Manager', cmd: 'taskmgr.exe', desc: 'タスクマネージャー' },
                { id: 'regedit', name: 'Registry Editor', cmd: 'regedit.exe', desc: 'レジストリエディタ' },
                { id: 'msinfo32', name: 'System Information', cmd: 'msinfo32.exe', desc: 'システム詳細情報' },
                { id: 'resmon', name: 'Resource Monitor', cmd: 'resmon.exe', desc: 'リソース使用状況モニター' },
                { id: 'msconfig', name: 'System Configuration', cmd: 'msconfig.exe', desc: 'システム構成' },
                { id: 'cmd', name: 'Command Prompt', cmd: 'cmd.exe', desc: 'コマンドプロンプト' },
                { id: 'powershell', name: 'PowerShell', cmd: 'powershell.exe', desc: 'PowerShell' },
                { id: 'mstsc', name: 'Remote Desktop', cmd: 'mstsc.exe', desc: 'リモートデスクトップ接続' },
                { id: 'ncpa', name: 'Network Connections', cmd: 'ncpa.cpl', desc: 'ネットワーク接続設定' }
            ]
        },
        {
            id: 'settings',
            title: 'Windows設定 (ms-settings)',
            items: [
                { id: 'settings-all', name: 'All Settings', cmd: 'explorer.exe', args: 'ms-settings:', desc: '設定アプリのトップ' },
                { id: 'settings-update', name: 'Windows Update', cmd: 'explorer.exe', args: 'ms-settings:windowsupdate', desc: '更新プログラムの確認' },
                { id: 'settings-apps', name: 'Apps & Features', cmd: 'explorer.exe', args: 'ms-settings:appsfeatures', desc: 'アプリと機能' },
                { id: 'settings-network', name: 'Network Status', cmd: 'explorer.exe', args: 'ms-settings:network-status', desc: 'ネットワークの状態' },
                { id: 'settings-display', name: 'Display', cmd: 'explorer.exe', args: 'ms-settings:display', desc: 'ディスプレイ設定' },
                { id: 'settings-sound', name: 'Sound', cmd: 'explorer.exe', args: 'ms-settings:sound', desc: 'サウンド設定' },
                { id: 'settings-notifications', name: 'Notifications', cmd: 'explorer.exe', args: 'ms-settings:notifications', desc: '通知とアクション' },
                { id: 'settings-power', name: 'Power & Sleep', cmd: 'explorer.exe', args: 'ms-settings:powersleep', desc: '電源とスリープ' },
                { id: 'settings-storage', name: 'Storage', cmd: 'explorer.exe', args: 'ms-settings:storagesense', desc: 'ストレージ設定' },
                { id: 'settings-privacy', name: 'Privacy', cmd: 'explorer.exe', args: 'ms-settings:privacy', desc: 'プライバシー設定' },
                { id: 'settings-about', name: 'About PC', cmd: 'explorer.exe', args: 'ms-settings:about', desc: 'バージョン情報' }
            ]
        }
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

                        <div id="was-tool-list" class="space-y-6">
                            ${this.categories.map(cat => `
                                <div>
                                    <h3 class="text-sm font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border-color)] pb-2 flex items-center">
                                        <i data-lucide="folder-open" class="w-4 h-4 mr-2"></i>
                                        ${cat.title}
                                    </h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        ${cat.items.map(tool => `
                                            <label class="flex items-start p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                                                <input type="checkbox" class="form-checkbox mt-1 mr-3 was-checkbox" value="${tool.id}" checked>
                                                <div class="min-w-0">
                                                    <div class="font-medium text-[var(--text-primary)] truncate">${tool.name}</div>
                                                    <div class="text-xs text-[var(--text-muted)] truncate">${tool.desc}</div>
                                                    <div class="text-xs text-[var(--text-muted)] font-mono mt-1 opacity-75 truncate" title="${tool.cmd} ${tool.args || ''}">
                                                        ${tool.cmd} ${tool.args || ''}
                                                    </div>
                                                </div>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
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

        // Re-initialize icons since we added headers
        lucide.createIcons();
    },

    toggleAll(checked) {
        document.querySelectorAll('.was-checkbox').forEach(cb => cb.checked = checked);
    },

    getAllTools() {
        return this.categories.flatMap(cat => cat.items);
    },

    downloadBatch() {
        const selectedIds = Array.from(document.querySelectorAll('.was-checkbox:checked')).map(cb => cb.value);

        if (selectedIds.length === 0) {
            OpsMateHelpers.showToast('ツールが選択されていません', 'error');
            return;
        }

        const allTools = this.getAllTools();
        const selectedTools = allTools.filter(t => selectedIds.includes(t.id));
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
            const args = tool.args ? `$s.Arguments='${tool.args}';` : '';

            // PowerShell command to create shortcut
            // Note: We need to handle single quotes in commands if any (though currently none have them)
            const psCmd = `$s=(New-Object -COM WScript.Shell).CreateShortcut('${"%DEST%"}\\${linkName}');$s.TargetPath='${tool.cmd}';${args}$s.Save()`;

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
