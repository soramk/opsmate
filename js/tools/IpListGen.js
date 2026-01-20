/**
 * OpsMate - IP Address List Generator
 */

const IpListGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'ip-list',
            title: 'IPアドレスリスト生成の使い方',
            description: 'CIDR表記（192.168.1.0/24）や範囲指定（10.0.0.1-10.0.0.50）から、含まれる全てのIPアドレスをリストとして展開します。',
            steps: [
                '生成元の形式（CIDR または 範囲）を選択します',
                '値を入力します（例: 172.16.0.0/28）',
                '「リスト生成」をクリックすると、全IPアドレスが表示されます',
                '出力形式（プレーンテキスト、CSV、JSON）を選択してコピーできます'
            ],
            tips: [
                '大量のIP生成（/16以上など）はブラウザが重くなる可能性があるため注意してください',
                '生成されたリストは、AnsibleのインベントリやFW設定の流し込みに活用できます',
                '「範囲」の場合、開始IPと終了IPをハイフンで繋いで入力してください'
            ],
            example: {
                title: '入力例',
                code: '192.168.1.0/29 -> 8個のIPを生成'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="list" class="w-5 h-5"></i>
                            生成設定
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">入力形式</label>
                        <div style="display: flex; gap: 1rem;">
                            <label class="radio-label">
                                <input type="radio" name="ip-format" value="cidr" checked> CIDR表記
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="ip-format" value="range"> 範囲指定 (Start-End)
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" id="ip-input-label">CIDR (例: 192.168.1.0/24)</label>
                        <input type="text" id="ip-gen-input" class="form-input" placeholder="192.168.1.0/24">
                    </div>

                    <div class="form-group">
                        <label class="form-label">出力形式</label>
                        <select id="ip-output-type" class="form-select">
                            <option value="newline">改行区切り (Plain Text)</option>
                            <option value="comma">カンマ区切り (CSV)</option>
                            <option value="json">JSON Array</option>
                        </select>
                    </div>

                    <button class="btn btn-primary" id="ip-gen-btn">
                        <i data-lucide="play" class="w-4 h-4"></i> リスト生成
                    </button>

                    <div id="ip-gen-error" class="error-message mt-4" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="ip-gen-error-text"></span>
                    </div>
                </div>

                <div class="panel-card" id="ip-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            生成結果 (<span id="ip-count">0</span> IPs)
                        </h2>
                        <button class="btn btn-secondary btn-sm" id="ip-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> 全てコピー
                        </button>
                    </div>
                    <textarea id="ip-output" class="form-textarea code-textarea" rows="10" readonly></textarea>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        const genBtn = document.getElementById('ip-gen-btn');
        const formatRadios = document.getElementsByName('ip-format');
        const copyBtn = document.getElementById('ip-copy-btn');

        if (genBtn) genBtn.addEventListener('click', () => this.generate());

        if (formatRadios) {
            formatRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    const label = document.getElementById('ip-input-label');
                    const input = document.getElementById('ip-gen-input');
                    if (radio.value === 'cidr') {
                        label.textContent = 'CIDR (例: 192.168.1.0/24)';
                        input.placeholder = '192.168.1.0/24';
                    } else {
                        label.textContent = '範囲 (例: 10.0.0.1-10.0.0.50)';
                        input.placeholder = '10.0.0.1-10.0.0.50';
                    }
                });
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const output = document.getElementById('ip-output').value;
                OpsMateHelpers.copyToClipboard(output, copyBtn);
            });
        }
    },

    generate() {
        const input = document.getElementById('ip-gen-input').value.trim();
        const format = document.querySelector('input[name="ip-format"]:checked').value;
        const outType = document.getElementById('ip-output-type').value;
        const panel = document.getElementById('ip-result-panel');
        const error = document.getElementById('ip-gen-error');
        const errorTxt = document.getElementById('ip-gen-error-text');

        if (!input) {
            errorTxt.textContent = '値を入力してください';
            error.style.display = 'flex';
            return;
        }

        let ips = [];
        try {
            if (format === 'cidr') {
                ips = this.parseCidr(input);
            } else {
                ips = this.parseRange(input);
            }

            if (ips.length > 65536) {
                if (!confirm(`${ips.length} 個のIPアドレスを生成しようとしています。ブラウザがフリーズする可能性があります。実行しますか？`)) {
                    return;
                }
            }

            let result = '';
            if (outType === 'newline') {
                result = ips.join('\n');
            } else if (outType === 'comma') {
                result = ips.join(', ');
            } else {
                result = JSON.stringify(ips, null, 2);
            }

            document.getElementById('ip-output').value = result;
            document.getElementById('ip-count').textContent = ips.length.toLocaleString();
            panel.style.display = 'block';
            error.style.display = 'none';
            panel.scrollIntoView({ behavior: 'smooth' });

        } catch (e) {
            errorTxt.textContent = e.message || '無効な形式です';
            error.style.display = 'flex';
            panel.style.display = 'none';
        }
    },

    parseCidr(cidr) {
        const parts = cidr.split('/');
        if (parts.length !== 2) throw new Error('CIDRの形式が正しくありません (例: 192.168.1.0/24)');

        const ip = parts[0];
        const mask = parseInt(parts[1]);
        if (isNaN(mask) || mask < 0 || mask > 32) throw new Error('サブネットマスクが無効です');

        const ipInt = this.ipToInt(ip);
        const hostBits = 32 - mask;
        const numHosts = Math.pow(2, hostBits);

        const networkInt = (ipInt >>> hostBits) << hostBits;

        const list = [];
        for (let i = 0; i < numHosts; i++) {
            list.push(this.intToIp(networkInt + i));
        }
        return list;
    },

    parseRange(range) {
        const parts = range.split('-');
        if (parts.length !== 2) throw new Error('範囲の形式が正しくありません (例: 10.0.0.1-10.0.0.50)');

        const startInt = this.ipToInt(parts[0].trim());
        const endInt = this.ipToInt(parts[1].trim());

        if (startInt > endInt) throw new Error('開始IPが終了IPより大きいです');

        const list = [];
        for (let i = startInt; i <= endInt; i++) {
            list.push(this.intToIp(i));
        }
        return list;
    },

    ipToInt(ip) {
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
            throw new Error(`無効なIPアドレスです: ${ip}`);
        }
        return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    },

    intToIp(int) {
        return [
            (int >>> 24) & 0xFF,
            (int >>> 16) & 0xFF,
            (int >>> 8) & 0xFF,
            int & 0xFF
        ].join('.');
    }
};

window.IpListGen = IpListGen;
