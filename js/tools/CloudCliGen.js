/**
 * OpsMate - AWS/Cloud CLI Generator
 */

const CloudCliGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'cloud-cli-gen',
            title: 'クラウドCLI生成の使い方',
            description: 'AWS, Azure, GCPの主要なCLIコマンドをGUIから簡単に生成します。',
            steps: [
                'クラウドプロバイダーを選択します',
                '操作対象（EC2, S3, IAMなど）と操作を選択します',
                'パラメータを入力してコマンドを生成します'
            ],
            tips: [
                'プロファイル名を設定すると --profile オプションが自動追加されます',
                '出力形式（JSON/Table/Text）も選択可能です',
                '生成されたコマンドは直接ターミナルで実行できます'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="cloud" class="w-5 h-5"></i>
                            クラウド CLI 生成
                        </h2>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4" id="cloud-provider">
                        <button class="template-btn active" data-provider="aws">AWS</button>
                        <button class="template-btn" data-provider="azure">Azure</button>
                        <button class="template-btn" data-provider="gcp">GCP</button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="form-group">
                            <label class="form-label">サービス</label>
                            <select id="cloud-service" class="form-select"></select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">操作</label>
                            <select id="cloud-action" class="form-select"></select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">プロファイル (任意)</label>
                            <input type="text" id="cloud-profile" class="form-input" placeholder="default">
                        </div>
                    </div>

                    <div id="cloud-params" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="terminal" class="w-5 h-5"></i>
                            生成コマンド
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('cloud-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="cloud-output" class="code-output p-4 rounded-lg font-mono text-sm overflow-auto"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    currentProvider: 'aws',

    services: {
        aws: {
            ec2: {
                name: 'EC2',
                actions: {
                    'describe-instances': { label: 'インスタンス一覧', params: [] },
                    'start-instances': { label: 'インスタンス起動', params: ['instance-id'] },
                    'stop-instances': { label: 'インスタンス停止', params: ['instance-id'] },
                    'describe-security-groups': { label: 'セキュリティグループ一覧', params: [] }
                }
            },
            s3: {
                name: 'S3',
                actions: {
                    'ls': { label: 'バケット一覧', params: [] },
                    'ls s3://': { label: 'オブジェクト一覧', params: ['bucket'] },
                    'cp': { label: 'コピー', params: ['source', 'dest'] },
                    'sync': { label: '同期', params: ['source', 'dest'] }
                }
            },
            iam: {
                name: 'IAM',
                actions: {
                    'list-users': { label: 'ユーザー一覧', params: [] },
                    'list-roles': { label: 'ロール一覧', params: [] },
                    'get-user': { label: 'ユーザー詳細', params: ['user-name'] }
                }
            },
            rds: {
                name: 'RDS',
                actions: {
                    'describe-db-instances': { label: 'DBインスタンス一覧', params: [] },
                    'describe-db-clusters': { label: 'DBクラスター一覧', params: [] }
                }
            }
        },
        azure: {
            vm: {
                name: 'VM',
                actions: {
                    'list': { label: 'VM一覧', params: [] },
                    'start': { label: 'VM起動', params: ['name', 'resource-group'] },
                    'stop': { label: 'VM停止', params: ['name', 'resource-group'] }
                }
            },
            storage: {
                name: 'Storage',
                actions: {
                    'account list': { label: 'ストレージアカウント一覧', params: [] },
                    'blob list': { label: 'Blob一覧', params: ['account-name', 'container-name'] }
                }
            }
        },
        gcp: {
            compute: {
                name: 'Compute Engine',
                actions: {
                    'instances list': { label: 'インスタンス一覧', params: [] },
                    'instances start': { label: 'インスタンス起動', params: ['name', 'zone'] },
                    'instances stop': { label: 'インスタンス停止', params: ['name', 'zone'] }
                }
            },
            storage: {
                name: 'Cloud Storage',
                actions: {
                    'ls': { label: 'バケット一覧', params: [] },
                    'ls gs://': { label: 'オブジェクト一覧', params: ['bucket'] }
                }
            }
        }
    },

    init() {
        document.querySelectorAll('#cloud-provider .template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#cloud-provider .template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentProvider = btn.dataset.provider;
                this.renderServices();
            });
        });

        document.getElementById('cloud-service').addEventListener('change', () => this.renderActions());
        document.getElementById('cloud-action').addEventListener('change', () => this.renderParams());
        document.getElementById('cloud-profile').addEventListener('input', () => this.generate());

        this.renderServices();
    },

    renderServices() {
        const select = document.getElementById('cloud-service');
        const services = this.services[this.currentProvider];
        select.innerHTML = Object.keys(services).map(k => `<option value="${k}">${services[k].name}</option>`).join('');
        this.renderActions();
    },

    renderActions() {
        const service = document.getElementById('cloud-service').value;
        const actions = this.services[this.currentProvider][service]?.actions || {};
        const select = document.getElementById('cloud-action');
        select.innerHTML = Object.keys(actions).map(k => `<option value="${k}">${actions[k].label}</option>`).join('');
        this.renderParams();
    },

    renderParams() {
        const service = document.getElementById('cloud-service').value;
        const action = document.getElementById('cloud-action').value;
        const actionData = this.services[this.currentProvider][service]?.actions[action];
        const container = document.getElementById('cloud-params');

        if (!actionData || actionData.params.length === 0) {
            container.innerHTML = '';
            this.generate();
            return;
        }

        container.innerHTML = actionData.params.map(p => `
            <div class="form-group">
                <label class="form-label">${p}</label>
                <input type="text" class="form-input cloud-param" data-param="${p}" placeholder="${p}">
            </div>
        `).join('');

        container.querySelectorAll('input').forEach(el => el.addEventListener('input', () => this.generate()));
        this.generate();
    },

    generate() {
        const provider = this.currentProvider;
        const service = document.getElementById('cloud-service').value;
        const action = document.getElementById('cloud-action').value;
        const profile = document.getElementById('cloud-profile').value;

        let cmd = '';
        const params = {};
        document.querySelectorAll('.cloud-param').forEach(el => {
            params[el.dataset.param] = el.value;
        });

        if (provider === 'aws') {
            if (service === 's3') {
                cmd = `aws s3 ${action}`;
                if (action.includes('s3://') && params.bucket) cmd = `aws s3 ls s3://${params.bucket}`;
                if (action === 'cp') cmd = `aws s3 cp ${params.source || '<source>'} ${params.dest || '<dest>'}`;
                if (action === 'sync') cmd = `aws s3 sync ${params.source || '<source>'} ${params.dest || '<dest>'}`;
            } else {
                cmd = `aws ${service} ${action}`;
                Object.keys(params).forEach(k => {
                    if (params[k]) cmd += ` --${k} ${params[k]}`;
                });
            }
            if (profile) cmd += ` --profile ${profile}`;
        } else if (provider === 'azure') {
            cmd = `az ${service} ${action}`;
            Object.keys(params).forEach(k => {
                if (params[k]) cmd += ` --${k} ${params[k]}`;
            });
        } else if (provider === 'gcp') {
            cmd = `gcloud ${service} ${action}`;
            Object.values(params).forEach(v => {
                if (v) cmd += ` ${v}`;
            });
        }

        document.getElementById('cloud-output').textContent = cmd;
    }
};

window.CloudCliGen = CloudCliGen;
