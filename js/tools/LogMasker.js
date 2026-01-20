/**
 * OpsMate - Log Anonymizer / Masker
 */

const LogMasker = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'log-masker',
            title: 'ログ匿名化ツールの使い方',
            description: 'ログファイルに含まれるIPアドレスや特定の機密情報を自動的に検出し、マスク処理（置換）を行います。ベンダーへのログ共有時などに便利です。',
            steps: [
                '対象のログテキストを「入力ログ」エリアに貼り付けます',
                'マスクしたい対象（IPv4, IPv6, メールアドレス等）にチェックを入れます',
                'カスタムキーワードを追加して個別に隠すことも可能です',
                '「匿名化実行」をクリックし、処理後のログをコピーします'
            ],
            tips: [
                'IPアドレスは `192.168.1.1` -> `***.***.***.***` のように置換されます',
                '「カスタムキーワード」には、ホスト名や特定のユーザー名を入れると効果的です',
                'マスク処理はすべてブラウザ上のJavaScriptで行われるため、機密が外部に漏れることはありません'
            ],
            example: {
                title: '実行例',
                code: 'ERROR at 10.0.0.5 -> ERROR at ***.***.***.***'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="eye-off" class="w-5 h-5"></i>
                            ログ匿名化の設定
                        </h2>
                    </div>
                    
                    <div class="checkbox-grid mb-4">
                        <label class="checkbox-label">
                            <input type="checkbox" id="mask-ipv4" checked> IPv4をマスク
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="mask-ipv6"> IPv6をマスク
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="mask-email" checked> メールアドレスをマスク
                        </label>
                        <label class="checkbox-label">
                             <input type="checkbox" id="mask-mac"> MACアドレスをマスク
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="form-label">カスタムキーワード (カンマ区切りで複数指定)</label>
                        <input type="text" id="mask-custom" class="form-input" placeholder="例: MyServer, admin-user, SECRET_KEY">
                    </div>

                    <div class="form-group">
                        <label class="form-label">置換文字</label>
                        <input type="text" id="mask-replacement" class="form-input" value="[MASKED]" placeholder="[MASKED]">
                    </div>
                </div>

                <div class="diff-input-container">
                    <div class="diff-input-panel">
                        <label class="form-label">入力ログ</label>
                        <textarea id="mask-input" class="form-textarea code-textarea" rows="12" placeholder="ここにログを貼り付けてください..."></textarea>
                    </div>
                    <div class="diff-input-panel">
                        <label class="form-label">匿名化済みログ</label>
                        <textarea id="mask-output" class="form-textarea code-textarea" rows="12" readonly placeholder="結果がここに表示されます..."></textarea>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-4">
                    <button class="btn btn-primary" id="mask-exec-btn">
                        <i data-lucide="shield" class="w-4 h-4"></i> 匿名化実行
                    </button>
                    <button class="btn btn-secondary btn-sm" id="mask-copy-btn">
                        <i data-lucide="copy" class="w-4 h-4"></i> 結果をコピー
                    </button>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const execBtn = document.getElementById('mask-exec-btn');
        const copyBtn = document.getElementById('mask-copy-btn');

        if (execBtn) execBtn.addEventListener('click', () => this.execute());
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const out = document.getElementById('mask-output').value;
                OpsMateHelpers.copyToClipboard(out, copyBtn);
            });
        }
    },

    execute() {
        let text = document.getElementById('mask-input').value;
        const replacement = document.getElementById('mask-replacement').value || '[MASKED]';
        const customKeywords = document.getElementById('mask-custom').value.split(',').map(s => s.trim()).filter(s => s !== '');

        // Patterns
        const patterns = [];

        if (document.getElementById('mask-ipv4').checked) {
            patterns.push({
                regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
                replace: replacement
            });
        }

        if (document.getElementById('mask-ipv6').checked) {
            patterns.push({
                regex: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi,
                replace: replacement
            });
        }

        if (document.getElementById('mask-email').checked) {
            patterns.push({
                regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
                replace: replacement
            });
        }

        if (document.getElementById('mask-mac').checked) {
            patterns.push({
                regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g,
                replace: replacement
            });
        }

        // Apply Patterns
        patterns.forEach(p => {
            text = text.replace(p.regex, p.replace);
        });

        // Apply Custom Keywords
        customKeywords.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const kwRegex = new RegExp(escaped, 'g');
            text = text.replace(kwRegex, replacement);
        });

        document.getElementById('mask-output').value = text;
        document.getElementById('mask-output').scrollIntoView({ behavior: 'smooth' });
    }
};

window.LogMasker = LogMasker;
