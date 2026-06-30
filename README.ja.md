<h1 align="center">TabularLab</h1>

<p align="center">
  <a href="https://github.com/bin-cao/TabularLab/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/bin-cao/TabularLab"></a>
  <a href="docs/VERSION.md"><img alt="Version" src="https://img.shields.io/badge/version-v1.0.0-146c5f"></a>
  <a href="https://bin-cao.github.io/TabularLab/"><img alt="Manual" src="https://img.shields.io/badge/manual-online-146c5f"></a>
  <a href="https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0"><img alt="Download Apps" src="https://img.shields.io/badge/download-apps-146c5f"></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  日本語 |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.fr.md">Français</a>
</p>

**TabularLab** は、表形式データ向けの軽量な機械学習ツールです。デスクトップ App として利用でき、ブラウザでも開けます。回帰、分類、クラスタリング、可視化、予測、結果のエクスポートに対応します。

**作者:** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**バージョン:** `v1.0.0`  
**リポジトリ:** <https://github.com/bin-cao/TabularLab>  
**App ダウンロード:** <https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0>  
**フィードバック:** 改善提案は [GitHub Issues](https://github.com/bin-cao/TabularLab/issues) に投稿してください。

## クイックスタート

Windows または macOS App は次のページからダウンロードできます。

```text
https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0
```

ブラウザで [`index.html`](index.html) を開くこともできます。ブラウザでローカル利用する場合は、静的サーバーの使用を推奨します。

```bash
python3 -m http.server 8000
```

その後、`http://localhost:8000/` を開きます。

## 主な機能

- CSV、TSV、TXT、XLSX、XLS ファイルを読み込み。
- 中国語と英語の UI 切り替え。
- 回帰、分類、クラスタリングに対応。
- 列を特徴量、目的変数、無視に設定。
- 複数目的の回帰と分類に対応。
- 欠損値処理、カテゴリ変数エンコード、主要ハイパーパラメータ調整。
- グラフ描画、モデル評価、結果出力、単一予測、バッチ予測に対応。

## 重要ファイル

| パス | 説明 |
| --- | --- |
| [`index.html`](index.html) | メインアプリケーション。 |
| [`assets/css/styles.css`](assets/css/styles.css) | UI スタイル。 |
| [`assets/js/app.js`](assets/js/app.js) | UI フロー、モデル実行、予測、出力処理。 |
| [`assets/js/ml.js`](assets/js/ml.js) | ブラウザ側の機械学習実装と評価指標。 |
| [`assets/js/data.js`](assets/js/data.js) | データ解析、前処理、分割、変換。 |
| [`assets/js/charts.js`](assets/js/charts.js) | グラフ描画とエクスポート。 |
| [`manual/index.html`](manual/index.html) | 言語切り替え対応の HTML マニュアル。 |

## サンプルデータ

`data/` には、合金強度回帰、材料分類、熱処理分類、合金クラスタリング、電池材料多目的回帰のサンプルがあります。
