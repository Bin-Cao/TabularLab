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
  中文 |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.fr.md">Français</a>
</p>

**TabularLab** 是一个轻量级表格机器学习工具，可作为桌面 App 使用，也可以在浏览器中打开。它支持回归、分类、聚类、可视化、预测和结果导出。

**作者：** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**版本：** `v1.0.0`  
**仓库：** <https://github.com/bin-cao/TabularLab>  
**下载 App：** <https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0>  
**反馈：** 请在 [GitHub Issues](https://github.com/bin-cao/TabularLab/issues) 提交建议。

## 快速开始

从下面地址下载 Windows 或 macOS App：

```text
https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0
```

也可以用浏览器打开 [`index.html`](index.html)。如果使用本地浏览器方式，建议启动静态服务器：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

## 核心功能

- 导入 CSV、TSV、TXT、XLSX 和 XLS 文件。
- 支持中文和英文界面切换。
- 支持回归、分类和聚类任务。
- 可将字段设置为特征、目标或忽略。
- 支持多目标回归和多目标分类。
- 支持缺失值处理、类别编码和关键模型超参数调整。
- 支持图表绘制、模型评估、结果导出、单条预测和批量预测。

## 重要文件

| 路径 | 功能 |
| --- | --- |
| [`index.html`](index.html) | 主应用入口。 |
| [`assets/css/styles.css`](assets/css/styles.css) | 界面样式。 |
| [`assets/js/app.js`](assets/js/app.js) | 界面流程、模型运行、预测和导出逻辑。 |
| [`assets/js/ml.js`](assets/js/ml.js) | 浏览器端机器学习算法和指标。 |
| [`assets/js/data.js`](assets/js/data.js) | 数据解析、预处理、划分和转换。 |
| [`assets/js/charts.js`](assets/js/charts.js) | 图表绘制和导出。 |
| [`assets/js/i18n.js`](assets/js/i18n.js) | 中英文界面文本。 |
| [`assets/js/meta.js`](assets/js/meta.js) | 版本、作者、引用、仓库和 issue 信息。 |
| [`manual/index.html`](manual/index.html) | 可切换语言的 HTML 说明书。 |
| [`docs/CITATION.bib`](docs/CITATION.bib) | BibTeX 引用文件。 |

## 示例数据

| 文件夹 | 任务 |
| --- | --- |
| [`data/regression_alloy_strength`](data/regression_alloy_strength) | 合金屈服强度回归。 |
| [`data/classification_material_class`](data/classification_material_class) | 材料类别分类。 |
| [`data/classification_heat_treatment_window`](data/classification_heat_treatment_window) | 热处理窗口分类。 |
| [`data/clustering_alloy_families`](data/clustering_alloy_families) | 合金族聚类。 |
| [`data/mixed_battery_multi_target`](data/mixed_battery_multi_target) | 电池材料多目标回归。 |

## 引用

```text
Bin Cao. (2026). TabularLab : A lightweight toolkit for tabular machine learning. Version 1.0.0. https://github.com/bin-cao/TabularLab
```
