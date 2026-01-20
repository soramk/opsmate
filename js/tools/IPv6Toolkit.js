/**
 * OpsMate - IPv6 Toolkit
 */

const IPv6Toolkit = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'ipv6',
            title: 'IPv6ツールキットの使い方',
            description: 'IPv6アドレスの展開（フル表記）と圧縮（省略表記）を相互変換します。ネットワークアドレスの計算も可能です。',
            steps: [
                'IPv6アドレスを入力（CIDR付きも可）',
                '「変換実行」をクリック',
                '縮小表記、展開表記、ネットワークアドレスが表示',
                '各値はクリックでコピー可能'
            ],
            tips: [
                '::は連続する0のグループを省略した表記',
                '先頭の0も省略可能（0db8 → db8）',
                'fe80::/10 はリンクローカルアドレス',
                '2001:db8::/32 はドキュメント用の予約範囲'
            ],
            example: {
                title: '変換例',
                code: '2001:db8::1 ↔ 2001:0db8:0000:0000:0000:0000:0000:0001'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="network" class="w-5 h-5"></i>
                            IPv6 アドレスヘルパー
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">IPv6 アドレス (CIDR付き可)</label>
                        <input type="text" id="ipv6-input" class="form-input" 
                               placeholder="2001:db8::1/64" value="2001:0db8:0000:0000:0000:0000:0000:0001/64">
                    </div>
                    
                    <div class="flex gap-2 mb-4">
                        <button class="btn btn-primary" id="ipv6-process">
                            <i data-lucide="wand-2" class="w-4 h-4"></i> 変換実行
                        </button>
                    </div>
                    
                    <div id="ipv6-results" class="result-grid" style="display: none;"></div>

                    ${helpSection}
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="info" class="w-5 h-5"></i>
                            IPv6 特殊・予約アドレス範囲
                        </h2>
                    </div>
                    <div class="dc-reference-grid">
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">未指定アドレス</span>
                            <span class="dc-ref-value">::/128</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">ループバック</span>
                            <span class="dc-ref-value">::1/128</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">リンクローカル</span>
                            <span class="dc-ref-value">fe80::/10</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">ユニークローカル (ULA)</span>
                            <span class="dc-ref-value">fc00::/7</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">マルチキャスト</span>
                            <span class="dc-ref-value">ff00::/8</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">ドキュメント用</span>
                            <span class="dc-ref-value">2001:db8::/32</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('ipv6-process')?.addEventListener('click', () => this.process());
    },

    process() {
        const input = document.getElementById('ipv6-input').value.trim();
        if (!input) return;

        let [address, cidr] = input.split('/');

        // Simple IPv6 expander/compressor logic
        try {
            const expanded = this.expandIPv6(address);
            const compressed = this.compressIPv6(expanded);

            const results = [
                { label: '縮小表記 (Compressed)', value: compressed + (cidr ? '/' + cidr : '') },
                { label: '展開表記 (Expanded)', value: expanded + (cidr ? '/' + cidr : '') }
            ];

            if (cidr) {
                const prefix = parseInt(cidr);
                if (prefix >= 0 && prefix <= 128) {
                    results.push({ label: 'CIDR プレフィックス', value: '/' + prefix });
                    const network = this.getNetwork(expanded, prefix);
                    results.push({ label: 'ネットワークアドレス', value: network + '/' + prefix });
                }
            }

            this.displayResults(results);
        } catch (e) {
            OpsMateHelpers.showToast('無効な IPv6 アドレス形式です', 'error');
        }
    },

    expandIPv6(ip) {
        if (!ip.includes('::')) {
            const parts = ip.split(':');
            if (parts.length === 8) {
                return parts.map(p => p.padStart(4, '0')).join(':');
            }
        }

        let [left, right] = ip.split('::');
        let leftParts = left ? left.split(':') : [];
        let rightParts = right ? right.split(':') : [];
        let missing = 8 - (leftParts.length + rightParts.length);
        let middle = Array(missing).fill('0000');

        let full = [
            ...leftParts.map(p => p.padStart(4, '0')),
            ...middle,
            ...rightParts.map(p => p.padStart(4, '0'))
        ];

        return full.join(':');
    },

    compressIPv6(expanded) {
        let parts = expanded.split(':').map(p => parseInt(p, 16).toString(16));
        let str = parts.join(':');

        // Find longest sequence of zeros
        let zeroMatch = str.match(/(^|:)(0(:0)+)($|:)/);
        if (zeroMatch) {
            str = str.replace(zeroMatch[0], '::');
            // Remove double colons if it happens
            str = str.replace(':::', '::');
        }
        return str.replace(/^:$/, '::');
    },

    getNetwork(expanded, prefix) {
        const parts = expanded.split(':').map(p => parseInt(p, 16));
        const bitCount = prefix;

        const networkParts = parts.map((part, i) => {
            const bitOffset = i * 16;
            if (bitOffset >= bitCount) return 0;
            if (bitOffset + 16 <= bitCount) return part;

            const bitsInThisPart = bitCount - bitOffset;
            const mask = ((1 << 16) - 1) << (16 - bitsInThisPart) & 0xFFFF;
            return part & mask;
        });

        return this.compressIPv6(networkParts.map(p => p.toString(16).padStart(4, '0')).join(':'));
    },

    displayResults(results) {
        const container = document.getElementById('ipv6-results');
        container.innerHTML = results.map(item => `
            <div class="result-item">
                <div class="result-label">${item.label}</div>
                <div class="result-value">
                    <span>${item.value}</span>
                    <button class="copy-btn" onclick="OpsMateHelpers.copyToClipboard('${item.value}', this)">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        container.style.display = 'grid';
        lucide.createIcons();
    }
};

window.IPv6Toolkit = IPv6Toolkit;
