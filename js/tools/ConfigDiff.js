/**
 * OpsMate - Config Diff Tool (Config差分比較)
 */

const ConfigDiff = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="file-diff" class="w-5 h-5"></i>
                            Config 差分比較
                        </h2>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" id="diff-swap">
                                <i data-lucide="arrow-left-right" class="w-4 h-4"></i> 入れ替え
                            </button>
                            <button class="btn btn-secondary btn-sm" id="diff-clear">
                                <i data-lucide="trash-2" class="w-4 h-4"></i> クリア
                            </button>
                        </div>
                    </div>
                    
                    <div class="diff-input-container">
                        <div class="diff-input-panel">
                            <label class="form-label">変更前 (Original)</label>
                            <textarea id="diff-before" class="form-textarea diff-textarea" 
                                      placeholder="元の設定を貼り付け..."></textarea>
                        </div>
                        <div class="diff-input-panel">
                            <label class="form-label">変更後 (Modified)</label>
                            <textarea id="diff-after" class="form-textarea diff-textarea" 
                                      placeholder="変更後の設定を貼り付け..."></textarea>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" id="diff-compare">
                            <i data-lucide="git-compare" class="w-4 h-4"></i>
                            比較実行
                        </button>
                        <label class="checkbox-label" style="margin-left: 1rem;">
                            <input type="checkbox" id="diff-ignore-whitespace">
                            行頭・行末の空白を無視
                        </label>
                    </div>
                </div>
                
                <div class="panel-card" id="diff-results" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="list" class="w-5 h-5"></i>
                            比較結果
                        </h2>
                        <div class="diff-stats" id="diff-stats"></div>
                    </div>
                    <div class="diff-output" id="diff-output"></div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('diff-compare')?.addEventListener('click', () => this.compare());
        document.getElementById('diff-swap')?.addEventListener('click', () => this.swap());
        document.getElementById('diff-clear')?.addEventListener('click', () => this.clear());
    },

    compare() {
        const before = document.getElementById('diff-before').value;
        const after = document.getElementById('diff-after').value;
        const ignoreWhitespace = document.getElementById('diff-ignore-whitespace').checked;

        const beforeLines = before.split('\n');
        const afterLines = after.split('\n');

        const diff = this.computeDiff(beforeLines, afterLines, ignoreWhitespace);
        this.displayResults(diff);
    },

    computeDiff(beforeLines, afterLines, ignoreWhitespace) {
        const normalize = (line) => ignoreWhitespace ? line.trim() : line;

        const result = [];
        let added = 0, removed = 0, unchanged = 0;

        // Simple line-by-line diff using LCS-like approach
        const maxLen = Math.max(beforeLines.length, afterLines.length);
        const beforeSet = new Map();
        const afterSet = new Map();

        beforeLines.forEach((line, i) => {
            const key = normalize(line);
            if (!beforeSet.has(key)) beforeSet.set(key, []);
            beforeSet.get(key).push({ line, index: i });
        });

        afterLines.forEach((line, i) => {
            const key = normalize(line);
            if (!afterSet.has(key)) afterSet.set(key, []);
            afterSet.get(key).push({ line, index: i });
        });

        let bi = 0, ai = 0;

        while (bi < beforeLines.length || ai < afterLines.length) {
            if (bi >= beforeLines.length) {
                // Remaining lines in after are additions
                result.push({ type: 'added', line: afterLines[ai], lineNum: ai + 1 });
                added++;
                ai++;
            } else if (ai >= afterLines.length) {
                // Remaining lines in before are removals
                result.push({ type: 'removed', line: beforeLines[bi], lineNum: bi + 1 });
                removed++;
                bi++;
            } else if (normalize(beforeLines[bi]) === normalize(afterLines[ai])) {
                // Lines match
                result.push({ type: 'unchanged', line: beforeLines[bi], lineNum: bi + 1 });
                unchanged++;
                bi++;
                ai++;
            } else {
                // Check if current before line exists later in after
                const beforeKey = normalize(beforeLines[bi]);
                const afterKey = normalize(afterLines[ai]);

                let foundInAfter = false;
                for (let j = ai + 1; j < Math.min(ai + 5, afterLines.length); j++) {
                    if (normalize(afterLines[j]) === beforeKey) {
                        foundInAfter = true;
                        break;
                    }
                }

                let foundInBefore = false;
                for (let j = bi + 1; j < Math.min(bi + 5, beforeLines.length); j++) {
                    if (normalize(beforeLines[j]) === afterKey) {
                        foundInBefore = true;
                        break;
                    }
                }

                if (foundInAfter && !foundInBefore) {
                    result.push({ type: 'added', line: afterLines[ai], lineNum: ai + 1 });
                    added++;
                    ai++;
                } else if (foundInBefore && !foundInAfter) {
                    result.push({ type: 'removed', line: beforeLines[bi], lineNum: bi + 1 });
                    removed++;
                    bi++;
                } else {
                    result.push({ type: 'removed', line: beforeLines[bi], lineNum: bi + 1 });
                    result.push({ type: 'added', line: afterLines[ai], lineNum: ai + 1 });
                    removed++;
                    added++;
                    bi++;
                    ai++;
                }
            }
        }

        return { lines: result, stats: { added, removed, unchanged } };
    },

    displayResults(diff) {
        const container = document.getElementById('diff-results');
        const output = document.getElementById('diff-output');
        const stats = document.getElementById('diff-stats');

        stats.innerHTML = `
            <span class="diff-stat added">+${diff.stats.added} 追加</span>
            <span class="diff-stat removed">-${diff.stats.removed} 削除</span>
            <span class="diff-stat unchanged">${diff.stats.unchanged} 変更なし</span>
        `;

        output.innerHTML = diff.lines.map(item => {
            const prefix = item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' ';
            const escapedLine = this.escapeHtml(item.line);
            return `<div class="diff-line ${item.type}"><span class="diff-prefix">${prefix}</span><span class="diff-content">${escapedLine || '&nbsp;'}</span></div>`;
        }).join('');

        container.style.display = 'block';
    },

    swap() {
        const before = document.getElementById('diff-before');
        const after = document.getElementById('diff-after');
        const temp = before.value;
        before.value = after.value;
        after.value = temp;
    },

    clear() {
        document.getElementById('diff-before').value = '';
        document.getElementById('diff-after').value = '';
        document.getElementById('diff-results').style.display = 'none';
    },

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
};

window.ConfigDiff = ConfigDiff;
