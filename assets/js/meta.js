(function () {
  const version = "1.1.0";
  const released = "2026-07-01";
  const title = "TabularLab : A lightweight toolkit for tabular machine learning.";
  const author = "Bin Cao";
  const authorDisplay = "Dr. Bin Cao / 曹斌";
  const authorUrl = "https://bin-cao.github.io/";
  const softwareUrl = "https://github.com/bin-cao/TabularLab";
  const issueUrl = `${softwareUrl}/issues`;
  const manualUrl = "https://bin-cao.github.io/TabularLab/";
  const citation = `${author}. (${released.slice(0, 4)}). ${title} Version ${version}. ${softwareUrl}`;
  const bibtex = `@software{Cao2026TabularLab,
  author = {${author}},
  title = {${title}},
  year = {2026},
  version = {${version}},
  url = {${softwareUrl}},
  note = {A lightweight toolkit for tabular machine learning}
}`;

  window.TabularLabMeta = {
    version,
    released,
    title,
    author,
    authorDisplay,
    authorUrl,
    softwareUrl,
    issueUrl,
    manualUrl,
    citation,
    bibtex
  };
})();
