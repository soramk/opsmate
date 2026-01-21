/**
 * OpsMate - Quick Note / Scratch Pad
 */

const QuickNote = {
    storageKey: 'opsmate_quicknote',

    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'quick-note',
            title: 'クイックメモの使い方',
            description: '作業中のメモやログの一時保存に使えるスクラッチパッドです。',
            steps: [
                'テキストエリアに自由にメモを記入します',
                '内容は自動的にブラウザに保存されます',
                'タブを複数作成して整理できます'
            ],
            tips: [
                'ブラウザを閉じても内容は保持されます',
                '重要なメモは別途バックアップしてください',
                'Markdownプレビュー機能もあります'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="sticky-note" class="w-5 h-5"></i>
                            クイックメモ
                        </h2>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="note-add-tab">
                                <i data-lucide="plus" class="w-4 h-4"></i> タブ追加
                            </button>
                            <button class="btn btn-secondary btn-sm" id="note-export">
                                <i data-lucide="download" class="w-4 h-4"></i> エクスポート
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex gap-2 mb-4 overflow-x-auto pb-2" id="note-tabs"></div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="form-group">
                            <div class="flex justify-between items-center mb-2">
                                <label class="form-label mb-0">メモ</label>
                                <span class="text-xs text-slate-500" id="note-chars">0 文字</span>
                            </div>
                            <textarea id="note-content" class="form-textarea font-mono text-sm" rows="20" placeholder="ここにメモを入力..."></textarea>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <label class="form-label mb-0">プレビュー (Markdown)</label>
                                <button class="btn btn-secondary btn-xs" id="note-copy-md" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('note-content').value)">
                                    <i data-lucide="copy" class="w-3 h-3"></i> コピー
                                </button>
                            </div>
                            <div id="note-preview" class="bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-auto prose prose-invert prose-sm max-w-none" style="min-height: 400px;"></div>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    tabs: [],
    currentTab: 0,

    init() {
        this.loadData();
        this.renderTabs();

        document.getElementById('note-content').addEventListener('input', () => {
            this.saveCurrentTab();
            this.updatePreview();
            this.updateCharCount();
        });

        document.getElementById('note-add-tab').addEventListener('click', () => this.addTab());
        document.getElementById('note-export').addEventListener('click', () => this.exportAll());

        this.loadCurrentTab();
        this.updatePreview();
        this.updateCharCount();
    },

    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.tabs = parsed.tabs || [{ name: 'メモ 1', content: '' }];
                this.currentTab = parsed.currentTab || 0;
            } else {
                this.tabs = [{ name: 'メモ 1', content: '' }];
            }
        } catch (e) {
            this.tabs = [{ name: 'メモ 1', content: '' }];
        }
    },

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify({
            tabs: this.tabs,
            currentTab: this.currentTab
        }));
    },

    renderTabs() {
        const container = document.getElementById('note-tabs');
        container.innerHTML = this.tabs.map((tab, i) => `
            <div class="flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${i === this.currentTab ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}" data-tab="${i}">
                <span class="text-sm whitespace-nowrap">${tab.name}</span>
                ${this.tabs.length > 1 ? `<button class="ml-1 text-slate-500 hover:text-rose-400" data-delete="${i}"><i data-lucide="x" class="w-3 h-3"></i></button>` : ''}
            </div>
        `).join('');

        lucide.createIcons();

        container.querySelectorAll('[data-tab]').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('[data-delete]')) return;
                this.switchTab(parseInt(el.dataset.tab));
            });
        });

        container.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTab(parseInt(btn.dataset.delete));
            });
        });
    },

    switchTab(index) {
        this.saveCurrentTab();
        this.currentTab = index;
        this.saveData();
        this.renderTabs();
        this.loadCurrentTab();
        this.updatePreview();
        this.updateCharCount();
    },

    loadCurrentTab() {
        const tab = this.tabs[this.currentTab];
        document.getElementById('note-content').value = tab?.content || '';
    },

    saveCurrentTab() {
        const content = document.getElementById('note-content').value;
        if (this.tabs[this.currentTab]) {
            this.tabs[this.currentTab].content = content;
            this.saveData();
        }
    },

    addTab() {
        const name = `メモ ${this.tabs.length + 1}`;
        this.tabs.push({ name, content: '' });
        this.currentTab = this.tabs.length - 1;
        this.saveData();
        this.renderTabs();
        this.loadCurrentTab();
        this.updatePreview();
        this.updateCharCount();
    },

    deleteTab(index) {
        if (this.tabs.length <= 1) return;
        if (!confirm(`「${this.tabs[index].name}」を削除しますか？`)) return;

        this.tabs.splice(index, 1);
        if (this.currentTab >= this.tabs.length) {
            this.currentTab = this.tabs.length - 1;
        }
        this.saveData();
        this.renderTabs();
        this.loadCurrentTab();
        this.updatePreview();
        this.updateCharCount();
    },

    updateCharCount() {
        const content = document.getElementById('note-content').value;
        document.getElementById('note-chars').textContent = `${content.length.toLocaleString()} 文字`;
    },

    updatePreview() {
        const content = document.getElementById('note-content').value;
        const preview = document.getElementById('note-preview');

        // Simple Markdown-like rendering
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-slate-200 mt-4 mb-2">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-100 mt-4 mb-2">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-emerald-400">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="bg-slate-800 px-1 rounded text-amber-400">$1</code>')
            .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>')
            .replace(/\n/g, '<br>');

        preview.innerHTML = html || '<span class="text-slate-600">プレビューがここに表示されます</span>';
    },

    exportAll() {
        let content = '';
        this.tabs.forEach((tab, i) => {
            content += `=== ${tab.name} ===\n\n${tab.content}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opsmate-notes-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        OpsMateHelpers.showToast('メモをエクスポートしました', 'success');
    }
};

window.QuickNote = QuickNote;
