<h1 align="center">TabularLab</h1>

<p align="center">
  <a href="https://github.com/bin-cao/TabularLab/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/bin-cao/TabularLab?style=social"></a>
  <a href="https://github.com/bin-cao/TabularLab/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/bin-cao/TabularLab"></a>
  <a href="docs/VERSION.md"><img alt="Version" src="https://img.shields.io/badge/version-V1.1.0-146c5f"></a>
  <a href="https://bin-cao.github.io/TabularLab/"><img alt="Manual" src="https://img.shields.io/badge/manual-online-146c5f"></a>
  <a href="https://github.com/Bin-Cao/TabularLab/releases"><img alt="Download Apps" src="https://img.shields.io/badge/download-apps-146c5f"></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  Français
</p>

**TabularLab** est un outil leger pour l'apprentissage automatique sur donnees tabulaires. Il peut etre utilise comme application de bureau ou ouvert dans un navigateur, et prend en charge la regression, la classification, le clustering, la visualisation, la prediction et l'export des resultats.

**Auteur :** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**Version :** `V1.1.0`  
**Depot :** <https://github.com/bin-cao/TabularLab>  
**Telecharger l'App :** <https://github.com/Bin-Cao/TabularLab/releases/tag/V1.1.0>  
**Retour :** veuillez ouvrir une demande sur [GitHub Issues](https://github.com/bin-cao/TabularLab/issues).

## Demarrage rapide

Telechargez l'application Windows ou macOS ici :

```text
https://github.com/Bin-Cao/TabularLab/releases/tag/V1.1.0
```

Vous pouvez aussi ouvrir [`index.html`](index.html) dans un navigateur. Pour une utilisation locale dans le navigateur, un serveur statique est recommande :

```bash
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000/`.

## Fonctions principales

- Import de fichiers CSV, TSV, TXT, XLSX et XLS.
- Bascule entre interface chinoise et anglaise.
- Taches de regression, classification et clustering.
- Definition des colonnes comme variables, cibles ou ignorees.
- Regression et classification multi-cibles.
- Traitement des valeurs manquantes, encodage categoriel et reglage des principaux hyperparametres.
- Graphiques, evaluation de modeles, export des resultats, prediction unique et prediction par lot.

## Fichiers importants

| Chemin | Role |
| --- | --- |
| [`index.html`](index.html) | Application principale. |
| [`assets/css/styles.css`](assets/css/styles.css) | Styles de l'interface. |
| [`assets/js/app.js`](assets/js/app.js) | Flux UI, execution des modeles, prediction et export. |
| [`assets/js/ml.js`](assets/js/ml.js) | Implementations ML et metriques cote navigateur. |
| [`assets/js/data.js`](assets/js/data.js) | Analyse, pretraitement, decoupage et transformation des donnees. |
| [`assets/js/charts.js`](assets/js/charts.js) | Rendu et export des graphiques. |
| [`manual/index.html`](manual/index.html) | Manuel HTML avec changement de langue. |

## Donnees d'exemple

Le dossier `data/` contient des exemples pour la regression de resistance d'alliage, la classification de materiaux, la classification de traitement thermique, le clustering d'alliages et la regression multi-cibles de materiaux de batterie.
