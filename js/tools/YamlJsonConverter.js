/**
 * OpsMate - YAML <-> JSON Converter
 */

const YamlJsonConverter = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'yaml-json',
            title: 'YAML ↔ JSON 変換器の使い方',
            description: 'YAML形式とJSON形式を相互に変換します。Kubernetesのマニフェストやクラウドの設定ファイルの変換に便利です。',
            steps: [
                '左側のテキストエリアに変換元のデータを貼り付けます',
                '自動的に形式が判別されますが、必要に応じて手動で「YAML -> JSON」か「JSON -> YAML」を選択します',
                '「変換実行」をクリックすると、右側に変換結果が表示されます',
                '変換結果は整形（インデント）された状態で出力されます'
            ],
            tips: [
                'YAMLはインデントに依存するため、貼り付け時の崩れに注意してください',
                'JSONからYAMLに変換する際、コメントは保持されません',
                'マルチドキュメント（--- 区切り）のYAMLにも対応しています',
                'エラーがある場合は、エラーメッセージが表示されます'
            ],
            example: {
                title: '変換例',
                code: 'name: OpsMate\nversion: 1.0\n---\n{\n  "name": "OpsMate",\n  "version": 1.0\n}'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="repeat" class="w-5 h-5"></i>
                            YAML / JSON 変換
                        </h2>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm active" id="yj-mode-yj">YAML ➜ JSON</button>
                            <button class="btn btn-secondary btn-sm" id="yj-mode-jy">JSON ➜ YAML</button>
                        </div>
                    </div>
                    
                    <div class="diff-input-container">
                        <div class="diff-input-panel">
                            <label class="form-label" id="yj-input-label">入力 (YAML)</label>
                            <textarea id="yj-input" class="form-textarea code-textarea" rows="15" placeholder="key: value"></textarea>
                        </div>
                        <div class="diff-input-panel">
                            <label class="form-label" id="yj-output-label">出力 (JSON)</label>
                            <textarea id="yj-output" class="form-textarea code-textarea" rows="15" readonly placeholder="結果がここに表示されます"></textarea>
                        </div>
                    </div>

                    <div class="flex justify-between items-center mt-4">
                        <button class="btn btn-primary" id="yj-convert-btn">
                            <i data-lucide="play" class="w-4 h-4"></i> 変換実行
                        </button>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="yj-copy-btn">
                                <i data-lucide="copy" class="w-4 h-4"></i> 結果をコピー
                            </button>
                        </div>
                    </div>

                    <div id="yj-error" class="error-message mt-4" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="yj-error-text"></span>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    mode: 'yj', // 'yj' for YAML to JSON, 'jy' for JSON to YAML

    init() {
        const yjMode = document.getElementById('yj-mode-yj');
        const jyMode = document.getElementById('yj-mode-jy');
        const convertBtn = document.getElementById('yj-convert-btn');
        const copyBtn = document.getElementById('yj-copy-btn');
        const input = document.getElementById('yj-input');

        if (yjMode) {
            yjMode.addEventListener('click', () => {
                this.mode = 'yj';
                yjMode.className = 'btn btn-primary btn-sm';
                jyMode.className = 'btn btn-secondary btn-sm';
                document.getElementById('yj-input-label').textContent = '入力 (YAML)';
                document.getElementById('yj-output-label').textContent = '出力 (JSON)';
            });
        }

        if (jyMode) {
            jyMode.addEventListener('click', () => {
                this.mode = 'jy';
                jyMode.className = 'btn btn-primary btn-sm';
                yjMode.className = 'btn btn-secondary btn-sm';
                document.getElementById('yj-input-label').textContent = '入力 (JSON)';
                document.getElementById('yj-output-label').textContent = '出力 (YAML)';
            });
        }

        if (convertBtn) convertBtn.addEventListener('click', () => this.convert());

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const out = document.getElementById('yj-output').value;
                OpsMateHelpers.copyToClipboard(out, copyBtn);
            });
        }
    },

    convert() {
        const inputStr = document.getElementById('yj-input').value.trim();
        const output = document.getElementById('yj-output');
        const error = document.getElementById('yj-error');
        const errorText = document.getElementById('yj-error-text');

        if (!inputStr) return;

        try {
            if (this.mode === 'yj') {
                // YAML to JSON
                // Handle multi-document YAML
                const docs = jsyaml.loadAll(inputStr);
                const result = docs.length === 1 ? docs[0] : docs;
                output.value = JSON.stringify(result, null, 2);
            } else {
                // JSON to YAML
                const jsonObj = JSON.parse(inputStr);
                output.value = jsyaml.dump(jsonObj, {
                    indent: 2,
                    lineWidth: -1 // disable line wrapping
                });
            }
            error.style.display = 'none';
        } catch (e) {
            errorText.textContent = `変換エラー: ${e.message}`;
            error.style.display = 'flex';
        }
    }
};

window.YamlJsonConverter = YamlJsonConverter;
