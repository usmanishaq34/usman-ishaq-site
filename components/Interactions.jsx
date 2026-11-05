"use client";

import { useEffect } from "react";

let started = false;

// Runs every animation and interaction on the page once, after the page loads.
// Every part checks that its elements exist first: a section hidden or removed
// from the dashboard must not stop the others from working.
export default function Interactions() {
  useEffect(() => {
    if (started) return;
    started = true;

    const $ = (id) => document.getElementById(id);
    const NS = "http://www.w3.org/2000/svg";

    /* ---------- dashboard visual editor and reveal fallback ---------- */
    // Inside the dashboard editor (iframe, ?dv-edit=1) every section shows at once;
    // elsewhere, anything still hidden after 2.5s that is on screen is revealed too.
    const editing = new URLSearchParams(location.search).has("dv-edit") || window.self !== window.top;
    if (editing) document.documentElement.classList.add("dv-editing");
    const revealAll = () => {
      document.querySelectorAll(".rv,.pipeline,.stats,#indCloud,.ind").forEach((x) => x.classList.add("in"));
      document.querySelectorAll("#measure .fill").forEach((f) => (f.style.width = f.dataset.w + "%"));
      document.querySelectorAll(".cnt[data-to]").forEach((c) => { const to = +c.dataset.to; c.textContent = to >= 1000 && to !== 2019 ? to.toLocaleString("en-US") : String(to); });
      document.querySelectorAll(".ac[data-to]").forEach((c) => (c.textContent = (+c.dataset.to).toFixed(+c.dataset.dec || 0)));
    };
    const revealVisible = () => {
      document.querySelectorAll(".rv:not(.in)").forEach((x) => { const r = x.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) x.classList.add("in"); });
    };

    /* ---------- lightbox ---------- */
    const lb = $("lightbox"), lbImg = $("lbImg");
    function openLb(src, alt) {
      if (!lb || !lbImg) return;
      lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("open"); document.body.style.overflow = "hidden";
    }
    function closeLb() { if (!lb) return; lb.classList.remove("open"); document.body.style.overflow = ""; }
    if (lb) {
      const lbClose = $("lbClose"); if (lbClose) lbClose.onclick = closeLb;
      lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });
    }

    /* ---------- client feedback: tabs and the video player ---------- */
    const fbTabs = $("fbTabs");
    if (fbTabs) {
      fbTabs.addEventListener("click", (e) => {
        const b = e.target.closest("[data-fb]"); if (!b) return;
        fbTabs.querySelectorAll("[data-fb]").forEach((x) => x.setAttribute("aria-selected", x === b ? "true" : "false"));
        document.querySelectorAll("[data-fb-panel]").forEach((p) => { p.hidden = p.dataset.fbPanel !== b.dataset.fb; });
        revealVisible();
      });
    }
    const vmodal = $("vmodal"), vframe = $("vframe"), vplayer = $("vplayer");
    if (vmodal && vframe && vplayer && typeof vmodal.showModal === "function") {
      const closeVideo = () => { vplayer.pause(); vplayer.removeAttribute("src"); vplayer.load(); if (vmodal.open) vmodal.close(); };
      document.querySelectorAll(".vcard[data-src]").forEach((card) => {
        card.addEventListener("click", () => {
          vframe.className = "vframe " + (card.dataset.shape === "tall" ? "tall" : "wide");
          vplayer.poster = card.dataset.poster || "";
          vplayer.src = card.dataset.src;
          vmodal.showModal();
          vplayer.play().catch(() => {});
        });
      });
      const vclose = $("vclose"); if (vclose) vclose.onclick = closeVideo;
      vmodal.addEventListener("click", (e) => { if (e.target === vmodal) closeVideo(); });
      vmodal.addEventListener("close", () => { vplayer.pause(); vplayer.removeAttribute("src"); vplayer.load(); });
    }

    /* ---------- portfolio ---------- */
    const pf = $("pfGrid"), filters = $("filters");
    if (pf && filters) {
      filters.addEventListener("click", (e) => {
        const b = e.target.closest(".filter"); if (!b) return;
        filters.querySelectorAll(".filter").forEach((x) => x.classList.toggle("on", x === b));
        const f = b.dataset.f;
        pf.querySelectorAll(".pf").forEach((el) => el.classList.toggle("hide", f !== "all" && el.dataset.c !== f));
      });
    }
    if (pf) {
      pf.addEventListener("click", (e) => { const c = e.target.closest(".pf"); if (!c) return; const h = c.querySelector("h4"); openLb(c.dataset.src, h ? h.textContent : ""); });
    }

    /* ---------- FAQ ---------- */
    const faqList = $("faqList");
    if (faqList) {
      faqList.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        const qa = b.parentNode, ans = qa.querySelector(".ans"), open = qa.classList.toggle("open");
        b.setAttribute("aria-expanded", open); if (ans) ans.style.maxHeight = open ? ans.scrollHeight + "px" : 0;
      });
    }

    /* ---------- counters ---------- */
    function animateNum(el, to, dur) {
      if (!el) return;
      const from = parseInt(el.textContent.replace(/,/g, "")) || 0, start = performance.now();
      const fmt = (n) => (to >= 1000 && to !== 2019 ? n.toLocaleString("en-US") : String(n));
      function f(t) { const k = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(f); }
      requestAnimationFrame(f);
    }

    /* ---------- sixteen towns ---------- */
    const towns = ["Springfield", "Franklin", "Clinton", "Greenville", "Fairview", "Madison", "Georgetown", "Salem", "Riverside", "Bristol", "Oxford", "Arlington", "Jackson", "Milford", "Dover", "Ashland"];
    const tsvg = $("townsSvg");
    let setTowns = () => {}, startAuto = () => {}, stopAuto = () => {};
    if (tsvg) {
      function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || tsvg).appendChild(e); return e; }
      const tLines = [], pageNodes = [];
      const gLines = el("g", {}), gNodes = el("g", {});
      const one = el("g", {}, gNodes);
      el("rect", { x: 470, y: 170, width: 150, height: 80, rx: 12, fill: "#db4c23" }, one);
      el("text", { x: 545, y: 205, "text-anchor": "middle", "font-weight": "700", fill: "#fff" }, one).textContent = "Service Areas";
      el("text", { x: 545, y: 224, "text-anchor": "middle", fill: "#ffe1d6" }, one).textContent = "one page";
      towns.forEach((t, i) => {
        const y = 14 + i * 25.5;
        const g = el("g", {}, gNodes);
        el("rect", { x: 10, y: y, width: 122, height: 20, rx: 10, fill: "rgba(255,255,255,.07)", stroke: "rgba(255,255,255,.15)" }, g);
        el("text", { x: 71, y: y + 14, "text-anchor": "middle" }, g).textContent = t;
        const line = el("path", { class: "tline", d: `M132 ${y + 10} C 300 ${y + 10}, 330 210, 470 210`, stroke: "rgba(255,120,80,.45)" }, gLines);
        tLines.push({ line, y });
        const pg = el("g", { opacity: 0, style: "transition:opacity .6s " + i * 0.04 + "s" }, gNodes);
        const col = i % 2, px = 430 + col * 105, py = 10 + Math.floor(i / 2) * 51;
        el("rect", { x: px, y: py, width: 95, height: 38, rx: 8, fill: "rgba(47,191,138,.15)", stroke: "#2fbf8a" }, pg);
        el("text", { x: px + 47, y: py + 16, "text-anchor": "middle", "font-size": "10.5", fill: "#bff0dc" }, pg).textContent = t;
        el("text", { x: px + 47, y: py + 30, "text-anchor": "middle", "font-size": "9.5", fill: "#7fd8b3" }, pg).textContent = "own page";
        pageNodes.push({ pg, px, py });
      });
      let townMode = "before";
      const tBefore = $("tBefore"), tAfter = $("tAfter");
      setTowns = function (mode) {
        townMode = mode;
        if (tBefore) tBefore.classList.toggle("on", mode === "before");
        if (tAfter) tAfter.classList.toggle("on", mode === "after");
        one.style.transition = "opacity .6s"; one.style.opacity = mode === "before" ? 1 : 0;
        tLines.forEach(({ line, y }, i) => {
          const p = pageNodes[i];
          if (mode === "before") { line.setAttribute("d", `M132 ${y + 10} C 300 ${y + 10}, 330 210, 470 210`); line.setAttribute("stroke", "rgba(255,120,80,.45)"); p.pg.setAttribute("opacity", 0); }
          else { line.setAttribute("d", `M132 ${y + 10} C 290 ${y + 10}, 300 ${p.py + 19}, ${p.px} ${p.py + 19}`); line.setAttribute("stroke", "rgba(47,191,138,.55)"); p.pg.setAttribute("opacity", 1); }
        });
        animateNum($("pageCount"), mode === "before" ? 1 : 16, 700);
      };
      let autoT = null;
      stopAuto = function () { clearInterval(autoT); autoT = null; };
      startAuto = function () { if (autoT) return; autoT = setInterval(() => setTowns(townMode === "before" ? "after" : "before"), 4200); };
      if (tBefore) tBefore.onclick = () => { stopAuto(); setTowns("before"); };
      if (tAfter) tAfter.onclick = () => { stopAuto(); setTowns("after"); };
      setTowns("before");
    }

    /* ---------- topical map lab ---------- */
    const C = { central: "#db4c23", core: "#5b7cff", outer: "#2fbf8a", attr: "#c7a6ff" };
    const graphs = {
      plumber: {
        side: { title: "Plumbing business", text: "The central entity is the company and its main service. Core sections are the money pages. Outer sections answer the questions that come before a call.", kv: [["Central entity", "Plumbing company"], ["Core sections", "Services, towns"], ["Outer sections", "Costs, signs, guides"], ["Goal", "Calls and booked jobs"]] },
        nodes: [["c", "Plumbing company", 400, 235, "central", 34],
          ["s1", "Repiping", 230, 120, "core", 22], ["s2", "Water heaters", 570, 120, "core", 22], ["s3", "Drain cleaning", 230, 350, "core", 22], ["s4", "Leak detection", 570, 350, "core", 22], ["s5", "Service areas", 400, 90, "core", 22],
          ["a1", "PEX vs copper", 90, 70, "attr", 14], ["a2", "Repipe cost", 110, 175, "attr", 14], ["a3", "Tankless", 700, 70, "attr", 14], ["a4", "Signs it is failing", 710, 180, "attr", 14], ["a5", "Hydro jetting", 95, 330, "attr", 14], ["a6", "Slab leaks", 700, 330, "attr", 14],
          ["o1", "Town A page", 300, 25, "outer", 13], ["o2", "Town B page", 500, 25, "outer", 13], ["o3", "Emergency plumber", 400, 420, "outer", 16], ["o4", "Plumbing FAQs", 250, 445, "outer", 13], ["o5", "Reviews and proof", 560, 445, "outer", 13]],
        edges: [["c", "s1"], ["c", "s2"], ["c", "s3"], ["c", "s4"], ["c", "s5"], ["s1", "a1"], ["s1", "a2"], ["s2", "a3"], ["s2", "a4"], ["s3", "a5"], ["s4", "a6"], ["s5", "o1"], ["s5", "o2"], ["c", "o3"], ["o3", "o4"], ["o3", "o5"], ["s3", "o3"], ["s4", "o3"]] },
      ecom: {
        side: { title: "Ecommerce store", text: "For a store the central entity is the product type. Categories are core. Attributes like size and material become filters, comparisons and buying guides.", kv: [["Central entity", "Product type"], ["Core sections", "Categories, products"], ["Outer sections", "Guides, comparisons"], ["Goal", "Online sales"]] },
        nodes: [["c", "Running shoes", 400, 235, "central", 34],
          ["k1", "Trail running", 220, 120, "core", 22], ["k2", "Road running", 580, 120, "core", 22], ["k3", "Women's", 220, 355, "core", 22], ["k4", "Men's", 580, 355, "core", 22],
          ["p1", "Product page", 90, 60, "core", 13], ["p2", "Product page", 360, 40, "core", 13], ["p3", "Product page", 710, 60, "core", 13],
          ["a1", "Size and fit", 80, 200, "attr", 14], ["a2", "Drop (mm)", 720, 200, "attr", 14], ["a3", "Cushioning", 400, 120, "attr", 14], ["a4", "Waterproof", 110, 420, "attr", 14],
          ["o1", "Best for flat feet", 300, 445, "outer", 13], ["o2", "Trail vs road", 500, 445, "outer", 13], ["o3", "How to choose", 700, 420, "outer", 14], ["o4", "Care guide", 400, 360, "outer", 13]],
        edges: [["c", "k1"], ["c", "k2"], ["c", "k3"], ["c", "k4"], ["k1", "p1"], ["k1", "p2"], ["k2", "p3"], ["k1", "a1"], ["k2", "a2"], ["c", "a3"], ["k3", "a4"], ["k3", "o1"], ["k4", "o2"], ["k4", "o3"], ["c", "o4"], ["a3", "p2"], ["o2", "k1"]] },
      schema: {
        side: { title: "Schema implementation", text: "Schema is the same map written as code. One @id per entity, linked together, so Google reads the business as a connected graph instead of loose pages.", code: true },
        nodes: [["c", "LocalBusiness", 400, 235, "central", 34],
          ["n1", "Organization", 230, 110, "core", 20], ["n2", "Service", 570, 110, "core", 20], ["n3", "WebPage", 230, 360, "core", 20], ["n4", "Person (owner)", 570, 360, "core", 20],
          ["a1", "areaServed", 720, 60, "attr", 14], ["a2", "hasOfferCatalog", 720, 190, "attr", 14], ["a3", "sameAs", 80, 60, "attr", 14], ["a4", "logo", 80, 180, "attr", 14], ["a5", "FAQPage", 90, 430, "attr", 14], ["a6", "BreadcrumbList", 330, 450, "attr", 14],
          ["o1", "Review", 720, 430, "outer", 14], ["o2", "GeoCoordinates", 500, 450, "outer", 14], ["o3", "openingHours", 400, 90, "outer", 13]],
        edges: [["c", "n1"], ["c", "n2"], ["c", "n3"], ["c", "n4"], ["n2", "a1"], ["n2", "a2"], ["n1", "a3"], ["n1", "a4"], ["n3", "a5"], ["n3", "a6"], ["c", "o1"], ["c", "o2"], ["c", "o3"], ["n4", "o1"]] },
      local: {
        side: { title: "Multi-town contractor", text: "A contractor serving many towns needs a service by town grid. Each town page carries its own jobs, questions and proof, and links back to the service hub.", kv: [["Central entity", "Contractor + main service"], ["Core sections", "Service hubs"], ["Outer sections", "Town × service pages"], ["Goal", "Calls from every town"]] },
        nodes: [["c", "Dock builder", 400, 235, "central", 34],
          ["h1", "Dock construction", 250, 130, "core", 22], ["h2", "Seawall repair", 550, 130, "core", 22], ["h3", "Boat lifts", 400, 370, "core", 22],
          ["t1", "Town A", 90, 60, "outer", 14], ["t2", "Town B", 130, 180, "outer", 14], ["t3", "Town C", 80, 300, "outer", 14], ["t4", "Town A", 710, 60, "outer", 14], ["t5", "Town B", 680, 180, "outer", 14], ["t6", "Town C", 720, 300, "outer", 14], ["t7", "Town A", 250, 440, "outer", 14], ["t8", "Town B", 550, 440, "outer", 14],
          ["q1", "Permits", 400, 60, "attr", 14], ["q2", "Seawall cost", 560, 260, "attr", 13], ["q3", "Materials", 240, 260, "attr", 13]],
        edges: [["c", "h1"], ["c", "h2"], ["c", "h3"], ["h1", "t1"], ["h1", "t2"], ["h1", "t3"], ["h2", "t4"], ["h2", "t5"], ["h2", "t6"], ["h3", "t7"], ["h3", "t8"], ["c", "q1"], ["h2", "q2"], ["h1", "q3"], ["h1", "q1"], ["h2", "q1"]] },
    };
    const gsvg = $("graph");
    const codeStr = `{
      "@context": "https://schema.org",
      "@type": "Plumber",
      "@id": "https://example.com/#business",
      "name": "Example Plumbing Co.",
      "parentOrganization": {"@id": "https://example.com/#org"},
      "areaServed": ["Springfield", "Franklin", "Salem"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "itemListElement": [
          {"@type": "Offer", "itemOffered":
            {"@type": "Service", "name": "Whole-house repiping"}}
        ]
      },
      "founder": {"@id": "https://example.com/#owner"},
      "sameAs": ["https://www.google.com/maps/..."]
    }`;
    let typeTimer = null;
    function typeCode() {
      clearInterval(typeTimer); const box = $("codeBox"); if (!box) return; let i = 0;
      const hl = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/("@?[\w]+")(\s*:)/g, '<span class="k">$1</span><span class="p">$2</span>').replace(/:\s*("[^"]*")/g, ': <span class="s">$1</span>');
      typeTimer = setInterval(() => { i += 4; box.innerHTML = hl(codeStr.slice(0, i)) + '<span class="caret"></span>'; if (i >= codeStr.length) { clearInterval(typeTimer); } }, 22);
    }
    function drawGraph(key) {
      if (!gsvg) return;
      const g = graphs[key]; gsvg.innerHTML = "";
      const pos = {}; g.nodes.forEach((n) => (pos[n[0]] = n));
      const eg = document.createElementNS(NS, "g"); gsvg.appendChild(eg);
      const ng = document.createElementNS(NS, "g"); gsvg.appendChild(ng);
      const edgeEls = [];
      g.edges.forEach(([a, b], i) => {
        const A = pos[a], B = pos[b];
        const p = document.createElementNS(NS, "path");
        const mx = (A[2] + B[2]) / 2, my = (A[3] + B[3]) / 2 - 18;
        p.setAttribute("d", `M${A[2]} ${A[3]} Q ${mx} ${my} ${B[2]} ${B[3]}`);
        p.setAttribute("class", "edge"); eg.appendChild(p);
        const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        p.style.transition = `stroke-dashoffset .9s ease ${0.25 + i * 0.05}s, stroke .3s`;
        requestAnimationFrame(() => requestAnimationFrame(() => (p.style.strokeDashoffset = 0)));
        edgeEls.push({ p, a, b });
      });
      g.nodes.forEach(([id, label, x, y, type, r], i) => {
        const n = document.createElementNS(NS, "g"); n.setAttribute("class", "node");
        n.style.opacity = 0; n.style.transform = `translate(${x}px,${y}px) scale(.3)`; n.style.transition = `opacity .5s ${i * 0.04}s, transform .6s cubic-bezier(.3,1.5,.5,1) ${i * 0.04}s`;
        const halo = document.createElementNS(NS, "circle"); halo.setAttribute("r", r + 8); halo.setAttribute("fill", C[type]); halo.setAttribute("opacity", 0.14); n.appendChild(halo);
        const c = document.createElementNS(NS, "circle"); c.setAttribute("r", r); c.setAttribute("fill", C[type]); n.appendChild(c);
        if (type === "central") { const pulse = document.createElementNS(NS, "circle"); pulse.setAttribute("r", r); pulse.setAttribute("fill", "none"); pulse.setAttribute("stroke", C.central); pulse.innerHTML = '<animate attributeName="r" from="' + r + '" to="' + (r + 26) + '" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" from=".7" to="0" dur="2.4s" repeatCount="indefinite"/>'; n.appendChild(pulse); }
        const t = document.createElementNS(NS, "text"); t.textContent = label; t.setAttribute("text-anchor", "middle");
        t.setAttribute("y", type === "central" ? 5 : r + 16); if (type === "central") { t.setAttribute("font-size", "13"); }
        n.appendChild(t); ng.appendChild(n);
        requestAnimationFrame(() => requestAnimationFrame(() => { n.style.opacity = 1; n.style.transform = `translate(${x}px,${y}px) scale(1)`; }));
        n.addEventListener("mouseenter", () => edgeEls.forEach((e) => e.p.classList.toggle("hot", e.a === id || e.b === id)));
        n.addEventListener("mouseleave", () => edgeEls.forEach((e) => e.p.classList.remove("hot")));
      });
      const side = $("labSide"), sd = g.side;
      if (side) {
        let html = `<span class="eyebrow">Example map</span><h3>${sd.title}</h3><p class="muted">${sd.text}</p>`;
        if (sd.kv) html += `<div class="kv">${sd.kv.map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join("")}</div>`;
        if (sd.code) html += `<pre class="code" id="codeBox"></pre>`;
        html += `<a class="btn btn-primary" href="#contact" style="justify-content:center">Map my business <span class="arrow">→</span></a>`;
        side.innerHTML = html;
        if (sd.code) typeCode();
      }
    }
    let currentGraph = "plumber", labStarted = false;
    const labTabs = $("labTabs");
    if (labTabs) {
      labTabs.addEventListener("click", (e) => {
        const b = e.target.closest(".tab"); if (!b) return;
        labTabs.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === b));
        currentGraph = b.dataset.g; drawGraph(currentGraph);
      });
    }

    /* ---------- observers ---------- */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const t = en.target;
        t.classList.add("in");
        if (t.classList.contains("stats")) { t.querySelectorAll(".cnt").forEach((c) => { const to = +c.dataset.to; if (to === 2019) { c.textContent = "2000"; } animateNum(c, to, 1800); }); }
        if (t.id === "measure") { t.querySelectorAll(".fill").forEach((f) => (f.style.width = f.dataset.w + "%")); }
        if (t.id === "problem") { setTimeout(() => { setTowns("after"); startAuto(); }, 900); }
        if (t.id === "lab" && !labStarted) { labStarted = true; drawGraph(currentGraph); }
        if (t.id === "indCloud") { t.querySelectorAll(".ind").forEach((x, i) => setTimeout(() => x.classList.add("in"), i * 45)); }
        io.unobserve(t);
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".rv,.stats,#measure,#problem,#lab,#indCloud,#pipeline").forEach((x) => io.observe(x));

    /* ---------- results counters ---------- */
    function countTo(el) { const to = +el.dataset.to, dec = +el.dataset.dec, st = performance.now(); (function f(t) { const k = Math.min(1, (t - st) / 1800), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(st); }

    /* ---------- generic zoom for proof images ---------- */
    document.addEventListener("click", (e) => {
      const z = e.target.closest(".gcard,.rf,.site"); if (!z) return;
      const im = z.querySelector("img"); if (!im) return; openLb(im.src, im.alt);
    });

    /* ---------- live build ---------- */
    const bSec = $("build");
    let bStarted = false;
    let showPanel = () => {};
    if (bSec) {
      const panels = [...bSec.querySelectorAll(".panel")], snavs = [...bSec.querySelectorAll(".snav")];
      let bTimers = [], bAuto = true;
      const T = (fn, ms) => bTimers.push(setTimeout(fn, ms));
      showPanel = function (i) {
        if (!panels.length) return;
        bTimers.forEach(clearTimeout); bTimers = [];
        panels.forEach((p, j) => p.classList.toggle("on", j === i));
        const p = panels[i]; let dur = 8500;
        if (i < 2) {
          const rows = [...p.querySelectorAll("tr.row")], nx = p.querySelector(".nextp");
          rows.forEach((r) => r.classList.remove("show", "hot")); if (nx) nx.classList.remove("show");
          rows.forEach((r, k) => T(() => r.classList.add("show"), 250 + k * 520));
          const end = 250 + rows.length * 520 + 200;
          T(() => { rows.forEach((r) => { if (r.hasAttribute("data-hot")) r.classList.add("hot"); }); if (nx) nx.classList.add("show"); }, end);
          dur = end + 2600;
        } else {
          const bl = [...p.querySelectorAll(".blk,.fold")], ns = [...p.querySelectorAll(".note")];
          bl.forEach((b) => b.classList.remove("show", "hl")); ns.forEach((n) => n.classList.remove("show", "hl"));
          bl.forEach((b, k) => T(() => {
            b.classList.add("show");
            const n = b.dataset.n; if (!n) return;
            p.querySelectorAll(".hl").forEach((x) => x.classList.remove("hl"));
            b.classList.add("hl"); const nn = p.querySelector('.note[data-n="' + n + '"]'); if (nn) nn.classList.add("show", "hl");
          }, 300 + k * 800));
          dur = 300 + bl.length * 800 + 2800;
        }
        snavs.forEach((n) => { n.classList.remove("on"); n.style.setProperty("--dur", dur + "ms"); });
        if (snavs[i]) { void snavs[i].offsetWidth; snavs[i].classList.add("on"); }
        if (bAuto) T(() => showPanel((i + 1) % panels.length), dur);
      };
      snavs.forEach((n, j) => n.addEventListener("click", () => { bAuto = false; bSec.classList.add("manual"); showPanel(j); }));
      if (panels[2]) {
        panels[2].querySelectorAll(".note").forEach((n) => n.addEventListener("mouseenter", () => {
          if (bAuto) return; const p = panels[2]; p.querySelectorAll(".hl").forEach((x) => x.classList.remove("hl"));
          n.classList.add("hl"); const blk = p.querySelector('.blk[data-n="' + n.dataset.n + '"]'); if (blk) blk.classList.add("hl");
        }));
      }
    }

    /* ---------- formula ---------- */
    let fxStarted = false;
    function runFormula() { const sp = [...document.querySelectorAll("#formula .fx span")]; if (!sp.length) return; let i = 0; setInterval(() => { sp.forEach((s, j) => s.classList.toggle("lit", j === i % sp.length)); i++; }, 1300); }

    const io2 = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return; const t = en.target;
      if (t.id === "agg") t.querySelectorAll(".ac").forEach(countTo);
      if (t.id === "build" && !bStarted) { bStarted = true; showPanel(0); }
      if (t.id === "formula" && !fxStarted) { fxStarted = true; runFormula(); }
      io2.unobserve(t);
    }), { threshold: 0.2 });
    ["agg", "build", "formula"].forEach((id) => { const n = $(id); if (n) io2.observe(n); });

    /* ---------- blog art + filter ---------- */
    function rng(s) { return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
    document.querySelectorAll(".art:not(.has-img)").forEach((a) => {
      const r = rng(+a.dataset.seed * 7919), W = 400, H = 220, n = 7 + Math.floor(r() * 4), pts = [];
      for (let i = 0; i < n; i++) pts.push([30 + r() * (W - 60), 25 + r() * (H - 60)]);
      pts[0] = [W * 0.5, H * 0.45];
      let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`;
      pts.slice(1).forEach((p, i) => { const L = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) + 40; s += `<path class="e" style="--L:${L};transition-delay:${i * 0.07}s" d="M${pts[0][0]} ${pts[0][1]} Q ${(p[0] + pts[0][0]) / 2} ${(p[1] + pts[0][1]) / 2 - 25} ${p[0]} ${p[1]}"/>`; });
      pts.forEach((p, i) => { const col = i === 0 ? "#db4c23" : ["#5b7cff", "#2fbf8a", "#c7a6ff"][i % 3], rad = i === 0 ? 14 : 4 + r() * 5; s += `<circle class="nd" cx="${p[0]}" cy="${p[1]}" r="${rad}" fill="${col}" opacity="${i === 0 ? 1 : 0.9}"/>`; });
      a.insertAdjacentHTML("afterbegin", s + "</svg>");
    });
    const bfilters = $("bfilters");
    if (bfilters) {
      bfilters.addEventListener("click", (e) => {
        const b = e.target.closest(".bfilter"); if (!b) return;
        bfilters.querySelectorAll(".bfilter").forEach((x) => x.classList.toggle("on", x === b));
        // Each tab shows at most three posts: the newest three overall, or the newest three of that category.
        const f = b.dataset.f; let shown = 0;
        document.querySelectorAll("#bgrid .post").forEach((p) => { const match = f === "all" || p.dataset.c === f; const show = match && shown < 3; if (show) shown++; p.classList.toggle("hide", !show); });
      });
    }

    /* ---------- header, progress, menu ---------- */
    const header = $("top"), prog = $("progress");
    addEventListener("scroll", () => {
      if (header) header.classList.toggle("scrolled", scrollY > 30);
      const h = document.documentElement.scrollHeight - innerHeight; if (prog) prog.style.width = (scrollY / h) * 100 + "%";
    }, { passive: true });
    const burger = $("burger"), mm = $("mobileMenu");
    if (burger && mm) {
      burger.onclick = () => mm.classList.toggle("open");
      mm.querySelectorAll("a").forEach((a) => (a.onclick = () => mm.classList.remove("open")));
    }

    /* ---------- Calendly popup ---------- */
    // Booking links open Calendly in a popup instead of a new tab; the widget
    // loads on the first click. If it fails to load, the link opens normally.
    let calendlyLoading = null;
    const loadCalendly = () => {
      if (window.Calendly) return Promise.resolve();
      if (calendlyLoading) return calendlyLoading;
      calendlyLoading = new Promise((resolve, reject) => {
        const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://assets.calendly.com/assets/external/widget.css"; document.head.appendChild(css);
        const js = document.createElement("script"); js.src = "https://assets.calendly.com/assets/external/widget.js"; js.async = true;
        js.onload = () => resolve(); js.onerror = () => { calendlyLoading = null; reject(new Error("Calendly failed to load")); };
        document.head.appendChild(js);
      });
      return calendlyLoading;
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href*="calendly.com"]');
      if (!a || editing || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      const href = a.href;
      loadCalendly().then(() => window.Calendly.initPopupWidget({ url: href })).catch(() => window.open(href, "_blank", "noopener"));
    });

    /* ---------- lead form ---------- */
    const leadForm = $("leadForm");
    if (leadForm) {
      leadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.target, name = f.name.value.trim(), email = f.email.value.trim();
        if (!name || !/^\S+@\S+\.\S+$/.test(email)) { (name ? f.email : f.name).focus(); (name ? f.email : f.name).style.borderColor = "#db4c23"; return; }
        const wins = [...f.querySelectorAll('input[name="win"]:checked')].map((x) => x.value).join(", ") || "Not given";
        const body = `Name: ${name}\nEmail: ${email}\nWebsite: ${f.website.value}\nBusiness type: ${f.type.value}\nCounts as a win: ${wins}\nTowns or markets: ${f.towns.value}\n\n${f.message.value}`;
        location.href = `mailto:workwithus@digitalvikingz.com?subject=${encodeURIComponent("Website enquiry from " + name)}&body=${encodeURIComponent(body)}`;
        const ok = $("formOk"); if (ok) ok.classList.add("show");
      });
    }

    if (editing) revealAll();
    else setTimeout(revealVisible, 2500);
  }, []);
  return null;
}
