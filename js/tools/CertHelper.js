/**
 * OpsMate - SSL/TLS Certificate Helper (Command Generator)
 */

const CertHelper = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'cert-helper',
            title: 'SSL/TLS 証明書ヘルパーの使い方',
            description: '証明書の確認や変換に必要な openssl コマンドを、パラメータ入力だけで正確に生成します。',
            steps: [
                '目的（サーバー証明書の確認、ファイル情報の表示など）を選択します',
                'ホスト名やポート、ファイルパスなどの詳細を入力します',
                '生成されたコマンドをワンクリックでコピーして使用します'
            ],
            tips: [
                's_client コマンドは、実際のネットワーク経路を通した証明書の正当性確認に最適です',
                '中間証明書が正しくインストールされているかの確認によく使われます',
                '有効期限（Expiry）をチェックするコマンドも生成可能です'
            ],
            example: {
                title: '活用例',
                code: 'openssl s_client -connect google.com:443 -showcerts'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="shield-check" class="w-5 h-5"></i>
                            証明書操作の選択
                        </h2>
                    </div>
                    <div class="form-group">
                        <label class="form-label">実行したい操作</label>
                        <select id="ch-action" class="form-select">
                            <optgroup label="リモートサーバー確認">
                                <option value="check-remote">サーバーの証明書を表示 (-connect)</option>
                                <option value="check-expiry">有効期限のみ表示</option>
                                <option value="check-cipher">使用可能な暗号スイートの確認</option>
                            </optgroup>
                            <optgroup label="ローカルファイル確認">
                                <option value="view-crt">証明書ファイル (.crt / .pem) の内容表示</option>
                                <option value="view-csr">CSR (証明書署名要求) の内容表示</option>
                                <option value="view-key">秘密鍵 (.key) の整合性確認</option>
                            </optgroup>
                            <optgroup label="変換">
                                <option value="conv-pfx-pem">PFX/P12 から PEM への変換</option>
                                <option value="conv-pem-pfx">PEM から PFX への変換</option>
                            </optgroup>
                        </select>
                    </div>

                    <div id="ch-params" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <!-- 動的にパラメータ入力欄が生成されます -->
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                             <i data-lucide="terminal" class="w-5 h-5"></i>
                            生成された OpenSSL コマンド
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('ch-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div id="ch-output" class="code-output p-4 rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center">
                        openssl s_client -connect example.com:443
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const actionSelect = document.getElementById('ch-action');
        if (actionSelect) {
            actionSelect.addEventListener('change', () => this.renderParams());
        }
        this.renderParams();
    },

    renderParams() {
        const action = document.getElementById('ch-action').value;
        const paramsContainer = document.getElementById('ch-params');
        let html = '';

        if (action.startsWith('check-')) {
            html = `
                <div class="form-group">
                    <label class="form-label">ホスト名 (FQDN / IP)</label>
                    <input type="text" id="ch-host" class="form-input" placeholder="example.com" value="example.com">
                </div>
                <div class="form-group">
                    <label class="form-label">ポート番号</label>
                    <input type="number" id="ch-port" class="form-input" placeholder="443" value="443">
                </div>
            `;
        } else if (action.startsWith('view-')) {
            html = `
                <div class="form-group">
                    <label class="form-label">ファイル名</label>
                    <input type="text" id="ch-file" class="form-input" placeholder="server.crt" value="server.crt">
                </div>
            `;
        } else if (action === 'conv-pfx-pem') {
            html = `
                <div class="form-group">
                    <label class="form-label">PFXファイル名</label>
                    <input type="text" id="ch-pfx" class="form-input" placeholder="cert.pfx">
                </div>
                <div class="form-group">
                    <label class="form-label">出力PEMファイル名</label>
                    <input type="text" id="ch-pem" class="form-input" placeholder="cert.pem">
                </div>
            `;
        }

        paramsContainer.innerHTML = html;

        // Add listeners to new inputs
        paramsContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.generate());
        });

        this.generate();
    },

    generate() {
        const action = document.getElementById('ch-action').value;
        const output = document.getElementById('ch-output');
        let cmd = '';

        const getVal = (id) => document.getElementById(id)?.value || '';

        switch (action) {
            case 'check-remote':
                cmd = `openssl s_client -connect ${getVal('ch-host')}:${getVal('ch-port')} -showcerts`;
                break;
            case 'check-expiry':
                cmd = `echo | openssl s_client -connect ${getVal('ch-host')}:${getVal('ch-port')} 2>/dev/null | openssl x509 -noout -dates`;
                break;
            case 'check-cipher':
                cmd = `openssl s_client -connect ${getVal('ch-host')}:${getVal('ch-port')} -cipher ALL`;
                break;
            case 'view-crt':
                cmd = `openssl x509 -in ${getVal('ch-file')} -text -noout`;
                break;
            case 'view-csr':
                cmd = `openssl req -in ${getVal('ch-file')} -text -noout -verify`;
                break;
            case 'view-key':
                cmd = `openssl rsa -in ${getVal('ch-file')} -check`;
                break;
            case 'conv-pfx-pem':
                cmd = `openssl pkcs12 -in ${getVal('ch-pfx')} -out ${getVal('ch-pem')} -nodes`;
                break;
            case 'conv-pem-pfx':
                cmd = `openssl pkcs12 -export -out cert.pfx -inkey cert.key -in cert.crt`;
                break;
        }

        output.innerText = cmd;
    }
};

window.CertHelper = CertHelper;
