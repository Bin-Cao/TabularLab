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
  <a href="README.ja.md">日本語</a> |
  한국어 |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.fr.md">Français</a>
</p>

**TabularLab**은 표 형식 데이터용 가벼운 머신러닝 도구입니다. 데스크톱 App으로 사용할 수 있고 브라우저에서도 열 수 있으며, 회귀, 분류, 클러스터링, 시각화, 예측, 결과 내보내기를 지원합니다.

**저자:** [Dr. Bin Cao / 曹斌](https://bin-cao.github.io/)  
**버전:** `v1.0.0`  
**저장소:** <https://github.com/bin-cao/TabularLab>  
**App 다운로드:** <https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0>  
**피드백:** 개선 제안은 [GitHub Issues](https://github.com/bin-cao/TabularLab/issues)에 등록해 주세요.

## 빠른 시작

Windows 또는 macOS App은 아래 주소에서 다운로드할 수 있습니다.

```text
https://github.com/Bin-Cao/TabularLab/releases/tag/V1.0.0
```

브라우저에서 [`index.html`](index.html)을 열 수도 있습니다. 로컬 브라우저 사용 시에는 정적 서버를 권장합니다.

```bash
python3 -m http.server 8000
```

그 다음 `http://localhost:8000/`을 엽니다.

## 주요 기능

- CSV, TSV, TXT, XLSX, XLS 파일 가져오기.
- 중국어와 영어 UI 전환.
- 회귀, 분류, 클러스터링 작업 지원.
- 각 열을 특성, 타깃, 무시로 설정.
- 다중 타깃 회귀와 분류 지원.
- 결측값 처리, 범주형 인코딩, 주요 하이퍼파라미터 조정.
- 차트 작성, 모델 평가, 결과 내보내기, 단일 예측, 배치 예측 지원.

## 주요 파일

| 경로 | 설명 |
| --- | --- |
| [`index.html`](index.html) | 메인 웹 애플리케이션. |
| [`assets/css/styles.css`](assets/css/styles.css) | UI 스타일. |
| [`assets/js/app.js`](assets/js/app.js) | UI 흐름, 모델 실행, 예측, 내보내기 로직. |
| [`assets/js/ml.js`](assets/js/ml.js) | 브라우저 기반 머신러닝 구현과 지표. |
| [`assets/js/data.js`](assets/js/data.js) | 데이터 파싱, 전처리, 분할, 변환. |
| [`assets/js/charts.js`](assets/js/charts.js) | 차트 렌더링과 내보내기. |
| [`manual/index.html`](manual/index.html) | 언어 전환이 가능한 HTML 사용자 설명서. |

## 예제 데이터

`data/`에는 합금 강도 회귀, 재료 분류, 열처리 분류, 합금 클러스터링, 배터리 재료 다중 타깃 회귀 예제가 포함되어 있습니다.
