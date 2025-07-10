# 🏊‍♂️ MinatoSwimRecord-app

競泳選手の記録管理、分析、目標設定をサポートする包括的なWebアプリケーションです。  
Claude CODEプロジェクト（`claude-code-test`）の一部として開発されています。

## ✨ 主要機能

### 📝 記録管理
- **新規記録追加**: 日付、種目、距離、プール、タイム等の詳細記録
- **記録編集・削除**: 既存データの修正・削除機能
- **一括インポート**: CSVファイルからの一括データ読み込み
- **データエクスポート**: CSV形式でのデータ出力

### 📊 分析・可視化
- **記録推移グラフ**: 時系列でのタイム変化を可視化
- **短水路・長水路比較**: プール種別での記録比較
- **統計情報**: 総記録数、参加大会数、1位獲得数等
- **AIアドバイス**: Claudeによる成績分析と目標設定アドバイス

### 🔄 データ共有
- **GitHub連携**: チーム全体でのデータ共有
- **リアルタイム更新**: プルリクエストによるデータ同期
- **バックアップ**: GitHubでの自動バージョン管理

## 🚀 セットアップ方法

### Claude CODEでの使用

```bash
# 既存プロジェクトディレクトリに移動
cd ~/claude_project/claude-code-test/MinatoSwimRecord-app

# 依存関係インストール（package.jsonがある場合）
npm install

# または新規作成の場合
npm init -y
npm install react recharts lucide-react

# 開発サーバー起動
npm run dev
# または
node server.js
```

### GitHubへのデプロイ

既存の`simple-deploy.bsh`スクリプトを使用します：

```bash
# claude-code-testディレクトリで実行
cd ~/claude_project/claude-code-test

# デプロイスクリプト実行
./simple-deploy.bsh

# スクリプト内のCOMMIT_MESSAGEを編集してから実行
# 例: COMMIT_MESSAGE="Add new swimming record: butterfly 50m improvement"
```

## 📁 ファイル構成

```
MinatoSwimRecord-app/
├── README.md
├── index.html
├── package.json
├── server.js              # Express サーバー（他プロジェクト参考）
├── src/
│   ├── App.jsx            # メインアプリケーション
│   ├── components/
│   │   ├── RecordForm.jsx      # 記録追加フォーム
│   │   ├── RecordList.jsx      # 記録一覧・編集
│   │   ├── GraphView.jsx       # グラフ表示
│   │   └── DataManager.jsx     # CSV入出力
│   └── utils/
│       ├── dataProcessor.js    # データ処理ユーティリティ
│       └── chartHelpers.js     # グラフ用ヘルパー
├── data/
│   ├── swim-records.json       # メインデータファイル
│   └── swimRecord-250705b.txt  # 初期データ（170件）
└── public/
    └── assets/
```

## 🗂️ プロジェクト全体構造

```
~/claude_project/claude-code-test/
├── MinatoSwimRecord-app/      # メインプロジェクト（水泳記録管理）
├── weather-app/               # 既存プロジェクト
├── game-app/                  # 既存プロジェクト
└── simple-deploy.bsh          # 共通デプロイスクリプト
```

## 🛠️ 新機能仕様

### 記録編集・削除機能

#### 編集機能
- **インライン編集**: 記録一覧でのクリック編集
- **モーダル編集**: 詳細編集画面
- **バリデーション**: タイム形式、日付等の入力検証

```javascript
// 編集機能の実装例
const editRecord = (id, updatedRecord) => {
  setRecords(records.map(record => 
    record.id === id ? {...record, ...updatedRecord} : record
  ));
};
```

#### 削除機能
- **単一削除**: 個別記録の削除
- **一括削除**: 選択した複数記録の削除
- **削除確認**: 誤削除防止のための確認ダイアログ

```javascript
// 削除機能の実装例
const deleteRecord = (id) => {
  if (confirm('この記録を削除しますか？')) {
    setRecords(records.filter(record => record.id !== id));
  }
};
```

### データ管理改善

#### 検索・フィルタ機能
- **種目別フィルタ**: 特定種目の記録のみ表示
- **期間フィルタ**: 日付範囲での絞り込み
- **大会別フィルタ**: 大会毎の記録表示
- **記録検索**: タイム、順位等での検索

#### ソート機能
- **日付順**: 新しい順/古い順
- **タイム順**: 速い順/遅い順
- **大会順**: 大会名のアルファベット順

## 🌐 GitHub連携によるデータ共有

### データ更新フロー

1. **記録追加/編集**
```bash
# MinatoSwimRecord-appで記録更新後
cd ~/claude_project/claude-code-test

# simple-deploy.bsh内のCOMMIT_MESSAGEを編集
# 例: COMMIT_MESSAGE="Add new swimming record: 2025-07-08 butterfly 50m 26.05"

# デプロイ実行
./simple-deploy.bsh
```

2. **チーム同期**
```bash
# 他メンバーの更新を取得
cd ~/claude_project/claude-code-test
git pull origin main
```

3. **アプリアクセス**
- スクリプト実行後に表示されるURLからアクセス
- GitHub Pages で自動的にWebサイト更新
- 全メンバーが最新データを閲覧可能

### 初期データ設定

```json
// data/swim-records.json の構造
// swimRecord-250705b.txt（170件）からの変換データ
{
  "records": [
    {
      "id": "001",
      "日付": "2025-03-28",
      "種目": "バタフライ",
      "距離": "50",
      "プール": "短水路",
      "タイム": "26.15",
      "種別": "大会",
      "大会名": "JO(春)",
      "レース": "A-決勝",
      "順位": "3位",
      "メモ": "",
      "入力者": "データ移行",
      "更新日時": "2025-07-08T10:00:00Z"
    }
    // ... 169件の追加データ
  ],
  "metadata": {
    "source": "swimRecord-250705b.txt",
    "totalRecords": 170,
    "lastUpdated": "2025-07-08T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### データ変換ユーティリティ

```javascript
// utils/dataConverter.js
// swimRecord-250705b.txtをJSONに変換
const convertCSVtoJSON = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  const records = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.replace(/"/g, ''));
    const record = { id: String(index + 1).padStart(3, '0') };
    
    headers.forEach((header, i) => {
      record[header] = values[i] || '';
    });
    
    record.更新日時 = new Date().toISOString();
    return record;
  });
  
  return {
    records,
    metadata: {
      source: "swimRecord-250705b.txt",
      totalRecords: records.length,
      lastUpdated: new Date().toISOString(),
      version: "1.0.0"
    }
  };
};
```

## 📱 レスポンシブ対応

### PC版機能
- **大画面グラフ**: 詳細な記録推移表示
- **多列表示**: 効率的な記録一覧
- **キーボードショートカット**: 高速データ入力

### モバイル版機能
- **タッチ操作**: スワイプでの記録切り替え
- **縦向き最適化**: 片手での操作性
- **オフライン対応**: PWA機能での記録閲覧

## 🎯 使用方法

### 1. 初回セットアップ
1. 初期データ（170件）を自動読み込み
2. 選手情報の設定
3. 目標設定

### 2. 日常使用
1. **記録追加**: 練習・大会後の記録入力
2. **進捗確認**: グラフでの成長推移確認
3. **目標設定**: AIアドバイスを参考に目標更新

### 3. チーム管理
1. **データ共有**: GitHub経由でのチーム記録共有
2. **分析会議**: 統計データを用いたチーム分析
3. **目標管理**: 個人・チーム目標の追跡

## 🔧 カスタマイズ

### テーマ設定
```css
/* カスタムテーマの例 */
:root {
  --primary-color: #2563eb;
  --secondary-color: #dc2626;
  --background-color: #f8fafc;
  --text-color: #1f2937;
}
```

### 追加種目設定
```javascript
// 新種目追加の例
const customStrokes = [
  '自由形', '平泳ぎ', '背泳ぎ', 'バタフライ', 
  '個人メドレー', 'フリーリレー', 'メドレーリレー'
];
```

## 🤝 コントリビューション

### データ追加方法
1. **simple-deploy.bshを使用**
```bash
cd ~/claude_project/claude-code-test

# スクリプト内のCOMMIT_MESSAGEを編集
# 例: COMMIT_MESSAGE="新記録追加: バタフライ50m 25.80秒"

./simple-deploy.bsh
```

2. **CSV一括アップロード**
- Webアプリ内のCSV読み込み機能を使用
- 大量データの一括追加に便利

### 機能改善提案
- GitHub Issues での機能要望
- 既存のweather-app、game-appの改善パターンを参考
- Pull Requestでの新機能追加

### 既存プロジェクトとの連携
- `claude-code-test`内の他アプリとの設計統一
- 共通ユーティリティの再利用
- 統一されたデプロイフロー（simple-deploy.bsh）

## 📈 将来の拡張計画

### 短期目標（1-3ヶ月）
- [ ] 記録予測機能（AI）
- [ ] 大会スケジュール管理
- [ ] コーチング機能

### 中期目標（3-6ヶ月）
- [ ] 動画分析連携
- [ ] SNS連携機能
- [ ] チーム内ランキング

### 長期目標（6-12ヶ月）
- [ ] VR/AR での泳法分析
- [ ] IoTデバイス連携
- [ ] 競技会公式記録連携

## 📞 サポート

### 技術サポート
- GitHub Issues: バグ報告・機能要望
- プロジェクト内共通Issue管理
- 既存アプリ（weather-app、game-app）の知見活用

### ドキュメント
- [プロジェクト共通ガイド](../README.md)
- [simple-deploy.bsh 使用方法](../simple-deploy.bsh)
- [開発者ガイド](./docs/development.md)

## 📄 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを参照

## 🙏 謝辞

- 初期データ提供者（swimRecord-250705b.txt）
- βテスター
- claude-code-testプロジェクトメンバー
- 既存アプリ（weather-app、game-app）開発者
- 水泳競技関係者

## 🔗 関連プロジェクト

同じ`claude-code-test`ディレクトリ内の関連プロジェクト：
- **weather-app**: 天気予報アプリ
- **game-app**: ゲームアプリ
- **simple-deploy.bsh**: 共通デプロイスクリプト

---

**🏊‍♂️ Happy Swimming! あなたの記録向上を全力でサポートします！ 🏆**

*このアプリは Claude CODE プロジェクト `claude-code-test/MinatoSwimRecord-app` の一部です*
