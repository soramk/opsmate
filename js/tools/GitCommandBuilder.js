/**
 * OpsMate - Git Command Builder
 */

const GitCommandBuilder = {
    render() {
        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="git-branch" class="w-5 h-5"></i>
                            Git コマンドビルダー
                        </h2>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4" id="git-categories">
                        <button class="template-btn active" data-cat="basic">基本</button>
                        <button class="template-btn" data-cat="branch">ブランチ</button>
                        <button class="template-btn" data-cat="remote">リモート</button>
                    </div>
                    <div class="form-group mb-4">
                        <label class="form-label">コマンド</label>
                        <select id="git-command" class="form-select"></select>
                    </div>
                    <div id="git-params" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                </div>
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="terminal" class="w-5 h-5"></i>
                            生成コマンド
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('git-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="git-output" class="code-output p-4 rounded-lg font-mono text-sm"></pre>
                </div>
                <div class="panel-card mt-6">
                    <div class="panel-header"><h2 class="panel-title" style="color: var(--text-secondary);">よく使うコマンド</h2></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" style="background: var(--bg-secondary); border-color: var(--border-color);" onclick="OpsMateHelpers.copyToClipboard('git status -s')">
                            <div class="text-xs" style="color: var(--text-muted);">ステータス確認</div>
                            <code class="text-xs" style="color: var(--accent-primary);">git status -s</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" style="background: var(--bg-secondary); border-color: var(--border-color);" onclick="OpsMateHelpers.copyToClipboard('git log --oneline -10')">
                            <div class="text-xs" style="color: var(--text-muted);">直近10件の履歴</div>
                            <code class="text-xs" style="color: var(--accent-primary);">git log --oneline -10</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" style="background: var(--bg-secondary); border-color: var(--border-color);" onclick="OpsMateHelpers.copyToClipboard('git fetch --all --prune')">
                            <div class="text-xs" style="color: var(--text-muted);">全リモート取得</div>
                            <code class="text-xs" style="color: var(--accent-primary);">git fetch --all --prune</code>
                        </div>
                        <div class="quick-ref-item p-3 rounded-lg cursor-pointer border" style="background: var(--bg-secondary); border-color: var(--border-color);" onclick="OpsMateHelpers.copyToClipboard('git reset HEAD~1')">
                            <div class="text-xs" style="color: var(--text-muted);">直前コミット取消</div>
                            <code class="text-xs" style="color: var(--accent-primary);">git reset HEAD~1</code>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    currentCat: 'basic',
    commands: {
        basic: [
            { id: 'clone', name: 'clone', params: ['url'], cmd: p => `git clone ${p.url}` },
            { id: 'add', name: 'add', params: ['files'], cmd: p => `git add ${p.files}` },
            { id: 'commit', name: 'commit', params: ['message'], cmd: p => `git commit -m "${p.message}"` },
            { id: 'status', name: 'status', params: [], cmd: () => 'git status' },
            { id: 'log', name: 'log', params: ['count'], cmd: p => `git log --oneline -${p.count}` }
        ],
        branch: [
            { id: 'branch', name: 'branch -a', params: [], cmd: () => 'git branch -a' },
            { id: 'checkout', name: 'checkout', params: ['name'], cmd: p => `git checkout ${p.name}` },
            { id: 'checkout-b', name: 'checkout -b', params: ['name'], cmd: p => `git checkout -b ${p.name}` },
            { id: 'merge', name: 'merge', params: ['branch'], cmd: p => `git merge ${p.branch}` },
            { id: 'delete', name: 'branch -d', params: ['name'], cmd: p => `git branch -d ${p.name}` }
        ],
        remote: [
            { id: 'remote', name: 'remote -v', params: [], cmd: () => 'git remote -v' },
            { id: 'fetch', name: 'fetch', params: ['remote'], cmd: p => `git fetch ${p.remote}` },
            { id: 'pull', name: 'pull', params: ['remote', 'branch'], cmd: p => `git pull ${p.remote} ${p.branch}` },
            { id: 'push', name: 'push', params: ['remote', 'branch'], cmd: p => `git push ${p.remote} ${p.branch}` },
            { id: 'push-u', name: 'push -u', params: ['remote', 'branch'], cmd: p => `git push -u ${p.remote} ${p.branch}` }
        ]
    },
    defaults: { url: 'https://github.com/user/repo.git', files: '.', message: 'Update', count: '10', name: 'feature/new', branch: 'main', remote: 'origin' },
    init() {
        document.querySelectorAll('#git-categories .template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#git-categories .template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCat = btn.dataset.cat;
                this.renderCommands();
            });
        });
        document.getElementById('git-command').addEventListener('change', () => this.renderParams());
        this.renderCommands();
    },
    renderCommands() {
        const select = document.getElementById('git-command');
        select.innerHTML = this.commands[this.currentCat].map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        this.renderParams();
    },
    renderParams() {
        const cmdId = document.getElementById('git-command').value;
        const cmd = this.commands[this.currentCat].find(c => c.id === cmdId);
        const container = document.getElementById('git-params');
        if (!cmd || !cmd.params.length) { container.innerHTML = ''; this.generate(); return; }
        container.innerHTML = cmd.params.map(p => `<div class="form-group"><label class="form-label">${p}</label><input type="text" class="form-input git-param" data-param="${p}" value="${this.defaults[p] || ''}"></div>`).join('');
        container.querySelectorAll('.git-param').forEach(i => i.addEventListener('input', () => this.generate()));
        this.generate();
    },
    generate() {
        const cmdId = document.getElementById('git-command').value;
        const cmd = this.commands[this.currentCat].find(c => c.id === cmdId);
        if (!cmd) return;
        const params = {};
        document.querySelectorAll('.git-param').forEach(i => params[i.dataset.param] = i.value);
        document.getElementById('git-output').textContent = cmd.cmd(params);
    }
};
window.GitCommandBuilder = GitCommandBuilder;
