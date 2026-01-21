/**
 * OpsMate - Excel Formula Builder
 */

const ExcelFormulaBuilder = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'excel-formula',
            title: 'Excel関数ビルダーの使い方',
            description: 'テキスト操作やデータ処理でよく使うExcel関数を直感的に生成します。',
            steps: [
                'やりたい操作（文字抽出、結合、検索など）を選択します',
                'セル参照やパラメータを入力します',
                '生成された関数をExcelにコピーして使用します'
            ],
            tips: [
                'セル参照は A1 や $A$1 形式で入力してください',
                '複雑な処理は生成された関数を組み合わせて使えます',
                '日本語テキストの場合はLENB系関数が便利です'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="table" class="w-5 h-5"></i>
                            Excel 関数ビルダー
                        </h2>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mb-4" id="excel-categories">
                        <button class="template-btn active" data-cat="text">文字操作</button>
                        <button class="template-btn" data-cat="extract">文字抽出</button>
                        <button class="template-btn" data-cat="search">検索・置換</button>
                        <button class="template-btn" data-cat="logic">条件・論理</button>
                        <button class="template-btn" data-cat="lookup">検索・参照</button>
                        <button class="template-btn" data-cat="date">日付・時刻</button>
                    </div>

                    <div class="form-group mb-4">
                        <label class="form-label">関数を選択</label>
                        <select id="excel-function" class="form-select"></select>
                    </div>

                    <div id="excel-params" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"></div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="function-square" class="w-5 h-5"></i>
                            生成された関数
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('excel-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="excel-output" class="code-output p-4 rounded-lg font-mono text-sm overflow-auto"></pre>
                    <div id="excel-desc" class="text-xs mt-3 p-3 rounded-lg"></div>
                </div>

                <!-- Quick Reference -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                            <i data-lucide="bookmark" class="w-5 h-5"></i>
                            よく使う関数パターン
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" onclick="OpsMateHelpers.copyToClipboard('=TRIM(CLEAN(A1))')">
                            <div class="text-xs mb-1">空白・制御文字を除去</div>
                            <code class="text-xs">=TRIM(CLEAN(A1))</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" onclick="OpsMateHelpers.copyToClipboard('=SUBSTITUTE(A1,CHAR(10),\", \")')">
                            <div class="text-xs mb-1">改行をカンマに置換</div>
                            <code class="text-xs">=SUBSTITUTE(A1,CHAR(10),", ")</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" onclick="OpsMateHelpers.copyToClipboard('=TEXT(A1,\"yyyy/mm/dd\")')">
                            <div class="text-xs mb-1">日付を文字列に変換</div>
                            <code class="text-xs">=TEXT(A1,"yyyy/mm/dd")</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" onclick="OpsMateHelpers.copyToClipboard('=IFERROR(VLOOKUP(A1,B:C,2,FALSE),\"\")')">
                            <div class="text-xs mb-1">VLOOKUPエラー処理付き</div>
                            <code class="text-xs">=IFERROR(VLOOKUP(A1,B:C,2,FALSE),"")</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" onclick="OpsMateHelpers.copyToClipboard('=LEFT(A1,FIND(\"@\",A1)-1)')">
                            <div class="text-xs mb-1">メールアドレスからユーザー名抽出</div>
                            <code class="text-xs">=LEFT(A1,FIND("@",A1)-1)</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" onclick="OpsMateHelpers.copyToClipboard('=MID(A1,FIND(\"/\",A1)+1,100)')">
                            <div class="text-xs mb-1">区切り文字以降を抽出</div>
                            <code class="text-xs">=MID(A1,FIND("/",A1)+1,100)</code>
                        </div>
                    </div>

                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    currentCat: 'text',

    functions: {
        text: [
            { id: 'concat', name: 'CONCATENATE / &', desc: '複数のセルを結合', params: ['cell1', 'cell2', 'separator'], formula: (p) => p.separator ? `=${p.cell1}&"${p.separator}"&${p.cell2}` : `=${p.cell1}&${p.cell2}` },
            { id: 'textjoin', name: 'TEXTJOIN', desc: '区切り文字で複数セル結合', params: ['separator', 'range'], formula: (p) => `=TEXTJOIN("${p.separator}",TRUE,${p.range})` },
            { id: 'upper', name: 'UPPER', desc: '大文字に変換', params: ['cell'], formula: (p) => `=UPPER(${p.cell})` },
            { id: 'lower', name: 'LOWER', desc: '小文字に変換', params: ['cell'], formula: (p) => `=LOWER(${p.cell})` },
            { id: 'proper', name: 'PROPER', desc: '先頭大文字に変換', params: ['cell'], formula: (p) => `=PROPER(${p.cell})` },
            { id: 'trim', name: 'TRIM', desc: '余分なスペースを削除', params: ['cell'], formula: (p) => `=TRIM(${p.cell})` },
            { id: 'clean', name: 'CLEAN', desc: '制御文字を削除', params: ['cell'], formula: (p) => `=CLEAN(${p.cell})` },
            { id: 'len', name: 'LEN / LENB', desc: '文字数を取得', params: ['cell'], formula: (p) => `=LEN(${p.cell})` },
            { id: 'rept', name: 'REPT', desc: '文字を繰り返し', params: ['text', 'times'], formula: (p) => `=REPT("${p.text}",${p.times})` }
        ],
        extract: [
            { id: 'left', name: 'LEFT', desc: '左からN文字抽出', params: ['cell', 'count'], formula: (p) => `=LEFT(${p.cell},${p.count})` },
            { id: 'right', name: 'RIGHT', desc: '右からN文字抽出', params: ['cell', 'count'], formula: (p) => `=RIGHT(${p.cell},${p.count})` },
            { id: 'mid', name: 'MID', desc: '中間N文字抽出', params: ['cell', 'start', 'count'], formula: (p) => `=MID(${p.cell},${p.start},${p.count})` },
            { id: 'leftb', name: 'LEFTB', desc: '左からNバイト抽出（日本語用）', params: ['cell', 'bytes'], formula: (p) => `=LEFTB(${p.cell},${p.bytes})` },
            { id: 'extract_before', name: '区切り前抽出', desc: '区切り文字より前を抽出', params: ['cell', 'delimiter'], formula: (p) => `=LEFT(${p.cell},FIND("${p.delimiter}",${p.cell})-1)` },
            { id: 'extract_after', name: '区切り後抽出', desc: '区切り文字より後を抽出', params: ['cell', 'delimiter'], formula: (p) => `=MID(${p.cell},FIND("${p.delimiter}",${p.cell})+1,LEN(${p.cell}))` },
            { id: 'extract_domain', name: 'ドメイン抽出', desc: 'メールアドレスからドメイン', params: ['cell'], formula: (p) => `=MID(${p.cell},FIND("@",${p.cell})+1,100)` },
            { id: 'extract_filename', name: 'ファイル名抽出', desc: 'パスからファイル名', params: ['cell'], formula: (p) => `=MID(${p.cell},FIND("*",SUBSTITUTE(${p.cell},"\\","*",LEN(${p.cell})-LEN(SUBSTITUTE(${p.cell},"\\",""))))+1,100)` }
        ],
        search: [
            { id: 'find', name: 'FIND', desc: '文字位置を検索（大文字小文字区別）', params: ['search', 'cell'], formula: (p) => `=FIND("${p.search}",${p.cell})` },
            { id: 'search', name: 'SEARCH', desc: '文字位置を検索（区別なし）', params: ['search', 'cell'], formula: (p) => `=SEARCH("${p.search}",${p.cell})` },
            { id: 'substitute', name: 'SUBSTITUTE', desc: '文字を置換', params: ['cell', 'old', 'new'], formula: (p) => `=SUBSTITUTE(${p.cell},"${p.old}","${p.new}")` },
            { id: 'replace', name: 'REPLACE', desc: '位置指定で置換', params: ['cell', 'start', 'length', 'new'], formula: (p) => `=REPLACE(${p.cell},${p.start},${p.length},"${p.new}")` },
            { id: 'contains', name: '含む判定', desc: '特定文字を含むか', params: ['cell', 'search'], formula: (p) => `=IF(ISNUMBER(FIND("${p.search}",${p.cell})),"含む","含まない")` }
        ],
        logic: [
            { id: 'if', name: 'IF', desc: '条件分岐', params: ['condition', 'true_val', 'false_val'], formula: (p) => `=IF(${p.condition},"${p.true_val}","${p.false_val}")` },
            { id: 'ifs', name: 'IFS', desc: '複数条件分岐', params: ['cond1', 'val1', 'cond2', 'val2'], formula: (p) => `=IFS(${p.cond1},"${p.val1}",${p.cond2},"${p.val2}",TRUE,"その他")` },
            { id: 'iferror', name: 'IFERROR', desc: 'エラー時の代替値', params: ['formula', 'error_val'], formula: (p) => `=IFERROR(${p.formula},"${p.error_val}")` },
            { id: 'isblank', name: 'ISBLANK判定', desc: '空白セル判定', params: ['cell', 'true_val', 'false_val'], formula: (p) => `=IF(ISBLANK(${p.cell}),"${p.true_val}","${p.false_val}")` },
            { id: 'switch', name: 'SWITCH', desc: '値による分岐', params: ['cell', 'case1', 'result1', 'case2', 'result2'], formula: (p) => `=SWITCH(${p.cell},"${p.case1}","${p.result1}","${p.case2}","${p.result2}","その他")` }
        ],
        lookup: [
            { id: 'vlookup', name: 'VLOOKUP', desc: '縦方向検索', params: ['search_val', 'range', 'col_num'], formula: (p) => `=VLOOKUP(${p.search_val},${p.range},${p.col_num},FALSE)` },
            { id: 'hlookup', name: 'HLOOKUP', desc: '横方向検索', params: ['search_val', 'range', 'row_num'], formula: (p) => `=HLOOKUP(${p.search_val},${p.range},${p.row_num},FALSE)` },
            { id: 'xlookup', name: 'XLOOKUP', desc: '高機能検索（365/2021）', params: ['search_val', 'search_range', 'return_range'], formula: (p) => `=XLOOKUP(${p.search_val},${p.search_range},${p.return_range},"見つからず")` },
            { id: 'index_match', name: 'INDEX+MATCH', desc: '柔軟な検索', params: ['search_val', 'search_range', 'return_range'], formula: (p) => `=INDEX(${p.return_range},MATCH(${p.search_val},${p.search_range},0))` },
            { id: 'countif', name: 'COUNTIF', desc: '条件に合う数をカウント', params: ['range', 'criteria'], formula: (p) => `=COUNTIF(${p.range},"${p.criteria}")` },
            { id: 'sumif', name: 'SUMIF', desc: '条件に合う値を合計', params: ['criteria_range', 'criteria', 'sum_range'], formula: (p) => `=SUMIF(${p.criteria_range},"${p.criteria}",${p.sum_range})` }
        ],
        date: [
            { id: 'today', name: 'TODAY', desc: '今日の日付', params: [], formula: () => `=TODAY()` },
            { id: 'now', name: 'NOW', desc: '現在の日時', params: [], formula: () => `=NOW()` },
            { id: 'text_date', name: 'TEXT(日付)', desc: '日付を書式変換', params: ['cell', 'format'], formula: (p) => `=TEXT(${p.cell},"${p.format}")` },
            { id: 'datedif', name: 'DATEDIF', desc: '日付の差分', params: ['start', 'end', 'unit'], formula: (p) => `=DATEDIF(${p.start},${p.end},"${p.unit}")` },
            { id: 'eomonth', name: 'EOMONTH', desc: '月末日', params: ['cell', 'months'], formula: (p) => `=EOMONTH(${p.cell},${p.months})` },
            { id: 'workday', name: 'WORKDAY', desc: '営業日計算', params: ['start', 'days'], formula: (p) => `=WORKDAY(${p.start},${p.days})` }
        ]
    },

    paramLabels: {
        cell: 'セル参照', cell1: 'セル1', cell2: 'セル2', separator: '区切り文字',
        range: '範囲', count: '文字数', start: '開始位置', bytes: 'バイト数',
        delimiter: '区切り文字', search: '検索文字', old: '置換前', new: '置換後',
        length: '長さ', condition: '条件式', true_val: 'TRUE時の値', false_val: 'FALSE時の値',
        formula: '数式', error_val: 'エラー時の値', search_val: '検索値',
        col_num: '列番号', row_num: '行番号', search_range: '検索範囲',
        return_range: '戻り値範囲', criteria: '条件', criteria_range: '条件範囲',
        sum_range: '合計範囲', format: '書式', end: '終了日', unit: '単位(Y/M/D)',
        months: '月数', days: '日数', text: 'テキスト', times: '回数',
        cond1: '条件1', val1: '値1', cond2: '条件2', val2: '値2',
        case1: 'ケース1', result1: '結果1', case2: 'ケース2', result2: '結果2'
    },

    paramDefaults: {
        cell: 'A1', cell1: 'A1', cell2: 'B1', separator: ',', range: 'A1:B10',
        count: '5', start: '1', bytes: '10', delimiter: '-', search: '検索語',
        old: '旧', new: '新', length: '3', condition: 'A1>0', true_val: 'はい',
        false_val: 'いいえ', formula: 'A1/B1', error_val: '', search_val: 'A1',
        col_num: '2', row_num: '2', search_range: 'A:A', return_range: 'B:B',
        criteria: '*', criteria_range: 'A:A', sum_range: 'B:B', format: 'yyyy/mm/dd',
        end: 'B1', unit: 'D', months: '0', days: '5', text: '-', times: '10',
        cond1: 'A1="A"', val1: '優', cond2: 'A1="B"', val2: '良',
        case1: 'A', result1: '優秀', case2: 'B', result2: '良好'
    },

    init() {
        document.querySelectorAll('#excel-categories .template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#excel-categories .template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCat = btn.dataset.cat;
                this.renderFunctions();
            });
        });

        document.getElementById('excel-function').addEventListener('change', () => this.renderParams());

        this.renderFunctions();
    },

    renderFunctions() {
        const select = document.getElementById('excel-function');
        const funcs = this.functions[this.currentCat];
        select.innerHTML = funcs.map(f => `<option value="${f.id}">${f.name} - ${f.desc}</option>`).join('');
        this.renderParams();
    },

    renderParams() {
        const funcId = document.getElementById('excel-function').value;
        const func = this.functions[this.currentCat].find(f => f.id === funcId);
        const container = document.getElementById('excel-params');

        if (!func || func.params.length === 0) {
            container.innerHTML = '<p class="text-slate-500 col-span-2 text-sm">パラメータ不要</p>';
            this.generate();
            return;
        }

        container.innerHTML = func.params.map(p => `
            <div class="form-group">
                <label class="form-label">${this.paramLabels[p] || p}</label>
                <input type="text" class="form-input excel-param" data-param="${p}" value="${this.paramDefaults[p] || ''}">
            </div>
        `).join('');

        container.querySelectorAll('.excel-param').forEach(input => {
            input.addEventListener('input', () => this.generate());
        });

        this.generate();
    },

    generate() {
        const funcId = document.getElementById('excel-function').value;
        const func = this.functions[this.currentCat].find(f => f.id === funcId);

        if (!func) return;

        const params = {};
        document.querySelectorAll('.excel-param').forEach(input => {
            params[input.dataset.param] = input.value;
        });

        const formula = func.formula(params);
        document.getElementById('excel-output').textContent = formula;
        document.getElementById('excel-desc').innerHTML = `<strong>${func.name}</strong>: ${func.desc}`;
    }
};

window.ExcelFormulaBuilder = ExcelFormulaBuilder;
