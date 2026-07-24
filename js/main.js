(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;

  /* ---------- theme ---------- */
  var btn = document.getElementById("themeBtn");
  var icon = document.getElementById("themeIcon");
  var label = document.getElementById("themeLabel");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    icon.textContent = t === "dark" ? "◐" : "◑";
    label.textContent = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var qp = new URLSearchParams(location.search).get("theme");
  applyTheme((qp === "dark" || qp === "light") ? qp
    : (saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")));
  btn.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    burger.textContent = open ? "✕" : "☰";
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.textContent = "☰";
    }
  });

  /* ---------- scroll progress + back-to-top ---------- */
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      toTop.classList.toggle("show", window.scrollY > 600);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- scrollspy ---------- */
  var sections = ["about", "skills", "projects", "certs", "education", "contact"];
  var navMap = {};
  navLinks.querySelectorAll("a").forEach(function (a) { navMap[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove("active"); });
        if (navMap[e.target.id]) navMap[e.target.id].classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- staggered reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    var batch = 0;
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.setProperty("--d", (batch++ * 0.08) + "s");
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var to = parseInt(el.getAttribute("data-count"), 10);
    var from = parseInt(el.getAttribute("data-from") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = to + suffix; return; }
    var t0 = null, dur = 1200;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = "translate(" + (dx * 6) + "px," + (dy * 6) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- 3D tilt + glow-follow on project cards ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll(".proj").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
        card.style.transform = "rotateX(" + ((0.5 - py) * 5) + "deg) rotateY(" + ((px - 0.5) * 5) + "deg) translateY(-2px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  } else {
    // still track glow position for touch taps
    document.querySelectorAll(".proj").forEach(function (card) {
      card.addEventListener("pointerdown", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ---------- cursor glow ---------- */
  var glow = document.getElementById("cursor-glow");
  if (finePointer && !reduce) {
    var gx = 0, gy = 0, tx = 0, ty = 0, glowOn = false;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!glowOn) { glowOn = true; glow.style.opacity = "0.7"; glowLoop(); }
    }, { passive: true });
    function glowLoop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.left = gx + "px"; glow.style.top = gy + "px";
      requestAnimationFrame(glowLoop);
    }
  }

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  copyBtn.addEventListener("click", function () {
    var email = "shayaamshaheem24@gmail.com";
    function done(ok) {
      copyBtn.textContent = ok ? "✓ copied" : "✗ copy failed";
      setTimeout(function () { copyBtn.textContent = "⧉ copy email"; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = email; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    }
  });

  /* ============================================================
     INTERACTIVE TERMINAL
     Boot sequence types itself, then hands over a live prompt.
     ============================================================ */
  var termEl = document.getElementById("term");
  var termBox = document.getElementById("termBox");
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var bootLines = [
    { t: "$ whoami", cls: "prompt" },
    { t: "shayaam.shaheem - computer science graduate", cls: "term-out" },
    { t: "$ nmap -sV --identity ./shayaam", cls: "prompt" },
    { t: "Starting recon on target profile ...", cls: "line" },
    { t: "PORT     STATE  SERVICE", cls: "line" },
    { t: "22/cyber open   network-security  [CCNAv7]", cls: "ok" },
    { t: "80/dev   open   software-eng      [python·java]", cls: "ok" },
    { t: "443/lab  open   linux·vmware·kali", cls: "ok" },
    { t: "$ cat ./mission.txt", cls: "prompt" },
    { t: "> breaking into cybersecurity, one packet at a time.", cls: "flag" },
    { t: "type `help` for available commands", cls: "line" }
  ];

  function addLine(text, cls, isHTML) {
    var p = document.createElement("p");
    p.className = "line " + (cls === "prompt" ? "" : (cls || ""));
    if (isHTML) { p.innerHTML = text; }
    else { p.innerHTML = cls === "prompt" ? '<span class="prompt">' + esc(text) + "</span>" : esc(text); }
    if (inputLine && inputLine.parentNode === termEl) termEl.insertBefore(p, inputLine);
    else termEl.appendChild(p);
    return p;
  }

  var inputLine = null, termInput = null;
  function mountPrompt() {
    inputLine = document.createElement("div");
    inputLine.className = "term-input-line";
    inputLine.innerHTML = '<span class="ps1">shayaam@sec:~$</span>';
    termInput = document.createElement("input");
    termInput.id = "term-input";
    termInput.setAttribute("aria-label", "Terminal command input");
    termInput.setAttribute("autocomplete", "off");
    termInput.setAttribute("autocapitalize", "off");
    termInput.setAttribute("spellcheck", "false");
    inputLine.appendChild(termInput);
    termEl.appendChild(inputLine);
    termBox.addEventListener("click", function () { termInput.focus({ preventScroll: true }); });
    var history = [], hIdx = -1;
    termInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var cmd = termInput.value.trim();
        addLine('<span class="prompt">shayaam@sec:~$</span> <span class="term-out">' + esc(termInput.value) + "</span>", "", true);
        if (cmd) { history.unshift(cmd); runCmd(cmd); }
        hIdx = -1;
        termInput.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hIdx < history.length - 1) { hIdx++; termInput.value = history[hIdx]; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hIdx > 0) { hIdx--; termInput.value = history[hIdx]; }
        else { hIdx = -1; termInput.value = ""; }
      }
    });
  }

  var commands = {
    help: function () {
      addLine("available commands:", "line");
      addLine("  whoami      - who is this guy", "term-out");
      addLine("  skills      - capability matrix", "term-out");
      addLine("  projects    - things I've built", "term-out");
      addLine("  certs       - verified credentials", "term-out");
      addLine("  contact     - establish connection", "term-out");
      addLine("  nmap        - re-run the recon scan", "term-out");
      addLine("  theme       - toggle dark/light", "term-out");
      addLine("  clear       - clear the terminal", "term-out");
    },
    whoami: function () {
      addLine("shayaam.shaheem - CS graduate @ Maldives National University", "term-out");
      addLine("focus: cybersecurity · networking · CCNA-certified", "ok");
    },
    skills: function () {
      addLine("net/sec : CCNAv7, routing & switching, subnetting, packet tracer", "term-out");
      addLine("code    : python, java, c++, sql, r, php, html/css", "term-out");
      addLine("systems : linux (ubuntu/kali), windows, vmware, git", "term-out");
      addLine("embedded: arduino, sensors, microcontrollers", "term-out");
    },
    projects: function () {
      addLine('[1] nids-xai - ML intrusion detection + SHAP/LIME explanations (FYP)  <a href="https://github.com/LostSSSS/FYP" target="_blank" rel="noopener">src</a>', "term-out", true);
      addLine('[2] port-scanner - multithreaded TCP scanner + banner grabbing  <a href="https://github.com/LostSSSS/Port-Scanner" target="_blank" rel="noopener">src</a>', "term-out", true);
      addLine('[3] facial-recognition - opencv + dlib + svm pipeline  <a href="https://github.com/LostSSSS/Facial_recognition_project" target="_blank" rel="noopener">src</a>', "term-out", true);
      addLine('[4] supermarket-sim - java queue simulation  <a href="https://github.com/LostSSSS/SupermarketSimulation" target="_blank" rel="noopener">src</a>', "term-out", true);
      addLine('[5] crossword - java CLI puzzle game  <a href="https://github.com/LostSSSS/CrosswordPuzzle" target="_blank" rel="noopener">src</a>', "term-out", true);
      addLine('[6] login-system - php + mysql auth  <a href="https://github.com/LostSSSS/Login-page-with-a-portfolio" target="_blank" rel="noopener">src</a>', "term-out", true);
    },
    certs: function () {
      addLine("✓ CCNAv7: Introduction to Networks - Cisco (2024)", "ok");
      addLine("✓ Edexcel International A-Level - Bio & Math (2022)", "ok");
      addLine("✓ Cambridge O-Level & IGCSE (2019)", "ok");
      addLine("✓ Maldives HSC & SSC (2019-2022)", "ok");
    },
    contact: function () {
      addLine('email : <a href="mailto:shayaamshaheem24@gmail.com">shayaamshaheem24@gmail.com</a>', "term-out", true);
      addLine('github: <a href="https://github.com/LostSSSS" target="_blank" rel="noopener">github.com/LostSSSS</a>', "term-out", true);
      addLine("status: ● open to work", "ok");
    },
    nmap: function () { rerunScan(); },
    theme: function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      addLine("theme -> " + root.getAttribute("data-theme"), "ok");
    },
    clear: function () {
      termEl.querySelectorAll(".line").forEach(function (n) { n.remove(); });
    },
    ls: function () { addLine("about/  capabilities/  projects/  certs/  education/  contact/", "term-out"); },
    sudo: function () { addLine("nice try. permission denied - this box is hardened. ☺", "err"); },
    exit: function () { addLine("there is no escape. try `projects` instead.", "flag"); }
  };
  function runCmd(raw) {
    var parts = raw.split(/\s+/);
    var name = parts[0].toLowerCase();
    if (commands[name]) { commands[name](parts.slice(1)); }
    else if (name === "cd") { addLine("this shell only goes deeper. try `ls`.", "flag"); }
    else { addLine("command not found: " + name + " - try `help`", "err"); }
    termEl.scrollTop = termEl.scrollHeight;
  }
  function rerunScan() {
    var scan = bootLines.slice(3, 8);
    var i = 0;
    (function next() {
      if (i >= scan.length) return;
      addLine(scan[i].t, scan[i].cls);
      i++;
      if (reduce) next(); else setTimeout(next, 160);
    })();
  }

  function bootInstant() {
    bootLines.forEach(function (l) { addLine(l.t, l.cls); });
    mountPrompt();
  }
  if (reduce) {
    bootInstant();
  } else {
    var li = 0, ci = 0, cur = null;
    (function type() {
      if (li >= bootLines.length) { mountPrompt(); return; }
      var l = bootLines[li];
      if (ci === 0) {
        cur = document.createElement("p");
        cur.className = "line " + (l.cls === "prompt" ? "" : l.cls);
        termEl.appendChild(cur);
      }
      if (ci <= l.t.length) {
        var txt = l.t.slice(0, ci);
        cur.innerHTML = l.cls === "prompt" ? '<span class="prompt">' + esc(txt) + "</span>" : esc(txt);
        ci++;
        setTimeout(type, l.cls === "prompt" ? 30 : 10);
      } else {
        li++; ci = 0;
        setTimeout(type, 220);
      }
    })();
  }

  /* ---------- role rotator ---------- */
  var roleEl = document.getElementById("role");
  var roles = [
    "aspiring cybersecurity specialist",
    "network engineer in training",
    "security-minded developer",
    "CCNA-certified · Linux native"
  ];
  var ri = 0, rc = 0, deleting = false;
  function roleStep() {
    var word = roles[ri];
    if (!deleting) {
      rc++;
      if (rc > word.length) { deleting = true; setTimeout(roleStep, 1600); return; }
    } else {
      rc--;
      if (rc === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    roleEl.textContent = word.slice(0, rc);
    setTimeout(roleStep, deleting ? 34 : 62);
  }
  if (reduce) { roleEl.textContent = roles[0]; } else { setTimeout(roleStep, 2400); }

  /* ---------- background node network (parallax-aware) ---------- */
  var canvas = document.getElementById("bg-canvas");
  var ctx = canvas.getContext("2d");
  var W, H, nodes, raf, dpr;
  function accentColor() {
    return getComputedStyle(root).getPropertyValue("--accent").trim() || "#43e0c4";
  }
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    var count = Math.min(64, Math.floor(window.innerWidth / 22));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28 * dpr,
        vy: (Math.random() - 0.5) * 0.28 * dpr,
        r: (Math.random() * 1.4 + 0.6) * dpr
      });
    }
  }
  var pointer = { x: -9999, y: -9999 };
  if (finePointer) {
    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX * (dpr || 1); pointer.y = e.clientY * (dpr || 1);
    }, { passive: true });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var rgb = hexToRgb(accentColor());
    var link = 130 * dpr;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      // gentle attraction toward the pointer
      var pdx = pointer.x - a.x, pdy = pointer.y - a.y;
      var pd = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pd < 220 * dpr && pd > 1) { a.x += pdx / pd * 0.18 * dpr; a.y += pdy / pd * 0.18 * dpr; }
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) {
          ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (0.14 * (1 - d / link)) + ")";
          ctx.lineWidth = dpr * 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.55)";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  if (!reduce) {
    resize(); draw();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(function () { cancelAnimationFrame(raf); resize(); draw(); }, 200);
    });
  } else {
    resize();
    var rgb = hexToRgb(accentColor());
    ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.4)";
    nodes.forEach(function (n) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill(); });
  }
})();
