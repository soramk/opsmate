# OpsMate - Network Engineer's Toolkit

> **Client-side Only, Secure, Fast**

ネットワークエンジニア・インフラ運用担当者のための高速・安全なブラウザベースツールキット。

## 特徴

- 🔒 **100% クライアントサイド処理** - データはサーバーに送信されません
- 🌙 **ダークモードUI** - 長時間の作業でも目に優しい
- 📱 **レスポンシブデザイン** - PC・スマホ両対応
- ⚡ **高速** - インストール不要、ブラウザで即座に使用可能

## 機能

### Phase 1 (実装済み)

- **IP Subnet Calculator** - サブネット計算、ネットワーク/ブロードキャストアドレス
- **MAC Address Converter** - Cisco/Linux/Windows形式への変換
- **Transfer Time Calculator** - ファイル転送時間の計算

### Phase 2 (Coming Soon)

- Base Converter - 進数変換・ビット計算
- Unix Timestamp Converter - Unix時間変換
- Config Diff Tool - Config差分比較
- Password Generator - パスワード生成
- Data Center Calculator - 電力・熱量計算

## 使い方

1. `index.html` をブラウザで開く
2. サイドバーからツールを選択
3. 入力して計算・変換

## ディレクトリ構造

```
opsmate/
├── index.html          # メインエントリーポイント
├── css/
│   └── style.css       # カスタムスタイル
├── js/
│   ├── app.js          # メインアプリケーション
│   ├── components/     # UIコンポーネント
│   │   ├── Sidebar.js
│   │   ├── Header.js
│   │   └── MainContent.js
│   ├── tools/          # 各ツールモジュール
│   │   ├── SubnetCalculator.js
│   │   ├── MacConverter.js
│   │   └── TransferCalculator.js
│   └── utils/
│       └── helpers.js  # ユーティリティ関数
└── assets/             # 静的アセット
    └── icons/
```

## 技術スタック

- HTML5 / CSS3 / JavaScript (Vanilla)
- Tailwind CSS (CDN)
- Lucide Icons
- JetBrains Mono フォント

## ライセンス

MIT License
