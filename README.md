<h1 align="center">TabularLab</h1>

<p align="center">
  <a href="https://github.com/bin-cao/TabularLab/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/bin-cao/TabularLab"></a>
  <a href="docs/VERSION.md"><img alt="Version" src="https://img.shields.io/badge/version-v1.0.0-146c5f"></a>
  <a href="manual/index.html"><img alt="Manual" src="https://img.shields.io/badge/manual-GitHub%20Pages-146c5f"></a>
</p>

**TabularLab** is a lightweight browser-based toolkit for tabular machine learning. It runs locally in the browser and supports regression, classification, clustering, visualization, prediction, and result export.

**Author:** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**Version:** `v1.0.0`  
**Repository:** <https://github.com/bin-cao/TabularLab>  
**Feedback:** Please open an issue on [GitHub Issues](https://github.com/bin-cao/TabularLab/issues).

## Quick Start

Open [`index.html`](index.html) in a browser.

For the best local experience, especially when loading default datasets, start a static server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Core Features

- Import CSV, TSV, TXT, XLSX, and XLS files.
- Switch between Chinese and English UI.
- Run regression, classification, and clustering tasks.
- Assign each column as feature, target, or ignored.
- Support multi-target regression and classification.
- Handle missing values and encode categorical features.
- Adjust key model hyperparameters from the interface.
- Draw histograms, scatter plots, correlation heatmaps, target plots, prediction plots, confusion matrices, and clustering projections.
- Use train/test split or K-fold cross-validation for supervised tasks.
- Export charts, model results, predictions, and processed data.
- Run single-row prediction and batch prediction.

## Important Files

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html) | Main TabularLab web application. |
| [`assets/css/styles.css`](assets/css/styles.css) | Main UI styling. |
| [`assets/js/app.js`](assets/js/app.js) | Application state, UI events, workflow, model execution, prediction, and export logic. |
| [`assets/js/ml.js`](assets/js/ml.js) | Browser-side machine learning implementations and metrics. |
| [`assets/js/data.js`](assets/js/data.js) | Data parsing, schema inference, preprocessing, splitting, and transformations. |
| [`assets/js/charts.js`](assets/js/charts.js) | Canvas chart rendering and chart export helpers. |
| [`assets/js/i18n.js`](assets/js/i18n.js) | Chinese and English UI text. |
| [`assets/js/meta.js`](assets/js/meta.js) | Version, author, citation, repository, and issue metadata. |
| [`assets/js/default-data.js`](assets/js/default-data.js) | Built-in sample dataset fallback data. |
| [`assets/js/utils.js`](assets/js/utils.js) | Shared utility functions. |
| [`assets/vendor/xlsx.full.min.js`](assets/vendor/xlsx.full.min.js) | Local SheetJS library for Excel parsing. |
| [`manual/index.html`](manual/index.html) | Bilingual HTML user manual with one-click language switching. |
| [`.github/workflows/deploy-manual.yml`](.github/workflows/deploy-manual.yml) | GitHub Actions workflow for deploying the manual to GitHub Pages. |
| [`.github/CITATION.cff`](.github/CITATION.cff) | GitHub citation metadata. |
| [`docs/CITATION.bib`](docs/CITATION.bib) | BibTeX citation file. |
| [`docs/VERSION.md`](docs/VERSION.md) | Version notes. |

## Example Data

| Folder | Task |
| --- | --- |
| [`data/regression_alloy_strength`](data/regression_alloy_strength) | Alloy yield-strength regression. |
| [`data/classification_material_class`](data/classification_material_class) | Material class multi-class classification. |
| [`data/classification_heat_treatment_window`](data/classification_heat_treatment_window) | Heat-treatment window binary classification. |
| [`data/clustering_alloy_families`](data/clustering_alloy_families) | Alloy family / material-property clustering. |
| [`data/mixed_battery_multi_target`](data/mixed_battery_multi_target) | Battery-material multi-target regression with missing values. |

## User Manual

The detailed bilingual manual is available at:

```text
manual/index.html
```

It explains the interface purpose, author information, data requirements, usage workflow, model functions, export options, and notes.

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow:

```text
.github/workflows/deploy-manual.yml
```

It deploys the `manual/` folder to GitHub Pages when changes are pushed to `main`.

First-time setup:

1. Open the GitHub repository.
2. Go to `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. Run the `Deploy Manual to GitHub Pages` workflow.

## Citation

Recommended citation:

```text
Bin Cao. (2026). TabularLab : A lightweight toolkit for tabular machine learning. Version 1.0.0. https://github.com/bin-cao/TabularLab
```

BibTeX is available in [`docs/CITATION.bib`](docs/CITATION.bib).

## Notes

TabularLab is designed for small to medium tabular datasets, teaching, demonstrations, prototyping, and quick experiments. For large-scale or production training workflows, use a dedicated Python/R backend or machine learning service.
