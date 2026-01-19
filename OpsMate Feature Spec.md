# **OpsMate \- Network Engineer's Toolkit Specification**

## **1\. プロジェクト概要**

* **プロジェクト名:** OpsMate (オプスメイト)  
* **ターゲット:** ネットワークエンジニア、インフラ運用担当者  
* **コンセプト:** "Client-side Only, Secure, Fast"  
  * サーバーにデータを送信せず、ブラウザだけで完結する（セキュリティ重視）。  
  * 現場で即座に使えるダークモードUI。  
  * スマホ・PC両対応のレスポンシブデザイン。

## **2\. 機能一覧 (Features)**

### **Phase 1: コア機能（実装済み）**

#### **1\. IP Subnet Calculator (IPサブネット計算機)**

* **入力:** IPアドレス, CIDR (プレフィックス長)  
* **出力:**  
  * ネットワークアドレス  
  * ブロードキャストアドレス  
  * サブネットマスク / ワイルドカードマスク  
  * 利用可能ホスト範囲 (First \- Last)  
  * 利用可能ホスト数  
* **特徴:** リアルタイム計算、エラーハンドリング。

#### **2\. MAC Address Converter (MACアドレス変換)**

* **入力:** 任意の区切り文字を含むMACアドレス文字列  
* **出力:**  
  * Cisco形式 (aaaa.bbbb.cccc)  
  * Windows/Linux形式 (AA:BB:CC:DD:EE:FF)  
  * ハイフン形式 (AA-BB-CC-DD-EE-FF)  
  * Raw形式 (aabbccddeeff)  
* **特徴:** 正規表現による自動整形、ワンクリックコピー機能。

#### **3\. Transfer Time Calculator (転送時間計算機)**

* **入力:** ファイルサイズ (KB/MB/GB/TB), 回線速度 (Kbps/Mbps/Gbps)  
* **出力:** 理論上の転送所要時間  
* **計算式:** (Size \* 8\) / Speed (オーバーヘッドは考慮しない理論値)

### **Phase 2: 拡張機能（これから実装）**

#### **4\. Base Converter (進数変換・ビット計算)**

* **概要:** IP計算の検算や、フラグ確認用。  
* **機能:**  
  * 10進数 ⇔ 2進数 ⇔ 16進数の相互変換。  
  * **Bit Toggle UI:** 8bit または 32bit の「0/1」ボタンを並べ、クリックでビットを反転させると数値が変わるUI（サブネットマスクの理解などに便利）。

#### **5\. Unix Timestamp Converter (Unix時間変換)**

* **概要:** ログ調査用。  
* **機能:**  
  * 現在時刻のUnix Time表示。  
  * Unix Time (秒/ミリ秒) ⇒ 日時文字列 (JST/UTC) への変換。  
  * 日時文字列 ⇒ Unix Time への変換。

#### **6\. Config Diff Tool (簡易Config差分比較)**

* **概要:** ネットワーク機器のConfig変更前後の比較。  
* **機能:**  
  * 2つのテキストエリア（Before / After）。  
  * 行単位での差分ハイライト（追加行は緑、削除行は赤）。  
  * ※外部ライブラリを使わず、シンプルな行比較ロジックで実装。

#### **7\. Password & Key Generator (パスワード生成)**

* **概要:** 初期パスワードやPre-Shared Keyの生成。  
* **機能:**  
  * 長さ指定。  
  * 文字種指定（英大文字、英小文字、数字、記号）。  
  * **紛らわしい文字の除外** (I, l, 1, O, 0 など) オプション。

#### **8\. Data Center Calculator (電力・熱量計算)**

* **概要:** ラック設計用。  
* **機能:**  
  * Watts ⇔ BTU/h 変換。  
  * Amps × Volts \= Watts (単相) 計算。

## **3\. UI/UX デザイン指針**

* **テーマカラー:**  
  * Base: Slate-950 (深みのあるダークグレー)  
  * Accent: Emerald-500 (コンソール画面の緑色をイメージ)  
  * Text: Mono font (JetBrains Mono, Consolas, Courier New等)  
* **ナビゲーション:**  
  * PC: 上部タブ切り替え  
  * Mobile: ハンバーガーメニュー  
* **コンポーネント:**  
  * 入力フォームは大きめに確保（指でタップしやすく）。  
  * 結果表示は「コピー」しやすく配置。  
  * エラー時は赤色でわかりやすく警告。

## **4\. 技術スタック (Single File Web App)**

* **Framework:** React (Functional Components, Hooks)  
* **Styling:** Tailwind CSS (Utility-first)  
* **Icons:** Lucide React  
* **Constraint:** 全てのロジックを1つの .jsx ファイルに収める（ポータビリティ重視）。