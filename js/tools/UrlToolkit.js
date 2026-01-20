/**
 * OpsMate - URL Toolkit (Parse & Build)
 */

const UrlToolkit = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'url-toolkit',
            title: 'URL解析・構築ツールの使い方',
            description: '複雑なクエリパラメータを持つURLを分解し、要素ごとに編集ができます。APIのリクエストテストや、特定のパラメータの値を書き換えて再構築する際に役立ちます。',
            steps: [
                '解析したいURLを入力欄に入力し、「解析」をクリックします',
                'ホスト、パス、パラメータが表形式で表示されます',
                'パラメータの値を編集したり、新しいパラメータを追加できます',
                '「URLを再構築」をクリックすると、現在の値からURLが生成されます'
            ],
            tips: [
                'URLエンコード/デコードは自動的に処理されます',
                'ハッシュ（#以降のフラグメント）の編集にも対応しています',
                'よく使うAPIエンドポイントのテンプレート作成にも便利です'
            ],
            example: {
                title: '解析例',
                code: 'https://example.com/api?id=123&q=test\n-> id: 123, q: test に分解して表示'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="link" class="w-5 h-5"></i>
                            URL解析
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">解析するURL</label>
                        <div class="input-group">
                            <input type="text" id="url-input" class="form-input" placeholder="https://example.com/path?q=value">
                            <button class="btn btn-primary" id="url-parse-btn">解析</button>
                        </div>
                    </div>
                </div>

                <div id="url-details" style="display: none;">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title">構成要素</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group mb-0">
                                <label class="form-label">Protocol</label>
                                <input type="text" id="url-protocol" class="form-input">
                            </div>
                            <div class="form-group mb-0">
                                <label class="form-label">Hostname</label>
                                <input type="text" id="url-host" class="form-input">
                            </div>
                            <div class="form-group mb-0">
                                <label class="form-label">Path</label>
                                <input type="text" id="url-path" class="form-input">
                            </div>
                            <div class="form-group mb-0">
                                <label class="form-label">Port</label>
                                <input type="text" id="url-port" class="form-input">
                            </div>
                        </div>
                    </div>

                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title">クエリパラメータ</h2>
                            <button class="btn btn-secondary btn-sm" id="url-add-param">
                                <i data-lucide="plus" class="w-4 h-4"></i> パラメータ追加
                            </button>
                        </div>
                        
                        <div id="url-params-container" class="space-y-2 mt-4">
                            <!-- パラメータリスト -->
                        </div>
                    </div>

                    <div class="panel-card">
                         <div class="panel-header">
                            <h2 class="panel-title">再構築結果</h2>
                            <button class="btn btn-primary btn-sm" id="url-build-btn">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i> URLを再構築
                            </button>
                        </div>
                        <div class="form-group mt-4">
                            <div class="input-group">
                                <textarea id="url-output" class="form-textarea code-textarea" rows="3" readonly></textarea>
                                <button class="btn btn-secondary" id="url-copy-btn" style="height: auto;">
                                    <i data-lucide="copy" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const parseBtn = document.getElementById('url-parse-btn');
        const buildBtn = document.getElementById('url-build-btn');
        const addBtn = document.getElementById('url-add-param');
        const copyBtn = document.getElementById('url-copy-btn');

        if (parseBtn) parseBtn.addEventListener('click', () => this.parse());
        if (buildBtn) buildBtn.addEventListener('click', () => this.build());
        if (addBtn) addBtn.addEventListener('click', () => this.addParam('', ''));
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const out = document.getElementById('url-output').value;
                OpsMateHelpers.copyToClipboard(out, copyBtn);
            });
        }
    },

    parse() {
        const urlStr = document.getElementById('url-input').value.trim();
        if (!urlStr) return;

        try {
            const url = new URL(urlStr.startsWith('http') ? urlStr : 'http://' + urlStr);

            document.getElementById('url-protocol').value = url.protocol;
            document.getElementById('url-host').value = url.hostname;
            document.getElementById('url-path').value = url.pathname;
            document.getElementById('url-port').value = url.port;

            const container = document.getElementById('url-params-container');
            container.innerHTML = '';

            url.searchParams.forEach((value, key) => {
                this.addParam(key, value);
            });

            document.getElementById('url-details').style.display = 'block';
            document.getElementById('url-details').scrollIntoView({ behavior: 'smooth' });

            this.build(); // Initial build

        } catch (e) {
            OpsMateHelpers.showToast('有効なURLを入力してください', 'error');
        }
    },

    addParam(key, value) {
        const container = document.getElementById('url-params-container');
        const row = document.createElement('div');
        row.className = 'grid grid-cols-[1fr,1.5fr,auto] gap-2 items-center';
        row.innerHTML = `
            <input type="text" class="form-input param-key" value="${key}" placeholder="Key">
            <input type="text" class="form-input param-value" value="${value}" placeholder="Value">
            <button class="btn btn-icon text-error hover:bg-error/10" onclick="this.parentElement.remove(); UrlToolkit.build();">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        container.appendChild(row);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    build() {
        try {
            const protocol = document.getElementById('url-protocol').value || 'https:';
            const host = document.getElementById('url-host').value;
            const path = document.getElementById('url-path').value || '/';
            const port = document.getElementById('url-port').value;

            if (!host) {
                OpsMateHelpers.showToast('ホスト名が必要です', 'error');
                return;
            }

            let url = protocol + '//' + host;
            if (port) url += ':' + port;
            url += path;

            const searchParams = new URLSearchParams();
            const keys = document.querySelectorAll('.param-key');
            const values = document.querySelectorAll('.param-value');

            keys.forEach((keyEl, i) => {
                const k = keyEl.value.trim();
                if (k) {
                    searchParams.append(k, values[i].value);
                }
            });

            const query = searchParams.toString();
            if (query) url += '?' + query;

            document.getElementById('url-output').value = url;
        } catch (e) {
            OpsMateHelpers.showToast('構築エラー: ' + e.message, 'error');
        }
    }
};

window.UrlToolkit = UrlToolkit;
