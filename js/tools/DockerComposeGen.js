/**
 * OpsMate - Docker Compose Generator
 */

const DockerComposeGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'docker-compose-gen',
            title: 'Docker Compose 生成の使い方',
            description: 'よく使うサービス構成のdocker-compose.ymlスニペットを素早く生成します。',
            steps: [
                'ベーステンプレート（DB, キャッシュ, 監視など）を選択します',
                'サービス名やポート番号をカスタマイズします',
                '生成されたYAMLをコピーして使用します'
            ],
            tips: [
                '複数のテンプレートを組み合わせて使う場合は、services部分を手動でマージしてください',
                'networksやvolumesは必要に応じて追加してください',
                '本番環境では環境変数をファイル(.env)で管理することを推奨します'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="container" class="w-5 h-5"></i>
                            テンプレート選択
                        </h2>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4" id="dc-templates">
                        <button class="template-btn active" data-template="nginx">Nginx</button>
                        <button class="template-btn" data-template="postgres">PostgreSQL</button>
                        <button class="template-btn" data-template="mysql">MySQL</button>
                        <button class="template-btn" data-template="redis">Redis</button>
                        <button class="template-btn" data-template="mongodb">MongoDB</button>
                        <button class="template-btn" data-template="prometheus">Prometheus</button>
                        <button class="template-btn" data-template="grafana">Grafana</button>
                        <button class="template-btn" data-template="elasticsearch">Elasticsearch</button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="form-label">サービス名</label>
                            <input type="text" id="dc-name" class="form-input" placeholder="myservice">
                        </div>
                        <div class="form-group">
                            <label class="form-label">ホストポート</label>
                            <input type="number" id="dc-port" class="form-input" placeholder="8080">
                        </div>
                        <div class="form-group">
                            <label class="form-label">イメージタグ</label>
                            <input type="text" id="dc-tag" class="form-input" placeholder="latest">
                        </div>
                    </div>
                </div>

                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-emerald-400">
                            <i data-lucide="file-code" class="w-5 h-5"></i>
                            docker-compose.yml
                        </h2>
                        <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('dc-output').innerText)">
                            <i data-lucide="copy" class="w-4 h-4"></i> コピー
                        </button>
                    </div>
                    <pre id="dc-output" class="bg-slate-950 p-4 rounded-lg font-mono text-sm text-emerald-400 overflow-auto max-h-[500px]"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    currentTemplate: 'nginx',

    templates: {
        nginx: {
            name: 'nginx',
            port: 80,
            tag: 'alpine',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: nginx:${t}
    container_name: ${n}
    ports:
      - "${p}:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped`
        },
        postgres: {
            name: 'postgres',
            port: 5432,
            tag: '15-alpine',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: postgres:${t}
    container_name: ${n}
    ports:
      - "${p}:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: mydb
    volumes:
      - ${n}_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  ${n}_data:`
        },
        mysql: {
            name: 'mysql',
            port: 3306,
            tag: '8.0',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: mysql:${t}
    container_name: ${n}
    ports:
      - "${p}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: changeme
      MYSQL_DATABASE: mydb
      MYSQL_USER: admin
      MYSQL_PASSWORD: changeme
    volumes:
      - ${n}_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  ${n}_data:`
        },
        redis: {
            name: 'redis',
            port: 6379,
            tag: '7-alpine',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: redis:${t}
    container_name: ${n}
    ports:
      - "${p}:6379"
    command: redis-server --appendonly yes
    volumes:
      - ${n}_data:/data
    restart: unless-stopped

volumes:
  ${n}_data:`
        },
        mongodb: {
            name: 'mongodb',
            port: 27017,
            tag: '6',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: mongo:${t}
    container_name: ${n}
    ports:
      - "${p}:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: changeme
    volumes:
      - ${n}_data:/data/db
    restart: unless-stopped

volumes:
  ${n}_data:`
        },
        prometheus: {
            name: 'prometheus',
            port: 9090,
            tag: 'latest',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: prom/prometheus:${t}
    container_name: ${n}
    ports:
      - "${p}:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ${n}_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

volumes:
  ${n}_data:`
        },
        grafana: {
            name: 'grafana',
            port: 3000,
            tag: 'latest',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: grafana/grafana:${t}
    container_name: ${n}
    ports:
      - "${p}:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - ${n}_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  ${n}_data:`
        },
        elasticsearch: {
            name: 'elasticsearch',
            port: 9200,
            tag: '8.11.0',
            yaml: (n, p, t) => `version: '3.8'

services:
  ${n}:
    image: docker.elastic.co/elasticsearch/elasticsearch:${t}
    container_name: ${n}
    ports:
      - "${p}:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - ${n}_data:/usr/share/elasticsearch/data
    restart: unless-stopped

volumes:
  ${n}_data:`
        }
    },

    init() {
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTemplate = btn.dataset.template;
                this.loadTemplate();
            });
        });

        document.getElementById('dc-name').addEventListener('input', () => this.generate());
        document.getElementById('dc-port').addEventListener('input', () => this.generate());
        document.getElementById('dc-tag').addEventListener('input', () => this.generate());

        this.loadTemplate();
    },

    loadTemplate() {
        const tpl = this.templates[this.currentTemplate];
        document.getElementById('dc-name').value = tpl.name;
        document.getElementById('dc-port').value = tpl.port;
        document.getElementById('dc-tag').value = tpl.tag;
        this.generate();
    },

    generate() {
        const tpl = this.templates[this.currentTemplate];
        const name = document.getElementById('dc-name').value || tpl.name;
        const port = document.getElementById('dc-port').value || tpl.port;
        const tag = document.getElementById('dc-tag').value || tpl.tag;

        document.getElementById('dc-output').textContent = tpl.yaml(name, port, tag);
    }
};

window.DockerComposeGen = DockerComposeGen;
