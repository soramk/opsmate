/**
 * OpsMate - Structured JSON Diff
 */

const JsonDiff = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'json-diff',
            title: 'JSON比較ツールの使い方',
            description: '2つのJSONデータを構造的に比較し、差分をハイライトします。設定ファイルの変更確認やAPIレスポンスの検証に最適です。',
            steps: [
                '比較元 (Left) と比較先 (Right) にJSONを貼り付けます',
                '「比較実行」をクリックします',
                '追加された値は緑、変更された値は黄、削除された値は赤で表示されます'
            ],
            tips: [
                'プロパティの順序が違っていても、名前が同じであれば正しく比較されます',
                '貼り付けられたJSONが不正な形式（Syntax Error）の場合はエラーが表示されます',
                '「フォーマットして比較」がデフォルトで有効です'
            ],
            example: {
                title: '活用例',
                code: 'Config A: {"port": 80, "ssl": false}\nConfig B: {"port": 443, "ssl": true}\nResult: port (80 -> 443), ssl (false -> true)'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="file-diff" class="w-5 h-5"></i>
                            Structured JSON Diff
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <div class="form-group">
                            <label class="form-label">Original (Left)</label>
                            <textarea id="jd-left" class="form-textarea code-textarea" rows="10" placeholder='{"id": 1, "status": "ok"}'></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Modified (Right)</label>
                            <textarea id="jd-right" class="form-textarea code-textarea" rows="10" placeholder='{"id": 1, "status": "error", "code": 500}'></textarea>
                        </div>
                    </div>

                    <div class="flex space-x-3 mt-4">
                        <button class="btn btn-primary" id="jd-run-btn">
                            <i data-lucide="zap" class="w-4 h-4"></i> 比較実行
                        </button>
                        <button class="btn btn-secondary" id="jd-clear-btn">
                             クリア
                        </button>
                    </div>
                </div>

                <div class="panel-card" id="jd-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">差分詳細</h2>
                    </div>
                    <div id="jd-output" class="space-y-2 font-mono text-sm overflow-auto max-h-[600px] p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                        <!-- Diff items dynamic -->
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const runBtn = document.getElementById('jd-run-btn');
        const clearBtn = document.getElementById('jd-clear-btn');

        if (runBtn) runBtn.addEventListener('click', () => this.compare());
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.getElementById('jd-left').value = '';
                document.getElementById('jd-right').value = '';
                document.getElementById('jd-result-panel').style.display = 'none';
            });
        }
    },

    compare() {
        const leftRaw = document.getElementById('jd-left').value;
        const rightRaw = document.getElementById('jd-right').value;
        const output = document.getElementById('jd-output');
        const panel = document.getElementById('jd-result-panel');

        try {
            const left = leftRaw.trim() ? JSON.parse(leftRaw) : {};
            const right = rightRaw.trim() ? JSON.parse(rightRaw) : {};

            const diffs = this.getDiff(left, right);

            if (diffs.length === 0) {
                output.innerHTML = `<div class="text-[var(--text-muted)] italic">差分は見つかりませんでした。データは完全に一致しています。</div>`;
            } else {
                output.innerHTML = diffs.map(d => this.formatDiffItem(d)).join('');
            }

            panel.style.display = 'block';
            panel.scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
            alert('JSONのパースに失敗しました。形式を確認してください。\n' + e.message);
        }
    },

    getDiff(obj1, obj2, path = '') {
        const diffs = [];
        const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

        allKeys.forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const val1 = obj1 ? obj1[key] : undefined;
            const val2 = obj2 ? obj2[key] : undefined;

            if (val1 === undefined && val2 !== undefined) {
                diffs.push({ type: 'added', path: currentPath, value: val2 });
            } else if (val1 !== undefined && val2 === undefined) {
                diffs.push({ type: 'removed', path: currentPath, value: val1 });
            } else if (this.isObject(val1) && this.isObject(val2)) {
                diffs.push(...this.getDiff(val1, val2, currentPath));
            } else if (val1 !== val2) {
                diffs.push({ type: 'changed', path: currentPath, oldValue: val1, newValue: val2 });
            }
        });

        return diffs;
    },

    isObject(val) {
        return val !== null && typeof val === 'object' && !Array.isArray(val);
    },

    formatDiffItem(d) {
        let content = '';
        let color = '';

        switch (d.type) {
            case 'added':
                color = 'text-[var(--success-color)]';
                content = `+ Added: ${JSON.stringify(d.value)}`;
                break;
            case 'removed':
                color = 'text-[var(--error-color)]';
                content = `- Removed: ${JSON.stringify(d.value)}`;
                break;
            case 'changed':
                color = 'text-[var(--warning-color)]';
                content = `~ Changed: ${JSON.stringify(d.oldValue)} -> ${JSON.stringify(d.newValue)}`;
                break;
        }

        return `
            <div class="flex items-start space-x-4 border-b border-[var(--border-color)] pb-2">
                <span class="text-[var(--text-muted)] w-1/3 break-all">${d.path}</span>
                <span class="${color} w-2/3 break-all">${content}</span>
            </div>
        `;
    }
};

window.JsonDiff = JsonDiff;
