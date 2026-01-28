# Windows管理者ツールショートカット作成機能の追加

## 概要

Windowsの管理者ツール（イベントビューワー、ローカルセキュリティポリシーなど）をチェックボックス形式で選択し、
それらのショートカットを一括作成するバッチファイルを生成・ダウンロードできる機能を追加する。

## 実装内容

1. **新規ツール追加**: `WinAdminShortcuts.js`
   - カテゴリ: `infra` (インフラ・クラウド)
   - ツール名: Windows管理ショートカット
   - ID: `win-admin-shortcuts`

2. **機能詳細**
   - ツールリストの表示 (Checkbox)
   - 全選択/全解除ボタン
   - ダウンロードボタン
   - バッチファイル生成ロジック (PowerShellを利用してLNKを作成)

3. **対象ツール一覧**
   - Event Viewer (eventvwr.msc)
   - Local Security Policy (secpol.msc)
   - Computer Management (compmgmt.msc)
   - Services (services.msc)
   - Task Scheduler (taskschd.msc)
   - Performance Monitor (perfmon.msc)
   - Group Policy Editor (gpedit.msc)
   - Registry Editor (regedit.exe)
   - Windows Firewall (wf.msc)
   - System Information (msinfo32.exe)
   - Resource Monitor (resmon.exe)
   - Task Manager (taskmgr.exe)
   - Command Prompt Admin (cmd.exe - runas) -> *Note: ショートカットプロパティで管理者化するのは複雑なので、単純なリンクにするか検討*

## ステータス

- [x] 実装
- [x] 完了

## 完了日

2026-01-28

## 備考

実装完了。バッチファイル生成によるショートカット作成機能を実装しました。
Closed.
