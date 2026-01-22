/**
 * OpsMate - Incident Post-mortem Generator
 */

const PostMortemGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'post-mortem',
            title: 'インシデント報告書作成の使い方',
            description: '障害発生時の事実関係を整理し、標準的なポストモーテム（事後検証報告書）を生成します。',
            steps: [
                '各項目（概要、発生日時、影響、原因、対応経緯）を埋めます',
                '「報告書生成」をクリックします',
                '生成されたテキスト（Markdown）をコピーして、ドキュメント共有ツールやチャットに貼り付けます'
            ],
            tips: [
                '事実は時系列で（Timeline）書くと、後からの振り返りがしやすくなります',
                '「再発防止策」は具体的であるほど望ましいです',
                'OpsMateはデータを保存しないため、ブラウザを閉じると入力内容は消えます。必ずどこかへコピーしてください'
            ],
            example: {
                title: '活用例',
                code: '### 障害概要\nAPIサーバーの過負荷による応答遅延\n### 発生日時\n2024-01-22 10:00 - 11:30'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="file-warning" class="w-5 h-5"></i>
                            Incident Post-mortem Generator
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        <div class="space-y-4">
                            <div class="form-group">
                                <label class="form-label">障害タイトル</label>
                                <input type="text" id="pm-title" class="form-input" placeholder="例: DBサーバー接続タイムアウトによるサービス停止">
                            </div>
                            <div class="form-group">
                                <label class="form-label">発生・復旧時刻</label>
                                <input type="text" id="pm-time" class="form-input" placeholder="例: 2024年1月22日 14:00 ～ 14:45 (45分間)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">影響範囲</label>
                                <textarea id="pm-impact" class="form-textarea" rows="2" placeholder="例: 管理画面へのアクセス、および一部のAPIリクエスト"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">根本原因</label>
                                <textarea id="pm-cause" class="form-textarea" rows="3" placeholder="例: 定期バッチの重複実行によるリソース枯渇"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">対応経緯 (Timeline)</label>
                                <textarea id="pm-timeline" class="form-textarea" rows="4" placeholder="14:05 アラート検知&#10;14:15 調査開始&#10;14:30 プロセス再起動により復旧"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">再発防止策</label>
                                <textarea id="pm-prevent" class="form-textarea" rows="3" placeholder="例: 二重起動防止ロックの実装、監視閾値の見直し"></textarea>
                            </div>

                            <button class="btn btn-primary" id="pm-run-btn">
                                <i data-lucide="file-text" class="w-4 h-4"></i> 報告書生成
                            </button>
                        </div>

                        <div class="flex flex-col">
                            <div class="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6 flex-grow">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-[var(--text-secondary)] text-sm font-medium uppercase">Report Preview</h3>
                                    <button class="btn btn-secondary btn-sm" id="pm-copy-btn" style="display: none;">
                                        <i data-lucide="copy" class="w-4 h-4"></i> 全てコピー
                                    </button>
                                </div>
                                <textarea id="pm-output" class="form-textarea code-textarea h-[500px]" readonly placeholder="生成されたレポートがここに表示されます..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const runBtn = document.getElementById('pm-run-btn');
        const copyBtn = document.getElementById('pm-copy-btn');

        if (runBtn) runBtn.addEventListener('click', () => this.generate());
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const out = document.getElementById('pm-output').value;
                OpsMateHelpers.copyToClipboard(out, copyBtn);
            });
        }
    },

    generate() {
        const title = document.getElementById('pm-title').value || '障害報告書';
        const time = document.getElementById('pm-time').value || '未指定';
        const impact = document.getElementById('pm-impact').value || '調査中';
        const cause = document.getElementById('pm-cause').value || '調査中';
        const timeline = document.getElementById('pm-timeline').value || '';
        const prevent = document.getElementById('pm-prevent').value || '検討中';

        const report = `
# インシデントポストモーテム報告書

## 1. タイトル
${title}

## 2. 発生・復旧時刻
${time}

## 3. 障害概要・影響範囲
${impact}

## 4. 発生原因
${cause}

## 5. 対応経緯 (Timeline)
${timeline || '（記載なし）'}

## 6. 恒久対策・再発防止策
${prevent}

---
*Generated by OpsMate at ${new Date().toLocaleString()}*
`.trim();

        document.getElementById('pm-output').value = report;
        document.getElementById('pm-copy-btn').style.display = 'flex';
    }
};

window.PostMortemGen = PostMortemGen;
