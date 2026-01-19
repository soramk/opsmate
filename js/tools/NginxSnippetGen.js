/**
 * OpsMate - Nginx Config Snippet Generator
 */

const NginxSnippetGen = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="server" class="w-5 h-5"></i>
                            Nginx 設定スニペット生成
                        </h2>
                    </div>

                    <div class="form-group">
                        <label class="form-label">スニペット種別</label>
                        <select id="nginx-type" class="form-select">
                            <option value="reverse-proxy">リバースプロキシ (Reverse Proxy)</option>
                            <option value="static-site">静的サイト (Static Site)</option>
                            <option value="redirect">HTTP → HTTPS リダイレクト</option>
                            <option value="ssl-basic">SSL 基本設定</option>
                            <option value="gzip">Gzip 圧縮設定</option>
                            <option value="cors">CORS ヘッダー</option>
                            <option value="rate-limit">レート制限 (Rate Limiting)</option>
                        </select>
                    </div>

                    <div id="nginx-proxy-panel" class="fw-option-panel">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group mb-0">
                                <label class="form-label">ドメイン名</label>
                                <input type="text" id="nginx-domain" class="form-input" placeholder="example.com">
                            </div>
                            <div class="form-group mb-0">
                                <label class="form-label">転送先バックエンド (upstream)</label>
                                <input type="text" id="nginx-backend" class="form-input" placeholder="http://127.0.0.1:3000">
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-primary" id="nginx-generate-btn">
                        <i data-lucide="file-code" class="w-4 h-4"></i> スニペット生成
                    </button>
                </div>

                <div class="panel-card" id="nginx-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">生成された設定</h2>
                        <button class="btn btn-secondary btn-sm" id="nginx-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="nginx-output" class="json-output" style="white-space: pre-wrap;"></pre>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('nginx-generate-btn')?.addEventListener('click', () => this.generate());
        document.getElementById('nginx-copy-btn')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('nginx-output').textContent);
        });
    },

    generate() {
        const type = document.getElementById('nginx-type').value;
        const domain = document.getElementById('nginx-domain').value.trim() || 'example.com';
        const backend = document.getElementById('nginx-backend').value.trim() || 'http://127.0.0.1:3000';

        let config = '';

        switch (type) {
            case 'reverse-proxy':
                config = `server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass ${backend};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;
                break;
            case 'static-site':
                config = `server {
    listen 80;
    server_name ${domain};
    root /var/www/${domain};
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}`;
                break;
            case 'redirect':
                config = `server {
    listen 80;
    server_name ${domain};
    return 301 https://$server_name$request_uri;
}`;
                break;
            case 'ssl-basic':
                config = `# SSL settings (add inside server block)
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;`;
                break;
            case 'gzip':
                config = `# Gzip compression (add in http {} or server {})
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml;`;
                break;
            case 'cors':
                config = `# CORS headers (add in location {})
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,Content-Type,Authorization' always;

if ($request_method = 'OPTIONS') {
    return 204;
}`;
                break;
            case 'rate-limit':
                config = `# Rate Limiting
# In http {} block:
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

# In location {} block:
limit_req zone=mylimit burst=20 nodelay;`;
                break;
        }

        document.getElementById('nginx-output').textContent = config;
        document.getElementById('nginx-result-panel').style.display = 'block';
        lucide.createIcons();
    }
};

window.NginxSnippetGen = NginxSnippetGen;
