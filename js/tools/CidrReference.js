/**
 * OpsMate - CIDR Quick Reference (CIDRクイックリファレンス)
 */

const CidrReference = {
    cidrTable: [
        { cidr: '/32', mask: '255.255.255.255', hosts: 1, wildcard: '0.0.0.0', usable: 1 },
        { cidr: '/31', mask: '255.255.255.254', hosts: 2, wildcard: '0.0.0.1', usable: 2 },
        { cidr: '/30', mask: '255.255.255.252', hosts: 4, wildcard: '0.0.0.3', usable: 2 },
        { cidr: '/29', mask: '255.255.255.248', hosts: 8, wildcard: '0.0.0.7', usable: 6 },
        { cidr: '/28', mask: '255.255.255.240', hosts: 16, wildcard: '0.0.0.15', usable: 14 },
        { cidr: '/27', mask: '255.255.255.224', hosts: 32, wildcard: '0.0.0.31', usable: 30 },
        { cidr: '/26', mask: '255.255.255.192', hosts: 64, wildcard: '0.0.0.63', usable: 62 },
        { cidr: '/25', mask: '255.255.255.128', hosts: 128, wildcard: '0.0.0.127', usable: 126 },
        { cidr: '/24', mask: '255.255.255.0', hosts: 256, wildcard: '0.0.0.255', usable: 254 },
        { cidr: '/23', mask: '255.255.254.0', hosts: 512, wildcard: '0.0.1.255', usable: 510 },
        { cidr: '/22', mask: '255.255.252.0', hosts: 1024, wildcard: '0.0.3.255', usable: 1022 },
        { cidr: '/21', mask: '255.255.248.0', hosts: 2048, wildcard: '0.0.7.255', usable: 2046 },
        { cidr: '/20', mask: '255.255.240.0', hosts: 4096, wildcard: '0.0.15.255', usable: 4094 },
        { cidr: '/19', mask: '255.255.224.0', hosts: 8192, wildcard: '0.0.31.255', usable: 8190 },
        { cidr: '/18', mask: '255.255.192.0', hosts: 16384, wildcard: '0.0.63.255', usable: 16382 },
        { cidr: '/17', mask: '255.255.128.0', hosts: 32768, wildcard: '0.0.127.255', usable: 32766 },
        { cidr: '/16', mask: '255.255.0.0', hosts: 65536, wildcard: '0.0.255.255', usable: 65534 },
        { cidr: '/15', mask: '255.254.0.0', hosts: 131072, wildcard: '0.1.255.255', usable: 131070 },
        { cidr: '/14', mask: '255.252.0.0', hosts: 262144, wildcard: '0.3.255.255', usable: 262142 },
        { cidr: '/13', mask: '255.248.0.0', hosts: 524288, wildcard: '0.7.255.255', usable: 524286 },
        { cidr: '/12', mask: '255.240.0.0', hosts: 1048576, wildcard: '0.15.255.255', usable: 1048574 },
        { cidr: '/11', mask: '255.224.0.0', hosts: 2097152, wildcard: '0.31.255.255', usable: 2097150 },
        { cidr: '/10', mask: '255.192.0.0', hosts: 4194304, wildcard: '0.63.255.255', usable: 4194302 },
        { cidr: '/9', mask: '255.128.0.0', hosts: 8388608, wildcard: '0.127.255.255', usable: 8388606 },
        { cidr: '/8', mask: '255.0.0.0', hosts: 16777216, wildcard: '0.255.255.255', usable: 16777214 }
    ],

    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'cidr',
            title: 'CIDRリファレンスの使い方',
            description: 'CIDR表記、サブネットマスク、ホスト数の一覧表と、サブネット分割計算機能を提供します。',
            steps: [
                '上部の検索欄でCIDR、マスク、ホスト数を検索',
                '下部でサブネット分割計算が可能',
                'ネットワークアドレスと現在のCIDRを入力',
                '分割数を選択して計算実行'
            ],
            tips: [
                '/24 = 254ホスト（一般的なLAN）',
                '/30 = 2ホスト（ポイントツーポイント）',
                '/32 = 1ホスト（単一ホストルート）',
                'プライベートIP範囲も一覧表示'
            ],
            example: {
                title: '分割例',
                code: '192.168.0.0/24 を 4分割 → /26 x 4 (各62ホスト)'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="table" class="w-5 h-5"></i>
                            CIDR 表記クイックリファレンス
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <input type="text" id="cidr-search" class="form-input" 
                               placeholder="CIDR、マスク、またはホスト数で検索..." autocomplete="off">
                    </div>
                    
                    <div class="port-table-container">
                        <table class="port-table" id="cidr-table">
                            <thead>
                                <tr>
                                    <th>CIDR</th>
                                    <th>サブネットマスク</th>
                                    <th>ワイルドカード</th>
                                    <th>IP総数</th>
                                    <th>利用可能ホスト数</th>
                                </tr>
                            </thead>
                            <tbody id="cidr-table-body"></tbody>
                        </table>
                    </div>

                    ${helpSection}
                </div>
                
                <!-- プライベートIPレンジ -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="lock" class="w-5 h-5"></i>
                            プライベート IP レンジ (RFC 1918)
                        </h2>
                    </div>
                    <div class="dc-reference-grid">
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">Class A</span>
                            <span class="dc-ref-value">10.0.0.0/8</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">Class B</span>
                            <span class="dc-ref-value">172.16.0.0/12</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">Class C</span>
                            <span class="dc-ref-value">192.168.0.0/16</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">Link-Local</span>
                            <span class="dc-ref-value">169.254.0.0/16</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">Loopback</span>
                            <span class="dc-ref-value">127.0.0.0/8</span>
                        </div>
                        <div class="dc-ref-item">
                            <span class="dc-ref-label">CGNAT</span>
                            <span class="dc-ref-value">100.64.0.0/10</span>
                        </div>
                    </div>
                </div>
                
                <!-- サブネット分割計算 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="split" class="w-5 h-5"></i>
                            サブネット分割計算
                        </h2>
                    </div>
                    
                    <div class="calc-grid">
                        <div class="form-group">
                            <label class="form-label">ネットワーク</label>
                            <input type="text" id="cidr-network" class="form-input" placeholder="192.168.0.0" value="192.168.0.0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">現在の CIDR</label>
                            <select id="cidr-current" class="form-select">
                                ${[24, 23, 22, 21, 20, 19, 18, 17, 16].map(c => `<option value="${c}" ${c === 24 ? 'selected' : ''}>/${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">分割数</label>
                            <select id="cidr-divide" class="form-select">
                                <option value="2">2 分割</option>
                                <option value="4">4 分割</option>
                                <option value="8">8 分割</option>
                                <option value="16">16 分割</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="cidr-calc-divide">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        サブネット計算
                    </button>
                    
                    <div id="cidr-divide-results" style="margin-top: 1rem; display: none;"></div>
                </div>
            </div>
        `;
    },

    init() {
        this.renderTable(this.cidrTable);

        document.getElementById('cidr-search')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.cidrTable.filter(row =>
                row.cidr.includes(query) ||
                row.mask.includes(query) ||
                row.hosts.toString().includes(query) ||
                row.usable.toString().includes(query)
            );
            this.renderTable(filtered);
        });

        document.getElementById('cidr-calc-divide')?.addEventListener('click', () => this.calcDivide());
    },

    renderTable(data) {
        const tbody = document.getElementById('cidr-table-body');
        if (!tbody) return;

        tbody.innerHTML = data.map(row => `
            <tr>
                <td class="port-number">${row.cidr}</td>
                <td class="service-name">${row.mask}</td>
                <td>${row.wildcard}</td>
                <td>${row.hosts.toLocaleString()}</td>
                <td>${row.usable.toLocaleString()}</td>
            </tr>
        `).join('');
    },

    calcDivide() {
        const network = document.getElementById('cidr-network').value.trim();
        const currentCidr = parseInt(document.getElementById('cidr-current').value);
        const divideInto = parseInt(document.getElementById('cidr-divide').value);

        if (!OpsMateHelpers.isValidIPv4(network)) {
            OpsMateHelpers.showToast('無効なIPアドレスです', 'error');
            return;
        }

        const newCidr = currentCidr + Math.log2(divideInto);
        if (newCidr > 32) {
            OpsMateHelpers.showToast('これ以上分割できません', 'error');
            return;
        }

        const baseInt = OpsMateHelpers.ipToInt(network);
        const blockSize = Math.pow(2, 32 - newCidr);

        const subnets = [];
        for (let i = 0; i < divideInto; i++) {
            const subnetInt = baseInt + (i * blockSize);
            subnets.push({
                network: OpsMateHelpers.intToIp(subnetInt) + '/' + newCidr,
                first: OpsMateHelpers.intToIp(subnetInt + 1),
                last: OpsMateHelpers.intToIp(subnetInt + blockSize - 2),
                broadcast: OpsMateHelpers.intToIp(subnetInt + blockSize - 1)
            });
        }

        const container = document.getElementById('cidr-divide-results');
        container.innerHTML = `
            <div class="result-grid">
                ${subnets.map((s, i) => `
                    <div class="result-item">
                        <div class="result-label">サブネット ${i + 1}</div>
                        <div class="result-value"><span>${s.network}</span></div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                            ${s.first} - ${s.last}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.style.display = 'block';
    }
};

window.CidrReference = CidrReference;
