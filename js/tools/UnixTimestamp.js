/**
 * OpsMate - Unix Timestamp Converter
 */

const UnixTimestamp = {
    clockInterval: null,

    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'unix',
            title: 'Unixタイムスタンプ変換の使い方',
            description: 'Unixタイムスタンプ（エポック時間）と人間が読める日時形式を相互変換します。ログ解析やAPI開発に便利です。',
            steps: [
                '上部で現在のUnixタイムスタンプをリアルタイム表示',
                '【Unix→日時】タイムスタンプを入力して変換',
                '【日時→Unix】日時を選択してUnixタイムスタンプに変換',
                '各値はクリックでコピー可能'
            ],
            tips: [
                'Unixタイムスタンプは1970年1月1日からの経過秒数',
                '秒とミリ秒（13桁）の両方に対応',
                'JSTとUTCの両方で結果を表示',
                'ISO 8601形式（2021-01-01T00:00:00Z）も出力'
            ],
            example: {
                title: '変換例',
                code: '1609459200 → 2021年1月1日 09:00:00 (JST) / 2021-01-01 00:00:00 (UTC)'
            }
        });

        return `
            <div class="tool-panel">
                <!-- 現在時刻表示 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                            現在の時刻
                        </h2>
                    </div>
                    <div class="current-time-display">
                        <div class="time-row">
                            <span class="time-label">Unix (秒)</span>
                            <span class="time-value" id="current-unix-sec">-</span>
                            <button class="copy-btn visible" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('current-unix-sec').textContent, this)">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="time-row">
                            <span class="time-label">Unix (ミリ秒)</span>
                            <span class="time-value" id="current-unix-ms">-</span>
                            <button class="copy-btn visible" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('current-unix-ms').textContent, this)">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="time-row">
                            <span class="time-label">ローカル時間 (JST)</span>
                            <span class="time-value" id="current-local">-</span>
                        </div>
                        <div class="time-row">
                            <span class="time-label">UTC</span>
                            <span class="time-value" id="current-utc">-</span>
                        </div>
                    </div>

                    ${helpSection}
                </div>
                
                <!-- Unix → 日時変換 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="arrow-right" class="w-5 h-5"></i>
                            Unix タイムスタンプ → 日時
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="unix-input">Unix タイムスタンプ</label>
                        <div class="input-group">
                            <input type="text" id="unix-input" class="form-input" placeholder="1609459200" autocomplete="off">
                            <select id="unix-unit" class="form-select">
                                <option value="s">秒</option>
                                <option value="ms">ミリ秒</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="unix-to-date">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        変換実行
                    </button>
                    
                    <div id="unix-to-date-error" class="error-message" style="display: none;">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="unix-to-date-error-text"></span>
                    </div>
                    
                    <div class="result-grid" id="unix-to-date-results" style="margin-top: 1.5rem; display: none;"></div>
                </div>
                
                <!-- 日時 → Unix変換 -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="arrow-left" class="w-5 h-5"></i>
                            日時 → Unix タイムスタンプ
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="date-input">日時</label>
                        <input type="datetime-local" id="date-input" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">タイムゾーン</label>
                        <div style="display: flex; gap: 1rem;">
                            <label class="radio-label"><input type="radio" name="tz" value="local" checked> ローカル (JST)</label>
                            <label class="radio-label"><input type="radio" name="tz" value="utc"> UTC</label>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="date-to-unix">
                        <i data-lucide="calculator" class="w-4 h-4"></i>
                        変換実行
                    </button>
                    
                    <div class="result-grid" id="date-to-unix-results" style="margin-top: 1.5rem; display: none;"></div>
                </div>
            </div>
        `;
    },

    init() {
        this.startClock();

        document.getElementById('unix-to-date')?.addEventListener('click', () => this.unixToDate());
        document.getElementById('date-to-unix')?.addEventListener('click', () => this.dateToUnix());
        document.getElementById('unix-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.unixToDate(); });

        // Set default datetime to now
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        const dateInput = document.getElementById('date-input');
        if (dateInput) dateInput.value = local;
    },

    startClock() {
        const update = () => {
            const now = Date.now();
            document.getElementById('current-unix-sec').textContent = Math.floor(now / 1000);
            document.getElementById('current-unix-ms').textContent = now;
            document.getElementById('current-local').textContent = new Date(now).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
            document.getElementById('current-utc').textContent = new Date(now).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        };
        update();
        this.clockInterval = setInterval(update, 1000);
    },

    unixToDate() {
        const input = document.getElementById('unix-input').value.trim();
        const unit = document.getElementById('unix-unit').value;

        if (!input || isNaN(input)) {
            this.showError('unix-to-date', '有効な Unix タイムスタンプを入力してください');
            return;
        }

        let ms = parseInt(input);
        if (unit === 's') ms *= 1000;

        const date = new Date(ms);
        if (isNaN(date.getTime())) {
            this.showError('unix-to-date', '無効なタイムスタンプです');
            return;
        }

        const results = [
            { label: 'ローカル時間 (JST)', value: date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) },
            { label: 'UTC', value: date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC' },
            { label: 'ISO 8601', value: date.toISOString() }
        ];

        this.displayResults('unix-to-date-results', results);
        this.hideError('unix-to-date');
    },

    dateToUnix() {
        const input = document.getElementById('date-input').value;
        const tz = document.querySelector('input[name="tz"]:checked')?.value || 'local';

        if (!input) return;

        let date;
        if (tz === 'utc') {
            date = new Date(input + 'Z');
        } else {
            date = new Date(input);
        }

        const ms = date.getTime();
        const sec = Math.floor(ms / 1000);

        const results = [
            { label: 'Unix (秒)', value: sec.toString() },
            { label: 'Unix (ミリ秒)', value: ms.toString() },
            { label: 'ISO 8601', value: date.toISOString() }
        ];

        this.displayResults('date-to-unix-results', results);
    },

    displayResults(containerId, results) {
        const grid = document.getElementById(containerId);
        grid.innerHTML = results.map(item => `
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
        grid.style.display = 'grid';
        lucide.createIcons();
    },

    showError(prefix, msg) {
        const el = document.getElementById(prefix + '-error');
        const txt = document.getElementById(prefix + '-error-text');
        if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
    },

    hideError(prefix) {
        const el = document.getElementById(prefix + '-error');
        if (el) el.style.display = 'none';
    },

    cleanup() {
        if (this.clockInterval) clearInterval(this.clockInterval);
    }
};

window.UnixTimestamp = UnixTimestamp;
