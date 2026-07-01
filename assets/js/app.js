(function () {
  const state = {
    rows: [],
    columns: [],
    schema: [],
    filename: "",
    dataSourceType: "",
    modelBundle: null,
    predictions: [],
    targetBundles: [],
    currentPreset: null
  };

  const $ = (id) => document.getElementById(id);

  const chartDefaults = {
    exportFormat: "png",
    fontFamily: "Arial, sans-serif",
    titleSize: "30",
    labelSize: "18",
    tickSize: "16",
    xLabelOffset: "40",
    yLabelOffset: "40",
    xTickOffset: "20",
    yTickOffset: "20",
    xLabelAngle: "36",
    yLabelAngle: "0",
    pointSize: "5",
    matrixValueSize: "18",
    matrixValueColor: "#1d2530",
    width: "1200",
    height: "720",
    correlationMaxFeatures: "14",
    correlationStyle: "blueRed",
    background: "#fbfcfd",
    textColor: "#1d2530",
    gridColor: "#e5ebf1",
    accentColor: "#0f766e"
  };

  const modelOptions = {
    regression: [
      ["linear", "Linear / Ridge Regression"],
      ["lasso", "Lasso Regression"],
      ["elasticnet", "ElasticNet Regression"],
      ["svr", "Linear SVR"],
      ["tree", "Decision Tree Regressor"],
      ["forest", "Random Forest Regressor"],
      ["gbr", "Gradient Boosting Regressor"],
      ["knn", "KNN Regression"]
    ],
    classification: [
      ["softmax", "Softmax Logistic Classifier"],
      ["svm", "Linear SVM"],
      ["tree", "Decision Tree Classifier"],
      ["forest", "Random Forest Classifier"],
      ["gnb", "Gaussian Naive Bayes"],
      ["knn", "KNN Classifier"]
    ],
    clustering: [
      ["kmeans", "KMeans Clustering"],
      ["dbscan", "DBSCAN Clustering"],
      ["agglomerative", "Agglomerative Clustering"]
    ]
  };

  const modelParamDefinitions = {
    linear: [
      { key: "lambda", label: "paramRegularization", help: "paramRegularizationHelp", min: 0, max: 1, step: 0.001, value: 0.01 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.03 },
      { key: "epochs", label: "paramEpochs", help: "paramEpochsHelp", min: 100, max: 5000, step: 100, value: 900 }
    ],
    lasso: [
      { key: "lambda", label: "paramRegularization", help: "paramRegularizationHelp", min: 0, max: 1, step: 0.001, value: 0.04 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.025 },
      { key: "epochs", label: "paramEpochs", help: "paramEpochsHelp", min: 100, max: 5000, step: 100, value: 1100 }
    ],
    elasticnet: [
      { key: "lambda", label: "paramRegularization", help: "paramRegularizationHelp", min: 0, max: 1, step: 0.001, value: 0.025 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.025 },
      { key: "epochs", label: "paramEpochs", help: "paramEpochsHelp", min: 100, max: 5000, step: 100, value: 1100 }
    ],
    svr: [
      { key: "lambda", label: "paramRegularization", help: "paramRegularizationHelp", min: 0, max: 1, step: 0.001, value: 0.02 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.025 },
      { key: "epochs", label: "paramEpochs", help: "paramEpochsHelp", min: 100, max: 5000, step: 100, value: 1000 }
    ],
    tree: [
      { key: "maxDepth", label: "paramMaxDepth", help: "paramMaxDepthHelp", min: 1, max: 30, step: 1, value: 7 }
    ],
    forest: [
      { key: "trees", label: "paramTrees", help: "paramTreesHelp", min: 5, max: 200, step: 5, value: 25 },
      { key: "maxDepth", label: "paramMaxDepth", help: "paramMaxDepthHelp", min: 1, max: 30, step: 1, value: 8 }
    ],
    gbr: [
      { key: "estimators", label: "paramEstimators", help: "paramEstimatorsHelp", min: 5, max: 200, step: 5, value: 35 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.12 },
      { key: "maxDepth", label: "paramMaxDepth", help: "paramMaxDepthHelp", min: 1, max: 10, step: 1, value: 2 }
    ],
    knn: [
      { key: "k", label: "paramK", help: "paramKHelp", min: 1, max: 50, step: 1, value: 5 }
    ],
    gnb: [
      { key: "varSmoothing", label: "paramVarSmoothing", help: "paramVarSmoothingHelp", min: 0.000000001, max: 0.01, step: 0.000000001, value: 0.000001 }
    ],
    softmax: [
      { key: "lambda", label: "paramRegularization", help: "paramRegularizationHelp", min: 0, max: 1, step: 0.001, value: 0.003 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.08 },
      { key: "epochs", label: "paramEpochs", help: "paramEpochsHelp", min: 100, max: 5000, step: 100, value: 800 }
    ],
    svm: [
      { key: "lambda", label: "paramRegularization", help: "paramRegularizationHelp", min: 0, max: 1, step: 0.001, value: 0.01 },
      { key: "lr", label: "paramLearningRate", help: "paramLearningRateHelp", min: 0.001, max: 1, step: 0.001, value: 0.03 },
      { key: "epochs", label: "paramEpochs", help: "paramEpochsHelp", min: 100, max: 5000, step: 100, value: 700 }
    ],
    kmeans: [
      { key: "k", label: "paramK", help: "paramKHelp", min: 2, max: 20, step: 1, value: 3 }
    ],
    dbscan: [
      { key: "eps", label: "paramEps", help: "paramEpsHelp", min: 0.05, max: 10, step: 0.05, value: 1.25 },
      { key: "minPts", label: "paramMinPts", help: "paramMinPtsHelp", min: 2, max: 30, step: 1, value: 4 }
    ],
    agglomerative: [
      { key: "k", label: "paramK", help: "paramKHelp", min: 2, max: 20, step: 1, value: 3 }
    ]
  };

  const tuningSearchSpaces = {
    linear: { lambda: [0, 0.003, 0.01, 0.03, 0.08], lr: [0.01, 0.03, 0.06], epochs: [300, 700, 1100] },
    lasso: { lambda: [0.005, 0.02, 0.04, 0.08, 0.15], lr: [0.01, 0.025, 0.05], epochs: [400, 800, 1200] },
    elasticnet: { lambda: [0.003, 0.015, 0.025, 0.06, 0.12], lr: [0.01, 0.025, 0.05], epochs: [400, 800, 1200] },
    svr: { lambda: [0.003, 0.01, 0.02, 0.05, 0.1], lr: [0.01, 0.025, 0.05], epochs: [400, 800, 1200] },
    tree: { maxDepth: [3, 5, 7, 10, 14] },
    forest: { trees: [15, 25, 45], maxDepth: [4, 8, 12] },
    gbr: { estimators: [20, 35, 60], lr: [0.05, 0.12, 0.2], maxDepth: [1, 2, 3] },
    knn: { k: [1, 3, 5, 7, 11] },
    softmax: { lambda: [0, 0.001, 0.003, 0.01, 0.03], lr: [0.03, 0.08, 0.15], epochs: [300, 700, 1100] },
    svm: { lambda: [0.001, 0.005, 0.01, 0.03, 0.08], lr: [0.01, 0.03, 0.06], epochs: [300, 700, 1000] },
    gnb: { varSmoothing: [0.000000001, 0.00000001, 0.0000001, 0.000001, 0.00001] },
    kmeans: { k: [2, 3, 4, 5, 6] },
    dbscan: { eps: [0.5, 0.9, 1.25, 1.8, 2.5], minPts: [3, 4, 6] },
    agglomerative: { k: [2, 3, 4, 5, 6] }
  };

  const defaultDatasets = [
    {
      id: "alloy_strength",
      path: "data/regression_alloy_strength/alloy_strength.csv",
      filename: "alloy_strength.csv",
      task: "regression",
      targets: ["yield_strength_mpa"],
      zh: { name: "合金强度回归数据", description: "材料回归任务：根据合金族、工艺、元素含量、晶粒尺寸和热处理参数预测屈服强度。", features: "除 yield_strength_mpa 外的所有列" },
      en: { name: "Alloy Strength Regression", description: "Materials regression task: predict yield strength from alloy family, processing, composition, grain size, and heat-treatment parameters.", features: "All columns except yield_strength_mpa" }
    },
    {
      id: "material_class",
      path: "data/classification_material_class/material_classification.csv",
      filename: "material_classification.csv",
      task: "classification",
      targets: ["material_class"],
      zh: { name: "材料类别多分类数据", description: "材料分类任务：根据密度、模量、电导率、熔点、抗氧化等级和晶体结构识别材料类别。", features: "除 material_class 外的所有列" },
      en: { name: "Material Class Classification", description: "Materials classification task: identify material class from density, modulus, conductivity, melting point, oxidation resistance, and crystal structure.", features: "All columns except material_class" }
    },
    {
      id: "heat_treatment",
      path: "data/classification_heat_treatment_window/heat_treatment_window.csv",
      filename: "heat_treatment_window.csv",
      task: "classification",
      targets: ["heat_treatment_pass"],
      zh: { name: "热处理窗口二分类数据", description: "材料工艺分类任务：判断成分和热处理参数是否落在可接受工艺窗口。", features: "除 heat_treatment_pass 外的所有列" },
      en: { name: "Heat Treatment Window Classification", description: "Materials process classification task: determine whether composition and heat-treatment parameters are inside an acceptable process window.", features: "All columns except heat_treatment_pass" }
    },
    {
      id: "alloy_clustering",
      path: "data/clustering_alloy_families/alloy_family_clustering.csv",
      filename: "alloy_family_clustering.csv",
      task: "clustering",
      targets: [],
      zh: { name: "合金族聚类数据", description: "无监督材料聚类任务：根据密度、模量、热膨胀、导热率、成本和加工方式发现材料族。", features: "所有列" },
      en: { name: "Alloy Family Clustering", description: "Unsupervised materials clustering task: discover material families from density, modulus, thermal expansion, conductivity, cost, and processing route.", features: "All columns" }
    },
    {
      id: "battery_multi",
      path: "data/mixed_battery_multi_target/battery_materials_multi_target.csv",
      filename: "battery_materials_multi_target.csv",
      task: "regression",
      targets: ["capacity_mah_g", "cycle_retention_pct"],
      zh: { name: "电池材料多目标数据", description: "材料多目标回归任务：包含缺失值和类别特征，预测容量和循环保持率。", features: "除 capacity_mah_g、cycle_retention_pct 外的所有列" },
      en: { name: "Battery Materials Multi-target", description: "Materials multi-target regression task with missing values and categorical features; predict capacity and cycle retention.", features: "All columns except capacity_mah_g and cycle_retention_pct" }
    }
  ];

  const SAMPLE_CSV = [
    "price,size,rooms,age,district,renovated,building_type,near_subway,school_score",
    "520000,96,3,12,East,yes,apartment,yes,8.6",
    "410000,72,2,24,West,no,apartment,no,7.4",
    "680000,130,4,8,Central,yes,condo,yes,9.1",
    "355000,64,2,31,North,no,apartment,no,6.8",
    "730000,142,4,5,Central,yes,house,yes,9.3",
    "485000,88,3,18,South,no,condo,yes,7.8",
    "610000,118,3,10,East,yes,condo,yes,8.4",
    "390000,70,2,28,West,no,apartment,no,7.1",
    "810000,158,5,4,Central,yes,house,yes,9.5",
    "450000,82,3,20,North,no,apartment,no,7.0",
    "565000,105,3,14,South,yes,condo,yes,8.0",
    "335000,58,1,35,West,no,apartment,no,6.6",
    "760000,150,4,7,East,yes,house,yes,8.9",
    "605000,112,3,11,Central,no,condo,yes,8.7",
    "430000,76,2,26,South,no,apartment,no,7.2"
  ].join("\n");

  function init() {
    I18N.apply("en");
    $("languageSelect").value = "en";
    bindEvents();
    populateDefaultDatasets();
    updateModels();
    updateTaskUi();
    renderEmpty();
    updateStatusBar();
  }

  function bindEvents() {
    $("languageSelect").addEventListener("change", (e) => {
      I18N.apply(e.target.value);
      populateDefaultDatasets();
      renderModelParams();
      updateTaskUi();
      renderAll();
      renderCurrentDatasetInfo();
      updateStatusBar();
    });
    $("themeToggle").addEventListener("click", () => {
      document.body.dataset.theme = document.body.dataset.theme === "dark" ? "" : "dark";
      drawCurrentChart();
    });
    $("fileInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      loadFile(file);
    });
    $("loadSampleBtn").addEventListener("click", loadSample);
    $("defaultDatasetSelect").addEventListener("change", renderDefaultDatasetInfo);
    $("clearBtn").addEventListener("click", clearData);
    $("taskType").addEventListener("change", () => {
      state.currentPreset = null;
      updateModels();
      updateTaskUi();
      selectDefaultFeatures();
      updateStatusBar();
    });
    $("modelSelect").addEventListener("change", () => {
      renderModelParams();
      updateStatusBar();
    });
    $("targetColumn").addEventListener("change", () => {
      state.currentPreset = null;
      syncRolesFromTargetSelect();
      selectDefaultFeatures();
      renderOverview();
      renderDataTable();
    });
    $("selectAllFeatures").addEventListener("click", () => setAllFeatures(true));
    $("clearFeatures").addEventListener("click", () => setAllFeatures(false));
    $("runBtn").addEventListener("click", runAnalysis);
    $("chartType").addEventListener("change", () => {
      updateChartControls();
      drawCurrentChart();
    });
    $("drawChartBtn").addEventListener("click", drawCurrentChart);
    document.querySelectorAll("[data-chart-setting]").forEach((control) => {
      control.addEventListener("input", () => {
        syncChartControls(control);
        drawCurrentChart();
        drawResultChart();
      });
      control.addEventListener("change", () => {
        syncChartControls(control);
        drawCurrentChart();
        drawResultChart();
      });
    });
    document.querySelectorAll(".chart-reset-btn").forEach((button) => button.addEventListener("click", resetChartDefaults));
    $("saveChartBtn").addEventListener("click", () => {
      saveChart("chart");
      Utils.toast(I18N.t("chartSaved"));
    });
    $("saveResultsBtn").addEventListener("click", saveResults);
    $("savePredictionsBtn").addEventListener("click", savePredictions);
    $("drawResultChartBtn").addEventListener("click", drawResultChart);
    $("resultTargetSelect").addEventListener("change", drawResultChart);
    $("projectionMethodSelect").addEventListener("change", drawResultChart);
    $("saveResultChartBtn").addEventListener("click", () => {
      saveChart("result");
      Utils.toast(I18N.t("chartSaved"));
    });
    $("predictBtn").addEventListener("click", singlePredict);
    $("batchPredictBtn").addEventListener("click", batchPredict);
    $("batchFileInput").addEventListener("change", updateBatchRequirements);
    $("exportCleanBtn").addEventListener("click", exportProcessedData);
    $("previewRows").addEventListener("input", renderDataTable);
    $("copyCitationBtn").addEventListener("click", () => copyText(TabularLabMeta.citation));
    $("copyBibtexBtn").addEventListener("click", () => copyText(TabularLabMeta.bibtex));
    $("copyOperationCitationBtn").addEventListener("click", () => copyText(TabularLabMeta.citation));
    $("copyOperationBibtexBtn").addEventListener("click", () => copyText(TabularLabMeta.bibtex));
    document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => activateTab(tab.dataset.tab)));
    setupCollapsiblePanels();
    setupSidebarResize();
    updateChartControls();
    const dropzone = $("dropzone");
    ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    }));
    ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    }));
    dropzone.addEventListener("drop", (e) => {
      $("fileInput").value = "";
      loadFile(e.dataTransfer.files[0]);
    });
    $("columnRoleTable").addEventListener("change", (e) => {
      if (!e.target.classList.contains("role-radio")) return;
      const column = e.target.value;
      syncLegacyFeatureSelect();
      syncTargetSelectFromRoles();
      renderColumnRoles();
      renderOverview();
      renderDataTable();
    });
  }

  function activateTab(name) {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === name));
  }

  function setupCollapsiblePanels() {
    document.querySelectorAll(".sidebar > .panel").forEach((panel, index) => {
      const heading = panel.querySelector(":scope > h2");
      if (!heading || panel.querySelector(":scope > .panel-toggle")) return;
      const panelId = panel.dataset.panelId || `sidebar-panel-${index}`;
      panel.dataset.panelId = panelId;
      const content = document.createElement("div");
      content.className = "panel-collapsible-content";
      Array.from(panel.children).forEach((child) => {
        if (child !== heading) content.appendChild(child);
      });
      const title = document.createElement("span");
      title.className = "panel-toggle-title";
      title.textContent = heading.textContent;
      const i18nKey = heading.getAttribute("data-i18n");
      if (i18nKey) title.setAttribute("data-i18n", i18nKey);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "panel-toggle";
      button.setAttribute("aria-expanded", "true");
      button.appendChild(title);
      heading.remove();
      panel.appendChild(button);
      panel.appendChild(content);
      const saved = localStorage.getItem(`tabularlab.${panelId}.collapsed`);
      setPanelCollapsed(panel, saved === null ? true : saved === "true");
      button.addEventListener("click", () => {
        const collapsed = !panel.classList.contains("is-collapsed");
        setPanelCollapsed(panel, collapsed);
        localStorage.setItem(`tabularlab.${panelId}.collapsed`, String(collapsed));
      });
    });
  }

  function setPanelCollapsed(panel, collapsed) {
    panel.classList.toggle("is-collapsed", collapsed);
    const button = panel.querySelector(":scope > .panel-toggle");
    if (button) button.setAttribute("aria-expanded", String(!collapsed));
  }

  function setupSidebarResize() {
    const resizer = $("sidebarResizer");
    if (!resizer) return;
    const saved = Number(localStorage.getItem("tabularlab.sidebarWidth"));
    if (Number.isFinite(saved)) setSidebarWidth(saved);
    resizer.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      resizer.setPointerCapture(event.pointerId);
      document.body.classList.add("is-resizing-sidebar");
    });
    resizer.addEventListener("pointermove", (event) => {
      if (!document.body.classList.contains("is-resizing-sidebar")) return;
      const layoutLeft = document.querySelector(".layout").getBoundingClientRect().left;
      setSidebarWidth(event.clientX - layoutLeft);
    });
    resizer.addEventListener("pointerup", (event) => {
      resizer.releasePointerCapture(event.pointerId);
      document.body.classList.remove("is-resizing-sidebar");
      localStorage.setItem("tabularlab.sidebarWidth", String(currentSidebarWidth()));
    });
    window.addEventListener("resize", () => setSidebarWidth(currentSidebarWidth()));
  }

  function setSidebarWidth(width) {
    const layout = document.querySelector(".layout");
    if (!layout) return;
    const max = Math.max(360, Math.min(620, layout.clientWidth * 0.46));
    const next = Utils.clamp(Number(width) || 430, 320, max);
    document.documentElement.style.setProperty("--sidebar-width", `${Math.round(next)}px`);
  }

  function currentSidebarWidth() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width");
    return Number.parseFloat(value) || 430;
  }

  function populateDefaultDatasets() {
    const current = $("defaultDatasetSelect").value || defaultDatasets[0].id;
    $("defaultDatasetSelect").innerHTML = "";
    defaultDatasets.forEach((dataset) => {
      const text = datasetText(dataset);
      const option = document.createElement("option");
      option.value = dataset.id;
      option.textContent = text.name;
      $("defaultDatasetSelect").appendChild(option);
    });
    $("defaultDatasetSelect").value = defaultDatasets.some((item) => item.id === current) ? current : defaultDatasets[0].id;
    renderDefaultDatasetInfo();
  }

  function selectedDefaultDataset() {
    return defaultDatasets.find((dataset) => dataset.id === $("defaultDatasetSelect").value) || defaultDatasets[0];
  }

  function renderDefaultDatasetInfo() {
    const dataset = selectedDefaultDataset();
    const text = datasetText(dataset);
    $("defaultDatasetInfo").innerHTML = [
      `<strong>${escapeHtml(text.name)}</strong>`,
      `<span>${escapeHtml(text.description)}</span>`,
      `<span>${escapeHtml(I18N.t("recommendedTask"))}: ${escapeHtml(I18N.t(dataset.task))}</span>`,
      `<span>${escapeHtml(I18N.t("recommendedTargets"))}: ${escapeHtml(dataset.targets.length ? dataset.targets.join(", ") : I18N.t("clusteringNoTarget"))}</span>`,
      `<span>${escapeHtml(I18N.t("recommendedFeatures"))}: ${escapeHtml(text.features)}</span>`
    ].join("");
  }

  function datasetText(dataset) {
    return dataset[I18N.lang] || dataset.en || dataset.zh;
  }

  function loadFile(file) {
    if (!file) return;
    const lower = file.name.toLowerCase();
    const reader = new FileReader();
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      reader.onload = () => {
        try {
          loadParsed(TabularData.parseWorkbook(reader.result), file.name);
        } catch (error) {
          Utils.toast(error.message === "xlsx_library_missing" ? I18N.t("excelLibraryMissing") : error.message);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }
    reader.onload = () => loadText(reader.result, file.name);
    reader.readAsText(file);
  }

  function loadSample() {
    $("fileInput").value = "";
    const dataset = selectedDefaultDataset();
    if (window.TabularLabDefaultData && window.TabularLabDefaultData[dataset.id]) {
      loadText(window.TabularLabDefaultData[dataset.id], dataset.filename, dataset);
      return;
    }
    fetch(dataset.path)
      .then((res) => res.text())
      .then((text) => loadText(text, dataset.filename, dataset))
      .catch(() => loadText(SAMPLE_CSV, "sample.csv", defaultDatasets[0]));
  }

  function loadText(text, filename, preset) {
    const parsed = TabularData.parseDelimited(text);
    loadParsed(parsed, filename, preset);
  }

  function loadParsed(parsed, filename, preset) {
    state.rows = parsed.rows;
    state.columns = parsed.columns;
    state.schema = TabularData.inferSchema(state.rows, state.columns);
    state.filename = filename || "";
    state.dataSourceType = preset ? "default" : "upload";
    state.modelBundle = null;
    state.predictions = [];
    state.targetBundles = [];
    state.currentPreset = preset || null;
    $("columnRoleTable").innerHTML = "";
    populateSelectors();
    applyPreset(preset);
    updateTaskUi();
    if (!preset) selectDefaultFeatures();
    renderColumnRoles();
    renderAll();
    renderCurrentDatasetInfo();
    updateStatusBar();
    drawCurrentChart();
    Utils.toast(`${I18N.t("loaded")}: ${state.rows.length} x ${state.columns.length}`);
  }

  function applyPreset(preset) {
    if (!preset) return;
    $("taskType").value = preset.task;
    updateModels();
    setTargetSelectValues(preset.targets);
    Array.from($("featureColumns").options).forEach((option) => {
      option.selected = preset.task === "clustering" || !preset.targets.includes(option.value);
    });
  }

  function clearData() {
    $("fileInput").value = "";
    state.rows = [];
    state.columns = [];
    state.schema = [];
    state.filename = "";
    state.dataSourceType = "";
    state.modelBundle = null;
    state.predictions = [];
    state.targetBundles = [];
    state.currentPreset = null;
    populateSelectors();
    renderColumnRoles();
    renderEmpty();
    renderCurrentDatasetInfo();
    updateStatusBar();
  }

  function renderCurrentDatasetInfo() {
    const node = $("currentDatasetInfo");
    if (!state.rows.length) {
      node.classList.remove("show");
      node.innerHTML = "";
      return;
    }
    const source = state.dataSourceType === "default" ? I18N.t("defaultData") : I18N.t("uploadedData");
    const presetName = state.currentPreset ? datasetText(state.currentPreset).name : "";
    node.innerHTML = [
      `<strong>${escapeHtml(I18N.t("currentDataset"))}: ${escapeHtml(state.filename || presetName || "dataset")}</strong>`,
      `<span>${escapeHtml(I18N.t("sourceType"))}: ${escapeHtml(source)}${presetName ? ` - ${escapeHtml(presetName)}` : ""}</span>`,
      `<span>${escapeHtml(I18N.t("rows"))}: ${state.rows.length} | ${escapeHtml(I18N.t("columns"))}: ${state.columns.length}</span>`
    ].join("");
    node.classList.add("show");
  }

  function updateStatusBar() {
    const datasetNode = $("statusDataset");
    const taskNode = $("statusTask");
    const modelNode = $("statusModel");
    if (!datasetNode || !taskNode || !modelNode) return;
    const datasetName = state.rows.length
      ? (state.filename || (state.currentPreset ? datasetText(state.currentPreset).name : "dataset"))
      : I18N.t("statusNoDataset");
    const task = $("taskType") ? $("taskType").value : "regression";
    const selectedModel = $("modelSelect") && $("modelSelect").selectedOptions[0]
      ? $("modelSelect").selectedOptions[0].textContent
      : I18N.t("statusNoModel");
    const trained = state.modelBundle && state.modelBundle.model
      ? ` / ${state.modelBundle.model.type}`
      : "";
    datasetNode.textContent = `${I18N.t("statusDataset")}: ${datasetName}`;
    taskNode.textContent = `${I18N.t("statusTask")}: ${I18N.t(task)}`;
    modelNode.textContent = `${I18N.t("statusModel")}: ${selectedModel}${trained}`;
  }

  function populateSelectors() {
    const selects = [$("targetColumn"), $("featureColumns"), $("xColumn"), $("yColumn")];
    selects.forEach((select) => {
      select.innerHTML = "";
      state.columns.forEach((column) => {
        const option = document.createElement("option");
        option.value = column;
        option.textContent = column;
        select.appendChild(option);
      });
    });
    const numeric = state.schema.find((s) => s.type === "numeric");
    if (numeric) setTargetSelectValues([numeric.name]);
    if (state.columns[0]) $("xColumn").value = state.columns[0];
    if (state.columns[1]) $("yColumn").value = state.columns[1];
    updateChartControls();
  }

  function renderColumnRoles() {
    if (!state.columns.length) {
      $("columnRoleTable").innerHTML = "";
      return;
    }
    const existingRoles = currentRoleMap();
    const existingFeatures = Object.keys(existingRoles).filter((column) => existingRoles[column] === "feature");
    const existingTargets = Object.keys(existingRoles).filter((column) => existingRoles[column] === "target");
    const hasExistingRoles = Object.keys(existingRoles).length > 0;
    const presetTargets = state.currentPreset && state.currentPreset.task === $("taskType").value ? state.currentPreset.targets : [];
    const selectedTargets = hasExistingRoles
      ? existingTargets
      : (presetTargets.length ? presetTargets : (targetSelectValues().length ? targetSelectValues() : [state.columns[0]]));
    const header = `<thead><tr><th>${I18N.t("roleColumn")}</th><th>${I18N.t("type")}</th><th>${I18N.t("feature")}</th><th>${I18N.t("target")}</th><th>${I18N.t("ignore")}</th></tr></thead>`;
    const body = state.schema.map((col) => {
      const isTarget = $("taskType").value !== "clustering" && selectedTargets.includes(col.name);
      const isFeature = $("taskType").value === "clustering" || (hasExistingRoles ? existingFeatures.includes(col.name) : !isTarget);
      const isIgnored = hasExistingRoles && existingRoles[col.name] === "ignore";
      const group = `role_${cssAttr(col.name)}`;
      return `<tr class="${isTarget ? "target-row" : ""}">
        <td>${escapeHtml(col.name)} ${isTarget ? `<span class="target-badge">${escapeHtml(I18N.t("target"))}</span>` : ""}</td>
        <td>${escapeHtml(col.type)}</td>
        <td><input class="role-radio role-feature" type="radio" name="${group}" value="${escapeHtml(col.name)}" data-role="feature" ${isFeature ? "checked" : ""}></td>
        <td><input class="role-radio role-target" type="radio" name="${group}" value="${escapeHtml(col.name)}" data-role="target" ${isTarget ? "checked" : ""} ${$("taskType").value === "clustering" ? "disabled" : ""}></td>
        <td><input class="role-radio role-ignore" type="radio" name="${group}" value="${escapeHtml(col.name)}" data-role="ignore" ${isIgnored ? "checked" : ""}></td>
      </tr>`;
    }).join("");
    $("columnRoleTable").innerHTML = `${header}<tbody>${body}</tbody>`;
    syncLegacyFeatureSelect();
    syncTargetSelectFromRoles();
  }

  function syncRoleDefaults() {
    if (!$("columnRoleTable").innerHTML) return;
    renderColumnRoles();
  }

  function syncLegacyFeatureSelect() {
    const features = Array.from(document.querySelectorAll(".role-feature:checked")).map((input) => input.value);
    Array.from($("featureColumns").options).forEach((option) => {
      option.selected = features.includes(option.value);
    });
  }

  function currentRoleMap() {
    const map = {};
    document.querySelectorAll(".role-radio:checked").forEach((input) => {
      map[input.value] = input.dataset.role;
    });
    return map;
  }

  function updateModels() {
    const task = $("taskType").value;
    $("modelSelect").innerHTML = "";
    modelOptions[task].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      $("modelSelect").appendChild(option);
    });
    renderModelParams();
    updateStatusBar();
  }

  function updateTaskUi() {
    const clustering = $("taskType").value === "clustering";
    $("targetWrap").style.display = clustering ? "none" : "grid";
    $("clusteringModeHint").style.display = clustering ? "block" : "none";
    document.querySelectorAll(".split-control").forEach((el) => setControlDisabled(el, clustering));
    if (clustering) $("crossValidation").checked = false;
    renderColumnRoles();
  }

  function setControlDisabled(container, disabled) {
    container.classList.toggle("is-disabled", disabled);
    container.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = disabled;
    });
  }

  function renderModelParams() {
    const params = modelParamDefinitions[$("modelSelect").value] || [];
    if (!params.length) {
      $("modelParams").innerHTML = "";
      return;
    }
    $("modelParams").innerHTML = [
      `<h3>${escapeHtml(I18N.t("hyperparameters"))}</h3>`,
      ...params.map((param) => `
        <label>
          <span>${escapeHtml(I18N.t(param.label))}</span>
          <input class="model-param" data-param="${escapeHtml(param.key)}" type="number" min="${param.min}" max="${param.max}" step="${param.step}" value="${param.value}">
          <p class="param-help">${escapeHtml(I18N.t(param.help))}</p>
        </label>
      `),
      `<div class="auto-tune-panel">
        <label class="checkbox">
          <input id="autoTuneEnabled" type="checkbox">
          <span>${escapeHtml(I18N.t("autoTune"))}</span>
        </label>
        <label>
          <span>${escapeHtml(I18N.t("autoTuneMethod"))}</span>
          <select id="autoTuneMethod">
            <option value="bayesian">${escapeHtml(I18N.t("bayesianTuning"))}</option>
            <option value="grid">${escapeHtml(I18N.t("gridSearch"))}</option>
          </select>
        </label>
        <p class="param-help">${escapeHtml(I18N.t("autoTuneHelp"))}</p>
        <div id="autoTuneStatus" class="auto-tune-status"></div>
      </div>`
    ].join("");
  }

  function selectedModelParams() {
    const params = {};
    const definitions = modelParamDefinitions[$("modelSelect").value] || [];
    document.querySelectorAll(".model-param").forEach((input) => {
      const definition = definitions.find((item) => item.key === input.dataset.param);
      const fallback = definition ? definition.value : Number(input.defaultValue);
      const value = Number(input.value);
      const resolved = Number.isFinite(value) ? value : fallback;
      const clamped = definition ? Utils.clamp(resolved, definition.min, definition.max) : resolved;
      params[input.dataset.param] = definition && definition.step >= 1 ? Math.round(clamped) : clamped;
    });
    return params;
  }

  function selectDefaultFeatures() {
    const targets = targetSelectValues();
    Array.from($("featureColumns").options).forEach((option) => {
      option.selected = $("taskType").value === "clustering" || !targets.includes(option.value);
    });
    syncRoleDefaults();
  }

  function setAllFeatures(selected) {
    Array.from($("featureColumns").options).forEach((option) => {
      option.selected = selected;
    });
    document.querySelectorAll(".role-feature").forEach((input) => {
      input.checked = selected;
    });
    if (selected) {
      document.querySelectorAll(".role-target:checked").forEach((input) => {
        const feature = document.querySelector(`.role-feature[value="${cssEscape(input.value)}"]`);
        if (feature) feature.checked = false;
      });
    }
  }

  function selectedFeatures() {
    const roleFeatures = Array.from(document.querySelectorAll(".role-feature:checked")).map((input) => input.value);
    if (roleFeatures.length) return roleFeatures;
    return Array.from($("featureColumns").selectedOptions).map((option) => option.value);
  }

  function selectedTargets() {
    if ($("taskType").value === "clustering") return [];
    const roleTargets = Array.from(document.querySelectorAll(".role-target:checked")).map((input) => input.value);
    const selectTargets = targetSelectValues();
    return roleTargets.length ? roleTargets : selectTargets;
  }

  function targetSelectValues() {
    return Array.from($("targetColumn").selectedOptions || []).map((option) => option.value);
  }

  function setTargetSelectValues(values) {
    const targets = new Set(values || []);
    Array.from($("targetColumn").options).forEach((option) => {
      option.selected = targets.has(option.value);
    });
  }

  function syncTargetSelectFromRoles() {
    const roleTargets = Array.from(document.querySelectorAll(".role-target:checked")).map((input) => input.value);
    if (roleTargets.length) setTargetSelectValues(roleTargets);
  }

  function syncRolesFromTargetSelect() {
    const targets = new Set(targetSelectValues());
    document.querySelectorAll(".role-target").forEach((input) => {
      input.checked = targets.has(input.value);
    });
    document.querySelectorAll(".role-feature").forEach((input) => {
      input.checked = !targets.has(input.value);
    });
    syncLegacyFeatureSelect();
  }

  function currentTargetColumns() {
    if ($("taskType").value === "clustering") return [];
    const targets = selectedTargets();
    return targets.length ? targets : (state.currentPreset ? state.currentPreset.targets : []);
  }

  function targetRowIndexes() {
    const targets = new Set(currentTargetColumns());
    return state.schema.reduce((indexes, col, index) => {
      if (targets.has(col.name)) indexes.push(index);
      return indexes;
    }, []);
  }

  function options() {
    return {
      missingStrategy: $("missingStrategy").value,
      encodingStrategy: $("encodingStrategy").value,
      testSize: Utils.clamp(Number($("testSize").value) || 0.25, 0.05, 0.8),
      seed: Number($("seed").value) || 42,
      folds: Number($("folds").value) || 5,
      modelParams: selectedModelParams(),
      autoTune: Boolean($("autoTuneEnabled") && $("autoTuneEnabled").checked),
      autoTuneMethod: $("autoTuneMethod") ? $("autoTuneMethod").value : "bayesian"
    };
  }

  function setAutoTuneStatus(message) {
    const node = $("autoTuneStatus");
    if (node) node.textContent = message || "";
  }

  function updateModelParamInputs(params) {
    Object.entries(params || {}).forEach(([key, value]) => {
      const input = document.querySelector(`.model-param[data-param="${cssEscape(key)}"]`);
      if (!input) return;
      input.value = Number.isInteger(value) ? String(value) : String(Number(value.toFixed ? value.toFixed(9) : value));
    });
  }

  function normalizeModelParams(modelName, params) {
    const definitions = modelParamDefinitions[modelName] || [];
    const normalized = {};
    definitions.forEach((definition) => {
      const raw = params && params[definition.key] !== undefined ? Number(params[definition.key]) : definition.value;
      const clamped = Utils.clamp(Number.isFinite(raw) ? raw : definition.value, definition.min, definition.max);
      normalized[definition.key] = definition.step >= 1 ? Math.round(clamped) : clamped;
    });
    return normalized;
  }

  function candidateParamSets(modelName, method, currentParams, seed) {
    const space = tuningSearchSpaces[modelName] || {};
    const keys = Object.keys(space);
    const base = normalizeModelParams(modelName, currentParams);
    if (!keys.length) return [base];
    const candidates = [base];
    const addCandidate = (params) => {
      const normalized = normalizeModelParams(modelName, { ...base, ...params });
      const signature = JSON.stringify(normalized);
      if (!candidates.some((item) => JSON.stringify(item) === signature)) candidates.push(normalized);
    };
    if (method === "grid") {
      keys.reduce((sets, key) => sets.flatMap((set) => space[key].map((value) => ({ ...set, [key]: value }))), [{}])
        .slice(0, 48)
        .forEach(addCandidate);
      return candidates;
    }
    const rand = Utils.seededRandom(seed || 42);
    for (let i = 0; i < 14; i++) {
      const params = {};
      keys.forEach((key) => {
        const values = space[key];
        params[key] = values[Math.floor(rand() * values.length)];
      });
      addCandidate(params);
    }
    keys.forEach((key) => {
      const values = space[key];
      values.forEach((value) => addCandidate({ [key]: value }));
    });
    return candidates.slice(0, 24);
  }

  function distanceForTuning(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  function silhouetteScore(X, assignments) {
    const valid = assignments.map((cluster, index) => ({ cluster, index })).filter((item) => item.cluster !== -1);
    const labels = Utils.unique(valid.map((item) => item.cluster)).map(Number);
    if (labels.length < 2 || valid.length < 3) return -1;
    const byCluster = new Map(labels.map((label) => [label, valid.filter((item) => item.cluster === label).map((item) => item.index)]));
    const scores = valid.map((item) => {
      const same = byCluster.get(item.cluster).filter((index) => index !== item.index);
      const a = same.length ? Utils.mean(same.map((index) => distanceForTuning(X[item.index], X[index]))) : 0;
      const otherDistances = labels
        .filter((label) => label !== item.cluster)
        .map((label) => Utils.mean(byCluster.get(label).map((index) => distanceForTuning(X[item.index], X[index]))));
      const b = Math.min(...otherDistances);
      const denom = Math.max(a, b);
      return denom ? (b - a) / denom : 0;
    });
    const noisePenalty = assignments.filter((cluster) => cluster === -1).length / Math.max(1, assignments.length);
    return Utils.mean(scores) - noisePenalty * 0.25;
  }

  function scoreCandidate(task, modelName, rows, features, targets, baseOpts, modelParams) {
    const opts = { ...baseOpts, modelParams };
    if (task === "clustering") {
      if (rows.length < 3) return -Infinity;
      const pre = TabularData.buildPreprocessor(rows, features, opts);
      const X = TabularData.transformRows(rows, pre);
      const model = ML.train(task, modelName, X, null, { seed: opts.seed, modelParams });
      return silhouetteScore(X, model.assignments || []);
    }
    const split = TabularData.splitRows(rows, Math.max(0.2, opts.testSize || 0.25), opts.seed + 19);
    if (split.train.length < 2 || split.test.length < 1) return -Infinity;
    const pre = TabularData.buildPreprocessor(split.train, features, opts);
    const XTrain = TabularData.transformRows(split.train, pre);
    const XTest = TabularData.transformRows(split.test, pre);
    const scores = targets.map((targetName) => {
      if (task === "regression") {
        const yTrain = split.train.map((row) => Utils.toNumber(row[targetName]));
        const yTest = split.test.map((row) => Utils.toNumber(row[targetName]));
        const model = ML.train(task, modelName, XTrain, yTrain, { seed: opts.seed, modelParams });
        const predicted = XTest.map((row) => model.predict(row));
        return ML.regressionMetrics(yTest, predicted).R2;
      }
      const targetPack = TabularData.getTarget(split.train, targetName, task);
      const yTest = split.test.map((row) => targetPack.labelToIndex.get(String(row[targetName])));
      const valid = yTest.map((v, i) => ({ v, i })).filter((item) => item.v !== undefined);
      if (!valid.length || targetPack.labels.length < 2) return -Infinity;
      const model = ML.train(task, modelName, XTrain, targetPack.y, { labels: targetPack.labels, seed: opts.seed, modelParams });
      const predicted = valid.map((item) => model.predict(XTest[item.i]));
      return ML.classificationMetrics(valid.map((item) => item.v), predicted, targetPack.labels).Accuracy;
    });
    const finite = scores.filter(Number.isFinite);
    return finite.length ? Utils.mean(finite) : -Infinity;
  }

  function autoTuneModel(task, modelName, rows, features, targets, opts) {
    const candidates = candidateParamSets(modelName, opts.autoTuneMethod, opts.modelParams, opts.seed);
    let best = { params: normalizeModelParams(modelName, opts.modelParams), score: -Infinity };
    candidates.forEach((params) => {
      try {
        const score = scoreCandidate(task, modelName, rows, features, targets, opts, params);
        if (Number.isFinite(score) && score > best.score) best = { params, score };
      } catch (error) {
        console.warn("Auto tuning candidate failed", modelName, params, error);
      }
    });
    return { ...best, candidates: candidates.length, method: opts.autoTuneMethod };
  }

  function runAnalysis() {
    if (!state.rows.length) return Utils.toast(I18N.t("emptyState"));
    const task = $("taskType").value;
    const targets = selectedTargets();
    const target = targets[0];
    const features = selectedFeatures().filter((feature) => !targets.includes(feature));
    const opts = options();
    if (!features.length || (task !== "clustering" && !targets.length)) return Utils.toast(I18N.t("invalidTask"));
    if (task === "regression") {
      const badTarget = targets.find((name) => {
        const info = state.schema.find((s) => s.name === name);
        return info && info.type !== "numeric";
      });
      if (badTarget) return Utils.toast(`${I18N.t("needNumericTarget")}: ${badTarget}`);
    }

    const usableRows = task === "clustering"
      ? state.rows
      : state.rows.filter((row) => targets.every((name) => task === "regression" ? Number.isFinite(Utils.toNumber(row[name])) : !Utils.isMissing(row[name])));
    if (opts.autoTune) {
      const confirmed = window.confirm(I18N.t("autoTuneConfirm"));
      if (confirmed) {
        setAutoTuneStatus(I18N.t("autoTuningRunning"));
        const tuning = autoTuneModel(task, $("modelSelect").value, usableRows, features, targets, opts);
        if (Number.isFinite(tuning.score)) {
          updateModelParamInputs(tuning.params);
          opts.modelParams = selectedModelParams();
          opts.tuning = tuning;
          setAutoTuneStatus(`${I18N.t("autoTuneDone")}: ${formatParams(tuning.params)} | ${I18N.t("score")}: ${Utils.formatNumber(tuning.score, 4)}`);
          Utils.toast(I18N.t("autoTuneDone"));
        } else {
          setAutoTuneStatus(I18N.t("autoTuneNoResult"));
          Utils.toast(I18N.t("autoTuneNoResult"));
        }
      } else {
        setAutoTuneStatus(I18N.t("autoTuneSkipped"));
      }
    }
    const split = task === "clustering" ? { train: usableRows, test: [] } : TabularData.splitRows(usableRows, opts.testSize, opts.seed);
    const splitInfo = {
      totalRows: usableRows.length,
      trainRows: split.train.length,
      testRows: split.test.length,
      testSize: task === "clustering" ? 0 : opts.testSize
    };
    const preprocessor = TabularData.buildPreprocessor(split.train, features, opts);
    const XTrain = TabularData.transformRows(split.train, preprocessor);
    let model;
    let metrics = {};
    let yTrain = null;
    let labels = null;
    let testPredictions = [];
    const targetBundles = [];

    if (task === "regression") {
      const XTest = TabularData.transformRows(split.test, preprocessor);
      testPredictions = split.test.map((row) => ({ ...row }));
      targets.forEach((targetName) => {
        yTrain = split.train.map((row) => Utils.toNumber(row[targetName]));
        const targetModel = ML.train(task, $("modelSelect").value, XTrain, yTrain, { seed: opts.seed, modelParams: opts.modelParams });
        const yTest = split.test.map((row) => Utils.toNumber(row[targetName]));
        const predicted = XTest.map((row) => targetModel.predict(row));
        const targetMetrics = ML.regressionMetrics(yTest, predicted);
        testPredictions.forEach((row, i) => {
          row[`${targetName}_actual`] = yTest[i];
          row[`${targetName}_prediction`] = predicted[i];
        });
        targetBundles.push({ target: targetName, model: targetModel, metrics: targetMetrics, labels: null });
      });
      model = targetBundles[0].model;
      metrics = targetBundles[0].metrics;
    } else if (task === "classification") {
      const XTest = TabularData.transformRows(split.test, preprocessor);
      testPredictions = split.test.map((row) => ({ ...row }));
      targets.forEach((targetName) => {
        const targetPack = TabularData.getTarget(split.train, targetName, task);
        labels = targetPack.labels;
        yTrain = targetPack.y;
        const targetModel = ML.train(task, $("modelSelect").value, XTrain, yTrain, { labels, seed: opts.seed, modelParams: opts.modelParams });
        const yTest = split.test.map((row) => targetPack.labelToIndex.get(String(row[targetName])));
        const valid = yTest.map((v, i) => ({ v, i })).filter((item) => item.v !== undefined);
        const predicted = valid.map((item) => targetModel.predict(XTest[item.i]));
        const targetMetrics = ML.classificationMetrics(valid.map((item) => item.v), predicted, labels);
        valid.forEach((item, i) => {
          testPredictions[item.i][`${targetName}_actual`] = labels[item.v];
          testPredictions[item.i][`${targetName}_prediction`] = labels[predicted[i]];
        });
        targetBundles.push({ target: targetName, model: targetModel, metrics: targetMetrics, labels });
      });
      model = targetBundles[0].model;
      labels = targetBundles[0].labels;
      metrics = targetBundles[0].metrics;
    } else {
      model = ML.train(task, $("modelSelect").value, XTrain, null, { seed: opts.seed, modelParams: opts.modelParams });
      metrics = ML.clusteringMetrics(XTrain, model);
      testPredictions = split.train.map((row, i) => ({ ...row, cluster: model.assignments[i] }));
    }

    let cv = null;
    let cvPredictions = [];
    if ($("crossValidation").checked && task !== "clustering") {
      cv = {};
      targets.forEach((targetName) => {
        cv[targetName] = ML.crossValidate(task, $("modelSelect").value, usableRows, features, targetName, opts);
      });
      cvPredictions = buildCvPredictionRows(usableRows, targets, cv);
    }

    state.targetBundles = targetBundles;
    state.modelBundle = { task, target, targets, features, opts, preprocessor, model, labels, metrics, cv, targetBundles, splitInfo, evaluationMode: cv ? "cross_validation_oof" : "test_split" };
    state.predictions = cv ? cvPredictions : testPredictions;
    renderResults();
    renderPredictionForm();
    renderBatchRequirements();
    populateResultTargets();
    drawResultChart();
    activateTab("results");
    updateStatusBar();
    Utils.toast(I18N.t("trained"));
  }

  function singlePredict() {
    if (!state.modelBundle) return Utils.toast(I18N.t("noModel"));
    const row = {};
    state.modelBundle.features.forEach((feature) => {
      row[feature] = document.querySelector(`[data-predict-field="${cssEscape(feature)}"]`).value;
    });
    const vector = TabularData.transformRow(row, state.modelBundle.preprocessor);
    if (state.modelBundle.task === "clustering") {
      const raw = state.modelBundle.model.predict(vector);
      $("predictionOutput").textContent = `${I18N.t("cluster")}: ${raw}`;
    } else {
      const outputs = (state.modelBundle.targetBundles || [{ target: state.modelBundle.target, model: state.modelBundle.model, labels: state.modelBundle.labels }]).map((targetBundle) => {
        const raw = targetBundle.model.predict(vector);
        return `${targetBundle.target}: ${formatPredictionForBundle(raw, targetBundle, state.modelBundle.task)}`;
      });
      $("predictionOutput").innerHTML = outputs.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
    }
    Utils.toast(I18N.t("predicted"));
  }

  function batchPredict() {
    if (!state.modelBundle) return Utils.toast(I18N.t("noModel"));
    const file = $("batchFileInput").files[0];
    if (!file) return Utils.toast(I18N.t("emptyState"));
    readPredictionFile(file).then((parsed) => {
      const missing = missingBatchFeatures(parsed.columns);
      if (missing.length) {
        $("batchStatus").textContent = `${I18N.t("missingFeatures")}: ${missing.join(", ")}`;
        Utils.toast($("batchStatus").textContent);
        return;
      }
      const rows = predictRows(parsed.rows);
      const baseName = file.name.replace(/\.[^.]+$/, "") || "batch";
      downloadBatchRows(file.name, `${baseName}-tabularlab-predictions`, rows);
      $("batchStatus").textContent = `${I18N.t("predicted")}: ${rows.length}`;
      Utils.toast(I18N.t("downloadReady"));
    }).catch((error) => {
      $("batchStatus").textContent = error.message;
      Utils.toast(error.message);
    });
  }

  function readPredictionFile(file) {
    return new Promise((resolve, reject) => {
      const lower = file.name.toLowerCase();
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        reader.onload = () => {
          try {
            resolve(TabularData.parseWorkbook(reader.result));
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = () => resolve(TabularData.parseDelimited(reader.result));
        reader.readAsText(file);
      }
    });
  }

  function missingBatchFeatures(columns) {
    if (!state.modelBundle) return [];
    const available = new Set(columns);
    return state.modelBundle.features.filter((feature) => !available.has(feature));
  }

  function predictRows(rows) {
    const bundle = state.modelBundle;
    const X = TabularData.transformRows(rows, bundle.preprocessor);
    return rows.map((row, i) => {
      const output = { ...row };
      if (bundle.task === "clustering") {
        output.tabularlab_cluster = bundle.model.predict(X[i]);
      } else {
        (bundle.targetBundles || [{ target: bundle.target, model: bundle.model, labels: bundle.labels }]).forEach((targetBundle) => {
          const raw = targetBundle.model.predict(X[i]);
          output[`tabularlab_${targetBundle.target}_prediction`] = formatPredictionForBundle(raw, targetBundle, bundle.task);
        });
      }
      return output;
    });
  }

  function downloadBatchRows(sourceName, baseName, rows) {
    const lower = sourceName.toLowerCase();
    if ((lower.endsWith(".xlsx") || lower.endsWith(".xls")) && window.XLSX) {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Predictions");
      const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      return;
    }
    Utils.downloadText(`${baseName}.csv`, Utils.rowsToCsv(rows), "text/csv;charset=utf-8");
  }

  function updateBatchRequirements() {
    renderBatchRequirements();
    const file = $("batchFileInput").files[0];
    if (!file || !state.modelBundle) return;
    readPredictionFile(file).then((parsed) => {
      const missing = missingBatchFeatures(parsed.columns);
      $("batchStatus").textContent = missing.length
        ? `${I18N.t("missingFeatures")}: ${missing.join(", ")}`
        : `${I18N.t("batchReady")} Rows: ${parsed.rows.length}`;
    }).catch((error) => {
      $("batchStatus").textContent = error.message;
    });
  }

  function renderBatchRequirements() {
    if (!state.modelBundle) {
      $("batchRequirement").innerHTML = `<strong>${escapeHtml(I18N.t("batchRequirements"))}</strong><span>${escapeHtml(I18N.t("noModel"))}</span>`;
      return;
    }
    const features = state.modelBundle.features;
    const outputs = state.modelBundle.task === "clustering"
      ? ["tabularlab_cluster"]
      : (state.modelBundle.targetBundles || [{ target: state.modelBundle.target }]).map((item) => `tabularlab_${item.target}_prediction`);
    $("batchRequirement").innerHTML = [
      `<strong>${escapeHtml(I18N.t("batchRequirements"))}</strong>`,
      `<span>${escapeHtml(I18N.t("requiredFeatures"))}: ${escapeHtml(features.join(", "))}</span>`,
      `<span>${escapeHtml(I18N.t("optionalColumns"))}</span>`,
      `<span>Output columns: ${escapeHtml(outputs.join(", "))}</span>`
    ].join("");
  }

  function formatPrediction(raw) {
    const bundle = state.modelBundle;
    if (bundle.task === "classification") return bundle.labels[raw];
    if (bundle.task === "clustering") return raw;
    return Utils.formatNumber(raw, 6);
  }

  function formatPredictionForBundle(raw, targetBundle, task) {
    if (task === "classification") return targetBundle.labels[raw];
    if (task === "clustering") return raw;
    return Utils.formatNumber(raw, 6);
  }

  function formatParams(params) {
    return Object.entries(params || {})
      .map(([key, value]) => `${key}=${Number.isFinite(Number(value)) ? Utils.formatNumber(Number(value), 6) : value}`)
      .join(", ");
  }

  function buildCvPredictionRows(rows, targets, cv) {
    const output = rows.map((row) => ({ ...row }));
    targets.forEach((target) => {
      const pack = cv[target];
      if (!pack || !pack.oofPredictions) return;
      pack.oofPredictions.forEach((item) => {
        if (!output[item.rowIndex]) return;
        output[item.rowIndex].cv_fold = item.fold;
        output[item.rowIndex][`${target}_actual`] = item.actual;
        output[item.rowIndex][`${target}_prediction`] = item.prediction;
      });
    });
    return output;
  }

  function renderAll() {
    renderOverview();
    renderDataTable();
    renderResults();
    renderPredictionForm();
    renderColumnRoles();
    populateResultTargets();
    renderBatchRequirements();
    renderAbout();
  }

  function renderEmpty() {
    $("datasetMetrics").innerHTML = metric("0", I18N.t("rows")) + metric("0", I18N.t("columns"));
    $("summaryTable").innerHTML = "";
    $("dataTable").innerHTML = "";
    $("resultLog").textContent = I18N.t("emptyState");
    $("evaluationNotice").classList.remove("show");
    $("evaluationNotice").innerHTML = "";
    $("resultSummary").innerHTML = "";
    $("modelMetrics").innerHTML = "";
    $("predictionForm").innerHTML = "";
    $("predictionOutput").textContent = "";
    $("batchRequirement").innerHTML = "";
    $("batchStatus").textContent = "";
    $("resultTargetSelect").innerHTML = "";
    $("projectionMethodSelect").style.display = "none";
    updateResultChartSettings();
    renderCurrentDatasetInfo();
    renderAbout();
  }

  function renderOverview() {
    if (!state.rows.length) return renderEmpty();
    const missing = state.schema.reduce((sum, col) => sum + col.missing, 0);
    const numeric = state.schema.filter((col) => col.type === "numeric").length;
    $("datasetMetrics").innerHTML = [
      metric(state.rows.length, I18N.t("rows")),
      metric(state.columns.length, I18N.t("columns")),
      metric(missing, I18N.t("missing")),
      metric(numeric, I18N.t("numeric"))
    ].join("");
    const head = [
      "Column",
      I18N.t("type"),
      I18N.t("missing"),
      "Missing %",
      I18N.t("unique"),
      I18N.t("mean"),
      "Median",
      "Q1",
      "Q3",
      I18N.t("std"),
      I18N.t("min"),
      I18N.t("max"),
      "Mode",
      "Samples"
    ];
    const rows = state.schema.map((col) => [
      col.name,
      col.type,
      col.missing,
      Utils.formatNumber(col.missingRate * 100, 2),
      col.unique,
      Utils.formatNumber(col.mean, 4),
      Utils.formatNumber(col.median, 4),
      Utils.formatNumber(col.q1, 4),
      Utils.formatNumber(col.q3, 4),
      Utils.formatNumber(col.std, 4),
      Utils.formatNumber(col.min, 4),
      Utils.formatNumber(col.max, 4),
      col.mode,
      (col.samples || []).join(" | ")
    ]);
    $("summaryTable").innerHTML = tableHtml(head, rows, { rowTargetIndexes: targetRowIndexes() });
  }

  function renderDataTable() {
    if (!state.rows.length) return;
    const limit = Utils.clamp(Number($("previewRows").value) || 5, 1, 500);
    const rows = state.rows.slice(0, limit).map((row) => state.columns.map((col) => row[col]));
    $("dataTable").innerHTML = tableHtml(state.columns, rows, { targetColumns: currentTargetColumns() });
  }

  function renderResults() {
    if (!state.modelBundle) {
      $("modelMetrics").innerHTML = "";
      $("evaluationNotice").classList.remove("show");
      $("evaluationNotice").innerHTML = "";
      $("resultSummary").innerHTML = "";
      $("resultLog").textContent = state.rows.length ? I18N.t("noModel") : I18N.t("emptyState");
      updateResultChartSettings();
      return;
    }
    const b = state.modelBundle;
    renderEvaluationNotice(b);
    $("resultSummary").innerHTML = buildSummaryReport(b);
    $("modelMetrics").innerHTML = evaluationCards(b) +
      targetMetricCards(b) +
      metric(b.preprocessor.featureNames.length, I18N.t("encodedFeatures"));
    $("resultLog").textContent = buildResultLog(b);
    updateResultChartSettings();
  }

  function targetMetricCards(bundle) {
    if (bundle.task === "clustering") {
      return Object.entries(flatMetrics(bundle.metrics)).map(([k, v]) => metric(Utils.formatNumber(v, 4), k)).join("");
    }
    if (bundle.evaluationMode === "cross_validation_oof" && bundle.cv) {
      return (bundle.targets || []).map((target) => {
        const metrics = bundle.cv[target] ? bundle.cv[target].aggregateMetrics : {};
        return Object.entries(flatMetrics(metrics)).map(([k, v]) => metric(Utils.formatNumber(v, 4), `${target} ${k}`)).join("");
      }).join("");
    }
    if (bundle.targetBundles && bundle.targetBundles.length) {
      return bundle.targetBundles.map((targetBundle) => {
        return Object.entries(flatMetrics(targetBundle.metrics)).map(([k, v]) => metric(Utils.formatNumber(v, 4), `${targetBundle.target} ${k}`)).join("");
      }).join("");
    }
    return Object.entries(flatMetrics(bundle.metrics)).map(([k, v]) => metric(Utils.formatNumber(v, 4), k)).join("");
  }

  function evaluationCards(bundle) {
    if (!bundle.splitInfo) return "";
    if (bundle.evaluationMode === "cross_validation_oof") {
      const firstTarget = (bundle.targets || [bundle.target])[0];
      const cvPack = bundle.cv && bundle.cv[firstTarget];
      const folds = cvPack ? cvPack.folds : bundle.opts.folds;
      const oofCount = cvPack && cvPack.oofPredictions ? cvPack.oofPredictions.length : 0;
      return metric("CV OOF", "Mode") +
        metric(folds, "K folds") +
        metric(bundle.splitInfo.totalRows, "Total rows") +
        metric(oofCount, "OOF predictions");
    }
    if (bundle.task === "clustering") {
      return metric("Clustering", "Mode") + metric(bundle.splitInfo.totalRows, "Total rows");
    }
    return metric("Train/Test", "Mode") +
      metric(bundle.splitInfo.trainRows, "Training rows") +
      metric(bundle.splitInfo.testRows, "Test rows");
  }

  function buildSummaryReport(bundle) {
    const targets = bundle.task === "clustering" ? I18N.t("clusteringNoTarget") : (bundle.targets || [bundle.target]).join(", ");
    const modelName = bundle.model && bundle.model.type ? bundle.model.type : ((bundle.targetBundles && bundle.targetBundles[0] && bundle.targetBundles[0].model.type) || "");
    const dataText = `${state.filename || I18N.t("currentDataset")} | ${bundle.splitInfo ? bundle.splitInfo.totalRows : state.rows.length} ${I18N.t("rows")}, ${state.columns.length} ${I18N.t("columns")}`;
    const modeText = bundle.evaluationMode === "cross_validation_oof"
      ? `${I18N.t("crossValidationMode")} (${bundle.opts.folds} ${I18N.t("folds")})`
      : (bundle.task === "clustering" ? I18N.t("clustering") : I18N.t("testSplitMode"));
    const effect = summarizeEffect(bundle);
    const featureText = `${bundle.features.length} ${I18N.t("featureCount")} / ${bundle.preprocessor.featureNames.length} ${I18N.t("encodedFeatures")}`;
    return `
      <strong>${escapeHtml(I18N.t("summaryReport"))}</strong>
      <dl>
        ${summaryItem(I18N.t("summaryData"), dataText)}
        ${summaryItem(I18N.t("summaryTask"), `${I18N.t(bundle.task)}${modelName ? ` | ${modelName}` : ""}`)}
        ${summaryItem(I18N.t("summaryTarget"), targets)}
        ${summaryItem(I18N.t("summaryFeatures"), featureText)}
        ${summaryItem(I18N.t("summaryMode"), modeText)}
        ${summaryItem(I18N.t("summaryEffect"), effect)}
      </dl>
    `;
  }

  function summaryItem(label, value) {
    return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
  }

  function summarizeEffect(bundle) {
    if (bundle.task === "clustering") {
      const metrics = bundle.metrics || {};
      const parts = [];
      if (Number.isFinite(metrics.clusters)) parts.push(`${I18N.t("cluster")}: ${metrics.clusters}`);
      if (Number.isFinite(metrics.noise)) parts.push(`${I18N.t("noise")}: ${metrics.noise}`);
      if (Number.isFinite(metrics.inertia)) parts.push(`Inertia: ${Utils.formatNumber(metrics.inertia, 4)}`);
      if (Array.isArray(metrics.sizes)) parts.push(`${I18N.t("clusterSizes")}: ${metrics.sizes.join(", ")}`);
      return parts.join("; ") || I18N.t("summaryNoMetrics");
    }
    const metricSets = collectMetricSets(bundle);
    if (!metricSets.length) return I18N.t("summaryNoMetrics");
    return metricSets.map((item) => {
      const metrics = item.metrics || {};
      const parts = [];
      if (Number.isFinite(metrics.R2)) parts.push(`R2=${Utils.formatNumber(metrics.R2, 4)}`);
      if (Number.isFinite(metrics.RMSE)) parts.push(`RMSE=${Utils.formatNumber(metrics.RMSE, 4)}`);
      if (Number.isFinite(metrics.MAE)) parts.push(`MAE=${Utils.formatNumber(metrics.MAE, 4)}`);
      if (Number.isFinite(metrics.Accuracy)) parts.push(`Accuracy=${Utils.formatNumber(metrics.Accuracy, 4)}`);
      return `${item.target}: ${parts.join(", ") || I18N.t("summaryNoMetrics")}`;
    }).join(" | ");
  }

  function collectMetricSets(bundle) {
    if (bundle.evaluationMode === "cross_validation_oof" && bundle.cv) {
      return (bundle.targets || []).map((target) => ({
        target,
        metrics: bundle.cv[target] ? bundle.cv[target].aggregateMetrics : {}
      }));
    }
    if (bundle.targetBundles && bundle.targetBundles.length) {
      return bundle.targetBundles.map((targetBundle) => ({
        target: targetBundle.target,
        metrics: targetBundle.metrics
      }));
    }
    return [{ target: bundle.target || I18N.t("target"), metrics: bundle.metrics }];
  }

  function renderEvaluationNotice(bundle) {
    const notice = $("evaluationNotice");
    let title = I18N.t("evaluationMode");
    let details = "";
    if (bundle.task === "clustering") {
      title = `${I18N.t("evaluationMode")}: ${I18N.t("clustering")}`;
      details = `${I18N.t("clusteringNotice")} Total rows: ${bundle.splitInfo.totalRows}.`;
    } else if (bundle.evaluationMode === "cross_validation_oof") {
      const firstTarget = (bundle.targets || [bundle.target])[0];
      const cvPack = bundle.cv && bundle.cv[firstTarget];
      const folds = cvPack ? cvPack.folds : bundle.opts.folds;
      const oofCount = cvPack && cvPack.oofPredictions ? cvPack.oofPredictions.length : 0;
      const validationSizes = cvPack && cvPack.foldResults ? cvPack.foldResults.map((fold) => fold.validationSize).join(", ") : "";
      title = `${I18N.t("evaluationMode")}: ${I18N.t("crossValidationMode")}`;
      details = `${I18N.t("cvNotice")} K=${folds}; total usable rows=${bundle.splitInfo.totalRows}; OOF predictions=${oofCount}; validation rows by fold=${validationSizes}.`;
    } else {
      title = `${I18N.t("evaluationMode")}: ${I18N.t("testSplitMode")}`;
      details = `${I18N.t("testNotice")} Training rows=${bundle.splitInfo.trainRows}; test rows=${bundle.splitInfo.testRows}; total usable rows=${bundle.splitInfo.totalRows}.`;
    }
    notice.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(details)}</span>`;
    notice.classList.add("show");
  }

  function populateResultTargets() {
    $("resultTargetSelect").innerHTML = "";
    if (!state.modelBundle) return;
    $("projectionMethodSelect").style.display = state.modelBundle.task === "clustering" ? "block" : "none";
    const options = state.modelBundle.task === "clustering" ? ["cluster"] : (state.modelBundle.targets || [state.modelBundle.target]);
    options.forEach((target) => {
      const option = document.createElement("option");
      option.value = target;
      option.textContent = target;
      $("resultTargetSelect").appendChild(option);
    });
    updateResultChartSettings();
  }

  function updateResultChartSettings() {
    const task = state.modelBundle ? state.modelBundle.task : "all";
    const note = $("resultChartSettingNote");
    if (note) {
      note.textContent = task === "regression"
        ? I18N.t("regressionChartSettings")
        : (task === "classification" ? I18N.t("classificationChartSettings") : (task === "clustering" ? I18N.t("clusteringChartSettings") : ""));
    }
    document.querySelectorAll("[data-result-setting]").forEach((node) => {
      const applies = node.dataset.resultSetting.split(/\s+/);
      const visible = applies.includes("all") || applies.includes(task);
      node.hidden = !visible;
    });
  }

  function drawResultChart() {
    applyChartSize($("resultCanvas"));
    renderResultChart($("resultCanvas"));
  }

  function renderResultChart(canvas) {
    if (!state.modelBundle || !state.predictions.length) return;
    const task = state.modelBundle.task;
    const style = getChartStyle();
    if (task === "regression") {
      const target = $("resultTargetSelect").value || (state.modelBundle.targets || [state.modelBundle.target])[0];
      return Charts.predictionScatter(canvas, state.predictions, `${target}_actual`, `${target}_prediction`, `${target}: Actual vs Predicted`, style);
      return;
    }
    if (task === "classification") {
      const target = $("resultTargetSelect").value || (state.modelBundle.targets || [state.modelBundle.target])[0];
      return Charts.confusionMatrix(canvas, state.predictions, `${target}_actual`, `${target}_prediction`, `${target}: Confusion Matrix`, style);
      return;
    }
    const numericFeatures = state.modelBundle.features.filter((feature) => {
      const info = state.schema.find((col) => col.name === feature);
      return info && info.type === "numeric";
    });
    const projection = buildClusterProjection($("projectionMethodSelect").value, numericFeatures);
    return Charts.clusterScatter(canvas, projection.rows, projection.x, projection.y, "cluster", projection.title, style);
  }

  function buildClusterProjection(method, numericFeatures) {
    if (method === "numeric") {
      const x = numericFeatures[0] || state.columns[0];
      const y = numericFeatures[1] || state.columns.find((col) => col !== x) || x;
      return { rows: state.predictions, x, y, title: `Cluster Projection: ${x} / ${y}` };
    }
    const X = TabularData.transformRows(state.predictions, state.modelBundle.preprocessor);
    const coords = method === "encoded" ? firstTwoEncoded(X) : (method === "tsne" ? tsne2(X) : pca2(X));
    const rows = state.predictions.map((row, i) => ({ ...row, projection_x: coords[i][0], projection_y: coords[i][1] }));
    return {
      rows,
      x: "projection_x",
      y: "projection_y",
      title: method === "encoded" ? "Cluster Projection: Encoded Features" : (method === "tsne" ? "Cluster Projection: t-SNE" : "Cluster Projection: PCA")
    };
  }

  function firstTwoEncoded(X) {
    return X.map((row) => [row[0] || 0, row[1] || 0]);
  }

  function pca2(X) {
    if (!X.length) return [];
    const cols = X[0].length;
    const means = Array.from({ length: cols }, (_, j) => Utils.mean(X.map((row) => row[j])));
    const centered = X.map((row) => row.map((value, j) => value - means[j]));
    const pc1 = powerComponent(centered);
    const deflated = centered.map((row) => {
      const score = row.reduce((sum, value, j) => sum + value * pc1[j], 0);
      return row.map((value, j) => value - score * pc1[j]);
    });
    const pc2 = powerComponent(deflated);
    return centered.map((row) => [
      row.reduce((sum, value, j) => sum + value * pc1[j], 0),
      row.reduce((sum, value, j) => sum + value * pc2[j], 0)
    ]);
  }

  function tsne2(X) {
    if (!X.length) return [];
    const n = X.length;
    if (n === 1) return [[0, 0]];
    const maxRows = 180;
    const base = X.slice(0, maxRows);
    const means = Array.from({ length: base[0].length }, (_, j) => Utils.mean(base.map((row) => row[j])));
    const scales = means.map((_, j) => {
      const variance = Utils.mean(base.map((row) => Math.pow(row[j] - means[j], 2)));
      return Math.sqrt(variance) || 1;
    });
    const Z = base.map((row) => row.map((value, j) => (value - means[j]) / scales[j]));
    const distances = Z.map((row, i) => Z.map((other, j) => i === j ? 0 : squaredDistance(row, other)));
    const sigma = Math.sqrt(Utils.mean(distances.flat().filter((value) => value > 0))) || 1;
    const P = distances.map((row, i) => {
      const vals = row.map((d, j) => i === j ? 0 : Math.exp(-d / (2 * sigma * sigma)));
      const sum = vals.reduce((a, b) => a + b, 0) || 1;
      return vals.map((v) => v / sum);
    });
    for (let i = 0; i < P.length; i++) {
      for (let j = 0; j < P.length; j++) P[i][j] = (P[i][j] + P[j][i]) / (2 * P.length);
    }
    let Y = Z.map((row, i) => {
      const angle = (i / Z.length) * Math.PI * 2;
      return [Math.cos(angle) * 0.01 + (row[0] || 0) * 0.001, Math.sin(angle) * 0.01 + (row[1] || 0) * 0.001];
    });
    let gains = Y.map(() => [0, 0]);
    for (let iter = 0; iter < 260; iter++) {
      const grads = Y.map(() => [0, 0]);
      const Qnum = Y.map((row, i) => Y.map((other, j) => i === j ? 0 : 1 / (1 + squaredDistance(row, other))));
      const qSum = Qnum.flat().reduce((a, b) => a + b, 0) || 1;
      for (let i = 0; i < Y.length; i++) {
        for (let j = 0; j < Y.length; j++) {
          if (i === j) continue;
          const q = Qnum[i][j] / qSum;
          const force = 4 * ((iter < 80 ? 4 : 1) * P[i][j] - q) * Qnum[i][j];
          grads[i][0] += force * (Y[i][0] - Y[j][0]);
          grads[i][1] += force * (Y[i][1] - Y[j][1]);
        }
      }
      const lr = iter < 80 ? 120 : 70;
      Y = Y.map((row, i) => {
        gains[i][0] = 0.82 * gains[i][0] - lr * grads[i][0];
        gains[i][1] = 0.82 * gains[i][1] - lr * grads[i][1];
        return [row[0] + gains[i][0], row[1] + gains[i][1]];
      });
      centerCoords(Y);
    }
    if (n <= maxRows) return Y;
    const coords = X.map((row, i) => {
      if (i < maxRows) return Y[i];
      const z = row.map((value, j) => (value - means[j]) / scales[j]);
      let best = 0;
      let bestD = Infinity;
      Z.forEach((candidate, j) => {
        const d = squaredDistance(z, candidate);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      });
      return [Y[best][0], Y[best][1]];
    });
    return coords;
  }

  function squaredDistance(a, b) {
    return a.reduce((sum, value, i) => sum + Math.pow(value - (b[i] || 0), 2), 0);
  }

  function centerCoords(coords) {
    const mx = Utils.mean(coords.map((row) => row[0]));
    const my = Utils.mean(coords.map((row) => row[1]));
    coords.forEach((row) => {
      row[0] -= mx;
      row[1] -= my;
    });
  }

  function powerComponent(X) {
    const cols = X[0] ? X[0].length : 0;
    let vector = Array.from({ length: cols }, (_, i) => i === 0 ? 1 : 0.5);
    for (let iter = 0; iter < 24; iter++) {
      const next = new Array(cols).fill(0);
      X.forEach((row) => {
        const score = row.reduce((sum, value, j) => sum + value * vector[j], 0);
        for (let j = 0; j < cols; j++) next[j] += score * row[j];
      });
      const norm = Math.sqrt(next.reduce((sum, value) => sum + value * value, 0)) || 1;
      vector = next.map((value) => value / norm);
    }
    return vector;
  }

  function renderPredictionForm() {
    $("predictionForm").innerHTML = "";
    if (!state.modelBundle) return;
    state.modelBundle.features.forEach((feature) => {
      const label = document.createElement("label");
      const span = document.createElement("span");
      span.textContent = feature;
      const input = document.createElement("input");
      input.type = "text";
      input.dataset.predictField = feature;
      const sample = state.rows.find((row) => !Utils.isMissing(row[feature]));
      input.value = sample ? sample[feature] : "";
      label.appendChild(span);
      label.appendChild(input);
      $("predictionForm").appendChild(label);
    });
  }

  function drawCurrentChart() {
    applyChartSize($("chartCanvas"));
    renderCurrentChart($("chartCanvas"));
  }

  function renderCurrentChart(canvas) {
    if (!state.rows.length) return;
    const type = $("chartType").value;
    const x = $("xColumn").value;
    const y = $("yColumn").value;
    const target = currentTargetColumns()[0] || $("targetColumn").value;
    const numeric = state.schema.filter((s) => s.type === "numeric").map((s) => s.name);
    const style = getChartStyle();
    if (type === "histogram") return Charts.histogram(canvas, state.rows, x, style);
    if (type === "violin") return Charts.violin(canvas, state.rows, x, style);
    if (type === "scatter") return Charts.scatter(canvas, state.rows, x, y, target, style);
    if (type === "correlation") return Charts.correlation(canvas, state.rows, numeric, style);
    if (type === "target") return Charts.targetPlot(canvas, state.rows, x, target, $("taskType").value, style);
  }

  function getChartStyle() {
    const accent = chartSetting("accentColor") || chartDefaults.accentColor;
    return Charts.styleOptions({
      background: chartSetting("background"),
      textColor: chartSetting("textColor"),
      mutedColor: chartSetting("textColor"),
      gridColor: chartSetting("gridColor"),
      frameColor: chartSetting("gridColor"),
      fontFamily: chartSetting("fontFamily"),
      titleSize: readChartNumber("titleSize", 30),
      labelSize: readChartNumber("labelSize", 18),
      tickSize: readChartNumber("tickSize", 16),
      valueSize: Math.max(10, readChartNumber("tickSize", 16) - 1),
      xLabelOffset: readChartNumber("xLabelOffset", 40),
      yLabelOffset: readChartNumber("yLabelOffset", 40),
      xTickOffset: readChartNumber("xTickOffset", 20),
      yTickOffset: readChartNumber("yTickOffset", 20),
      xLabelAngle: readChartNumber("xLabelAngle", 36),
      yLabelAngle: readChartNumber("yLabelAngle", 0),
      pointSize: readChartNumber("pointSize", 5),
      matrixValueSize: readChartNumber("matrixValueSize", 18),
      matrixValueColor: chartSetting("matrixValueColor"),
      correlationMaxFeatures: readChartNumber("correlationMaxFeatures", 14),
      correlationStyle: chartSetting("correlationStyle"),
      palette: [accent, "#dc5f3d", "#2563eb", "#b7791f", "#7c3aed", "#15803d", "#db2777", "#475569"]
    });
  }

  function updateChartControls() {
    if (!$("chartType")) return;
    const type = $("chartType").value;
    const fixedCount = type === "histogram" || type === "violin";
    $("xColumn").disabled = type === "correlation";
    $("yColumn").disabled = fixedCount || type === "correlation";
    $("xColumnLabel").textContent = type === "correlation" ? I18N.t("numericFeatures") : "X";
    $("yColumnLabel").textContent = fixedCount ? "Y = Count" : (type === "correlation" ? I18N.t("numericFeatures") : "Y");
    $("yColumn").title = fixedCount ? "Y = Count" : "";
    $("correlationMaxFeatures").disabled = type !== "correlation";
    $("correlationStyle").disabled = type !== "correlation";
  }

  function chartSetting(key) {
    const control = document.querySelector(`[data-chart-setting="${cssEscape(key)}"]`);
    return control ? control.value : chartDefaults[key];
  }

  function readChartNumber(key, fallback) {
    const value = Number(chartSetting(key));
    return Number.isFinite(value) ? value : fallback;
  }

  function chartDimensions() {
    return {
      width: Utils.clamp(readChartNumber("width", 1200), 480, 2400),
      height: Utils.clamp(readChartNumber("height", 720), 320, 1800)
    };
  }

  function applyChartSize(canvas) {
    if (!canvas || canvas.__svg) return;
    const dims = chartDimensions();
    if (canvas.width !== dims.width) canvas.width = dims.width;
    if (canvas.height !== dims.height) canvas.height = dims.height;
  }

  function syncChartControls(source) {
    if (!source || !source.dataset.chartSetting) return;
    document.querySelectorAll(`[data-chart-setting="${cssEscape(source.dataset.chartSetting)}"]`).forEach((control) => {
      if (control !== source) control.value = source.value;
    });
  }

  function resetChartDefaults() {
    Object.entries(chartDefaults).forEach(([key, value]) => {
      document.querySelectorAll(`[data-chart-setting="${cssEscape(key)}"]`).forEach((control) => {
        control.value = value;
      });
    });
    drawCurrentChart();
    drawResultChart();
  }

  function saveChart(kind) {
    const format = chartSetting("exportFormat");
    const dims = chartDimensions();
    if (kind === "result") {
      if (format === "svg") {
        Charts.saveSvg((target) => renderResultChart(target), "tabularlab-result-analysis.svg", dims.width, dims.height);
      } else {
        applyChartSize($("resultCanvas"));
        renderResultChart($("resultCanvas"));
        Charts.saveCanvas($("resultCanvas"), "tabularlab-result-analysis.png");
      }
      return;
    }
    if (format === "svg") {
      Charts.saveSvg((target) => renderCurrentChart(target), "tabularlab-chart.svg", dims.width, dims.height);
    } else {
      applyChartSize($("chartCanvas"));
      renderCurrentChart($("chartCanvas"));
      Charts.saveCanvas($("chartCanvas"), "tabularlab-chart.png");
    }
  }

  function saveResults() {
    if (!state.modelBundle) return Utils.toast(I18N.t("noModel"));
    const targetMetrics = (state.modelBundle.targetBundles || []).map((item) => ({
      target: item.target,
      model: item.model.type,
      metrics: item.metrics
    }));
    Utils.downloadText("tabularlab-results.json", JSON.stringify({
      task: state.modelBundle.task,
      targets: state.modelBundle.targets,
      features: state.modelBundle.features,
      splitInfo: state.modelBundle.splitInfo,
      evaluationMode: state.modelBundle.evaluationMode,
      modelParams: state.modelBundle.opts.modelParams,
      tuning: state.modelBundle.opts.tuning || null,
      metricMeaning: state.modelBundle.evaluationMode === "cross_validation_oof"
        ? "Reported metrics and prediction plots use concatenated out-of-fold predictions from all cross-validation validation folds, so every usable row is evaluated once as validation data."
        : (state.modelBundle.task === "clustering" ? "Clustering metrics are computed on the full selected dataset." : "Reported test metrics are computed only on the held-out test set."),
      metrics: state.modelBundle.metrics,
      targetMetrics,
      cv: state.modelBundle.cv
    }, null, 2), "application/json");
    Utils.toast(I18N.t("downloadReady"));
  }

  function savePredictions() {
    if (!state.predictions.length) return Utils.toast(I18N.t("noModel"));
    Utils.downloadText("tabularlab-predictions.csv", Utils.rowsToCsv(state.predictions), "text/csv;charset=utf-8");
    Utils.toast(I18N.t("downloadReady"));
  }

  function exportProcessedData() {
    if (!state.rows.length) return Utils.toast(I18N.t("emptyState"));
    const features = selectedFeatures();
    const pre = TabularData.buildPreprocessor(state.rows, features, options());
    const transformed = TabularData.transformRows(state.rows, pre).map((vector) => {
      const row = {};
      pre.featureNames.forEach((name, i) => row[name] = vector[i]);
      return row;
    });
    Utils.downloadText("tabularlab-processed.csv", Utils.rowsToCsv(transformed), "text/csv;charset=utf-8");
    Utils.toast(I18N.t("downloadReady"));
  }

  function renderAbout() {
    if (!window.TabularLabMeta) return;
    $("headerVersion").textContent = `V${TabularLabMeta.version}`;
    $("headerAuthorLink").textContent = TabularLabMeta.authorDisplay;
    $("headerAuthorLink").href = TabularLabMeta.authorUrl;
    $("headerManualLink").href = TabularLabMeta.manualUrl;
    $("headerIssueLink").href = TabularLabMeta.issueUrl;
    $("operationVersion").textContent = `V${TabularLabMeta.version} | ${TabularLabMeta.released}`;
    $("operationAuthorLink").textContent = TabularLabMeta.authorDisplay;
    $("operationAuthorLink").href = TabularLabMeta.authorUrl;
    $("operationCitationText").value = TabularLabMeta.citation;
    $("operationBibtexText").value = TabularLabMeta.bibtex;
    $("softwareTitle").textContent = TabularLabMeta.title;
    $("softwareVersion").textContent = `V${TabularLabMeta.version}`;
    $("softwareReleased").textContent = TabularLabMeta.released;
    $("authorLink").textContent = TabularLabMeta.authorDisplay;
    $("authorLink").href = TabularLabMeta.authorUrl;
    $("citationText").textContent = TabularLabMeta.citation;
    $("bibtexText").textContent = TabularLabMeta.bibtex;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => Utils.toast(I18N.t("copied")));
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    Utils.toast(I18N.t("copied"));
  }

  function buildResultLog(bundle) {
    const lines = [];
    lines.push(`${I18N.t("modelSummary")}`);
    lines.push(`Task: ${bundle.task}`);
    lines.push(`Model: ${bundle.model.type}`);
    lines.push(`Target: ${bundle.task === "clustering" ? I18N.t("clusteringNoTarget") : (bundle.targets || [bundle.target]).join(", ")}`);
    lines.push(`${I18N.t("featureCount")}: ${bundle.features.length}`);
    lines.push(`${I18N.t("encodedFeatures")}: ${bundle.preprocessor.featureNames.length}`);
    lines.push(`Current parameters: ${formatParams(bundle.opts.modelParams)}`);
    if (bundle.opts.tuning) {
      lines.push(`Auto tuning: ${bundle.opts.tuning.method}; candidates=${bundle.opts.tuning.candidates}; score=${Utils.formatNumber(bundle.opts.tuning.score, 6)}`);
    }
    if (bundle.splitInfo && bundle.evaluationMode === "cross_validation_oof") {
      const firstTarget = (bundle.targets || [bundle.target])[0];
      const cvPack = bundle.cv && bundle.cv[firstTarget];
      lines.push("");
      lines.push("Cross-validation evaluation");
      lines.push(`K folds: ${cvPack ? cvPack.folds : bundle.opts.folds}`);
      lines.push(`Total usable rows: ${bundle.splitInfo.totalRows}`);
      lines.push(`OOF predictions: ${cvPack && cvPack.oofPredictions ? cvPack.oofPredictions.length : 0}`);
      lines.push(`Validation rows by fold: ${cvPack && cvPack.foldResults ? cvPack.foldResults.map((fold) => fold.validationSize).join(", ") : ""}`);
      lines.push("No train/test split result is shown in this mode. Metrics, result charts, and exported predictions use concatenated out-of-fold validation predictions across all rows.");
    } else if (bundle.splitInfo) {
      lines.push("");
      lines.push(bundle.task === "clustering" ? "Clustering evaluation" : "Train/test evaluation");
      lines.push(`Usable rows: ${bundle.splitInfo.totalRows}`);
      if (bundle.task === "clustering") {
        lines.push("Clustering uses the full selected dataset because there is no target label.");
      } else {
        lines.push(`Training rows: ${bundle.splitInfo.trainRows}`);
        lines.push(`Test rows: ${bundle.splitInfo.testRows}`);
        lines.push("The metrics below are held-out test-set performance only. Training rows are used to fit the model; test rows are used only for final evaluation.");
      }
    }
    lines.push("");
    lines.push(bundle.evaluationMode === "cross_validation_oof" ? "Cross-validation out-of-fold results" : I18N.t("testResults"));
    if (bundle.evaluationMode === "cross_validation_oof" && bundle.cv) {
      (bundle.targets || []).forEach((target) => {
        if (!bundle.cv[target]) return;
        lines.push(`\n[${target}] concatenated out-of-fold metrics`);
        lines.push(JSON.stringify(bundle.cv[target].aggregateMetrics, null, 2));
      });
    } else if (bundle.targetBundles && bundle.targetBundles.length) {
      bundle.targetBundles.forEach((targetBundle) => {
        lines.push(`\n[${targetBundle.target}] ${targetBundle.model.type}`);
        lines.push(JSON.stringify(targetBundle.metrics, null, 2));
      });
    } else {
      lines.push(JSON.stringify(bundle.metrics, null, 2));
    }
    if (bundle.cv) {
      lines.push("");
      lines.push(I18N.t("cvResults"));
      lines.push("K-fold cross validation method: each loop holds out one fold as validation data, predicts that held-out fold, then concatenates all held-out fold predictions and compares them with the true labels/values.");
      lines.push("The exported JSON includes foldResults and oofPredictions for this comparison.");
      lines.push(JSON.stringify(bundle.cv, null, 2));
    }
    if (bundle.model.weights) {
      lines.push("");
      lines.push(I18N.t("coefficients"));
      const coefs = bundle.preprocessor.featureNames.map((name, i) => ({ feature: name, weight: bundle.model.weights[i] }))
        .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
        .slice(0, 30);
      lines.push(JSON.stringify(coefs, null, 2));
    }
    if (state.predictions.length) {
      lines.push("");
      lines.push(`${I18N.t("sample")} predictions`);
      lines.push(JSON.stringify(state.predictions.slice(0, 8), null, 2));
    }
    return lines.join("\n");
  }

  function flatMetrics(metrics) {
    const out = {};
    Object.entries(metrics || {}).forEach(([key, value]) => {
      if (typeof value === "number") out[key] = value;
      if (Array.isArray(value) && key === "sizes") value.forEach((v, i) => out[`cluster_${i}`] = v);
    });
    return out;
  }

  function metric(value, label) {
    return `<div class="metric"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(String(label))}</span></div>`;
  }

  function tableHtml(headers, rows, options) {
    const opts = options || {};
    const targetColumns = new Set(opts.targetColumns || []);
    const rowTargetIndexes = new Set(opts.rowTargetIndexes || []);
    const head = `<thead><tr>${headers.map((h) => {
      const isTarget = targetColumns.has(String(h));
      return `<th class="${isTarget ? "target-col" : ""}">${escapeHtml(h)}${isTarget ? ` <span class="target-badge">${escapeHtml(I18N.t("target"))}</span>` : ""}</th>`;
    }).join("")}</tr></thead>`;
    const body = `<tbody>${rows.map((row, rowIndex) => {
      const isTargetRow = rowTargetIndexes.has(rowIndex);
      return `<tr class="${isTargetRow ? "target-row" : ""}">${row.map((v, colIndex) => {
        const isTargetCol = targetColumns.has(String(headers[colIndex]));
        return `<td class="${isTargetCol ? "target-col" : ""}">${escapeHtml(v)}</td>`;
      }).join("")}</tr>`;
    }).join("")}</tbody>`;
    return head + body;
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  function cssAttr(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
