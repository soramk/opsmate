# Windows管理ショートカットツールの拡張

## 概要

Windows管理ショートカット作成ツールにおいて、以下の機能拡張を行う。

1. ツールのカテゴリ表示
2. ツールの追加（特にms-settings関連）

## カテゴリ案

### 1. 管理コンソール (MSC)

- 既存のMSC系ツール

### 2. コントロールパネル・システム

- Control Panel, Admin Tools, etc.

### 3. Windows設定 (Settings)

- ms-settingsURIスキームを使用した設定画面へのショートカット
  - Windows Update
  - Apps
  - Network
  - Display
  - etc.

### 4. ユーティリティ

- CMD, PowerShell, MSTSC, etc.

## 実装方針

- `WinAdminShortcuts.js` のデータ構造をカテゴリ対応に変更
- UIをカテゴリごとにグルーピングして表示
- バッチ生成ロジックの適応

## ステータス

Closed
