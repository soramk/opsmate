/**
 * OpsMate - Encoding Converter (Base64, URL, Hex, etc.)
 */

const EncodingConverter = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'encoding',
            title: 'エンコード変換の使い方',
            description: 'Base64、URL、Hex、HTMLの各種エンコード・デコードを行います。API開発やデータ処理に便利です。',
            steps: [
                '入力欄に変換したいテキストを入力',
                '実行したい変換ボタン（エンコード/デコード）をクリック',
                '変換結果が下に表示されます',
                '結果をコピーして利用'
            ],
            tips: [
                'Base64: バイナリデータのテキスト化に使用',
                'URL: URLの特殊文字をエスケープ',
                'Hex: 文字を16進数表現に変換',
                'HTML: HTMLタグをエスケープして表示用に変換'
            ],
            example: {
                title: '変換例',
                code: 'Hello → Base64: SGVsbG8= | URL: Hello | Hex: 48 65 6c 6c 6f'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="file-code-2" class="w-5 h-5"></i>
                            文字エンコード・デコード変換
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">入力</label>
                        <textarea id="enc-input" class="form-textarea code-textarea" rows="5" 
                                  placeholder="変換したいテキストを入力..."></textarea>
                    </div>

                    <div class="quick-patterns mb-4">
                        <button class="btn btn-primary btn-sm" data-enc="base64-enc">Base64 エンコード</button>
                        <button class="btn btn-secondary btn-sm" data-enc="base64-dec">Base64 デコード</button>
                        <button class="btn btn-primary btn-sm" data-enc="url-enc">URL エンコード</button>
                        <button class="btn btn-secondary btn-sm" data-enc="url-dec">URL デコード</button>
                        <button class="btn btn-primary btn-sm" data-enc="hex-enc">テキスト → Hex</button>
                        <button class="btn btn-secondary btn-sm" data-enc="hex-dec">Hex → テキスト</button>
                        <button class="btn btn-primary btn-sm" data-enc="html-enc">HTML エンコード</button>
                        <button class="btn btn-secondary btn-sm" data-enc="html-dec">HTML デコード</button>
                    </div>

                    ${helpSection}
                </div>

                <div class="panel-card" id="enc-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title" id="enc-result-title">変換結果</h2>
                        <button class="btn btn-secondary btn-sm" id="enc-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <textarea id="enc-output" class="form-textarea code-textarea" rows="5" readonly></textarea>
                </div>
            </div>
        `;
    },

    init() {
        document.querySelectorAll('[data-enc]').forEach(btn => {
            btn.addEventListener('click', () => this.convert(btn.dataset.enc));
        });
        document.getElementById('enc-copy-btn')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('enc-output').value);
        });
    },

    convert(type) {
        const input = document.getElementById('enc-input').value;
        let output = '';
        let title = '変換結果';

        try {
            switch (type) {
                case 'base64-enc':
                    output = btoa(unescape(encodeURIComponent(input)));
                    title = 'Base64 エンコード済';
                    break;
                case 'base64-dec':
                    output = decodeURIComponent(escape(atob(input)));
                    title = 'Base64 デコード済';
                    break;
                case 'url-enc':
                    output = encodeURIComponent(input);
                    title = 'URL エンコード済';
                    break;
                case 'url-dec':
                    output = decodeURIComponent(input);
                    title = 'URL デコード済';
                    break;
                case 'hex-enc':
                    output = Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
                    title = 'Hex エンコード済';
                    break;
                case 'hex-dec':
                    output = input.replace(/\s/g, '').match(/.{1,2}/g).map(h => String.fromCharCode(parseInt(h, 16))).join('');
                    title = 'Hex デコード済';
                    break;
                case 'html-enc':
                    output = input.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
                    title = 'HTML エンコード済';
                    break;
                case 'html-dec':
                    const el = document.createElement('div');
                    el.innerHTML = input;
                    output = el.textContent;
                    title = 'HTML デコード済';
                    break;
            }

            document.getElementById('enc-output').value = output;
            document.getElementById('enc-result-title').textContent = title;
            document.getElementById('enc-result-panel').style.display = 'block';
        } catch (e) {
            OpsMateHelpers.showToast('変換に失敗しました: 無効な入力です', 'error');
        }
    }
};

window.EncodingConverter = EncodingConverter;
