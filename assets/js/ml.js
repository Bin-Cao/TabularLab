(function () {
  function dot(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
    return sum;
  }

  function distance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  function trainLinearRegression(X, y, options) {
    const n = X.length;
    const p = X[0].length;
    const weights = new Array(p).fill(0);
    let bias = Utils.mean(y);
    const lr = options.lr || 0.03;
    const lambda = options.lambda ?? 0.01;
    const epochs = options.epochs || 900;
    for (let epoch = 0; epoch < epochs; epoch++) {
      const grad = new Array(p).fill(0);
      let biasGrad = 0;
      for (let i = 0; i < n; i++) {
        const pred = dot(weights, X[i]) + bias;
        const err = pred - y[i];
        biasGrad += err;
        for (let j = 0; j < p; j++) grad[j] += err * X[i][j];
      }
      bias -= lr * biasGrad / n;
      for (let j = 0; j < p; j++) weights[j] -= lr * (grad[j] / n + lambda * weights[j]);
    }
    return {
      type: "linear_regression",
      weights,
      bias,
      predict(row) {
        return dot(weights, row) + bias;
      }
    };
  }

  function trainKnn(X, y, options) {
    return {
      type: options.task === "classification" ? "knn_classifier" : "knn_regressor",
      X,
      y,
      k: options.k || 5,
      labels: options.labels || null,
      predict(row) {
        const neighbors = X.map((x, index) => ({ d: distance(x, row), y: y[index] }))
          .sort((a, b) => a.d - b.d)
          .slice(0, this.k);
        if (options.task === "regression") return Utils.mean(neighbors.map((n) => n.y));
        const votes = new Map();
        neighbors.forEach((n) => votes.set(n.y, (votes.get(n.y) || 0) + 1));
        return Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0][0];
      }
    };
  }

  function softmax(scores) {
    const max = Math.max(...scores);
    const exps = scores.map((s) => Math.exp(s - max));
    const total = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => v / total);
  }

  function trainSoftmax(X, y, options) {
    const n = X.length;
    const p = X[0].length;
    const classes = options.classCount;
    const W = Array.from({ length: classes }, () => new Array(p).fill(0));
    const b = new Array(classes).fill(0);
    const lr = options.lr || 0.08;
    const lambda = options.lambda ?? 0.003;
    const epochs = options.epochs || 800;
    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradW = Array.from({ length: classes }, () => new Array(p).fill(0));
      const gradB = new Array(classes).fill(0);
      for (let i = 0; i < n; i++) {
        const scores = W.map((w, c) => dot(w, X[i]) + b[c]);
        const probs = softmax(scores);
        for (let c = 0; c < classes; c++) {
          const err = probs[c] - (y[i] === c ? 1 : 0);
          gradB[c] += err;
          for (let j = 0; j < p; j++) gradW[c][j] += err * X[i][j];
        }
      }
      for (let c = 0; c < classes; c++) {
        b[c] -= lr * gradB[c] / n;
        for (let j = 0; j < p; j++) W[c][j] -= lr * (gradW[c][j] / n + lambda * W[c][j]);
      }
    }
    return {
      type: "softmax_classifier",
      W,
      b,
      labels: options.labels,
      predictProba(row) {
        return softmax(W.map((w, c) => dot(w, row) + b[c]));
      },
      predict(row) {
        const probs = this.predictProba(row);
        return probs.indexOf(Math.max(...probs));
      }
    };
  }

  function trainKMeans(X, options) {
    const k = options.k || 3;
    const rand = Utils.seededRandom(options.seed || 42);
    const centroids = [];
    const used = new Set();
    while (centroids.length < Math.min(k, X.length)) {
      const index = Math.floor(rand() * X.length);
      if (!used.has(index)) {
        used.add(index);
        centroids.push(X[index].slice());
      }
    }
    let assignments = new Array(X.length).fill(0);
    for (let iter = 0; iter < 80; iter++) {
      assignments = X.map((row) => {
        const distances = centroids.map((center) => distance(row, center));
        return distances.indexOf(Math.min(...distances));
      });
      const next = centroids.map((center, cluster) => {
        const members = X.filter((_, index) => assignments[index] === cluster);
        if (!members.length) return center;
        return center.map((_, j) => Utils.mean(members.map((row) => row[j])));
      });
      const shift = next.reduce((sum, center, i) => sum + distance(center, centroids[i]), 0);
      centroids.splice(0, centroids.length, ...next);
      if (shift < 0.00001) break;
    }
    return {
      type: "kmeans",
      centroids,
      assignments,
      predict(row) {
        const distances = centroids.map((center) => distance(row, center));
        return distances.indexOf(Math.min(...distances));
      }
    };
  }

  function majority(values) {
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  function variance(values) {
    const m = Utils.mean(values);
    return Utils.mean(values.map((value) => Math.pow(value - m, 2)));
  }

  function gini(values) {
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    let impurity = 1;
    counts.forEach((count) => {
      const p = count / values.length;
      impurity -= p * p;
    });
    return impurity;
  }

  function trainDecisionTree(X, y, options) {
    const task = options.task;
    const maxDepth = options.maxDepth || 7;
    const minSize = options.minSize || 4;
    const featureSample = options.featureSample || X[0].length;

    function leaf(values) {
      return task === "regression" ? Utils.mean(values) : majority(values);
    }

    function score(leftY, rightY) {
      const total = leftY.length + rightY.length;
      if (!leftY.length || !rightY.length) return Infinity;
      if (task === "regression") {
        return (leftY.length * variance(leftY) + rightY.length * variance(rightY)) / total;
      }
      return (leftY.length * gini(leftY) + rightY.length * gini(rightY)) / total;
    }

    function build(indexes, depth) {
      const values = indexes.map((i) => y[i]);
      if (depth >= maxDepth || indexes.length <= minSize || new Set(values).size === 1) {
        return { value: leaf(values) };
      }
      let best = { score: Infinity, feature: 0, threshold: 0, left: [], right: [] };
      const features = Utils.shuffle(Array.from({ length: X[0].length }, (_, i) => i), depth + indexes.length).slice(0, featureSample);
      features.forEach((feature) => {
        const candidates = Utils.unique(indexes.map((i) => X[i][feature]))
          .map(Number)
          .filter(Number.isFinite)
          .sort((a, b) => a - b);
        const step = Math.max(1, Math.floor(candidates.length / 16));
        for (let c = 0; c < candidates.length; c += step) {
          const threshold = candidates[c];
          const left = indexes.filter((i) => X[i][feature] <= threshold);
          const right = indexes.filter((i) => X[i][feature] > threshold);
          const current = score(left.map((i) => y[i]), right.map((i) => y[i]));
          if (current < best.score) best = { score: current, feature, threshold, left, right };
        }
      });
      if (!best.left.length || !best.right.length || !Number.isFinite(best.score)) return { value: leaf(values) };
      return {
        feature: best.feature,
        threshold: best.threshold,
        left: build(best.left, depth + 1),
        right: build(best.right, depth + 1)
      };
    }

    const root = build(X.map((_, i) => i), 0);
    return {
      type: task === "regression" ? "decision_tree_regressor" : "decision_tree_classifier",
      root,
      predict(row) {
        let node = root;
        while (node.value === undefined) node = row[node.feature] <= node.threshold ? node.left : node.right;
        return node.value;
      }
    };
  }

  function trainRandomForest(X, y, options) {
    const trees = [];
    const rand = Utils.seededRandom(options.seed || 42);
    const treeCount = options.trees || 25;
    const featureSample = Math.max(1, Math.round(Math.sqrt(X[0].length)));
    for (let t = 0; t < treeCount; t++) {
      const sampleX = [];
      const sampleY = [];
      for (let i = 0; i < X.length; i++) {
        const index = Math.floor(rand() * X.length);
        sampleX.push(X[index]);
        sampleY.push(y[index]);
      }
      trees.push(trainDecisionTree(sampleX, sampleY, {
        task: options.task,
        maxDepth: options.maxDepth || 8,
        minSize: 3,
        featureSample
      }));
    }
    return {
      type: options.task === "regression" ? "random_forest_regressor" : "random_forest_classifier",
      trees,
      predict(row) {
        const votes = trees.map((tree) => tree.predict(row));
        return options.task === "regression" ? Utils.mean(votes) : majority(votes);
      }
    };
  }

  function trainGradientBoostingRegressor(X, y, options) {
    const estimators = [];
    const lr = options.lr || 0.12;
    let bias = Utils.mean(y);
    let prediction = new Array(y.length).fill(bias);
    for (let i = 0; i < (options.estimators || 35); i++) {
      const residuals = y.map((value, row) => value - prediction[row]);
      const tree = trainDecisionTree(X, residuals, { task: "regression", maxDepth: options.maxDepth || 2, minSize: 4 });
      estimators.push(tree);
      prediction = prediction.map((value, row) => value + lr * tree.predict(X[row]));
    }
    return {
      type: "gradient_boosting_regressor",
      bias,
      lr,
      estimators,
      predict(row) {
        return estimators.reduce((value, tree) => value + lr * tree.predict(row), bias);
      }
    };
  }

  function trainGaussianNB(X, y, options) {
    const classes = Array.from(new Set(y)).sort((a, b) => a - b);
    const varSmoothing = Math.max(1e-12, options.varSmoothing ?? 1e-6);
    const stats = classes.map((klass) => {
      const rows = X.filter((_, i) => y[i] === klass);
      return {
        klass,
        prior: rows.length / X.length,
        mean: X[0].map((_, j) => Utils.mean(rows.map((row) => row[j]))),
        variance: X[0].map((_, j) => Math.max(varSmoothing, variance(rows.map((row) => row[j]))))
      };
    });
    return {
      type: "gaussian_naive_bayes",
      labels: options.labels,
      stats,
      predict(row) {
        const scores = stats.map((item) => {
          let logp = Math.log(item.prior || 1e-9);
          for (let j = 0; j < row.length; j++) {
            const v = item.variance[j];
            logp += -0.5 * Math.log(2 * Math.PI * v) - Math.pow(row[j] - item.mean[j], 2) / (2 * v);
          }
          return { klass: item.klass, score: logp };
        });
        return scores.sort((a, b) => b.score - a.score)[0].klass;
      }
    };
  }

  function trainLinearSvm(X, y, options) {
    const classes = Array.from(new Set(y)).sort((a, b) => a - b);
    const p = X[0].length;
    const W = classes.map(() => new Array(p).fill(0));
    const b = classes.map(() => 0);
    const lr = options.lr || 0.03;
    const lambda = options.lambda ?? 0.01;
    for (let epoch = 0; epoch < (options.epochs || 700); epoch++) {
      for (let i = 0; i < X.length; i++) {
        classes.forEach((klass, c) => {
          const target = y[i] === klass ? 1 : -1;
          const margin = target * (dot(W[c], X[i]) + b[c]);
          for (let j = 0; j < p; j++) W[c][j] -= lr * lambda * W[c][j];
          if (margin < 1) {
            b[c] += lr * target;
            for (let j = 0; j < p; j++) W[c][j] += lr * target * X[i][j];
          }
        });
      }
    }
    return {
      type: "linear_svm_classifier",
      W,
      b,
      predict(row) {
        const scores = W.map((w, c) => dot(w, row) + b[c]);
        return classes[scores.indexOf(Math.max(...scores))];
      }
    };
  }

  function trainLinearSvr(X, y, options) {
    return trainLinearRegression(X, y, { lr: options.lr || 0.025, lambda: options.lambda ?? 0.02, epochs: options.epochs || 1000 });
  }

  function trainDBSCAN(X, options) {
    const eps = options.eps || 1.25;
    const minPts = options.minPts || 4;
    const assignments = new Array(X.length).fill(undefined);
    let cluster = 0;
    function neighbors(index) {
      return X.map((row, i) => ({ i, d: distance(X[index], row) })).filter((item) => item.d <= eps).map((item) => item.i);
    }
    for (let i = 0; i < X.length; i++) {
      if (assignments[i] !== undefined) continue;
      const near = neighbors(i);
      if (near.length < minPts) {
        assignments[i] = -1;
        continue;
      }
      assignments[i] = cluster;
      const seeds = near.slice();
      while (seeds.length) {
        const current = seeds.pop();
        if (assignments[current] === -1) assignments[current] = cluster;
        if (assignments[current] !== undefined) continue;
        assignments[current] = cluster;
        const currentNear = neighbors(current);
        if (currentNear.length >= minPts) currentNear.forEach((n) => seeds.push(n));
      }
      cluster++;
    }
    return {
      type: "dbscan",
      assignments,
      predict(row) {
        const nearest = X.map((x, i) => ({ i, d: distance(x, row) })).sort((a, b) => a.d - b.d)[0];
        return nearest ? assignments[nearest.i] : -1;
      }
    };
  }

  function trainAgglomerative(X, options) {
    const k = options.k || 3;
    let clusters = X.map((_, i) => [i]);
    function center(cluster) {
      return X[0].map((_, j) => Utils.mean(cluster.map((i) => X[i][j])));
    }
    while (clusters.length > k) {
      let best = { a: 0, b: 1, d: Infinity };
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const d = distance(center(clusters[i]), center(clusters[j]));
          if (d < best.d) best = { a: i, b: j, d };
        }
      }
      clusters[best.a] = clusters[best.a].concat(clusters[best.b]);
      clusters.splice(best.b, 1);
    }
    const assignments = new Array(X.length).fill(0);
    clusters.forEach((cluster, label) => cluster.forEach((index) => assignments[index] = label));
    const centroids = clusters.map(center);
    return {
      type: "agglomerative",
      assignments,
      centroids,
      predict(row) {
        const distances = centroids.map((item) => distance(item, row));
        return distances.indexOf(Math.min(...distances));
      }
    };
  }

  function regressionMetrics(actual, predicted) {
    const residuals = actual.map((v, i) => v - predicted[i]);
    const mae = Utils.mean(residuals.map(Math.abs));
    const rmse = Math.sqrt(Utils.mean(residuals.map((v) => v * v)));
    const baseline = Utils.mean(actual);
    const ssRes = residuals.reduce((sum, v) => sum + v * v, 0);
    const ssTot = actual.reduce((sum, v) => sum + Math.pow(v - baseline, 2), 0);
    return { MAE: mae, RMSE: rmse, R2: ssTot ? 1 - ssRes / ssTot : 0 };
  }

  function classificationMetrics(actual, predicted, labels) {
    const correct = actual.filter((v, i) => v === predicted[i]).length;
    const rows = labels.map((label, classIndex) => {
      let tp = 0;
      let fp = 0;
      let fn = 0;
      actual.forEach((value, i) => {
        if (value === classIndex && predicted[i] === classIndex) tp++;
        if (value !== classIndex && predicted[i] === classIndex) fp++;
        if (value === classIndex && predicted[i] !== classIndex) fn++;
      });
      const precision = tp + fp ? tp / (tp + fp) : 0;
      const recall = tp + fn ? tp / (tp + fn) : 0;
      const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
      return { label, precision, recall, f1, support: actual.filter((v) => v === classIndex).length };
    });
    return { Accuracy: actual.length ? correct / actual.length : 0, report: rows };
  }

  function clusteringMetrics(X, model) {
    const labels = Array.from(new Set(model.assignments)).sort((a, b) => a - b);
    const sizes = labels.map((cluster) => model.assignments.filter((v) => v === cluster).length);
    if (!model.centroids) return { clusters: labels.length, noise: model.assignments.filter((v) => v === -1).length, sizes };
    const inertia = X.reduce((sum, row, index) => {
      const center = model.centroids[model.assignments[index]];
      return center ? sum + Math.pow(distance(row, center), 2) : sum;
    }, 0);
    return { inertia, sizes };
  }

  function train(task, modelName, X, y, options) {
    const params = options.modelParams || {};
    if (task === "regression" && modelName === "lasso") return trainLinearRegression(X, y, { lambda: params.lambda ?? 0.04, lr: params.lr || 0.025, epochs: params.epochs || 1100 });
    if (task === "regression" && modelName === "elasticnet") return trainLinearRegression(X, y, { lambda: params.lambda ?? 0.025, lr: params.lr || 0.025, epochs: params.epochs || 1100 });
    if (task === "regression" && modelName === "svr") return trainLinearSvr(X, y, params);
    if (task === "regression" && modelName === "tree") return trainDecisionTree(X, y, { task, maxDepth: params.maxDepth || 7 });
    if (task === "regression" && modelName === "forest") return trainRandomForest(X, y, { task, seed: options.seed, trees: params.trees || 25, maxDepth: params.maxDepth || 8 });
    if (task === "regression" && modelName === "gbr") return trainGradientBoostingRegressor(X, y, { estimators: params.estimators || 35, lr: params.lr || 0.12, maxDepth: params.maxDepth || 2 });
    if (task === "regression" && modelName === "knn") return trainKnn(X, y, { task, k: params.k || 5 });
    if (task === "regression") return trainLinearRegression(X, y, { lambda: params.lambda ?? 0.01, lr: params.lr || 0.03, epochs: params.epochs || 900 });
    if (task === "classification" && modelName === "svm") return trainLinearSvm(X, y, { labels: options.labels, lambda: params.lambda ?? 0.01, lr: params.lr || 0.03, epochs: params.epochs || 700 });
    if (task === "classification" && modelName === "tree") return trainDecisionTree(X, y, { task, maxDepth: params.maxDepth || 7 });
    if (task === "classification" && modelName === "forest") return trainRandomForest(X, y, { task, seed: options.seed, trees: params.trees || 25, maxDepth: params.maxDepth || 8 });
    if (task === "classification" && modelName === "gnb") return trainGaussianNB(X, y, { labels: options.labels, varSmoothing: params.varSmoothing ?? 1e-6 });
    if (task === "classification" && modelName === "knn") return trainKnn(X, y, { task, k: params.k || 5, labels: options.labels });
    if (task === "classification") return trainSoftmax(X, y, { classCount: options.labels.length, labels: options.labels, lambda: params.lambda ?? 0.003, lr: params.lr || 0.08, epochs: params.epochs || 800 });
    if (modelName === "dbscan") return trainDBSCAN(X, { eps: params.eps || 1.25, minPts: params.minPts || 4 });
    if (modelName === "agglomerative") return trainAgglomerative(X, { k: params.k || 3 });
    return trainKMeans(X, { k: params.k || 3, seed: options.seed });
  }

  function crossValidate(task, modelName, rows, featureColumns, targetColumn, options) {
    const folds = Utils.clamp(Number(options.folds) || 5, 2, Math.min(10, rows.length));
    const indexes = Utils.shuffle(rows.map((_, index) => index), options.seed || 42);
    const foldSize = Math.ceil(rows.length / folds);
    const foldResults = [];
    const oofPredictions = [];
    let allLabels = null;
    for (let fold = 0; fold < folds; fold++) {
      const testIds = new Set(indexes.slice(fold * foldSize, (fold + 1) * foldSize));
      const trainRows = rows.filter((_, index) => !testIds.has(index));
      const testPairs = rows.map((row, index) => ({ row, index })).filter((item) => testIds.has(item.index));
      const testRows = testPairs.map((item) => item.row);
      if (!trainRows.length || !testRows.length) continue;
      const pre = TabularData.buildPreprocessor(trainRows, featureColumns, options);
      const XTrain = TabularData.transformRows(trainRows, pre);
      const XTest = TabularData.transformRows(testRows, pre);
      let yTrain;
      let yTest;
      let labels = null;
      if (task === "regression") {
        yTrain = trainRows.map((row) => Utils.toNumber(row[targetColumn]));
        yTest = testRows.map((row) => Utils.toNumber(row[targetColumn]));
      } else {
        const target = TabularData.getTarget(trainRows, targetColumn, task);
        labels = target.labels;
        allLabels = labels;
        yTrain = target.y;
        yTest = testRows.map((row) => target.labelToIndex.get(String(row[targetColumn])));
      }
      const model = train(task, modelName, XTrain, yTrain, { labels, seed: options.seed, modelParams: options.modelParams });
      if (task === "regression") {
        const predicted = XTest.map((row) => model.predict(row));
        const metrics = regressionMetrics(yTest, predicted);
        foldResults.push({ fold: fold + 1, trainSize: trainRows.length, validationSize: testRows.length, metrics });
        predicted.forEach((value, i) => {
          oofPredictions.push({ fold: fold + 1, rowIndex: testPairs[i].index, target: targetColumn, actual: yTest[i], prediction: value });
        });
      } else {
        const valid = yTest.map((v, i) => ({ v, i })).filter((item) => item.v !== undefined);
        const predicted = valid.map((item) => model.predict(XTest[item.i]));
        const actual = valid.map((item) => item.v);
        const metrics = classificationMetrics(actual, predicted, labels);
        foldResults.push({ fold: fold + 1, trainSize: trainRows.length, validationSize: valid.length, metrics });
        valid.forEach((item, i) => {
          oofPredictions.push({ fold: fold + 1, rowIndex: testPairs[item.i].index, target: targetColumn, actual: labels[item.v], prediction: labels[predicted[i]] });
        });
      }
    }
    const aggregateMetrics = aggregateCvMetrics(task, oofPredictions, allLabels);
    return {
      folds,
      method: "Each fold trains on K-1 folds, predicts the held-out validation fold, then all held-out fold predictions are concatenated and compared with the true labels/values.",
      foldResults,
      aggregateMetrics,
      oofPredictions: oofPredictions.sort((a, b) => a.rowIndex - b.rowIndex)
    };
  }

  function aggregateCvMetrics(task, oofPredictions, labels) {
    if (!oofPredictions.length) return {};
    if (task === "regression") {
      return regressionMetrics(
        oofPredictions.map((row) => Number(row.actual)),
        oofPredictions.map((row) => Number(row.prediction))
      );
    }
    const labelList = labels || Utils.unique(oofPredictions.flatMap((row) => [row.actual, row.prediction])).sort();
    const map = new Map(labelList.map((label, index) => [String(label), index]));
    return classificationMetrics(
      oofPredictions.map((row) => map.get(String(row.actual))),
      oofPredictions.map((row) => map.get(String(row.prediction))),
      labelList
    );
  }

  window.ML = {
    train,
    crossValidate,
    regressionMetrics,
    classificationMetrics,
    clusteringMetrics
  };
})();
