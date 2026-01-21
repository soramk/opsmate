/**
 * OpsMate - Mermaid Network Diagram Editor
 */

const NetworkDiagram = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'network-diagram',
            title: 'ネットワーク構成図エディタの使い方',
            description: 'Mermaid.js 構文を使用して、テキストベースで美しくプロフェッショナルなネットワーク構成図を作成します。',
            steps: [
                '左側のテキストエディタに Mermaid 構文を入力します',
                '入力に合わせて右側のプレビューがリアルタイムに更新されます',
                '「サンプル読み込み」ボタンで初期テンプレートを確認できます',
                '「画像を保存」ボタンで作成した図をエクスポートできます'
            ],
            tips: [
                'graph TD; は上から下、graph LR; は左から右へのフローです',
                'ノード名は [ ] で囲むと四角、( ) で囲むと丸くなります',
                '--> でノードを繋ぎます。文字を載せる場合は -- テキスト --> と記述します',
                'Subnet や VLAN ごとにグループ化するには subgraph 構文が便利です'
            ],
            example: {
                title: '基本テンプレート',
                code: 'graph TD\n  Internet((Internet))\n  Router[Router]\n  Internet --- Router\n  Router --- FW(Firewall)\n  FW --- SW{Switch}'
            }
        });

        return `
            <div class="tool-panel">
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div class="panel-header py-2 bg-slate-800/50">
                            <div class="flex flex-wrap gap-2 px-4" id="diagram-toolbar">
                                <button class="toolbar-btn" data-type="node" data-shape="round" title="丸型ノード (Router系)">
                                    <i data-lucide="circle" class="w-4 h-4"></i>
                                </button>
                                <button class="toolbar-btn" data-type="node" data-shape="square" title="四角型ノード (PC/Server系)">
                                    <i data-lucide="square" class="w-4 h-4"></i>
                                </button>
                                <button class="toolbar-btn" data-type="node" data-shape="rhombus" title="菱形ノード (Switch系)">
                                    <i data-lucide="diamond" class="w-4 h-4"></i>
                                </button>
                                <button class="toolbar-btn" data-type="edge" data-style="straight" title="直接接続 (---)">
                                    <i data-lucide="minus" class="w-4 h-4"></i>
                                </button>
                                <button class="toolbar-btn" data-type="edge" data-style="arrow" title="矢印接続 (-->)">
                                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                </button>
                                <button class="toolbar-btn" data-type="subgraph" title="サブグラフ (VLAN/Subnet)">
                                    <i data-lucide="box" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <textarea id="diagram-editor" class="form-textarea h-full font-mono text-sm p-4 w-full" style="min-height: 400px;" spellcheck="false" placeholder="ここに Mermaid 構文を入力するか、ツールバーを使用してノードを追加してください"></textarea>
                        </div>
                    </div>

                    <!-- Preview Area -->
                    <div class="panel-card flex flex-col min-h-[500px]">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <i data-lucide="image" class="w-5 h-5"></i>
                                プレビュー
                            </h2>
                            <button class="btn btn-primary btn-sm" id="diagram-save-btn">
                                <i data-lucide="download" class="w-4 h-4"></i> 画像で保存 (SVG)
                            </button>
                        </div>
                        <div class="flex-grow bg-slate-900/50 rounded-lg flex items-center justify-center p-4 overflow-auto border border-slate-800" id="diagram-preview">
                            <div class="mermaid" id="mermaid-container"></div>
                        </div>
                        <div id="diagram-error" class="text-rose-500 text-xs mt-2 px-2 hidden"></div>
                    </div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    defaultTemplate: `graph TD
    %% ノードの定義
    Internet((Internet))
    RouterA[Router A]
    RouterB[Router B]
    FW1(Firewall 1)
    FW2(Firewall 2)
    SW1{L3 SW 1}
    SW2{L3 SW 2}

    subgraph External_Network
        Internet
    end

    subgraph DMZ
        FW1
        FW2
    end

    subgraph Internal_Network
        SW1
        SW2
    end

    %% 接続の定義
    Internet --- RouterA
    Internet --- RouterB
    RouterA --- FW1
    RouterB --- FW2
    FW1 --- SW1
    FW2 --- SW2
    SW1 --- SW2`,

    init() {
        const editor = document.getElementById('diagram-editor');
        const container = document.getElementById('mermaid-container');
        const sampleBtn = document.getElementById('diagram-sample-btn');
        const clearBtn = document.getElementById('diagram-clear-btn');
        const saveBtn = document.getElementById('diagram-save-btn');
        const errorEl = document.getElementById('diagram-error');

        // Initialize Mermaid
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                themeVariables: {
                    primaryColor: '#10b981',
                    lineColor: '#34d399',
                    fontFamily: 'JetBrains Mono'
                }
            });
        }

        if (editor) {
            // Initial render
            editor.value = this.defaultTemplate;
            this.updatePreview(editor.value);

            // Real-time update
            let timeout;
            editor.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.updatePreview(editor.value);
                }, 500);
            });
        }

        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => {
                editor.value = this.defaultTemplate;
                this.updatePreview(editor.value);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                editor.value = 'graph TD\n  ';
                this.updatePreview(editor.value);
                editor.focus();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAsSvg());
        }

        // Toolbar Events
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const shape = btn.dataset.shape;
                const style = btn.dataset.style;
                this.injectCode(type, shape, style);
            });
        });
    },

    injectCode(type, shape, style) {
        const editor = document.getElementById('diagram-editor');
        if (!editor) return;

        let snippet = '';
        const cursor = editor.selectionStart;
        const textValue = editor.value;

        if (type === 'node') {
            const label = prompt('ノード名を入力してください', 'NewNode');
            if (!label) return;
            if (shape === 'round') snippet = `  ${label}((${label}))\n`;
            else if (shape === 'square') snippet = `  ${label}[${label}]\n`;
            else if (shape === 'rhombus') snippet = `  ${label}{${label}}\n`;
        } else if (type === 'edge') {
            if (style === 'straight') snippet = ' --- ';
            else snippet = ' --> ';
        } else if (type === 'subgraph') {
            const name = prompt('サブグラフ名（VLAN/Subnetなど）を入力してください', 'Subnet');
            if (!name) return;
            snippet = `\n  subgraph ${name}\n    \n  end\n`;
        }

        editor.value = textValue.substring(0, cursor) + snippet + textValue.substring(cursor);
        this.updatePreview(editor.value);
        editor.focus();
        editor.setSelectionRange(cursor + snippet.length, cursor + snippet.length);
    },

    async updatePreview(code) {
        const container = document.getElementById('mermaid-container');
        const errorEl = document.getElementById('diagram-error');
        if (!container) return;

        try {
            errorEl.classList.add('hidden');
            const { svg } = await mermaid.render('mermaid-svg-render', code);
            container.innerHTML = svg;
        } catch (err) {
            console.error('Mermaid error:', err);
            errorEl.innerText = '構文エラー: ' + err.message.split('\n')[0];
            errorEl.classList.remove('hidden');
            // Don't clear preview on typo, keep last valid
        }
    },

    saveAsSvg() {
        const svgEl = document.querySelector('#mermaid-container svg');
        if (!svgEl) {
            OpsMateHelpers.showToast('プレビューが表示されている状態で実行してください', 'error');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `network_diagram_${new Date().toISOString().slice(0, 10)}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        OpsMateHelpers.showToast('SVG画像を保存しました', 'success');
    }
};

window.NetworkDiagram = NetworkDiagram;
