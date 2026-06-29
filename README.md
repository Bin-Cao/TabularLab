<h1 align="center">TabularLab</h1>

<p align="center">
  <a href="https://github.com/bin-cao/TabularLab/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/bin-cao/TabularLab"></a>
  <a href="docs/VERSION.md"><img alt="Version" src="https://img.shields.io/badge/version-v1.0.0-146c5f"></a>
  <a href="manual/index.html"><img alt="Manual" src="https://img.shields.io/badge/manual-GitHub%20Pages-146c5f"></a>
</p>

<p align="center">
  English |
  <a href="README.zh.md">中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.fr.md">Français</a>
</p>

**TabularLab** is a lightweight browser-based toolkit for tabular machine learning. It runs locally in the browser and supports regression, classification, clustering, visualization, prediction, and result export.

**Author:** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**Version:** `v1.0.0`  
**Repository:** <https://github.com/bin-cao/TabularLab>  
**Feedback:** Please open an issue on [GitHub Issues](https://github.com/bin-cao/TabularLab/issues).

## Quick Start

Open [`index.html`](index.html) in a browser. For the best local experience, start a static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Core Features

- Import CSV, TSV, TXT, XLSX, and XLS files.
- Switch between Chinese and English UI.
- Run regression, classification, and clustering tasks.
- Assign columns as feature, target, or ignored.
- Support multi-target regression and classification.
- Handle missing values, encode categorical features, and tune key hyperparameters.
- Draw charts, evaluate models, export results, and run single or batch prediction.

## Important Files

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html) | Main TabularLab web application. |
| [`assets/css/styles.css`](assets/css/styles.css) | Main UI styling. |
| [`assets/js/app.js`](assets/js/app.js) | UI workflow, model execution, prediction, and export logic. |
| [`assets/js/ml.js`](assets/js/ml.js) | Browser-side machine learning implementations and metrics. |
| [`assets/js/data.js`](assets/js/data.js) | Data parsing, preprocessing, splitting, and transformations. |
| [`assets/js/charts.js`](assets/js/charts.js) | Canvas chart rendering and export helpers. |
| [`assets/js/i18n.js`](assets/js/i18n.js) | Chinese and English UI text. |
| [`assets/js/meta.js`](assets/js/meta.js) | Version, author, citation, repository, and issue metadata. |
| [`manual/index.html`](manual/index.html) | Bilingual HTML user manual with one-click language switching. |
| [`.github/workflows/deploy-manual.yml`](.github/workflows/deploy-manual.yml) | GitHub Actions workflow for deploying the manual to GitHub Pages. |
| [`docs/CITATION.bib`](docs/CITATION.bib) | BibTeX citation file. |

## Example Data

| Folder | Task |
| --- | --- |
| [`data/regression_alloy_strength`](data/regression_alloy_strength) | Alloy yield-strength regression. |
| [`data/classification_material_class`](data/classification_material_class) | Material class classification. |
| [`data/classification_heat_treatment_window`](data/classification_heat_treatment_window) | Heat-treatment window classification. |
| [`data/clustering_alloy_families`](data/clustering_alloy_families) | Alloy family clustering. |
| [`data/mixed_battery_multi_target`](data/mixed_battery_multi_target) | Battery-material multi-target regression. |

## Manual and Deployment

The detailed manual is available at [`manual/index.html`](manual/index.html). The workflow [`.github/workflows/deploy-manual.yml`](.github/workflows/deploy-manual.yml) deploys the `manual/` folder to GitHub Pages. In GitHub, set `Settings -> Pages -> Source` to `GitHub Actions`, then run the workflow.

## Citation

```text
Bin Cao. (2026). TabularLab : A lightweight toolkit for tabular machine learning. Version 1.0.0. https://github.com/bin-cao/TabularLab
```
