/**
 * OpsMate - Subnet VLSM Calculator
 */

const VlsmCalculator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'vlsm-calculator',
            title: 'VLSM計算機の使い方',
            description: '1つのネットワークを複数のサブネットに可変長で分割（VLSM: Variable Length Subnet Masking）します。',
            steps: [
                '親ネットワーク（例: 192.168.0.0/24）を入力します',
                '必要なサブネットのホスト数をカンマ区切りまたは改行で入力します',
                '「計算」ボタンで最適なVLSM分割結果が表示されます'
            ],
            tips: [
                'ホスト数が大きい順に配置すると効率的に割り当てられます',
                '各サブネットのネットワークアドレス、ブロードキャスト、使用可能範囲が確認できます',
                'アドレスが足りない場合はエラーが表示されます'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="git-branch" class="w-5 h-5"></i>
                            VLSM サブネット分割
                        </h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="form-group">
                            <label class="form-label">親ネットワーク (CIDR)</label>
                            <input type="text" id="vlsm-network" class="form-input" placeholder="192.168.0.0/24" value="192.168.0.0/24">
                        </div>
                        <div class="form-group flex items-end">
                            <button class="btn btn-primary w-full" id="vlsm-calc-btn">
                                <i data-lucide="calculator" class="w-4 h-4"></i> 計算
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">必要ホスト数 (カンマまたは改行区切り)</label>
                        <textarea id="vlsm-hosts" class="form-textarea" rows="4" placeholder="50&#10;30&#10;10&#10;10">50
30
10
10</textarea>
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="table" class="w-5 h-5"></i>
                            分割結果
                        </h2>
                    </div>
                    <div id="vlsm-result" class="overflow-x-auto"></div>
                </div>

                ${helpSection}
            </div>
        `;
    },

    init() {
        document.getElementById('vlsm-calc-btn').addEventListener('click', () => this.calculate());
    },

    calculate() {
        const networkInput = document.getElementById('vlsm-network').value.trim();
        const hostsInput = document.getElementById('vlsm-hosts').value.trim();
        const resultEl = document.getElementById('vlsm-result');

        // Parse network
        const match = networkInput.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
        if (!match) {
            resultEl.innerHTML = '<p class="text-rose-400">無効なCIDR形式です</p>';
            return;
        }

        const baseIp = this.ipToInt(match[1]);
        const baseCidr = parseInt(match[2]);
        const totalHosts = Math.pow(2, 32 - baseCidr);

        // Parse host requirements
        const hostReqs = hostsInput.split(/[\n,]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
        if (hostReqs.length === 0) {
            resultEl.innerHTML = '<p class="text-rose-400">ホスト数を入力してください</p>';
            return;
        }

        // Sort by size descending for efficient allocation
        const subnets = hostReqs.map((h, i) => ({ name: `Subnet ${i + 1}`, hosts: h }));
        subnets.sort((a, b) => b.hosts - a.hosts);

        // Calculate VLSM
        let currentIp = baseIp;
        const results = [];

        for (const subnet of subnets) {
            // Find smallest subnet that fits
            const neededHosts = subnet.hosts + 2; // +2 for network and broadcast
            let cidr = 32;
            while (Math.pow(2, 32 - cidr) < neededHosts && cidr > 0) cidr--;

            const subnetSize = Math.pow(2, 32 - cidr);

            // Check if within bounds
            if (currentIp + subnetSize > baseIp + totalHosts) {
                resultEl.innerHTML = '<p class="text-rose-400">アドレス空間が不足しています</p>';
                return;
            }

            const networkAddr = currentIp;
            const broadcast = currentIp + subnetSize - 1;
            const firstUsable = networkAddr + 1;
            const lastUsable = broadcast - 1;

            results.push({
                name: subnet.name,
                requested: subnet.hosts,
                cidr: `/${cidr}`,
                network: this.intToIp(networkAddr),
                mask: this.cidrToMask(cidr),
                broadcast: this.intToIp(broadcast),
                firstUsable: this.intToIp(firstUsable),
                lastUsable: this.intToIp(lastUsable),
                usable: subnetSize - 2
            });

            currentIp += subnetSize;
        }

        // Render table
        resultEl.innerHTML = `
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b" style="border-color: var(--border-color);">
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">名前</th>
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">要求</th>
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">CIDR</th>
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">ネットワーク</th>
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">使用可能範囲</th>
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">ブロードキャスト</th>
                        <th class="py-2 px-2 text-left" style="color: var(--text-muted);">使用可能数</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr class="border-b" style="border-color: var(--border-color);">
                            <td class="py-2 px-2" style="color: var(--text-primary);">${r.name}</td>
                            <td class="py-2 px-2" style="color: var(--text-secondary);">${r.requested}</td>
                            <td class="py-2 px-2 font-mono" style="color: var(--accent-primary);">${r.cidr}</td>
                            <td class="py-2 px-2 font-mono" style="color: var(--text-primary);">${r.network}</td>
                            <td class="py-2 px-2 font-mono" style="color: var(--text-secondary);">${r.firstUsable} - ${r.lastUsable}</td>
                            <td class="py-2 px-2 font-mono" style="color: var(--text-muted);">${r.broadcast}</td>
                            <td class="py-2 px-2" style="color: var(--accent-primary);">${r.usable}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    ipToInt(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    },

    intToIp(int) {
        return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    },

    cidrToMask(cidr) {
        const mask = ~((1 << (32 - cidr)) - 1) >>> 0;
        return this.intToIp(mask);
    }
};

window.VlsmCalculator = VlsmCalculator;
