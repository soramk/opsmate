/**
 * OpsMate - JWT Decoder
 */

const JwtDecoder = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'jwt',
            title: 'JWTデコーダーの使い方',
            description: 'JSON Web Token (JWT) をデコードして、ヘッダーとペイロードの中身を整形表示します。署名の検証は行わず、デコードのみをブラウザ上で行います。',
            steps: [
                'デコードしたいJWT文字列をテキストエリアに貼り付けます',
                '「デコード実行」をクリックします',
                'Header（アルゴリズム等）とPayload（ユーザー情報、期限等）が表示されます'
            ],
            tips: [
                'JWTは通常 `header.payload.signature` の3部構成です',
                'Payload内の `exp` は有効期限（Unix時間）、`iat` は発行時間です',
                'デコードはすべてブラウザ上で行われ、外部に送信されません',
                '不正な形式のトークンはエラーが表示されます'
            ],
            example: {
                title: 'Payload項目の例',
                code: '"sub": "1234567890", "name": "John Doe", "admin": true, "iat": 1516239022'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="shield-check" class="w-5 h-5"></i>
                            JWT 入力
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">JWT トークン (Encoded)</label>
                        <textarea id="jwt-input" class="form-textarea code-textarea" rows="5" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>
                    </div>

                    <button class="btn btn-primary" id="jwt-decode-btn">
                        <i data-lucide="unlock" class="w-4 h-4"></i> デコード実行
                    </button>

                    <div id="jwt-error" class="error-message mt-4" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="jwt-error-text"></span>
                    </div>
                </div>

                <div id="jwt-results" style="display: none;">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title text-accent">Header (JOSE)</h2>
                        </div>
                        <pre id="jwt-header-output" class="json-output"></pre>
                    </div>

                    <div class="panel-card">
                        <div class="panel-header">
                            <h2 class="panel-title text-accent">Payload (Claims)</h2>
                        </div>
                        <div id="jwt-payload-stats" class="json-stats mb-4"></div>
                        <pre id="jwt-payload-output" class="json-output"></pre>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const decodeBtn = document.getElementById('jwt-decode-btn');
        const input = document.getElementById('jwt-input');

        if (decodeBtn) {
            decodeBtn.addEventListener('click', () => this.decode());
        }

        if (input) {
            input.addEventListener('input', () => {
                const err = document.getElementById('jwt-error');
                if (err) err.style.display = 'none';
            });
        }
    },

    decode() {
        const token = document.getElementById('jwt-input').value.trim();
        const results = document.getElementById('jwt-results');
        const error = document.getElementById('jwt-error');
        const errorText = document.getElementById('jwt-error-text');

        if (!token) {
            errorText.textContent = 'トークンを入力してください';
            error.style.display = 'flex';
            return;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            errorText.textContent = '無効なJWT形式です。3つのパーツ（.区切り）が必要です。';
            error.style.display = 'flex';
            results.style.display = 'none';
            return;
        }

        try {
            const headerJson = this.base64UrlDecode(parts[0]);
            const payloadJson = this.base64UrlDecode(parts[1]);

            const header = JSON.parse(headerJson);
            const payload = JSON.parse(payloadJson);

            document.getElementById('jwt-header-output').textContent = JSON.stringify(header, null, 2);
            document.getElementById('jwt-payload-output').textContent = JSON.stringify(payload, null, 2);

            this.renderPayloadStats(payload);

            results.style.display = 'block';
            error.style.display = 'none';
            results.scrollIntoView({ behavior: 'smooth' });

        } catch (e) {
            errorText.textContent = 'デコードに失敗しました。Base64Url形式が正しくないか、JSONとして解析できません。';
            error.style.display = 'flex';
            results.style.display = 'none';
        }
    },

    base64UrlDecode(str) {
        // Base64Url to Base64
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Pad
        while (base64.length % 4) {
            base64 += '=';
        }
        return decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    },

    renderPayloadStats(payload) {
        const stats = document.getElementById('jwt-payload-stats');
        let html = '';

        if (payload.iat) {
            const iat = new Date(payload.iat * 1000).toLocaleString();
            html += `<span><i data-lucide="clock" class="w-3 h-3 inline mr-1"></i>発行(iat): ${iat}</span>`;
        }
        if (payload.exp) {
            const exp = new Date(payload.exp * 1000);
            const now = new Date();
            const isExpired = exp < now;
            const expStr = exp.toLocaleString();
            html += `<span class="${isExpired ? 'text-error' : 'text-success'}">
                        <i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>期限(exp): ${expStr} ${isExpired ? '(期限切れ)' : ''}
                    </span>`;
        }

        stats.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

window.JwtDecoder = JwtDecoder;
