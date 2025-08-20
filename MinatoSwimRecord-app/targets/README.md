# 🏊‍♂️ 競泳目標値システム

## 📋 概要

このディレクトリには競泳の目標基準線機能に関連するファイルが含まれています。

## 📁 ディレクトリ構成

```
targets/
├── swimming_targets.csv    # 競泳目標タイムデータ（13-15歳）
├── target-manager.js       # 目標管理クラス
└── README.md              # このファイル
```

## 🎯 機能

### 1. 自動年齢計算
- 誕生日（2012-09-04）から現在年齢を自動計算
- 13歳、14歳、15歳の目標データに対応

### 2. 目標基準線表示
- 全国中学校大会（zenchu）記録
- JOCジュニアオリンピック春季大会（jo_spring）記録
- JOCジュニアオリンピック夏季大会（jo_summer）記録

### 3. ハイブリッドデータ読み込み
- CSVファイルから最新データ読み込み
- ネットワーク接続なしの場合、フォールバックデータ使用
- オフライン動作完全保証

## 📊 データ構造

### CSVファイル形式
```csv
age,event,distance,pool_type,meet,level,time_seconds,time_display,last_updated
13,freestyle,50,short,zenchu,champion,22.19,22.19,2025-01-01
```

### データパラメータ
- **age**: 年齢（13, 14, 15）
- **event**: 種目（freestyle, butterfly）
- **distance**: 距離（50, 100, 200）
- **pool_type**: プール種別（short=25m, long=50m）
- **meet**: 大会（zenchu, jo_spring, jo_summer）
- **level**: レベル（champion, final, standard）
- **time_seconds**: タイム（秒数）
- **time_display**: 表示用タイム
- **last_updated**: 更新日

## 🔧 使用方法

### 1. 初期化
```javascript
// 目標データ初期化
await window.targetManager.initializeTargets();
```

### 2. 目標基準線取得
```javascript
const targetLines = window.targetManager.getTargetLines(
    'freestyle',  // 種目
    50,          // 距離
    'short'      // プール種別
);
```

### 3. 年齢確認
```javascript
const currentAge = window.targetManager.getCurrentAge();
console.log('現在の年齢:', currentAge);
```

## 🎨 表示スタイル

### 線の色
- **zenchu（全中）**: 赤系（#FF4444, #FF6666, #FF8888）
- **jo_spring（JO春）**: 緑系（#44AA44, #66CC66, #88EE88）
- **jo_summer（JO夏）**: 青系（#4488FF, #66AAFF, #88CCFF）

### 線のスタイル
- **champion（優勝）**: 実線、太さ2、透明度0.9
- **final（決勝）**: 破線、太さ1.5、透明度0.7
- **standard（標準）**: 点線、太さ1、透明度0.6

## 🔄 データ更新手順

### 1. 新しい記録の追加
1. `swimming_targets.csv`に新しい行を追加
2. 既存のフォーマットに従ってデータ入力
3. ファイルを保存

### 2. フォールバックデータ更新
1. `target-manager.js`の`getFallbackTargets()`メソッドを編集
2. 新しいデータ構造を追加
3. ファイルを保存

## ⚠️ 注意事項

1. **既存ファイル非破壊**: 既存のアプリケーションコードは一切変更していません
2. **オフライン対応**: ネットワークエラー時は自動的にフォールバックデータを使用
3. **年齢制限**: 現在13-15歳のデータのみ対応
4. **種目制限**: freestyle（自由形）とbutterfly（バタフライ）のみ対応

## 🚀 今後の拡張

- 他の年齢層データ追加
- 背泳ぎ・平泳ぎ・個人メドレー対応
- 地域大会記録追加
- パフォーマンス予測機能

---

**最終更新**: 2025-01-01  
**バージョン**: 1.0.0