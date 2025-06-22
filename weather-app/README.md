# Weather App

美しいスマートフォン対応の天気予報PWAアプリケーションです。

## 特徴

- 📱 **完全レスポンシブデザイン** - スマホファーストのモバイル最適化
- 🌓 **ダークモード対応** - システム設定に基づく自動切り替え
- 📍 **位置情報自動取得** - GPS/Geolocation APIを使用
- 🔍 **都市検索機能** - OpenWeatherMap Geocoding API
- ⭐ **お気に入り都市** - ローカルストレージによる永続化
- 📊 **詳細な天気情報** - 現在の天気、5日間予報、24時間予報
- 🎨 **動的背景** - 天気に応じたグラデーション変更
- 📴 **PWA対応** - オフライン表示、ホーム画面追加可能
- 👆 **タッチ最適化** - スワイプジェスチャー、タッチフレンドリーUI

## 必要な設定

### OpenWeatherMap APIキー

このアプリケーションを使用するには、[OpenWeatherMap](https://openweathermap.org/api)からAPIキーを取得する必要があります。

1. [OpenWeatherMap](https://openweathermap.org/api)にアカウントを作成
2. APIキーを取得（無料プランで十分です）
3. アプリの設定画面（⚙️ボタン）からAPIキーを入力

## 機能詳細

### 現在の天気
- 温度、体感温度
- 湿度、風速、気圧、視界
- 天気の説明とアイコン
- 天気に応じた背景グラデーション

### 予報機能
- **時間別予報**: 24時間の詳細予報
- **5日間予報**: 日別の最高・最低気温と天気

### お気に入り機能
- 都市をお気に入りに追加/削除
- 最大10都市まで保存
- お気に入り都市の一覧表示と温度確認

### PWA機能
- **オフライン対応**: Service Workerによるキャッシュ
- **ホーム画面追加**: スマートフォンのホーム画面にアプリとして追加可能
- **バックグラウンド同期**: ネットワーク復帰時の自動更新

## 技術スタック

- **HTML5** - セマンティックマークアップ
- **CSS3** - カスタムプロパティ、Grid、Flexbox
- **Vanilla JavaScript** - ES6+、モジュラー設計
- **Service Worker** - PWA、オフライン機能
- **Web APIs**:
  - Geolocation API
  - LocalStorage API
  - Fetch API
  - Intersection Observer API

## ファイル構成

```
weather-app/
├── index.html              # メインHTML
├── manifest.json           # PWAマニフェスト
├── sw.js                   # Service Worker
├── css/
│   └── style.css          # メインスタイルシート
├── js/
│   ├── app.js             # メインアプリケーションロジック
│   └── config.js          # 設定管理モジュール
├── icons/                 # PWAアイコン
│   ├── icon-72x72.svg
│   ├── icon-96x96.svg
│   ├── icon-128x128.svg
│   ├── icon-144x144.svg
│   ├── icon-152x152.svg
│   ├── icon-192x192.svg
│   ├── icon-384x384.svg
│   └── icon-512x512.svg
└── README.md              # このファイル
```

## 使用方法

### 初回セットアップ
1. アプリケーションファイルをWebサーバーにデプロイ
2. ブラウザで`index.html`にアクセス
3. 設定画面（⚙️）でOpenWeatherMap APIキーを入力
4. 位置情報の使用を許可（推奨）

### 基本操作
- **現在地の天気取得**: 📍ボタンをタップ
- **都市検索**: 検索バーに都市名を入力
- **お気に入り追加**: 天気表示中に⭐ボタンをタップ
- **タブ切り替え**: タブボタンまたはスワイプジェスチャー
- **テーマ切り替え**: 🌙/☀️ボタンでダークモード切り替え

### PWAインストール
スマートフォンでアクセスすると、ホーム画面への追加プロンプトが表示されます。
「追加」を選択すると、ネイティブアプリのように使用できます。

## ブラウザサポート

- **推奨**: Chrome 80+, Safari 13+, Firefox 75+, Edge 80+
- **PWA機能**: Chrome, Edge, Safari (iOS 11.3+)
- **Service Worker**: モダンブラウザ全般

## 開発

### ローカル開発
```bash
# HTTPサーバーが必要（Service Workerの制約）
python -m http.server 8000
# または
npx serve .
# または
php -S localhost:8000
```

### 設定のエクスポート/インポート
開発者コンソールから設定の管理が可能：
```javascript
// 設定のエクスポート
console.log(weatherConfig.exportSettings());

// 設定のインポート
weatherConfig.importSettings(jsonString);

// 設定のクリア
weatherConfig.clearSettings();
```

## API使用量について

OpenWeatherMapの無料プランでは以下の制限があります：
- 1,000 calls/day
- 60 calls/minute

アプリはキャッシュ機能により、API使用量を最小限に抑えています。

## セキュリティ

- APIキーはブラウザのLocalStorageに保存
- HTTPS推奨（特にPWA機能使用時）
- APIキーはクライアントサイドのみで使用

## ライセンス

MIT License

## 貢献

バグ報告や機能要望は、GitHubのIssuesまでお願いします。

## 更新履歴

### v1.0.0
- 初回リリース
- 基本的な天気表示機能
- PWA対応
- レスポンシブデザイン
- ダークモード対応