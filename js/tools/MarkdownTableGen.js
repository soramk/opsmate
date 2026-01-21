/**
 * OpsMate - Markdown Table Generator
 */

const MarkdownTableGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'mdtable-gen',
            title: 'Markdownテーブル生成の使い方',
            description: 'スプレッドシート形式の入力からMarkdownのテーブル記法を生成します。',
            steps: [
                'セル数（列×行）を設定します',
                'ヘッダーとデータを入力します',
                '生成されたMarkdownをドキュメントに貼り付けます'
            ],
            tips: [
                'タブ区切りのデータをペーストすると自動で入力されます',
                '配置（左寄せ、中央、右寄せ）も指定可能です',
                'GitHubやNotionなど多くのサービスで利用できます'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="table-2" class="w-5 h-5"></i>
                            テーブル設定
                        </h2>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div class="form-group">
                            <label class="form-label">列数</label>
                            <input type="number" id="mdt-cols" class="form-input" value="3" min="1" max="10">
                        </div>
                        <div class="form-group">
                            <label class="form-label">行数 (ヘッダー除く)</label>
                            <input type="number" id="mdt-rows" class="form-input" value="3" min="1" max="20">
                        </div>
                        <div class="form-group">
                            <label class="form-label">配置</label>
                            <select id="mdt-align" class="form-select">
                                <option value="left">左寄せ</option>
                                <option value="center">中央</option>
                                <option value="right">右寄せ</option>
                            </select>
                        </div>
                        <div class="form-group flex items-end">
                            <button class="btn btn-secondary w-full" id="mdt-rebuild-btn">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i> 再構築
                            </button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table id="mdt-table" class="w-full"></table>
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="file-code" class="w-5 h-5"></i>
                            Markdown出力
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('mdt-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="mdt-output" class="bg-slate-950 p-4 rounded-lg font-mono text-sm text-emerald-400 overflow-auto"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        document.getElementById('mdt-rebuild-btn').addEventListener('click', () => this.buildTable());
        document.getElementById('mdt-align').addEventListener('change', () => this.generate());
        this.buildTable();
    },

    buildTable() {
        const cols = parseInt(document.getElementById('mdt-cols').value) || 3;
        const rows = parseInt(document.getElementById('mdt-rows').value) || 3;
        const table = document.getElementById('mdt-table');

        let html = '<thead><tr>';
        for (let c = 0; c < cols; c++) {
            html += `<th class="p-1"><input type="text" class="form-input text-sm mdt-cell" data-row="header" data-col="${c}" value="列${c + 1}"></th>`;
        }
        html += '</tr></thead><tbody>';

        for (let r = 0; r < rows; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
                html += `<td class="p-1"><input type="text" class="form-input text-sm mdt-cell" data-row="${r}" data-col="${c}" value=""></td>`;
            }
            html += '</tr>';
        }
        html += '</tbody>';

        table.innerHTML = html;

        // Add event listeners
        table.querySelectorAll('.mdt-cell').forEach(input => {
            input.addEventListener('input', () => this.generate());
            input.addEventListener('paste', (e) => this.handlePaste(e));
        });

        this.generate();
    },

    handlePaste(e) {
        const pastedData = e.clipboardData.getData('text');
        if (!pastedData.includes('\t')) return; // Not tab-separated

        e.preventDefault();

        const lines = pastedData.trim().split('\n');
        const startRow = e.target.dataset.row;
        const startCol = parseInt(e.target.dataset.col);

        if (startRow === 'header') {
            // Handle header paste
            const cells = lines[0].split('\t');
            cells.forEach((val, i) => {
                const input = document.querySelector(`.mdt-cell[data-row="header"][data-col="${startCol + i}"]`);
                if (input) input.value = val.trim();
            });

            // Data rows
            lines.slice(1).forEach((line, r) => {
                const cells = line.split('\t');
                cells.forEach((val, c) => {
                    const input = document.querySelector(`.mdt-cell[data-row="${r}"][data-col="${startCol + c}"]`);
                    if (input) input.value = val.trim();
                });
            });
        } else {
            const rowIdx = parseInt(startRow);
            lines.forEach((line, r) => {
                const cells = line.split('\t');
                cells.forEach((val, c) => {
                    const input = document.querySelector(`.mdt-cell[data-row="${rowIdx + r}"][data-col="${startCol + c}"]`);
                    if (input) input.value = val.trim();
                });
            });
        }

        this.generate();
    },

    generate() {
        const cols = parseInt(document.getElementById('mdt-cols').value) || 3;
        const rows = parseInt(document.getElementById('mdt-rows').value) || 3;
        const align = document.getElementById('mdt-align').value;

        // Get header values
        const headers = [];
        for (let c = 0; c < cols; c++) {
            const input = document.querySelector(`.mdt-cell[data-row="header"][data-col="${c}"]`);
            headers.push(input?.value || `列${c + 1}`);
        }

        // Get data values
        const data = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const input = document.querySelector(`.mdt-cell[data-row="${r}"][data-col="${c}"]`);
                row.push(input?.value || '');
            }
            data.push(row);
        }

        // Calculate column widths
        const widths = headers.map((h, i) => {
            const maxDataWidth = Math.max(...data.map(row => (row[i] || '').length));
            return Math.max(h.length, maxDataWidth, 3);
        });

        // Generate Markdown
        const padCell = (text, width) => {
            if (align === 'center') return text.padStart(Math.floor((width + text.length) / 2)).padEnd(width);
            if (align === 'right') return text.padStart(width);
            return text.padEnd(width);
        };

        let md = '| ' + headers.map((h, i) => padCell(h, widths[i])).join(' | ') + ' |\n';

        // Separator
        const separator = widths.map(w => {
            if (align === 'center') return ':' + '-'.repeat(w - 2) + ':';
            if (align === 'right') return '-'.repeat(w - 1) + ':';
            return '-'.repeat(w);
        });
        md += '| ' + separator.join(' | ') + ' |\n';

        // Data rows
        data.forEach(row => {
            md += '| ' + row.map((cell, i) => padCell(cell, widths[i])).join(' | ') + ' |\n';
        });

        document.getElementById('mdt-output').textContent = md;
    }
};

window.MarkdownTableGen = MarkdownTableGen;
