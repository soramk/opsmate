/**
 * OpsMate - SSL/TLS Certificate Helper
 */

const CertTool = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'cert-tool',
            title: 'SSL/TLS 証明書ヘルパーの使い方',
            description: 'SSL証明書（PEM形式）の確認や、opensslコマンドの生成を支援します。ブラウザ単体での完全な解析は行わず、確実に作業するためのコマンド集を提供します。',
            steps: [
                '証明書（-----BEGIN CERTIFICATE-----）を貼り付けます',
                '「PEM検証」をクリックして。形式が正しいか確認します',
                '「詳細確認コマンド」セクションで、用途に合わせた openssl コマンドを生成・コピーして実行します'
            ],
            tips: [
                '証明書、秘密鍵、CSRが正しいペアかどうかを確認するコマンドも生成できます',
                '有効期限をチェックするコマンドは、Webサーバーのメンテナンスで頻繁に使用します'
            ],
            example: {
                title: '実行コマンド例',
                code: 'openssl x509 -in cert.pem -text -noout'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="lock" class="w-5 h-5"></i>
                            PEMデータ入力
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">証明書 / CSR / 秘密鍵 (PEM形式)</label>
                        <textarea id="cert-input" class="form-textarea code-textarea" rows="10" placeholder="-----BEGIN CERTIFICATE-----\n..."></textarea>
                    </div>

                    <div class="flex gap-2">
                        <button class="btn btn-primary" id="cert-verify-btn">
                            <i data-lucide="check-circle" class="w-4 h-4"></i> PEM検証 (簡易)
                        </button>
                    </div>

                    <div id="cert-status" class="mt-4" style="display: none;">
                        <div class="alert" id="cert-alert">
                            <span id="cert-status-text"></span>
                        </div>
                    </div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="terminal" class="w-5 h-5"></i>
                            OpenSSL コマンド生成
                        </h2>
                    </div>

                    <div class="space-y-4">
                        <div class="cmd-box">
                            <div class="cmd-label">証明書の内容（有効期限・発行者等）を表示</div>
                            <div class="input-group">
                                <input type="text" class="form-input code-font" readonly value="openssl x509 -in cert.pem -text -noout">
                                <button class="btn btn-secondary btn-icon" onclick="OpsMateHelpers.copyToClipboard(this.previousElementSibling.value, this)">
                                    <i data-lucide="copy" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>

                        <div class="cmd-box">
                            <div class="cmd-label">CSR (証明書署名要求) の内容を表示</div>
                            <div class="input-group">
                                <input type="text" class="form-input code-font" readonly value="openssl req -in csr.pem -text -noout">
                                <button class="btn btn-secondary btn-icon" onclick="OpsMateHelpers.copyToClipboard(this.previousElementSibling.value, this)">
                                    <i data-lucide="copy" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>

                        <div class="cmd-box">
                            <div class="cmd-label">証明書と秘密鍵がペア（同一のModulus）か確認</div>
                            <div class="grid grid-cols-1 gap-2">
                                <div class="input-group">
                                    <input type="text" class="form-input code-font text-xs" readonly value="openssl x509 -noout -modulus -in cert.pem | openssl md5">
                                    <button class="btn btn-secondary btn-icon" onclick="OpsMateHelpers.copyToClipboard(this.previousElementSibling.value, this)">
                                        <i data-lucide="copy" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <div class="input-group">
                                    <input type="text" class="form-input code-font text-xs" readonly value="openssl rsa -noout -modulus -in key.pem | openssl md5">
                                    <button class="btn btn-secondary btn-icon" onclick="OpsMateHelpers.copyToClipboard(this.previousElementSibling.value, this)">
                                        <i data-lucide="copy" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="cmd-box">
                            <div class="cmd-label">秘密鍵の整合性チェック</div>
                            <div class="input-group">
                                <input type="text" class="form-input code-font" readonly value="openssl rsa -in key.pem -check">
                                <button class="btn btn-secondary btn-icon" onclick="OpsMateHelpers.copyToClipboard(this.previousElementSibling.value, this)">
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
        const verifyBtn = document.getElementById('cert-verify-btn');
        if (verifyBtn) verifyBtn.addEventListener('click', () => this.verify());
    },

    verify() {
        const input = document.getElementById('cert-input').value.trim();
        const status = document.getElementById('cert-status');
        const alert = document.getElementById('cert-alert');
        const text = document.getElementById('cert-status-text');

        if (!input) return;

        let type = '不明';
        let isValid = false;

        if (input.includes('-----BEGIN CERTIFICATE-----')) {
            type = 'SSL証明書 (Certificate)';
            isValid = input.includes('-----END CERTIFICATE-----');
        } else if (input.includes('-----BEGIN CERTIFICATE REQUEST-----')) {
            type = 'CSR (Certificate Signing Request)';
            isValid = input.includes('-----END CERTIFICATE REQUEST-----');
        } else if (input.includes('-----BEGIN RSA PRIVATE KEY-----') || input.includes('-----BEGIN PRIVATE KEY-----')) {
            type = '秘密鍵 (Private Key)';
            isValid = input.includes('-----END RSA PRIVATE KEY-----') || input.includes('-----END PRIVATE KEY-----');
        }

        status.style.display = 'block';
        if (isValid) {
            alert.className = 'alert alert-success';
            text.textContent = `検出: ${type} - 形式は正しいようです。`;
        } else {
            alert.className = 'alert alert-error';
            text.textContent = 'エラー: PEM形式が不完全か、破損しています。';
        }
    }
};

window.CertTool = CertTool;
