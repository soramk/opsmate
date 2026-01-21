/**
 * OpsMate - Main Content Component
 */

const MainContentComponent = {
    toolLoaders: {
        'subnet-calculator': () => SubnetCalculator.render(),
        'mac-converter': () => MacConverter.render(),
        'transfer-calculator': () => TransferCalculator.render(),
        'network-diagram': () => NetworkDiagram.render(),
        'filter-wizard': () => FilterWizard.render(),
        'syslog-highlighter': () => SyslogHighlighter.render(),
        'bdp-calculator': () => BdpCalculator.render(),
        'iac-generator': () => IacGenerator.render(),
        'base-converter': () => BaseConverter.render(),
        'unix-timestamp': () => UnixTimestamp.render(),
        'password-generator': () => PasswordGenerator.render(),
        'port-reference': () => PortReference.render(),
        'regex-tester': () => RegexTester.render(),
        'config-diff': () => ConfigDiff.render(),
        'datacenter-calc': () => DataCenterCalc.render(),
        'cidr-reference': () => CidrReference.render(),
        'json-formatter': () => JsonFormatter.render(),
        'http-status': () => HttpStatusReference.render(),
        'ipv6-toolkit': () => IPv6Toolkit.render(),
        'cron-master': () => CronMaster.render(),
        'hash-gen': () => HashGenerator.render(),
        'text-utility': () => TextUtility.render(),
        'ssh-config-gen': () => SshConfigGen.render(),
        'firewalld-builder': () => FirewalldBuilder.render(),
        'systemd-unit-gen': () => SystemdUnitGen.render(),
        'nginx-snippet': () => NginxSnippetGen.render(),
        'encoding-converter': () => EncodingConverter.render(),
        'uuid-generator': () => UuidGenerator.render(),
        'tera-term-macro': () => TeraTermMacroGen.render(),
        'rdp-config-gen': () => RdpConfigGen.render(),
        'op-bookmarks': () => OpBookmarks.render(),
        'jwt-decoder': () => JwtDecoder.render(),
        'ip-list-gen': () => IpListGen.render(),
        'bulk-cmd-gen': () => BulkCommandGen.render(),
        'yaml-json': () => YamlJsonConverter.render(),
        'log-masker': () => LogMasker.render(),
        'url-toolkit': () => UrlToolkit.render(),
        'cert-tool': () => CertTool.render()
    },

    init() {
        this.showWelcome();
    },

    loadTool(toolId) {
        const contentEl = document.getElementById('tool-content');
        if (!contentEl) return;

        const loader = this.toolLoaders[toolId];

        if (loader) {
            contentEl.innerHTML = loader();
            this.initTool(toolId);
            lucide.createIcons();
        } else {
            this.showComingSoon(toolId);
        }
    },

    initTool(toolId) {
        switch (toolId) {
            case 'subnet-calculator': SubnetCalculator.init(); break;
            case 'mac-converter': MacConverter.init(); break;
            case 'transfer-calculator': TransferCalculator.init(); break;
            case 'network-diagram': NetworkDiagram.init(); break;
            case 'filter-wizard': FilterWizard.init(); break;
            case 'syslog-highlighter': SyslogHighlighter.init(); break;
            case 'bdp-calculator': BdpCalculator.init(); break;
            case 'iac-generator': IacGenerator.init(); break;
            case 'base-converter': BaseConverter.init(); break;
            case 'unix-timestamp': UnixTimestamp.init(); break;
            case 'password-generator': PasswordGenerator.init(); break;
            case 'port-reference': PortReference.init(); break;
            case 'regex-tester': RegexTester.init(); break;
            case 'config-diff': ConfigDiff.init(); break;
            case 'datacenter-calc': DataCenterCalc.init(); break;
            case 'cidr-reference': CidrReference.init(); break;
            case 'json-formatter': JsonFormatter.init(); break;
            case 'http-status': HttpStatusReference.init(); break;
            case 'ipv6-toolkit': IPv6Toolkit.init(); break;
            case 'cron-master': CronMaster.init(); break;
            case 'hash-gen': HashGenerator.init(); break;
            case 'text-utility': TextUtility.init(); break;
            case 'ssh-config-gen': SshConfigGen.init(); break;
            case 'firewalld-builder': FirewalldBuilder.init(); break;
            case 'systemd-unit-gen': SystemdUnitGen.init(); break;
            case 'nginx-snippet': NginxSnippetGen.init(); break;
            case 'encoding-converter': EncodingConverter.init(); break;
            case 'uuid-generator': UuidGenerator.init(); break;
            case 'tera-term-macro': TeraTermMacroGen.init(); break;
            case 'rdp-config-gen': RdpConfigGen.init(); break;
            case 'op-bookmarks': OpBookmarks.init(); break;
            case 'jwt-decoder': JwtDecoder.init(); break;
            case 'ip-list-gen': IpListGen.init(); break;
            case 'bulk-cmd-gen': BulkCommandGen.init(); break;
            case 'yaml-json': YamlJsonConverter.init(); break;
            case 'log-masker': LogMasker.init(); break;
            case 'url-toolkit': UrlToolkit.init(); break;
            case 'cert-tool': CertTool.init(); break;
        }
    },

    showWelcome() {
        const contentEl = document.getElementById('tool-content');
        if (!contentEl) return;
        // Welcome screen is already in the HTML
    },

    showComingSoon(toolId) {
        const contentEl = document.getElementById('tool-content');
        if (!contentEl) return;

        contentEl.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon"><i data-lucide="construction" class="w-20 h-20"></i></div>
                <h2 class="welcome-title">開発中</h2>
                <p class="welcome-description">この機能は現在開発中です。</p>
            </div>
        `;
        lucide.createIcons();
    }
};

window.MainContentComponent = MainContentComponent;
