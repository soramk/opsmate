/**
 * OpsMate - Kubernetes YAML Generator
 */

const K8sYamlGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'k8s-yaml-gen',
            title: 'Kubernetes YAML生成の使い方',
            description: 'Kubernetesの主要なリソース（Deployment, Service, ConfigMap等）のマニフェストを素早く生成します。',
            steps: [
                'リソースタイプを選択します',
                '名前や設定値をフォームに入力します',
                '生成されたYAMLをコピーして kubectl apply -f で適用します'
            ],
            tips: [
                'namespaceを指定しない場合はdefaultに作成されます',
                '本番環境ではresources（CPU/Memory制限）の設定を推奨します',
                'labelは必ず設定し、Serviceとの紐付けに使用します'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="box" class="w-5 h-5"></i>
                            Kubernetes YAML 生成
                        </h2>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4" id="k8s-resources">
                        <button class="template-btn active" data-resource="deployment">Deployment</button>
                        <button class="template-btn" data-resource="service">Service</button>
                        <button class="template-btn" data-resource="configmap">ConfigMap</button>
                        <button class="template-btn" data-resource="secret">Secret</button>
                        <button class="template-btn" data-resource="ingress">Ingress</button>
                        <button class="template-btn" data-resource="pvc">PVC</button>
                        <button class="template-btn" data-resource="cronjob">CronJob</button>
                    </div>

                    <div id="k8s-form" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="file-code" class="w-5 h-5"></i>
                            生成されたマニフェスト
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('k8s-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="k8s-output" class="bg-slate-950 p-4 rounded-lg font-mono text-sm text-emerald-400 overflow-auto max-h-[500px]"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    currentResource: 'deployment',

    init() {
        document.querySelectorAll('#k8s-resources .template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#k8s-resources .template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentResource = btn.dataset.resource;
                this.renderForm();
            });
        });

        this.renderForm();
    },

    renderForm() {
        const container = document.getElementById('k8s-form');
        let html = '';

        // Common fields
        html += `
            <div class="form-group">
                <label class="form-label">名前</label>
                <input type="text" id="k8s-name" class="form-input" value="my-app">
            </div>
            <div class="form-group">
                <label class="form-label">Namespace</label>
                <input type="text" id="k8s-namespace" class="form-input" value="default">
            </div>
        `;

        // Resource-specific fields
        switch (this.currentResource) {
            case 'deployment':
                html += `
                    <div class="form-group">
                        <label class="form-label">イメージ</label>
                        <input type="text" id="k8s-image" class="form-input" value="nginx:alpine">
                    </div>
                    <div class="form-group">
                        <label class="form-label">レプリカ数</label>
                        <input type="number" id="k8s-replicas" class="form-input" value="3">
                    </div>
                    <div class="form-group">
                        <label class="form-label">コンテナポート</label>
                        <input type="number" id="k8s-port" class="form-input" value="80">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CPU制限</label>
                        <input type="text" id="k8s-cpu" class="form-input" value="100m">
                    </div>
                `;
                break;
            case 'service':
                html += `
                    <div class="form-group">
                        <label class="form-label">タイプ</label>
                        <select id="k8s-svc-type" class="form-select">
                            <option value="ClusterIP">ClusterIP</option>
                            <option value="NodePort">NodePort</option>
                            <option value="LoadBalancer">LoadBalancer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ポート</label>
                        <input type="number" id="k8s-port" class="form-input" value="80">
                    </div>
                    <div class="form-group">
                        <label class="form-label">ターゲットポート</label>
                        <input type="number" id="k8s-target-port" class="form-input" value="8080">
                    </div>
                `;
                break;
            case 'configmap':
                html += `
                    <div class="form-group col-span-2">
                        <label class="form-label">データ (key=value 形式、改行区切り)</label>
                        <textarea id="k8s-data" class="form-textarea" rows="4">APP_ENV=production
LOG_LEVEL=info</textarea>
                    </div>
                `;
                break;
            case 'secret':
                html += `
                    <div class="form-group col-span-2">
                        <label class="form-label">データ (key=value 形式、改行区切り) ※自動でBase64エンコード</label>
                        <textarea id="k8s-data" class="form-textarea" rows="4">DB_PASSWORD=secret123
API_KEY=myapikey</textarea>
                    </div>
                `;
                break;
            case 'ingress':
                html += `
                    <div class="form-group">
                        <label class="form-label">ホスト名</label>
                        <input type="text" id="k8s-host" class="form-input" value="app.example.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">サービス名</label>
                        <input type="text" id="k8s-svc-name" class="form-input" value="my-app">
                    </div>
                    <div class="form-group">
                        <label class="form-label">サービスポート</label>
                        <input type="number" id="k8s-port" class="form-input" value="80">
                    </div>
                `;
                break;
            case 'pvc':
                html += `
                    <div class="form-group">
                        <label class="form-label">ストレージサイズ</label>
                        <input type="text" id="k8s-storage" class="form-input" value="10Gi">
                    </div>
                    <div class="form-group">
                        <label class="form-label">アクセスモード</label>
                        <select id="k8s-access" class="form-select">
                            <option value="ReadWriteOnce">ReadWriteOnce</option>
                            <option value="ReadOnlyMany">ReadOnlyMany</option>
                            <option value="ReadWriteMany">ReadWriteMany</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">StorageClass (空欄でデフォルト)</label>
                        <input type="text" id="k8s-storageclass" class="form-input" placeholder="standard">
                    </div>
                `;
                break;
            case 'cronjob':
                html += `
                    <div class="form-group">
                        <label class="form-label">スケジュール (Cron形式)</label>
                        <input type="text" id="k8s-schedule" class="form-input" value="0 2 * * *">
                    </div>
                    <div class="form-group">
                        <label class="form-label">イメージ</label>
                        <input type="text" id="k8s-image" class="form-input" value="busybox:latest">
                    </div>
                    <div class="form-group col-span-2">
                        <label class="form-label">コマンド</label>
                        <input type="text" id="k8s-command" class="form-input" value="/bin/sh -c 'echo Hello'">
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
        container.querySelectorAll('input, select, textarea').forEach(el => {
            el.addEventListener('input', () => this.generate());
        });
        this.generate();
    },

    generate() {
        const name = document.getElementById('k8s-name')?.value || 'my-app';
        const namespace = document.getElementById('k8s-namespace')?.value || 'default';
        let yaml = '';

        switch (this.currentResource) {
            case 'deployment':
                const image = document.getElementById('k8s-image')?.value || 'nginx:alpine';
                const replicas = document.getElementById('k8s-replicas')?.value || '3';
                const port = document.getElementById('k8s-port')?.value || '80';
                const cpu = document.getElementById('k8s-cpu')?.value || '100m';
                yaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    app: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${image}
        ports:
        - containerPort: ${port}
        resources:
          requests:
            cpu: ${cpu}
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi`;
                break;

            case 'service':
                const svcType = document.getElementById('k8s-svc-type')?.value || 'ClusterIP';
                const svcPort = document.getElementById('k8s-port')?.value || '80';
                const targetPort = document.getElementById('k8s-target-port')?.value || '8080';
                yaml = `apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  type: ${svcType}
  selector:
    app: ${name}
  ports:
  - port: ${svcPort}
    targetPort: ${targetPort}
    protocol: TCP`;
                break;

            case 'configmap':
            case 'secret':
                const data = document.getElementById('k8s-data')?.value || '';
                const dataLines = data.split('\n').filter(l => l.includes('='));
                const dataYaml = dataLines.map(l => {
                    const [k, ...v] = l.split('=');
                    const val = v.join('=');
                    if (this.currentResource === 'secret') {
                        return `  ${k}: ${btoa(val)}`;
                    }
                    return `  ${k}: "${val}"`;
                }).join('\n');
                yaml = `apiVersion: v1
kind: ${this.currentResource === 'secret' ? 'Secret' : 'ConfigMap'}
metadata:
  name: ${name}
  namespace: ${namespace}
${this.currentResource === 'secret' ? 'type: Opaque\n' : ''}data:
${dataYaml}`;
                break;

            case 'ingress':
                const host = document.getElementById('k8s-host')?.value || 'app.example.com';
                const svcName = document.getElementById('k8s-svc-name')?.value || 'my-app';
                const ingPort = document.getElementById('k8s-port')?.value || '80';
                yaml = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}
  namespace: ${namespace}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: ${host}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${svcName}
            port:
              number: ${ingPort}`;
                break;

            case 'pvc':
                const storage = document.getElementById('k8s-storage')?.value || '10Gi';
                const access = document.getElementById('k8s-access')?.value || 'ReadWriteOnce';
                const sc = document.getElementById('k8s-storageclass')?.value;
                yaml = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  accessModes:
  - ${access}
${sc ? `  storageClassName: ${sc}\n` : ''}  resources:
    requests:
      storage: ${storage}`;
                break;

            case 'cronjob':
                const schedule = document.getElementById('k8s-schedule')?.value || '0 2 * * *';
                const cronImage = document.getElementById('k8s-image')?.value || 'busybox:latest';
                const command = document.getElementById('k8s-command')?.value || 'echo Hello';
                yaml = `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  schedule: "${schedule}"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: ${name}
            image: ${cronImage}
            command: ["/bin/sh", "-c", "${command}"]
          restartPolicy: OnFailure`;
                break;
        }

        document.getElementById('k8s-output').textContent = yaml;
    }
};

window.K8sYamlGen = K8sYamlGen;
