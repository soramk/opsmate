# Feature: MTU / MSS Overhead Calculator
Status: Closed

## 概要
ネットワークエンジニアがVPNやカプセル化（VXLAN, GRE等）を設定する際に、フラグメンテーションを回避するために必要な最適なMSS（Maximum Segment Size）を算出するツールを追加しました。

## 追加した機能
- **物理MTU設定**: 標準1500から、フレッツ光等のPPPoE環境（1454/1492）、Jumbo Frame（9000）のプリセットを搭載。
- **プロトコル選択**: IPv4/IPv6、TCP/UDPによる基本的なオーバーヘッドの違いに対応。
- **カプセル化オプション**:
    - VLAN (802.1Q) / QinQ
    - PPPoE
    - MPLS
    - GRE
    - VXLAN
    - IPsec ESP (Tunnel Mode)
    - WireGuard
- **計算結果**:
    - 推奨MSSのリアルタイム表示
    - 合計オーバーヘッド（バイト）
    - 転送効率（Efficiency）の算出
    - ヘッダー構成の内訳（Breakdown）表示

## 対応内容
1. `js/tools/OverheadCalculator.js` の新規作成
2. `js/components/Sidebar.js` への登録（ネットワークカテゴリ）
3. `js/components/MainContent.js` へのツールローダー追加
4. `index.html` へのスクリプト読み込み追加
