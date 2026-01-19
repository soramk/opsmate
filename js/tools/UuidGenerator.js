/**
 * OpsMate - UUID / ULID Generator
 */

const UuidGenerator = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="fingerprint" class="w-5 h-5"></i>
                            UUID / ULID Generator
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="form-group mb-0">
                            <label class="form-label">Type</label>
                            <select id="uuid-type" class="form-select">
                                <option value="uuidv4">UUID v4 (Random)</option>
                                <option value="ulid">ULID (Sortable)</option>
                            </select>
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">Count</label>
                            <input type="number" id="uuid-count" class="form-input" value="5" min="1" max="100">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="uuid-uppercase">
                            Uppercase
                        </label>
                    </div>

                    <button class="btn btn-primary" id="uuid-generate-btn">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Generate
                    </button>
                </div>

                <div class="panel-card" id="uuid-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">Generated IDs</h2>
                        <button class="btn btn-secondary btn-sm" id="uuid-copy-btn">
                            <i data-lucide="copy" class="w-4 h-4"></i> Copy All
                        </button>
                    </div>
                    <textarea id="uuid-output" class="form-textarea code-textarea" rows="8" readonly></textarea>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('uuid-generate-btn')?.addEventListener('click', () => this.generate());
        document.getElementById('uuid-copy-btn')?.addEventListener('click', () => {
            OpsMateHelpers.copyToClipboard(document.getElementById('uuid-output').value);
        });
    },

    generate() {
        const type = document.getElementById('uuid-type').value;
        const count = Math.min(parseInt(document.getElementById('uuid-count').value) || 1, 100);
        const uppercase = document.getElementById('uuid-uppercase').checked;

        const results = [];
        for (let i = 0; i < count; i++) {
            let id = type === 'ulid' ? this.generateULID() : this.generateUUIDv4();
            if (uppercase) id = id.toUpperCase();
            results.push(id);
        }

        document.getElementById('uuid-output').value = results.join('\n');
        document.getElementById('uuid-result-panel').style.display = 'block';
        lucide.createIcons();
    },

    generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    generateULID() {
        const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
        const TIME_LEN = 10;
        const RANDOM_LEN = 16;

        let time = Date.now();
        let timeStr = '';
        for (let i = TIME_LEN - 1; i >= 0; i--) {
            timeStr = ENCODING[time % 32] + timeStr;
            time = Math.floor(time / 32);
        }

        let randomStr = '';
        for (let i = 0; i < RANDOM_LEN; i++) {
            randomStr += ENCODING[Math.floor(Math.random() * 32)];
        }

        return (timeStr + randomStr).toLowerCase();
    }
};

window.UuidGenerator = UuidGenerator;
