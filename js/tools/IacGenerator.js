/**
 * OpsMate - IaC Snippet Generator (Terraform & Ansible)
 */

const IacGenerator = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'iac-generator',
            title: 'IaC スニペット生成器の使い方',
            description: 'Terraform や Ansible のネットワーク設定に関わる定型コードスニペットを素早く生成します。',
            steps: [
                '上部のタブで Terraform または Ansible を選択します',
                'リソースの種類（VPC, Subnet, OS設定など）を選択します',
                'パラメータを入力すると、コードが自動生成されます'
            ],
            tips: [
                '生成されたコードはあくまでテンプレートです。環境に合わせて変数を調整してください',
                'Ansible では、Cisco IOS や Juniper Junos などの主要ベンダーモジュールの構文が選べます',
                'Terraform では、構成に合わせたサブネット分割なども考慮されています'
            ]
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="flex border-b border-slate-800 mb-6">
                        <button class="px-6 py-2 border-b-2 border-emerald-500 text-emerald-400 font-medium" id="tab-terraform">Terraform</button>
                        <button class="px-6 py-2 border-b-2 border-transparent hover:text-slate-300" id="tab-ansible">Ansible</button>
                    </div>

                    <!-- Terraform Panel -->
                    <div id="panel-terraform">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="form-group">
                                <label class="form-label">リソース種類</label>
                                <select id="tf-type" class="form-select">
                                    <option value="vpc">AWS VPC & Subnets</option>
                                    <option value="sg">Security Group</option>
                                    <option value="ec2">EC2 Instance (Network focus)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">名前 / 識別子</label>
                                <input type="text" id="tf-name" class="form-input" placeholder="example-network">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">CIDR ブロック</label>
                            <input type="text" id="tf-cidr" class="form-input" placeholder="10.0.0.0/16">
                        </div>
                    </div>

                    <!-- Ansible Panel (Hidden by default) -->
                    <div id="panel-ansible" class="hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="form-group">
                                <label class="form-label">OS / ベンダー</label>
                                <select id="ans-os" class="form-select">
                                    <option value="ios">Cisco IOS</option>
                                    <option value="junos">Juniper Junos</option>
                                    <option value="linux">Linux (Generic)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">モジュール</label>
                                <select id="ans-mod" class="form-select">
                                    <option value="vlan">L2 VLAN 設定</option>
                                    <option value="interface">インターフェース設定</option>
                                    <option value="user">ユーザ管理</option>
                                </select>
                            </div>
                        </div>
                         <div class="form-group">
                            <label class="form-label">パラメータ (JSON形式で記述可)</label>
                            <input type="text" id="ans-params" class="form-input" placeholder="id: 10, name: Web_VLAN">
                        </div>
                    </div>
                </div>

                <!-- Output Area -->
                <div class="panel-card mt-6">
                    <div class="panel-header">
                        <h2 class="panel-title text-slate-300">
                             <i data-lucide="code" class="w-5 h-5"></i>
                            生成コード
                        </h2>
                         <button class="btn btn-secondary btn-sm" onclick="OpsMateHelpers.copyToClipboard(document.getElementById('iac-output').innerText)">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                    </div>
                    <pre id="iac-output" class="bg-slate-950 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[500px] text-emerald-400"></pre>
                </div>

                ${helpSection}
            </div>
        `;
    },

    activeTab: 'terraform',

    init() {
        const tabTf = document.getElementById('tab-terraform');
        const tabAns = document.getElementById('tab-ansible');
        const panelTf = document.getElementById('panel-terraform');
        const panelAns = document.getElementById('panel-ansible');

        tabTf.addEventListener('click', () => {
            this.activeTab = 'terraform';
            tabTf.classList.add('border-emerald-500', 'text-emerald-400');
            tabTf.classList.remove('border-transparent');
            tabAns.classList.remove('border-emerald-500', 'text-emerald-400');
            tabAns.classList.add('border-transparent');
            panelTf.classList.remove('hidden');
            panelAns.classList.add('hidden');
            this.generate();
        });

        tabAns.addEventListener('click', () => {
            this.activeTab = 'ansible';
            tabAns.classList.add('border-emerald-500', 'text-emerald-400');
            tabAns.classList.remove('border-transparent');
            tabTf.classList.remove('border-emerald-500', 'text-emerald-400');
            tabTf.classList.add('border-transparent');
            panelAns.classList.remove('hidden');
            panelTf.classList.add('hidden');
            this.generate();
        });

        const inputs = ['tf-type', 'tf-name', 'tf-cidr', 'ans-os', 'ans-mod', 'ans-params'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.generate());
        });

        this.generate();
    },

    generate() {
        const output = document.getElementById('iac-output');
        let code = '';

        if (this.activeTab === 'terraform') {
            const type = document.getElementById('tf-type').value;
            const name = document.getElementById('tf-name').value || 'example';
            const cidr = document.getElementById('tf-cidr').value || '10.0.0.0/16';

            if (type === 'vpc') {
                code = `resource "aws_vpc" "${name}" {
  cidr_block           = "${cidr}"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${name}"
  }
}

resource "aws_subnet" "${name}-public-1" {
  vpc_id            = aws_vpc.${name}.id
  cidr_block        = "\${cidrsubnet(aws_vpc.${name}.cidr_block, 8, 1)}"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "${name}-public-1"
  }
}`;
            } else if (type === 'sg') {
                code = `resource "aws_security_group" "${name}" {
  name        = "${name}"
  description = "Managed by OpsMate"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["\${var.my_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`;
            } else {
                code = `resource "aws_instance" "${name}" {
  ami           = "ami-xxxxx"
  instance_type = "t3.micro"

  network_interface {
    network_interface_id = aws_network_interface.foo.id
    device_index         = 0
  }
}`;
            }
        } else {
            const os = document.getElementById('ans-os').value;
            const mod = document.getElementById('ans-mod').value;
            const params = document.getElementById('ans-params').value;

            if (os === 'ios') {
                if (mod === 'vlan') {
                    code = `- name: Configure VLANs
  cisco.ios.ios_vlans:
    config:
      - name: OpsMate_VLAN
        vlan_id: 10
        state: active`;
                } else {
                    code = `- name: Configure Interface
  cisco.ios.ios_interfaces:
    config:
      - name: GigabitEthernet0/1
        description: Uplink
        enabled: true`;
                }
            } else if (os === 'junos') {
                code = `- name: Configure Juniper Interface
  junipernetworks.junos.junos_interfaces:
    config:
      - name: ge-0/0/0
        description: Server_Port
        enabled: true`;
            } else {
                code = `- name: Install Nginx
  ansible.builtin.package:
    name: nginx
    state: present`;
            }
        }

        output.innerText = code;
    }
};

window.IacGenerator = IacGenerator;
