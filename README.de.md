<h1 align="center">TabularLab</h1>

<p align="center">
  <a href="https://github.com/bin-cao/TabularLab/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/bin-cao/TabularLab"></a>
  <a href="docs/VERSION.md"><img alt="Version" src="https://img.shields.io/badge/version-v1.0.0-146c5f"></a>
  <a href="manual/index.html"><img alt="Manual" src="https://img.shields.io/badge/manual-GitHub%20Pages-146c5f"></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a> |
  Deutsch |
  <a href="README.fr.md">Français</a>
</p>

**TabularLab** ist ein leichtgewichtiges browserbasiertes Toolkit fuer maschinelles Lernen mit tabellarischen Daten. Es laeuft lokal im Browser und unterstuetzt Regression, Klassifikation, Clustering, Visualisierung, Vorhersage und Ergebnisexport.

**Autor:** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**Version:** `v1.0.0`  
**Repository:** <https://github.com/bin-cao/TabularLab>  
**Feedback:** Vorschlaege bitte ueber [GitHub Issues](https://github.com/bin-cao/TabularLab/issues) einreichen.

## Schnellstart

Oeffnen Sie [`index.html`](index.html) im Browser. Fuer ein stabileres lokales Laden der Beispieldaten starten Sie einen statischen Server:

```bash
python3 -m http.server 8000
```

Danach `http://localhost:8000/` oeffnen.

## Hauptfunktionen

- Import von CSV-, TSV-, TXT-, XLSX- und XLS-Dateien.
- Umschaltung zwischen chinesischer und englischer Benutzeroberflaeche.
- Regression, Klassifikation und Clustering.
- Spalten als Merkmal, Ziel oder ignoriert markieren.
- Mehrziel-Regression und Mehrziel-Klassifikation.
- Fehlende Werte behandeln, kategoriale Merkmale kodieren und wichtige Hyperparameter einstellen.
- Diagramme erstellen, Modelle bewerten, Ergebnisse exportieren sowie Einzel- und Batch-Vorhersagen ausfuehren.

## Wichtige Dateien

| Pfad | Zweck |
| --- | --- |
| [`index.html`](index.html) | Hauptanwendung. |
| [`assets/css/styles.css`](assets/css/styles.css) | UI-Stile. |
| [`assets/js/app.js`](assets/js/app.js) | UI-Ablauf, Modellausfuehrung, Vorhersage und Export. |
| [`assets/js/ml.js`](assets/js/ml.js) | Machine-Learning-Implementierungen und Metriken im Browser. |
| [`assets/js/data.js`](assets/js/data.js) | Datenparsing, Vorverarbeitung, Aufteilung und Transformation. |
| [`assets/js/charts.js`](assets/js/charts.js) | Diagrammrendering und Export. |
| [`manual/index.html`](manual/index.html) | HTML-Handbuch mit Sprachumschaltung. |
| [`.github/workflows/deploy-manual.yml`](.github/workflows/deploy-manual.yml) | Workflow fuer GitHub-Pages-Deployment. |

## Beispieldaten

Der Ordner `data/` enthaelt Beispiele fuer Legierungsfestigkeits-Regression, Materialklassifikation, Waermebehandlungs-Klassifikation, Legierungs-Clustering und Mehrziel-Regression fuer Batteriematerialien.

## Handbuch und Deployment

Das Handbuch befindet sich unter [`manual/index.html`](manual/index.html). Fuer GitHub Pages setzen Sie `Settings -> Pages -> Source` auf `GitHub Actions` und fuehren den Workflow aus.
