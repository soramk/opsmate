# Feature: Multi-OS Management Tools (Linux & Windows)

Status: Closed

## 概要

WindowsとLinuxの両方を管理する運用エンジニア向けに、権限設定やトラブルシューティング、システム管理を効率化するコマンド生成ツールを3つ追加しました。

## 追加したツール

1. **権限ウィザード (Permission Wizard)** (`perm-wizard`)
   - Linuxの `chmod` (8進数) と Windowsの `icacls` を、チェックボックスで視覚的に生成。
2. **疎通確認コマンド (Net Troubleshooting)** (`net-trouble`)
   - PowerShellの `Test-NetConnection`, Linuxの `nc`, `mtr`, Bash Socket等、目的別の1行コマンドを生成。
3. **システム管理 (System Helper)** (`sys-helper`)
   - Linuxの `systemctl`, `ps` と Windowsの `sc.exe`, `tasklist`, `wmic` を切り替えて生成可能。

## 対応内容

- 3つの新規ツールファイルの作成 (`js/tools/*.js`)
- サイドバーへの登録（ネットワークおよびインフラカテゴリ）
- メインコンテンツローダーへの統合
- HTMLファイルへのスクリプト読み込み追加
