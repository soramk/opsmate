/**
 * OpsMate - Cron Expression Master
 */

const CronMaster = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="alarm-clock" class="w-5 h-5"></i>
                            Cron 設定ガイド (Explainer)
                        </h2>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cron 設定式 (5フィールド)</label>
                        <div class="input-group">
                            <input type="text" id="cron-input" class="form-input" 
                                   placeholder="*/15 9-17 * * 1-5" value="0 0 * * *">
                            <button class="btn btn-primary" id="cron-explain">
                                <i data-lucide="message-square" class="w-4 h-4"></i> 解説
                            </button>
                        </div>
                        <p class="header-description" style="margin-top: 0.5rem;">
                            フォーマット: 分 時 日 月 曜日
                        </p>
                    </div>

                    <div id="cron-result" class="password-result" style="display: none;">
                        <div class="password-display" id="cron-human-text"></div>
                        <div id="cron-next-dates" style="font-size: 0.8rem; color: var(--text-muted);"></div>
                    </div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="plus-circle" class="w-5 h-5"></i>
                            定番のプリセット
                        </h2>
                    </div>
                    <div class="quick-patterns">
                        <button class="quick-pattern-btn" data-cron="0 * * * *">毎時 0分</button>
                        <button class="quick-pattern-btn" data-cron="0 0 * * *">毎日 深夜0時</button>
                        <button class="quick-pattern-btn" data-cron="0 0 * * 0">毎週 日曜日 深夜0時</button>
                        <button class="quick-pattern-btn" data-cron="*/15 * * * *">15分おき</button>
                        <button class="quick-pattern-btn" data-cron="0 9-17 * * 1-5">平日 営業時間(9-17時)の毎時0分</button>
                        <button class="quick-pattern-btn" data-cron="0 0 1 * *">毎月 1日 深夜0時</button>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('cron-explain')?.addEventListener('click', () => this.explain());
        document.querySelectorAll('.quick-pattern-btn[data-cron]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('cron-input').value = btn.dataset.cron;
                this.explain();
            });
        });
    },

    explain() {
        const expression = document.getElementById('cron-input').value.trim();
        const parts = expression.split(/\s+/);

        if (parts.length !== 5) {
            OpsMateHelpers.showToast('Cron式は5つのフィールド（分 時 日 月 曜日）で指定してください', 'error');
            return;
        }

        const [min, hour, day, month, week] = parts;
        let result = "このCron設定は：<br><strong style='color: var(--accent-primary);'>";

        try {
            const humanMin = this.partToText(min, 'minute');
            const humanHour = this.partToText(hour, 'hour');
            const humanDay = this.partToText(day, 'day');
            const humanMonth = this.partToText(month, 'month');
            const humanWeek = this.partToText(week, 'weekday');

            result += `${humanMonth}${humanDay}${humanWeek} の ${humanHour}${humanMin} に実行されます。`;
            result += "</strong>";

            const resultEl = document.getElementById('cron-result');
            document.getElementById('cron-human-text').innerHTML = result;
            resultEl.style.display = 'block';
        } catch (e) {
            OpsMateHelpers.showToast('Cron式の構文が無効です', 'error');
        }
    },

    partToText(part, type) {
        if (part === '*') {
            if (type === 'minute') return '毎分';
            if (type === 'hour') return '毎時';
            return '';
        }

        if (part.includes('/')) {
            const [range, step] = part.split('/');
            return `${step}${this.getUnit(type)}おき`;
        }

        if (part.includes('-')) {
            const [start, end] = part.split('-');
            return `${start}から${end}${this.getUnit(type)}の間`;
        }

        if (part.includes(',')) {
            return `${part}${this.getUnit(type)}`;
        }

        return `${part}${this.getUnit(type)}`;
    },

    getUnit(type) {
        return {
            minute: '分',
            hour: '時',
            day: '日',
            month: '月',
            weekday: '曜日'
        }[type];
    }
};

window.CronMaster = CronMaster;
