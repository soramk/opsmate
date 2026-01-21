/**
 * OpsMate - Operation Bookmarks
 */

const OpBookmarks = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'bookmarks',
            title: 'オペレーション・ブックマークの使い方',
            description: '日常的に使用する管理画面やドキュメントのURLを整理・保存します。ブラウザの localStorage に保存されるため、外部サーバーには送信されません。',
            steps: [
                '「新規ブックマーク追加」フォームにタイトルとURLを入力',
                'カテゴリを選択または新規作成して保存',
                '保存されたブックマークはカード形式で表示され、クリックで開けます',
                '不要になったブックマークはゴミ箱アイコンで削除できます'
            ],
            tips: [
                'よく使う手順書（WikiやConfluence）を登録しておくと便利です',
                'クラウドコンソール（AWS/Azure/GCP）へのリンク集として活用できます',
                'ブラウザを閉じてもデータは保持されます',
                '「エクスポート」ボタンでJSON形式でバックアップが可能です'
            ],
            example: {
                title: '活用例',
                code: 'カテゴリ: AWSコンソール, タイトル: EC2管理画面, URL: https://...'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="plus-circle" class="w-5 h-5"></i>
                            新規ブックマーク追加
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group mb-0">
                            <label class="form-label">タイトル</label>
                            <input type="text" id="bm-title" class="form-input" placeholder="例: 社員ポータル">
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">URL</label>
                            <input type="url" id="bm-url" class="form-input" placeholder="https://example.com">
                        </div>
                    </div>

                    <div class="form-group mt-4">
                        <label class="form-label">カテゴリ</label>
                        <div class="input-group">
                            <select id="bm-category-select" class="form-select">
                                <option value="全般">全般</option>
                                <option value="管理画面">管理画面</option>
                                <option value="ドキュメント">ドキュメント</option>
                                <option value="ツール">ツール</option>
                                <option value="NEW">+ 新規カテゴリ</option>
                            </select>
                            <input type="text" id="bm-category-new" class="form-input" style="display: none;" placeholder="新しいカテゴリ名">
                        </div>
                    </div>

                    <button class="btn btn-primary" id="bm-save-btn">
                        <i data-lucide="save" class="w-4 h-4"></i> 保存
                    </button>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="bookmark" class="w-5 h-5"></i>
                            保存されたブックマーク
                        </h2>
                        <div class="flex gap-2">
                             <button class="btn btn-secondary btn-sm" id="bm-import-btn">
                                <i data-lucide="upload" class="w-4 h-4"></i> インポート
                            </button>
                             <button class="btn btn-secondary btn-sm" id="bm-export-btn">
                                <i data-lucide="download" class="w-4 h-4"></i> エクスポート
                            </button>
                            <input type="file" id="bm-import-input" style="display: none;" accept=".json">
                        </div>
                    </div>

                    <div id="bm-list" class="bm-container">
                        <!-- ブックマークがここに表示されます -->
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    bookmarks: [],

    init() {
        this.loadBookmarks();
        this.renderBookmarks();

        const saveBtn = document.getElementById('bm-save-btn');
        const exportBtn = document.getElementById('bm-export-btn');
        const categorySelect = document.getElementById('bm-category-select');
        const categoryNew = document.getElementById('bm-category-new');

        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                categoryNew.style.display = categorySelect.value === 'NEW' ? 'block' : 'none';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveBookmark());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportBookmarks());
        }

        const importBtn = document.getElementById('bm-import-btn');
        const importInput = document.getElementById('bm-import-input');

        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => this.handleImport(e));
        }
    },

    loadBookmarks() {
        const saved = localStorage.getItem('opsmate-bookmarks');
        if (saved) {
            try {
                this.bookmarks = JSON.parse(saved);
            } catch (e) {
                this.bookmarks = [];
            }
        } else {
            // Default bookmarks
            this.bookmarks = [
                { id: Date.now(), title: 'Google', url: 'https://google.com', category: '全般' }
            ];
            this.saveToStorage();
        }
    },

    saveToStorage() {
        localStorage.setItem('opsmate-bookmarks', JSON.stringify(this.bookmarks));
    },

    saveBookmark() {
        const title = document.getElementById('bm-title').value.trim();
        const url = document.getElementById('bm-url').value.trim();
        let category = document.getElementById('bm-category-select').value;
        const newCat = document.getElementById('bm-category-new').value.trim();

        if (category === 'NEW') category = newCat || '未分類';
        if (!title || !url) {
            OpsMateHelpers.showToast('タイトルとURLを入力してください', 'error');
            return;
        }

        const newBookmark = {
            id: Date.now(),
            title,
            url,
            category
        };

        this.bookmarks.push(newBookmark);
        this.saveToStorage();
        this.renderBookmarks();
        this.updateCategoryOptions();

        // Clear form
        document.getElementById('bm-title').value = '';
        document.getElementById('bm-url').value = '';
        OpsMateHelpers.showToast('ブックマークを保存しました', 'success');
    },

    deleteBookmark(id) {
        this.bookmarks = this.bookmarks.filter(bm => bm.id !== id);
        this.saveToStorage();
        this.renderBookmarks();
        this.updateCategoryOptions();
    },

    renderBookmarks() {
        const listContainer = document.getElementById('bm-list');
        if (!listContainer) return;

        if (this.bookmarks.length === 0) {
            listContainer.innerHTML = '<p class="text-muted text-center py-8">ブックマークがありません</p>';
            return;
        }

        // Group by category
        const groups = {};
        this.bookmarks.forEach(bm => {
            if (!groups[bm.category]) groups[bm.category] = [];
            groups[bm.category].push(bm);
        });

        let html = '';
        for (const cat in groups) {
            html += `
                <div class="bm-section">
                    <h3 class="bm-category-title text-accent">${cat}</h3>
                    <div class="bm-grid">
                        ${groups[cat].map(bm => `
                            <div class="bm-card">
                                <a href="${bm.url}" target="_blank" rel="noopener noreferrer" class="bm-card-link">
                                    <div class="bm-card-icon">
                                        <i data-lucide="external-link" class="w-4 h-4"></i>
                                    </div>
                                    <div class="bm-card-info">
                                        <div class="bm-card-title">${bm.title}</div>
                                        <div class="bm-card-url">${bm.url}</div>
                                    </div>
                                </a>
                                <button class="bm-delete-btn" onclick="OpBookmarks.deleteBookmark(${bm.id})">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        listContainer.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    updateCategoryOptions() {
        const select = document.getElementById('bm-category-select');
        const categories = [...new Set(this.bookmarks.map(bm => bm.category))];
        const defaultCats = ['全般', '管理画面', 'ドキュメント', 'ツール'];

        const allCats = [...new Set([...defaultCats, ...categories])];

        let html = allCats.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        html += '<option value="NEW">+ 新規カテゴリ</option>';

        select.innerHTML = html;
    },

    exportBookmarks() {
        const data = JSON.stringify(this.bookmarks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opsmate_bookmarks_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported)) {
                    throw new Error('Invalid format');
                }

                // Merge bookmarks (avoid exact duplicates by URL and click ID update)
                const existingUrls = new Set(this.bookmarks.map(bm => bm.url));
                let importCount = 0;

                imported.forEach(bm => {
                    if (!existingUrls.has(bm.url)) {
                        this.bookmarks.push({
                            ...bm,
                            id: Date.now() + Math.random() // Ensure unique ID
                        });
                        importCount++;
                    }
                });

                if (importCount > 0) {
                    this.saveToStorage();
                    this.renderBookmarks();
                    this.updateCategoryOptions();
                    OpsMateHelpers.showToast(`${importCount}件のブックマークをインポートしました`, 'success');
                } else {
                    OpsMateHelpers.showToast('インポートする新しいブックマークはありませんでした', 'info');
                }
            } catch (err) {
                console.error('Import error:', err);
                OpsMateHelpers.showToast('ファイルの読み込みに失敗しました。正しいJSON形式か確認してください。', 'error');
            }
            // Reset input
            event.target.value = '';
        };
        reader.readAsText(file);
    }
};

window.OpBookmarks = OpBookmarks;
