/**
 * OpsMate - IP Subnet Calculator
 */

const SubnetCalculator = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="network" class="w-5 h-5"></i>
                            入力
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="subnet-ip">IPアドレス</label>
                        <input type="text" id="subnet-ip" class="form-input" 
                               placeholder="192.168.1.0" autocomplete="off">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="subnet-cidr">CIDR / プレフィックス長</label>
                        <div class="input-group">
                            <span style="padding: 0.75rem 1rem; color: var(--text-muted);">/</span>
                            <input type="number" id="subnet-cidr" class="form-input" 
                                   placeholder="24" min="0" max="32" value="24">
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="subnet-calculate">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        計算実行
                    </button>
                    
                    <div id="subnet-error" class="error-message" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="subnet-error-text"></span>
                    </div>
                </div>
                
                <div class="panel-card" id="subnet-results" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="info" class="w-5 h-5"></i>
                            計算結果
                        </h2>
                    </div>
                    <div class="result-grid" id="subnet-result-grid"></div>
                </div>
            </div>
        `;
    },

    init() {
        const calcBtn = document.getElementById('subnet-calculate');
        const ipInput = document.getElementById('subnet-ip');
        const cidrInput = document.getElementById('subnet-cidr');

        if (calcBtn) {
            calcBtn.addEventListener('click', () => this.calculate());
        }

        [ipInput, cidrInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.calculate();
                });
                input.addEventListener('input', () => this.hideError());
            }
        });
    },

    calculate() {
        const ip = document.getElementById('subnet-ip').value.trim();
        const cidr = document.getElementById('subnet-cidr').value.trim();

        if (!ip) {
            this.showError('IPアドレスを入力してください');
            return;
        }

        if (!OpsMateHelpers.isValidIPv4(ip)) {
            this.showError('無効なIPアドレス形式です');
            return;
        }

        if (!OpsMateHelpers.isValidCIDR(cidr)) {
            this.showError('CIDRは0から32の間で指定してください');
            return;
        }

        const results = this.computeSubnet(ip, parseInt(cidr));
        this.displayResults(results);
    },

    computeSubnet(ip, cidr) {
        const ipInt = OpsMateHelpers.ipToInt(ip);
        const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
        const wildcard = ~mask >>> 0;
        const network = (ipInt & mask) >>> 0;
        const broadcast = (network | wildcard) >>> 0;
        const firstHost = cidr >= 31 ? network : (network + 1) >>> 0;
        const lastHost = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;
        const hostCount = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;

        return {
            network: OpsMateHelpers.intToIp(network) + '/' + cidr,
            subnet: OpsMateHelpers.intToIp(mask),
            wildcard: OpsMateHelpers.intToIp(wildcard),
            broadcast: OpsMateHelpers.intToIp(broadcast),
            firstHost: OpsMateHelpers.intToIp(firstHost),
            lastHost: OpsMateHelpers.intToIp(lastHost),
            hostCount: OpsMateHelpers.formatNumber(hostCount)
        };
    },

    displayResults(results) {
        const grid = document.getElementById('subnet-result-grid');
        const container = document.getElementById('subnet-results');

        const items = [
            { label: 'ネットワークアドレス', value: results.network },
            { label: 'サブネットマスク', value: results.subnet },
            { label: 'ワイルドカードマスク', value: results.wildcard },
            { label: 'ブロードキャストアドレス', value: results.broadcast },
            { label: '最初のホスト', value: results.firstHost },
            { label: '最後のホスト', value: results.lastHost },
            { label: '利用可能ホスト数', value: results.hostCount }
        ];

        grid.innerHTML = items.map(item => `
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

        container.style.display = 'block';
        lucide.createIcons();
    },

    showError(msg) {
        const errorEl = document.getElementById('subnet-error');
        const textEl = document.getElementById('subnet-error-text');
        if (errorEl && textEl) {
            textEl.textContent = msg;
            errorEl.style.display = 'flex';
        }
    },

    hideError() {
        const errorEl = document.getElementById('subnet-error');
        if (errorEl) errorEl.style.display = 'none';
    }
};

window.SubnetCalculator = SubnetCalculator;
