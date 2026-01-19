/**
 * OpsMate - HTTP Status Code Reference (HTTPステータスコードリファレンス)
 */

const HttpStatusReference = {
    statusCodes: [
        // 1xx Informational
        { code: 100, name: 'Continue', category: '1xx', description: 'リクエスト継続可能' },
        { code: 101, name: 'Switching Protocols', category: '1xx', description: 'プロトコル切替' },

        // 2xx Success
        { code: 200, name: 'OK', category: '2xx', description: '成功' },
        { code: 201, name: 'Created', category: '2xx', description: 'リソース作成成功' },
        { code: 202, name: 'Accepted', category: '2xx', description: 'リクエスト受理（処理中）' },
        { code: 204, name: 'No Content', category: '2xx', description: '成功（レスポンスなし）' },
        { code: 206, name: 'Partial Content', category: '2xx', description: '部分的コンテンツ' },

        // 3xx Redirection
        { code: 301, name: 'Moved Permanently', category: '3xx', description: '恒久的リダイレクト' },
        { code: 302, name: 'Found', category: '3xx', description: '一時的リダイレクト' },
        { code: 303, name: 'See Other', category: '3xx', description: '他を参照' },
        { code: 304, name: 'Not Modified', category: '3xx', description: '未更新（キャッシュ使用）' },
        { code: 307, name: 'Temporary Redirect', category: '3xx', description: '一時的リダイレクト（メソッド保持）' },
        { code: 308, name: 'Permanent Redirect', category: '3xx', description: '恒久的リダイレクト（メソッド保持）' },

        // 4xx Client Error
        { code: 400, name: 'Bad Request', category: '4xx', description: '不正なリクエスト' },
        { code: 401, name: 'Unauthorized', category: '4xx', description: '認証が必要' },
        { code: 403, name: 'Forbidden', category: '4xx', description: 'アクセス禁止' },
        { code: 404, name: 'Not Found', category: '4xx', description: 'リソースが見つからない' },
        { code: 405, name: 'Method Not Allowed', category: '4xx', description: 'メソッド不許可' },
        { code: 408, name: 'Request Timeout', category: '4xx', description: 'リクエストタイムアウト' },
        { code: 409, name: 'Conflict', category: '4xx', description: 'リソース競合' },
        { code: 413, name: 'Payload Too Large', category: '4xx', description: 'ペイロードが大きすぎる' },
        { code: 414, name: 'URI Too Long', category: '4xx', description: 'URIが長すぎる' },
        { code: 415, name: 'Unsupported Media Type', category: '4xx', description: 'サポートされていないメディアタイプ' },
        { code: 422, name: 'Unprocessable Entity', category: '4xx', description: '処理できないエンティティ' },
        { code: 429, name: 'Too Many Requests', category: '4xx', description: 'リクエスト過多（レート制限）' },

        // 5xx Server Error
        { code: 500, name: 'Internal Server Error', category: '5xx', description: 'サーバー内部エラー' },
        { code: 501, name: 'Not Implemented', category: '5xx', description: '未実装' },
        { code: 502, name: 'Bad Gateway', category: '5xx', description: '不正なゲートウェイ' },
        { code: 503, name: 'Service Unavailable', category: '5xx', description: 'サービス利用不可' },
        { code: 504, name: 'Gateway Timeout', category: '5xx', description: 'ゲートウェイタイムアウト' },
        { code: 505, name: 'HTTP Version Not Supported', category: '5xx', description: 'HTTPバージョン非対応' }
    ],

    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="globe" class="w-5 h-5"></i>
                            HTTP ステータスコード
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="text" id="http-search" class="form-input" 
                                   placeholder="コードまたは名前で検索..." autocomplete="off">
                            <select id="http-category" class="form-select">
                                <option value="">全て</option>
                                <option value="1xx">1xx 情報 (Informational)</option>
                                <option value="2xx">2xx 成功 (Success)</option>
                                <option value="3xx">3xx リダイレクト (Redirection)</option>
                                <option value="4xx">4xx クライアントエラー (Client Error)</option>
                                <option value="5xx">5xx サーバーエラー (Server Error)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="http-cards-grid" id="http-cards"></div>
                </div>
                
                <!-- HTTP Headers Reference -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="file-text" class="w-5 h-5"></i>
                            よく使われる HTTP ヘッダー
                        </h2>
                    </div>
                    <div class="http-headers-list">
                        <div class="http-header-item">
                            <span class="http-header-name">Content-Type</span>
                            <span class="http-header-desc">レスポンスのMIMEタイプ</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">Authorization</span>
                            <span class="http-header-desc">認証情報（Bearer, Basic等）</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">Cache-Control</span>
                            <span class="http-header-desc">キャッシュ制御ディレクティブ</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">X-Forwarded-For</span>
                            <span class="http-header-desc">プロキシ経由のクライアントIP</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">Accept</span>
                            <span class="http-header-desc">受け入れ可能なMIMEタイプ</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">User-Agent</span>
                            <span class="http-header-desc">クライアント情報</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">Set-Cookie</span>
                            <span class="http-header-desc">Cookie設定</span>
                        </div>
                        <div class="http-header-item">
                            <span class="http-header-name">CORS Headers</span>
                            <span class="http-header-desc">Access-Control-Allow-*</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.renderCards(this.statusCodes);

        const search = document.getElementById('http-search');
        const category = document.getElementById('http-category');

        const filter = () => {
            const query = search.value.toLowerCase();
            const cat = category.value;

            const filtered = this.statusCodes.filter(s => {
                const matchQuery = !query ||
                    s.code.toString().includes(query) ||
                    s.name.toLowerCase().includes(query) ||
                    s.description.toLowerCase().includes(query);
                const matchCat = !cat || s.category === cat;
                return matchQuery && matchCat;
            });

            this.renderCards(filtered);
        };

        search?.addEventListener('input', filter);
        category?.addEventListener('change', filter);
    },

    renderCards(data) {
        const container = document.getElementById('http-cards');
        if (!container) return;

        const categoryColors = {
            '1xx': 'info',
            '2xx': 'success',
            '3xx': 'warning',
            '4xx': 'error',
            '5xx': 'error'
        };

        container.innerHTML = data.map(s => `
            <div class="http-status-card ${categoryColors[s.category]}">
                <div class="http-code">${s.code}</div>
                <div class="http-name">${s.name}</div>
                <div class="http-desc">${s.description}</div>
            </div>
        `).join('');
    }
};

window.HttpStatusReference = HttpStatusReference;
