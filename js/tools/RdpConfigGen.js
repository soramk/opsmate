/**
 * OpsMate - RDP Config Generator (.rdp)
 */

const RdpConfigGen = {
    render() {
        const helpSection = OpsMateHelpers.renderHelpSection({
            toolId: 'rdp',
            title: 'RDP設定ファイル生成の使い方',
            description: 'Windows リモートデスクトップ接続用の設定ファイル（.rdp）を生成します。画面解像度やリソース共有設定を事前定義したファイルを配布・保存できます。',
            steps: [
                '接続先ホスト名またはIPアドレスを入力',
                '表示設定（全画面、ウィンドウサイズ）を選択',
                'キーボードやオーディオ、ローカルドライブの共有設定を選択',
                '「RDPファイル生成」をクリックし、.rdp ファイルとして保存'
            ],
            tips: [
                '.rdp ファイルはダブルクリックするだけで接続を開始できます',
                '「スマートサイジング」を有効にすると、ウィンドウに合わせて画面がリサイズされます',
                'セキュリティ上の理由から、パスワードはこのファイルには保存されません',
                '古い端末への接続には、色深度を下げると動作が軽くなる場合があります'
            ],
            example: {
                title: '接続方法',
                code: 'mstsc.exe config.rdp'
            }
        });

        return `
            <div class="tool-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="monitor" class="w-5 h-5"></i>
                            接続・表示設定
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group mb-0">
                            <label class="form-label">ホスト名 / IPアドレス</label>
                            <input type="text" id="rdp-host" class="form-input" placeholder="192.168.1.10">
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">ユーザー名 (任意)</label>
                            <input type="text" id="rdp-user" class="form-input" placeholder="Administrator">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div class="form-group mb-0">
                            <label class="form-label">画面解像度</label>
                            <select id="rdp-resolution" class="form-select">
                                <option value="fullscreen">全画面 (Full Screen)</option>
                                <option value="1920x1080">1920 x 1080</option>
                                <option value="1600x900">1600 x 900</option>
                                <option value="1280x720">1280 x 720</option>
                                <option value="1024x768">1024 x 768</option>
                                <option value="800x600">800 x 600</option>
                            </select>
                        </div>
                        <div class="form-group mb-0">
                            <label class="form-label">色深度</label>
                            <select id="rdp-bpp" class="form-select">
                                <option value="32">最高品質 (32ビット)</option>
                                <option value="24">高品質 (24ビット)</option>
                                <option value="16">中品質 (16ビット)</option>
                                <option value="15">低品質 (15ビット)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i data-lucide="share-2" class="w-5 h-5"></i>
                            ローカルリソース・詳細設定
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rdp-smart-sizing" checked>
                                スマートサイジングを有効にする
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rdp-drives">
                                ローカルドライブを共有する
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rdp-clipboard" checked>
                                クリップボードを共有する
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rdp-multimon">
                                全てのモニターを使用する
                            </label>
                        </div>
                    </div>

                    <div class="form-group mt-2">
                        <label class="form-label">オーディオ設定</label>
                        <select id="rdp-audio" class="form-select">
                            <option value="0">このコンピューターで再生する</option>
                            <option value="1">リモートコンピューターで再生する</option>
                            <option value="2">再生しない</option>
                        </select>
                    </div>

                    <button class="btn btn-primary" id="rdp-generate-btn">
                        <i data-lucide="file-text" class="w-4 h-4"></i> RDPファイル生成
                    </button>

                    ${helpSection}
                </div>

                <div class="panel-card" id="rdp-result-panel" style="display: none;">
                    <div class="panel-header">
                        <h2 class="panel-title">生成された設定 (.rdp)</h2>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm" id="rdp-copy-btn">
                                <i data-lucide="copy" class="w-4 h-4"></i> コピー
                            </button>
                            <button class="btn btn-secondary btn-sm" id="rdp-download-btn">
                                <i data-lucide="download" class="w-4 h-4"></i> ダウンロード
                            </button>
                        </div>
                    </div>
                    <pre id="rdp-output" class="json-output" style="white-space: pre-wrap; font-family: monospace;"></pre>
                </div>
            </div>
        `;
    },

    init() {
        const generateBtn = document.getElementById('rdp-generate-btn');
        const copyBtn = document.getElementById('rdp-copy-btn');
        const downloadBtn = document.getElementById('rdp-download-btn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const output = document.getElementById('rdp-output').textContent;
                OpsMateHelpers.copyToClipboard(output, copyBtn);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.download());
        }
    },

    generate() {
        const host = document.getElementById('rdp-host').value || '127.0.0.1';
        const user = document.getElementById('rdp-user').value;
        const res = document.getElementById('rdp-resolution').value;
        const bpp = document.getElementById('rdp-bpp').value;
        const audio = document.getElementById('rdp-audio').value;
        const smartSizing = document.getElementById('rdp-smart-sizing').checked ? 1 : 0;
        const clipboard = document.getElementById('rdp-clipboard').checked ? 1 : 0;
        const drives = document.getElementById('rdp-drives').checked ? 'drives:s:1' : '';
        const multimon = document.getElementById('rdp-multimon').checked ? 1 : 0;

        let width = 1024, height = 768, screenMode = 1;
        if (res === 'fullscreen') {
            screenMode = 2;
        } else {
            [width, height] = res.split('x').map(Number);
        }

        let rdp = `screen mode id:i:${screenMode}
use multimon:i:${multimon}
desktopwidth:i:${width}
desktopheight:i:${height}
session bpp:i:${bpp}
winposstr:s:0,3,0,0,800,600
full address:s:${host}
compression:i:1
keyboardhook:i:2
audiocapturemode:i:0
videoplaybackmode:i:1
connection type:i:7
networkautodetect:i:1
bandwidthautodetect:i:1
displayconnectionbar:i:1
enableworkspacereconnect:i:0
disable wallpaper:i:0
allow font smoothing:i:1
allow desktop composition:i:1
disable full window drag:i:1
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
audiomode:i:${audio}
redirectclipboard:i:${clipboard}
redirectprinters:i:1
redirectcomports:i:0
redirectsmartcards:i:1
redirectposdevices:i:0
redirectdirectx:i:1
redirectdrives:i:${drives ? 1 : 0}
autoreconnection enabled:i:1
authentication level:i:2
prompt for credentials:i:0
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:
gatewayusagemethod:i:1
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:1
promptcredentialonce:i:1
use redirection server name:i:0
rdgiskdcproxy:i:0
kdcproxyname:s:
smart sizing:i:${smartSizing}
`;

        if (user) {
            rdp += `username:s:${user}\n`;
        }

        if (drives) {
            rdp += `${drives}\n`;
        }

        const output = document.getElementById('rdp-output');
        const panel = document.getElementById('rdp-result-panel');
        output.textContent = rdp;
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth' });
    },

    download() {
        const rdp = document.getElementById('rdp-output').textContent;
        const host = document.getElementById('rdp-host').value || 'server';
        const blob = new Blob([rdp], { type: 'application/x-rdp' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${host}.rdp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

window.RdpConfigGen = RdpConfigGen;
