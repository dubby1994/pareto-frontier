(function () {
  "use strict";

  /* ============ i18n ============ */
  const I18N = {
    zh: {
      title: "Pareto Frontier · 帕累托前沿",
      description: '输入成本与收益，自动计算并绘制 Pareto 前沿（绿色为前沿点，灰色为被支配点）',
      inputData: "数据输入",
      benefitDir: "收益",
      benefitMax: "越大越好",
      benefitMin: "越小越好",
      showDominated: "被支配点",
      headerIndex: "#",
      headerName: "名称",
      headerCost: "成本",
      headerBenefit: "收益",
      addRow: "+ 添加",
      loadSample: "示例",
      clearAll: "清空",
      downloadTpl: "下载模板",
      importExcel: "导入",
      exportPng: "导出 PNG",
      statTotalLabel: "总数",
      statParetoLabel: "前沿",
      statDominatedLabel: "被支配",
      chartTitle: "成本 — 收益 Pareto 前沿",
      chartSubMax: "X：成本（越低越好） · Y：收益（越高越好）",
      chartSubMin: "X：成本（越低越好） · Y：收益（越低越好）",
      legendPareto: "Pareto 前沿点",
      legendDominated: "被支配点",
      legendFrontier: "前沿曲线",
      legendDirection: "支配方向（向右上更优）",
      legendDirectionMin: "支配方向（向右下更优）",
      placeholderName: "名称",
      delTitle: "删除",
      unnamed: "未命名",
      schemePrefix: "方案",
      tplHeaderName: "名称",
      tplHeaderCost: "成本",
      tplHeaderBenefit: "收益",
      toastSampleLoaded: "已载入示例数据",
      toastTemplateDownloaded: "模板已下载",
      toastImported: "已导入 {n} 条数据",
      toastImportFail: "导入失败：{msg}",
      toastFileEmpty: "文件为空",
      toastNoData: "未解析到有效数据",
      toastPngExported: "已导出 PNG",
      toastExportFail: "导出失败",
      chartEmpty: "暂无数据，请在左侧输入或点击「示例」",
      axisCost: "成本  Cost  →",
      axisBenefit: "收益  Benefit  →",
      better: "更优",
      tooltipCost: "成本",
      tooltipBenefit: "收益",
      tooltipDominated: "被支配",
      tooltipPareto: "Pareto 前沿",
      langLabel: "中文",
      themeToggle: "切换主题",
    },
    en: {
      title: "Pareto Frontier · Visualizer",
      description: 'Enter cost & benefit to compute and plot the Pareto frontier (green = frontier, grey = dominated)',
      inputData: "Data Input",
      benefitDir: "Benefit",
      benefitMax: "Higher is better",
      benefitMin: "Lower is better",
      showDominated: "Dominated",
      headerIndex: "#",
      headerName: "Name",
      headerCost: "Cost",
      headerBenefit: "Benefit",
      addRow: "+ Add",
      loadSample: "Sample",
      clearAll: "Clear",
      downloadTpl: "Template",
      importExcel: "Import",
      exportPng: "Export PNG",
      statTotalLabel: "Total",
      statParetoLabel: "Frontier",
      statDominatedLabel: "Dominated",
      chartTitle: "Cost — Benefit Pareto Frontier",
      chartSubMax: "X: Cost (lower is better) · Y: Benefit (higher is better)",
      chartSubMin: "X: Cost (lower is better) · Y: Benefit (lower is better)",
      legendPareto: "Pareto frontier point",
      legendDominated: "Dominated point",
      legendFrontier: "Frontier curve",
      legendDirection: "Dominance direction (top-right is better)",
      legendDirectionMin: "Dominance direction (bottom-right is better)",
      placeholderName: "Name",
      delTitle: "Delete",
      unnamed: "Unnamed",
      schemePrefix: "Option",
      tplHeaderName: "Name",
      tplHeaderCost: "Cost",
      tplHeaderBenefit: "Benefit",
      toastSampleLoaded: "Sample data loaded",
      toastTemplateDownloaded: "Template downloaded",
      toastImported: "Imported {n} rows",
      toastImportFail: "Import failed: {msg}",
      toastFileEmpty: "File is empty",
      toastNoData: "No valid data parsed",
      toastPngExported: "PNG exported",
      toastExportFail: "Export failed",
      chartEmpty: "No data. Enter rows on the left or click \"Sample\".",
      axisCost: "Cost  →",
      axisBenefit: "Benefit  →",
      better: "better",
      tooltipCost: "Cost",
      tooltipBenefit: "Benefit",
      tooltipDominated: "Dominated",
      tooltipPareto: "Pareto frontier",
      langLabel: "EN",
      themeToggle: "Toggle theme",
    },
  };

  let lang = localStorage.getItem("pareto-lang") || "zh";
  if (!I18N[lang]) lang = "zh";

  function t(key, vars) {
    let s = I18N[lang][key];
    if (s == null) return key;
    if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }

  function applyI18n() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.innerHTML = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    // select options
    document.querySelectorAll("#benefitDir option").forEach(opt => {
      opt.textContent = t(opt.getAttribute("data-i18n"));
    });
    // chart subtitle & legend direction depend on current benefit direction
    const maxBenefit = benefitDir === "max";
    const subEl = document.getElementById("chartSub");
    if (subEl) subEl.textContent = t(maxBenefit ? "chartSubMax" : "chartSubMin");
    const dirEl = document.getElementById("legendDirection");
    if (dirEl) dirEl.textContent = t(maxBenefit ? "legendDirection" : "legendDirectionMin");
    applyTheme();
    renderTable();
    update();
  }

  /* ============ sample data ============ */
  function sampleData() {
    const prefix = t("schemePrefix");
    const items = [
      { s: "G", cost: 5,  benefit: 30 },
      { s: "A", cost: 10, benefit: 50 },
      { s: "E", cost: 15, benefit: 45 },
      { s: "B", cost: 20, benefit: 80 },
      { s: "C", cost: 30, benefit: 70 },
      { s: "D", cost: 40, benefit: 95 },
      { s: "F", cost: 50, benefit: 90 },
    ];
    return items.map(d => ({ name: prefix + " " + d.s, cost: d.cost, benefit: d.benefit }));
  }

  /* ============ refs ============ */
  const tbody = document.getElementById("tbody");
  const chart = document.getElementById("chart");
  const chartWrap = document.getElementById("chartWrap");
  const tooltip = document.getElementById("tooltip");
  const showDomChk = document.getElementById("showDom");
  const benefitDirSel = document.getElementById("benefitDir");
  const toastEl = document.getElementById("toast");
  const langToggle = document.getElementById("langToggle");
  const themeToggle = document.getElementById("themeToggle");

  let VW = 800, VH = 520;
  const M = { top: 30, right: 30, bottom: 56, left: 64 };
  let PW = VW - M.left - M.right;
  let PH = VH - M.top - M.bottom;

  let data = [];
  let benefitDir = localStorage.getItem("pareto-benefit-dir") || "max";
  if (benefitDir !== "max" && benefitDir !== "min") benefitDir = "max";

  /* ============ theme ============ */
  let theme = localStorage.getItem("pareto-theme") || "dark";
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
    themeToggle.title = t("themeToggle");
  }
  themeToggle.onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("pareto-theme", theme);
    applyTheme();
    update();
  };

  /* ============ toast ============ */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ============ table ============ */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function num(v) { return (v == null || v === "" || isNaN(v)) ? "" : v; }

  function rowHtml(item, i) {
    return `<tr data-i="${i}">
      <td class="idx">${i + 1}</td>
      <td><input type="text" class="name" value="${escapeHtml(item.name)}" placeholder="${escapeHtml(t("placeholderName"))}"></td>
      <td><input type="number" class="num cost" value="${num(item.cost)}" step="any" placeholder="0"></td>
      <td><input type="number" class="num benefit" value="${num(item.benefit)}" step="any" placeholder="0"></td>
      <td><button class="del-btn" title="${escapeHtml(t("delTitle"))}">×</button></td>
    </tr>`;
  }

  function renderTable() {
    tbody.innerHTML = data.map((d, i) => rowHtml(d, i)).join("");
  }

  function readTable() {
    const rows = tbody.querySelectorAll("tr");
    const out = [];
    rows.forEach(r => {
      const name = r.querySelector(".name").value.trim();
      const cost = parseFloat(r.querySelector(".cost").value);
      const benefit = parseFloat(r.querySelector(".benefit").value);
      out.push({
        name: name || t("unnamed"),
        cost: isNaN(cost) ? 0 : cost,
        benefit: isNaN(benefit) ? 0 : benefit,
      });
    });
    data = out;
  }

  tbody.addEventListener("input", () => { readTable(); update(); });
  tbody.addEventListener("click", e => {
    const btn = e.target.closest(".del-btn");
    if (!btn) return;
    const tr = btn.closest("tr");
    const i = +tr.dataset.i;
    data.splice(i, 1);
    renderTable();
    update();
  });

  document.getElementById("addRow").onclick = () => {
    data.push({ name: t("schemePrefix") + " " + (data.length + 1), cost: 0, benefit: 0 });
    renderTable();
    update();
    const last = tbody.querySelector("tr:last-child .name");
    if (last) last.focus();
  };
  document.getElementById("loadSample").onclick = () => {
    data = sampleData();
    renderTable();
    update();
    toast(t("toastSampleLoaded"));
  };
  document.getElementById("clearAll").onclick = () => {
    data = [];
    renderTable();
    update();
  };
  showDomChk.onchange = update;
  benefitDirSel.value = benefitDir;
  benefitDirSel.onchange = () => {
    benefitDir = benefitDirSel.value;
    localStorage.setItem("pareto-benefit-dir", benefitDir);
    const maxBenefit = benefitDir === "max";
    document.getElementById("chartSub").textContent = t(maxBenefit ? "chartSubMax" : "chartSubMin");
    document.getElementById("legendDirection").textContent = t(maxBenefit ? "legendDirection" : "legendDirectionMin");
    update();
  };

  langToggle.onclick = () => {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem("pareto-lang", lang);
    applyI18n();
  };

  /* ============ Pareto computation ============
     Cost is always minimized. Benefit direction is configurable.
     Dominated: exists another point q that is no worse in both dims and
                strictly better in at least one.
  */
  function computePareto(pts) {
    const maxBenefit = benefitDir === "max";
    return pts.map((p, i) => {
      const dominated = pts.some((q, j) => {
        if (j === i) return false;
        const costOK = q.cost <= p.cost;
        const benOK = maxBenefit ? q.benefit >= p.benefit : q.benefit <= p.benefit;
        if (!costOK || !benOK) return false;
        return q.cost < p.cost || (maxBenefit ? q.benefit > p.benefit : q.benefit < p.benefit);
      });
      return { ...p, idx: i, dominated };
    });
  }

  /* ============ chart rendering ============ */
  const SVGNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    const e = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function niceTicks(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min;
    const step0 = Math.pow(10, Math.floor(Math.log10(span / count)));
    const err = (span / count) / step0;
    let step;
    if (err >= 7.5) step = 10 * step0;
    else if (err >= 3.5) step = 5 * step0;
    else if (err >= 1.5) step = 2 * step0;
    else step = step0;
    const start = Math.ceil(min / step) * step;
    const ticks = [];
    for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(+v.toFixed(10));
    return ticks;
  }

  function fmt(v) {
    if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + "k";
    if (Number.isInteger(v)) return String(v);
    return (+v.toFixed(2)).toString();
  }

  function draw(annotated) {
    while (chart.firstChild) chart.removeChild(chart.firstChild);

    const defs = el("defs");
    defs.innerHTML = `
      <linearGradient id="frontFill" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="rgba(61,214,140,0.02)"/>
        <stop offset="100%" stop-color="rgba(61,214,140,0.16)"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
    chart.appendChild(defs);

    const pts = annotated;
    if (!pts.length) {
      chart.appendChild(el("text", {
        x: VW / 2, y: VH / 2, "text-anchor": "middle",
        fill: "var(--muted)", "font-size": "14"
      }, t("chartEmpty")));
      return;
    }

    const xs = pts.map(p => p.cost);
    const ys = pts.map(p => p.benefit);
    let xmin = Math.min(...xs), xmax = Math.max(...xs);
    let ymin = Math.min(...ys), ymax = Math.max(...ys);
    const padX = (xmax - xmin) * 0.08 || 1;
    const padY = (ymax - ymin) * 0.1 || 1;
    xmin -= padX; xmax += padX;
    ymin -= padY; ymax += padY;

    const sx = v => M.left + ((v - xmin) / (xmax - xmin)) * PW;
    const sy = v => M.top + (1 - (v - ymin) / (ymax - ymin)) * PH;

    const xticks = niceTicks(xmin, xmax, 8);
    const yticks = niceTicks(ymin, ymax, 7);

    const gridLayer = el("g");
    chart.appendChild(gridLayer);

    xticks.forEach(tk => {
      if (tk < xmin || tk > xmax) return;
      const x = sx(tk);
      gridLayer.appendChild(el("line", {
        x1: x, y1: M.top, x2: x, y2: M.top + PH,
        stroke: "var(--grid-line)", "stroke-width": 1
      }));
      gridLayer.appendChild(el("text", {
        x, y: M.top + PH + 20, "text-anchor": "middle",
        fill: "var(--muted)", "font-size": "11"
      }, fmt(tk)));
    });
    yticks.forEach(tk => {
      if (tk < ymin || tk > ymax) return;
      const y = sy(tk);
      gridLayer.appendChild(el("line", {
        x1: M.left, y1: y, x2: M.left + PW, y2: y,
        stroke: "var(--grid-line)", "stroke-width": 1
      }));
      gridLayer.appendChild(el("text", {
        x: M.left - 10, y: y + 4, "text-anchor": "end",
        fill: "var(--muted)", "font-size": "11"
      }, fmt(tk)));
    });

    gridLayer.appendChild(el("line", {
      x1: M.left, y1: M.top, x2: M.left, y2: M.top + PH,
      stroke: "var(--border)", "stroke-width": 1.5
    }));
    gridLayer.appendChild(el("line", {
      x1: M.left, y1: M.top + PH, x2: M.left + PW, y2: M.top + PH,
      stroke: "var(--border)", "stroke-width": 1.5
    }));

    chart.appendChild(el("text", {
      x: M.left + PW / 2, y: VH - 14, "text-anchor": "middle",
      fill: "var(--accent-2)", "font-size": "13", "font-weight": "600"
    }, t("axisCost")));
    chart.appendChild(el("text", {
      x: 16, y: M.top + PH / 2, "text-anchor": "middle",
      fill: "var(--accent)", "font-size": "13", "font-weight": "600",
      transform: `rotate(-90 16 ${M.top + PH / 2})`
    }, t("axisBenefit")));

    // "better" direction arrow: top-right (max benefit) or bottom-right (min benefit)
    const maxBenefit = benefitDir === "max";
    const ax = M.left + PW - 6;
    const ay = maxBenefit ? (M.top + 6) : (M.top + PH - 6);
    const dy = maxBenefit ? 6 : -6;
    const arrow = el("g", { opacity: 0.5 });
    arrow.appendChild(el("path", {
      d: `M ${ax - 36} ${ay - dy} L ${ax - 4} ${ay - dy} M ${ax - 8} ${ay - dy - 4} L ${ax - 4} ${ay - dy} L ${ax - 8} ${ay - dy + 4}`,
      stroke: "var(--good)", "stroke-width": 1.4, fill: "none"
    }));
    arrow.appendChild(el("text", {
      x: ax - 40, y: ay - dy - 2, "text-anchor": "end",
      fill: "var(--good)", "font-size": "10"
    }, t("better")));
    chart.appendChild(arrow);

    const pareto = pts.filter(p => !p.dominated)
      .slice().sort((a, b) => a.cost - b.cost || a.benefit - b.benefit);

    if (pareto.length >= 2) {
      const ptsStr = pareto.map(p => `${sx(p.cost)},${sy(p.benefit)}`).join(" ");
      chart.appendChild(el("polyline", {
        points: ptsStr,
        fill: "none",
        stroke: "var(--pareto-line)",
        "stroke-width": 2.4,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        filter: "url(#glow)"
      }));
    }

    const showDom = showDomChk.checked;
    const domLayer = el("g");
    chart.appendChild(domLayer);
    pts.forEach(p => {
      if (!p.dominated) return;
      if (!showDom) return;
      domLayer.appendChild(el("circle", {
        cx: sx(p.cost), cy: sy(p.benefit), r: 5,
        fill: "var(--dominated)", stroke: "var(--chart-bg)", "stroke-width": 1.5,
        opacity: 0.9
      }));
      bindTooltip(domLayer.lastChild, p);
    });

    const pLayer = el("g");
    chart.appendChild(pLayer);
    pareto.forEach(p => {
      const g = el("g");
      g.appendChild(el("circle", {
        cx: sx(p.cost), cy: sy(p.benefit), r: 7,
        fill: "var(--pareto)", stroke: "var(--chart-bg)", "stroke-width": 2,
        filter: "url(#glow)"
      }));
      g.appendChild(el("text", {
        x: sx(p.cost) + 10, y: sy(p.benefit) - 10,
        fill: "var(--text)", "font-size": "11",
        "font-weight": "600", "paint-order": "stroke",
        stroke: "var(--chart-bg)", "stroke-width": 3, "stroke-linejoin": "round"
      }, p.name));
      pLayer.appendChild(g);
      bindTooltip(g, p);
    });
  }

  function bindTooltip(node, p) {
    node.style.cursor = "pointer";
    node.addEventListener("mousemove", e => {
      const rect = chartWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tooltip.style.left = (x + 14) + "px";
      tooltip.style.top = (y + 14) + "px";
      tooltip.style.opacity = 1;
      tooltip.innerHTML =
        `<div class="t-name">${escapeHtml(p.name)}</div>` +
        `<div class="t-row">${escapeHtml(t("tooltipCost"))}: <b>${fmt(p.cost)}</b></div>` +
        `<div class="t-row">${escapeHtml(t("tooltipBenefit"))}: <b>${fmt(p.benefit)}</b></div>` +
        (p.dominated
          ? `<span class="t-tag d">${escapeHtml(t("tooltipDominated"))}</span>`
          : `<span class="t-tag p">${escapeHtml(t("tooltipPareto"))}</span>`);
    });
    node.addEventListener("mouseleave", () => { tooltip.style.opacity = 0; });
  }

  function update() {
    const annotated = computePareto(data);
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((tr, i) => {
      tr.classList.remove("pareto-row", "dominated-row");
      if (i < annotated.length) {
        if (annotated[i].dominated) tr.classList.add("dominated-row");
        else tr.classList.add("pareto-row");
      }
    });
    const total = annotated.length;
    const np = annotated.filter(p => !p.dominated).length;
    document.getElementById("statTotal").textContent = total;
    document.getElementById("statPareto").textContent = np;
    document.getElementById("statDom").textContent = total - np;
    draw(annotated);
  }

  /* ============ export PNG ============ */
  document.getElementById("exportBtn").onclick = () => {
    // inline CSS variables onto the svg so the serialized standalone image
    // resolves var(--...) colors correctly
    const root = getComputedStyle(document.documentElement);
    const vars = ["--bg","--text","--muted","--border","--accent","--accent-2",
      "--pareto","--pareto-line","--dominated","--good","--grid-line",
      "--chart-bg","--canvas-bg"];
    const inlineVars = vars.map(v => `${v}:${root.getPropertyValue(v).trim()}`).join(";");
    const prevStyle = chart.getAttribute("style") || "";
    chart.setAttribute("style", (prevStyle ? prevStyle + ";" : "") + inlineVars);

    const xml = new XMLSerializer().serializeToString(chart);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = VW * 2; c.height = VH * 2;
      const ctx = c.getContext("2d");
      ctx.fillStyle = root.getPropertyValue("--canvas-bg").trim() || "#131820";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const a = document.createElement("a");
      a.download = "pareto-frontier.png";
      a.href = c.toDataURL("image/png");
      a.click();
      toast(t("toastPngExported"));
    };
    img.onerror = () => toast(t("toastExportFail"));
    img.src = "data:image/svg+xml;base64," + svg64;

    // restore original style
    if (prevStyle) chart.setAttribute("style", prevStyle);
    else chart.removeAttribute("style");
  };

  /* ============ excel template & import ============ */
  document.getElementById("downloadTpl").onclick = () => {
    const aoa = [
      [t("tplHeaderName"), t("tplHeaderCost"), t("tplHeaderBenefit")],
      [t("schemePrefix") + " A", 10, 50],
      [t("schemePrefix") + " B", 20, 80],
      [t("schemePrefix") + " C", 30, 70],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 16 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pareto");
    XLSX.writeFile(wb, "pareto-template.xlsx");
    toast(t("toastTemplateDownloaded"));
  };

  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  importBtn.onclick = () => importFile.click();
  importFile.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!rows.length) { toast(t("toastFileEmpty")); return; }

        let start = 0;
        const firstCost = parseFloat(rows[0] && rows[0][1]);
        const firstBen = parseFloat(rows[0] && rows[0][2]);
        if (isNaN(firstCost) || isNaN(firstBen)) start = 1;

        const parsed = [];
        for (let i = start; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0) continue;
          const name = String(r[0] ?? "").trim();
          const cost = parseFloat(r[1]);
          const benefit = parseFloat(r[2]);
          if (name === "" && isNaN(cost) && isNaN(benefit)) continue;
          parsed.push({
            name: name || (t("schemePrefix") + " " + (parsed.length + 1)),
            cost: isNaN(cost) ? 0 : cost,
            benefit: isNaN(benefit) ? 0 : benefit,
          });
        }
        if (!parsed.length) { toast(t("toastNoData")); return; }
        data = parsed;
        renderTable();
        update();
        toast(t("toastImported", { n: parsed.length }));
      } catch (err) {
        console.error(err);
        toast(t("toastImportFail", { msg: err.message }));
      } finally {
        importFile.value = "";
      }
    };
    reader.readAsArrayBuffer(f);
  };

  /* ============ responsive chart sizing ============ */
  function fitChart() {
    const r = chart.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (w <= 0 || h <= 0) return;
    VW = w;
    VH = h;
    PW = VW - M.left - M.right;
    PH = VH - M.top - M.bottom;
    chart.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
    update();
  }
  const ro = new ResizeObserver(() => { fitChart(); });
  ro.observe(chart);

  /* ============ init ============ */
  data = sampleData();
  applyI18n();
})();
