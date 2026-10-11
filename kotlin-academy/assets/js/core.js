/* =========================================================================
   Kotlin Academy — core runtime
   Shared layout (header, sidebar, pager, footer), full-text search, theme,
   scrollspy, tabs, syntax highlighter, runnable Kotlin Playground blocks,
   quizzes and lesson progress tracking. No build step, no dependencies.
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------------------------------------ Site map */
  const SITE = [
    { id: "setup", file: "setup.html", num: "01", group: "Getting Started", level: "Beginner", minutes: 60,
      title: "Toolkit & Environment Setup", short: "Toolkit & Environment", icon: "🧰", accent: "#3ddc84",
      desc: "Install the JDK, IntelliJ IDEA, Android Studio, the Android SDK, an emulator and a real device." },
    { id: "hello", file: "hello.html", num: "02", group: "Getting Started", level: "Beginner", minutes: 30,
      title: "Hello, Kotlin!", short: "Hello, Kotlin!", icon: "👋", accent: "#a98bff",
      desc: "Your first program, how Kotlin code is compiled and run, and four ways to run it." },
    { id: "basics", file: "basics.html", num: "03", group: "Kotlin Fundamentals", level: "Beginner", minutes: 45,
      title: "Variables, Types & Operators", short: "Variables & Types", icon: "🔤", accent: "#6cb8ff",
      desc: "val vs var, type inference, numbers, strings and templates, conversions and operators." },
    { id: "control-flow", file: "control-flow.html", num: "04", group: "Kotlin Fundamentals", level: "Beginner", minutes: 40,
      title: "Control Flow", short: "Control Flow", icon: "🔀", accent: "#6cb8ff",
      desc: "if and when as expressions, for/while loops, ranges, progressions and labels." },
    { id: "functions", file: "functions.html", num: "05", group: "Kotlin Fundamentals", level: "Beginner", minutes: 45,
      title: "Functions", short: "Functions", icon: "🧮", accent: "#6cb8ff",
      desc: "Parameters, default & named arguments, single-expression, vararg, infix, local and tail-recursive functions." },
    { id: "null-safety", file: "null-safety.html", num: "06", group: "Kotlin Fundamentals", level: "Beginner", minutes: 40,
      title: "Null Safety", short: "Null Safety", icon: "🛡️", accent: "#6cb8ff",
      desc: "Nullable types, ?. and ?:, smart casts, !!, lateinit and lazy — say goodbye to NullPointerException." },
    { id: "collections", file: "collections.html", num: "07", group: "Kotlin Fundamentals", level: "Beginner", minutes: 60,
      title: "Collections", short: "Collections", icon: "📚", accent: "#6cb8ff",
      desc: "List, Set, Map, arrays, the collection operations toolbox and lazy sequences." },
    { id: "classes", file: "classes.html", num: "08", group: "Object-Oriented & Functional", level: "Intermediate", minutes: 60,
      title: "Classes, Objects & Interfaces", short: "Classes & Interfaces", icon: "🏛️", accent: "#e05fd4",
      desc: "Constructors, properties, visibility, inheritance, abstract classes and interfaces." },
    { id: "special-classes", file: "special-classes.html", num: "09", group: "Object-Oriented & Functional", level: "Intermediate", minutes: 50,
      title: "Data, Enum, Sealed & Object", short: "Special Classes", icon: "💎", accent: "#e05fd4",
      desc: "data classes, enum classes, sealed hierarchies, object & companion, value classes." },
    { id: "functional", file: "functional.html", num: "10", group: "Object-Oriented & Functional", level: "Intermediate", minutes: 60,
      title: "Lambdas, Extensions & Scope Functions", short: "Functional Kotlin", icon: "λ", accent: "#e05fd4",
      desc: "Function types, higher-order functions, extensions, let/run/with/apply/also and inline functions." },
    { id: "generics", file: "generics.html", num: "11", group: "Object-Oriented & Functional", level: "Intermediate", minutes: 45,
      title: "Generics", short: "Generics", icon: "🧬", accent: "#e05fd4",
      desc: "Type parameters, constraints, variance (in/out), star projection and reified types." },
    { id: "idioms", file: "idioms.html", num: "12", group: "Object-Oriented & Functional", level: "Intermediate", minutes: 50,
      title: "Errors, Delegation & Idioms", short: "Errors & Idioms", icon: "✨", accent: "#e05fd4",
      desc: "Exceptions, Result, require/check, delegation with by, property delegates, operator overloading." },
    { id: "coroutines", file: "coroutines.html", num: "13", group: "Advanced Kotlin", level: "Advanced", minutes: 75,
      title: "Coroutines", short: "Coroutines", icon: "⚡", accent: "#ff8a4c",
      desc: "suspend, launch/async, structured concurrency, dispatchers, cancellation and exception handling." },
    { id: "flow", file: "flow.html", num: "14", group: "Advanced Kotlin", level: "Advanced", minutes: 60,
      title: "Flow, StateFlow & Channels", short: "Flow & StateFlow", icon: "🌊", accent: "#ff8a4c",
      desc: "Cold flows, operators, StateFlow, SharedFlow, channels and context preservation." },
    { id: "advanced", file: "advanced.html", num: "15", group: "Advanced Kotlin", level: "Master", minutes: 60,
      title: "DSLs, Testing & Multiplatform", short: "DSLs, Testing & KMP", icon: "🎓", accent: "#ff8a4c",
      desc: "Type-safe builders, annotations & reflection, testing with kotlin.test/MockK/Turbine, Kotlin Multiplatform." },
    { id: "android-basics", file: "android-basics.html", num: "16", group: "Android with Kotlin", level: "Intermediate", minutes: 60,
      title: "Android App Fundamentals", short: "Android Fundamentals", icon: "🤖", accent: "#3ddc84",
      desc: "Project anatomy, Gradle Kotlin DSL & version catalogs, the manifest, Activity lifecycle, resources and intents." },
    { id: "compose", file: "compose.html", num: "17", group: "Android with Kotlin", level: "Intermediate", minutes: 75,
      title: "Jetpack Compose UI", short: "Jetpack Compose", icon: "🎨", accent: "#3ddc84",
      desc: "Composables, state & recomposition, modifiers, layouts, lists, Material 3 theming and previews." },
    { id: "architecture", file: "architecture.html", num: "18", group: "Android with Kotlin", level: "Advanced", minutes: 70,
      title: "App Architecture: MVVM, Hilt & Navigation", short: "App Architecture", icon: "🏗️", accent: "#3ddc84",
      desc: "Layers, ViewModel, unidirectional data flow, repositories, Hilt dependency injection and type-safe navigation." },
    { id: "data", file: "data.html", num: "19", group: "Android with Kotlin", level: "Advanced", minutes: 70,
      title: "Data, Networking & Background Work", short: "Data & Networking", icon: "🗄️", accent: "#3ddc84",
      desc: "Room, DataStore, Retrofit + kotlinx.serialization, offline-first repositories and WorkManager." },
    { id: "release", file: "release.html", num: "20", group: "Android with Kotlin", level: "Master", minutes: 50,
      title: "Testing, Debugging & Publishing", short: "Test, Debug & Ship", icon: "🚀", accent: "#3ddc84",
      desc: "Unit & UI tests, Logcat, the debugger and profiler, R8, signing, App Bundles and Google Play." },
    { id: "final-project", file: "final-project.html", num: "21", group: "Final Project", level: "Master", minutes: 360,
      title: "Final Project: TaskFlow — a complete Android app", short: "Final Project: TaskFlow", icon: "🏁", accent: "#ffcb6b",
      desc: "Build a production-style task manager with Compose, MVVM, Hilt, Room, DataStore, Retrofit, WorkManager and tests." },
    { id: "cheatsheet", file: "cheatsheet.html", num: "A", group: "Reference", level: "All", minutes: 15,
      title: "Kotlin Cheat Sheet & Mastery Checklist", short: "Cheat Sheet", icon: "📋", accent: "#9a98a8",
      desc: "Syntax at a glance, Java → Kotlin translations and the checklist to call yourself a Kotlin master." },
  ];
  const LESSONS = SITE.filter((p) => p.group !== "Reference");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const pageId = document.body.dataset.page || "home";
  const currentPage = SITE.find((p) => p.id === pageId);

  /* ------------------------------------------------------- Storage */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const doneSet = () => new Set(store.get("ka-done", []));
  function setDone(id, on) {
    const s = doneSet();
    on ? s.add(id) : s.delete(id);
    store.set("ka-done", Array.from(s));
    document.dispatchEvent(new CustomEvent("ka:progress"));
  }

  const ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const LOGO = '<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="kg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e44857"/><stop offset=".5" stop-color="#c711e1"/><stop offset="1" stop-color="#7f52ff"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#16151c"/><path d="M12 12h40L32 32l20 20H12z" fill="url(#kg)"/></svg>';

  /* --------------------------------------------------------------- Header */
  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const links = LESSONS.map((p) => `<a href="${p.file}"><span class="dm-num">${p.num}</span><span><b>${esc(p.short)}</b><i>${esc(p.desc)}</i></span></a>`).join("");
    const nav = (id, label, file) => `<a href="${file}" class="${pageId === id ? "active" : ""}">${label}</a>`;
    host.outerHTML = `
      <header class="site-header">
        <button class="icon-btn menu-btn" id="menu-btn" aria-label="Open table of contents" aria-expanded="false">☰</button>
        <a class="brand" href="index.html" aria-label="Kotlin Academy home">${LOGO}<span>Kotlin Academy<small>Zero → Master</small></span></a>
        <nav class="main-nav" aria-label="Main navigation">
          ${nav("home", "Home", "index.html")}
          <div class="nav-drop ${currentPage && currentPage.group !== "Reference" ? "active" : ""}">
            <button aria-haspopup="true">Lessons ▾</button>
            <div class="nav-drop-menu">${links}</div>
          </div>
          ${nav("setup", "Setup", "setup.html")}
          ${nav("compose", "Compose", "compose.html")}
          ${nav("final-project", "Final Project", "final-project.html")}
          ${nav("cheatsheet", "Cheat Sheet", "cheatsheet.html")}
        </nav>
        <div class="header-spacer"></div>
        <div class="global-search" role="search">
          <span class="s-icon">${ICON_SEARCH}</span>
          <input id="gs-input" type="search" placeholder="Search lessons…" autocomplete="off" aria-label="Search the site">
          <kbd>Ctrl K</kbd>
          <div class="search-results" id="gs-results" role="listbox"></div>
        </div>
        <button class="icon-btn" id="theme-btn" type="button"></button>
      </header>`;
    const mb = $("#menu-btn"), sb = $("#sidebar");
    if (!sb) { mb.style.visibility = "hidden"; return; }
    mb.addEventListener("click", () => {
      const open = sb.classList.toggle("open");
      mb.setAttribute("aria-expanded", String(open));
    });
    sb.addEventListener("click", (e) => { if (e.target.closest("a")) sb.classList.remove("open"); });
  }

  /* ---------------------------------------------------------------- Theme */
  function initTheme() {
    const btn = $("#theme-btn");
    if (!btn) return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const effective = () => root.getAttribute("data-theme") || (media.matches ? "light" : "dark");
    const paint = () => {
      const light = effective() === "light";
      btn.textContent = light ? "🌙" : "☀️";
      btn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      btn.title = btn.getAttribute("aria-label");
    };
    btn.addEventListener("click", () => {
      const next = effective() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ka-theme", next); } catch (e) { /* storage unavailable */ }
      paint();
    });
    media.addEventListener("change", paint);
    paint();
  }

  /* -------------------------------------------------------- Global search */
  /* The index is built by fetching every page and reading its sections, so
     search covers the full text without a hand-maintained keyword list. Over
     file:// fetch is blocked; we then fall back to page titles only. */
  function sectionsOf(doc, page) {
    return $$("section.doc-section[id]", doc).map((s) => {
      const h = $("h2", s);
      const title = s.dataset.title || (h ? h.textContent.replace(/^\s*[\d.]+\s*/, "") : s.id);
      // Join text nodes with spaces so words from adjacent elements don't run together.
      const walker = doc.createTreeWalker(s, NodeFilter.SHOW_TEXT);
      const parts = [];
      while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
      const text = parts.join(" ").replace(/\s+/g, " ");
      return { title, sub: page.short, page: page.num, href: `${page.file}#${s.id}`, text };
    });
  }
  let indexPromise = null;
  function loadIndex() {
    if (indexPromise) return indexPromise;
    const base = SITE.map((p) => ({ title: p.title, sub: p.desc, page: p.num === "A" ? "Ref" : "Lesson " + p.num, href: p.file, text: p.desc }));
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem("ka-index-v2") || "null"); } catch (e) { /* ignore */ }
    if (cached) return (indexPromise = Promise.resolve(base.concat(cached)));
    indexPromise = Promise.all(SITE.map((p) =>
      fetch(p.file).then((r) => (r.ok ? r.text() : "")).then((html) => sectionsOf(new DOMParser().parseFromString(html, "text/html"), p)).catch(() => [])
    )).then((lists) => {
      const all = [].concat(...lists);
      try { sessionStorage.setItem("ka-index-v2", JSON.stringify(all)); } catch (e) { /* quota */ }
      return base.concat(all);
    }).catch(() => base);
    return indexPromise;
  }
  function hilite(text, q) {
    const n = norm(text), i = q ? n.indexOf(q) : -1;
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }
  function snippet(text, q) {
    const n = norm(text), i = n.indexOf(q);
    if (i < 0) return "";
    const s = Math.max(0, i - 50);
    return (s > 0 ? "…" : "") + text.slice(s, i + q.length + 70) + "…";
  }
  function initGlobalSearch() {
    const input = $("#gs-input"), box = $("#gs-results");
    if (!input) return;
    let sel = -1;
    const run = () => {
      const raw = input.value.trim(), q = norm(raw);
      if (!q) { box.classList.remove("open"); return; }
      loadIndex().then((index) => {
        if (input.value.trim() !== raw) return;
        const terms = q.split(/\s+/);
        const scored = index.map((e) => {
          const t = norm(e.title), body = norm(e.text);
          if (!terms.every((w) => t.includes(w) || body.includes(w))) return null;
          const score = terms.reduce((a, w) => a + (t.includes(w) ? 10 : 0) + (t.startsWith(w) ? 5 : 0), 0);
          return { e, score };
        }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 14);
        sel = -1;
        box.innerHTML = scored.length
          ? scored.map(({ e }) => {
              const snip = norm(e.title).includes(terms[0]) ? e.sub : snippet(e.text, terms[0]) || e.sub;
              return `<a href="${e.href}" role="option"><span class="sr-page">${esc(e.page)}</span><br><b>${hilite(e.title, terms[0])}</b><small>${hilite(snip, terms[0])}</small></a>`;
            }).join("")
          : `<div class="sr-empty">No results for “${esc(raw)}”.</div>`;
        box.classList.add("open");
      });
    };
    input.addEventListener("input", run);
    input.addEventListener("focus", () => { loadIndex(); if (input.value) run(); });
    input.addEventListener("keydown", (e) => {
      const items = $$("a", box);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("sel", i === sel));
        items[sel].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        const t = items[sel >= 0 ? sel : 0];
        if (t) location.href = t.getAttribute("href");
      } else if (e.key === "Escape") {
        box.classList.remove("open"); input.blur();
      }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".global-search")) box.classList.remove("open"); });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.focus(); input.select(); }
      else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
  }

  /* --------------------------------------------------------------- Sidebar */
  function renderSidebar() {
    const host = $("#sidebar");
    if (!host) return;
    const done = doneSet();
    const groups = {};
    SITE.forEach((p) => (groups[p.group] = groups[p.group] || []).push(p));
    const sections = $$("section.doc-section[id]").map((s) => {
      const h = $("h2", s);
      return [s.id, s.dataset.title || (h ? h.textContent : s.id)];
    });
    let html = `
      <div class="sb-progress" title="Lessons you marked complete">
        <div class="sb-progress-label"><span>Course progress</span><span id="sb-course">0%</span></div>
        <div class="sb-progress-bar"><div id="sb-course-bar"></div></div>
      </div>
      <div class="sb-progress">
        <div class="sb-progress-label"><span>This page</span><span id="sb-pct">0%</span></div>
        <div class="sb-progress-bar"><div id="sb-bar"></div></div>
      </div>
      <nav aria-label="Table of contents">`;
    Object.entries(groups).forEach(([g, pages]) => {
      html += `<div class="sb-group"><div class="sb-group-title">${esc(g)}</div>`;
      pages.forEach((p) => {
        const cur = p.id === pageId;
        html += `<a class="sb-page ${cur ? "current" : ""}" href="${p.file}" ${cur ? 'aria-current="page"' : ""}><span class="sb-num">${p.num}</span><span>${esc(p.short)}</span>${done.has(p.id) ? '<span class="sb-done" title="Completed">✓</span>' : ""}</a>`;
        if (cur && sections.length) {
          html += `<ul class="sb-sections">${sections.map(([id, t]) => `<li><a href="#${id}" data-sec="${id}">${esc(t)}</a></li>`).join("")}</ul>`;
        }
      });
      html += `</div>`;
    });
    host.innerHTML = html + "</nav>";
    paintCourseProgress();
    const cur = $(".sb-page.current", host);
    if (cur) setTimeout(() => cur.scrollIntoView({ block: "center" }), 0);
  }
  function paintCourseProgress() {
    const done = doneSet();
    const n = LESSONS.filter((p) => done.has(p.id)).length;
    const pct = Math.round((n / LESSONS.length) * 100);
    $$("#sb-course, #hp-pct").forEach((el) => (el.textContent = `${pct}%`));
    $$("#sb-course-bar, #hp-bar").forEach((el) => (el.style.width = pct + "%"));
    const c = $("#hp-count");
    if (c) c.textContent = `${n} of ${LESSONS.length} lessons completed`;
  }

  /* ---------------------------------------------- Scrollspy & progress */
  function initScrollspy() {
    const secs = $$("section.doc-section[id]");
    const links = $$(".sb-sections a");
    const bar = $("#sb-bar"), pct = $("#sb-pct"), top = $(".to-top");
    const onScroll = () => {
      const y = window.scrollY + 140;
      let active = secs[0];
      secs.forEach((s) => { if (s.offsetTop <= y) active = s; });
      links.forEach((a) => a.classList.toggle("active", active && a.dataset.sec === active.id));
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 100;
      if (bar) bar.style.width = p + "%";
      if (pct) pct.textContent = p + "%";
      if (top) top.classList.toggle("show", window.scrollY > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function decorateSections() {
    $$("section.doc-section[id] .sec-head h2").forEach((h) => {
      const id = h.closest("section").id;
      if (!$(".anchor", h)) h.insertAdjacentHTML("beforeend", `<a class="anchor" href="#${id}" aria-label="Link to this section">#</a>`);
    });
  }

  /* --------------------------------------------- Lesson completion & pager */
  function renderPager() {
    const host = $("#pager");
    if (!host || !currentPage) return;
    const i = SITE.indexOf(currentPage);
    const prev = SITE[i - 1], next = SITE[i + 1];
    const isLesson = currentPage.group !== "Reference";
    host.innerHTML = `
      ${isLesson ? `<div class="lesson-done"><p><b>Finished this lesson?</b><br><span class="muted small">Your progress is saved in this browser only.</span></p><button class="btn" id="done-btn" type="button"></button></div>` : ""}
      <div class="pager">
        ${prev ? `<a class="prev" href="${prev.file}"><small>← Previous · ${prev.num}</small><b>${esc(prev.short)}</b></a>` : "<span></span>"}
        ${next ? `<a class="next" href="${next.file}"><small>Next · ${next.num} →</small><b>${esc(next.short)}</b></a>` : ""}
      </div>`;
    const btn = $("#done-btn");
    if (!btn) return;
    const paint = () => {
      const on = doneSet().has(pageId);
      btn.className = on ? "btn done" : "btn primary";
      btn.textContent = on ? "✓ Completed — undo" : "Mark lesson complete";
    };
    btn.addEventListener("click", () => { setDone(pageId, !doneSet().has(pageId)); paint(); renderSidebar(); initScrollspy(); });
    paint();
  }

  /* --------------------------------------------------------------- Footer */
  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.outerHTML = `
      <footer class="site-footer"><div class="f-inner">
        <div><b style="color:var(--text)">Kotlin Academy</b><br>Learn Kotlin from zero to master — and ship a real Android app.</div>
        <div class="f-links">
          <a href="https://kotlinlang.org/docs/home.html" target="_blank" rel="noopener">Kotlin docs ↗</a>
          <a href="https://developer.android.com/kotlin" target="_blank" rel="noopener">Android Kotlin ↗</a>
          <a href="https://developer.android.com/develop/ui/compose" target="_blank" rel="noopener">Jetpack Compose ↗</a>
          <a href="https://play.kotlinlang.org/" target="_blank" rel="noopener">Kotlin Playground ↗</a>
          <a href="cheatsheet.html">Cheat sheet</a>
        </div>
      </div></footer>
      <button class="icon-btn to-top" type="button" aria-label="Back to top" onclick="window.scrollTo({top:0})">↑</button>`;
  }

  /* ----------------------------------------------------------------- Tabs */
  /* <div class="tabs" data-group="os"><div class="tab-list"><button data-tab="win">…</button></div>
     <div class="tab-panel" data-panel="win">…</div></div>. Tabs sharing a data-group switch together. */
  function initTabs(root = document) {
    $$(".tabs", root).forEach((tabs) => {
      const list = $(".tab-list", tabs);
      const btns = $$(":scope > .tab-list > button", tabs);
      const panels = $$(":scope > .tab-panel", tabs);
      list.setAttribute("role", "tablist");
      const select = (key, fromGroup) => {
        if (!btns.some((b) => b.dataset.tab === key)) return;
        btns.forEach((b) => { const on = b.dataset.tab === key; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
        panels.forEach((p) => (p.hidden = p.dataset.panel !== key));
        if (!fromGroup && tabs.dataset.group) {
          store.set("ka-tab-" + tabs.dataset.group, key);
          $$(`.tabs[data-group="${tabs.dataset.group}"]`).forEach((t) => t !== tabs && t._select && t._select(key, true));
        }
      };
      tabs._select = select;
      btns.forEach((b) => {
        b.setAttribute("role", "tab");
        b.type = "button";
        b.addEventListener("click", () => select(b.dataset.tab));
        b.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const i = btns.indexOf(b), n = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
          select(n.dataset.tab); n.focus();
        });
      });
      let initial = btns[0] && btns[0].dataset.tab;
      if (tabs.dataset.group) {
        const saved = store.get("ka-tab-" + tabs.dataset.group, null);
        if (saved && btns.some((b) => b.dataset.tab === saved)) initial = saved;
        else if (tabs.dataset.group === "os") {
          const ua = navigator.userAgent;
          const guess = /Mac/.test(ua) ? "mac" : /Linux/.test(ua) && !/Android/.test(ua) ? "linux" : "win";
          if (btns.some((b) => b.dataset.tab === guess)) initial = guess;
        }
      }
      if (initial) select(initial, true);
    });
  }

  /* ---------------------------------------------------------- Highlighter */
  const KT_KW = new Set(("as as? break class continue do else false for fun if in !in interface is !is null object package return super this throw true try typealias typeof val var when while " +
    "by catch constructor delegate dynamic field file finally get import init param property receiver set setparam value where " +
    "abstract actual annotation companion const crossinline data enum expect external final infix inline inner internal lateinit noinline open operator out override private protected public reified sealed suspend tailrec vararg it").split(" "));
  const LANG_NAMES = { kotlin: "Kotlin", kts: "Gradle KTS", java: "Java", xml: "XML", bash: "Shell", shell: "Shell", powershell: "PowerShell", toml: "TOML", json: "JSON", properties: "Properties", text: "Text", proguard: "ProGuard", groovy: "Groovy" };
  const JAVA_KW = new Set("abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while var record null true false".split(" "));

  function tokenize(code, lang) {
    const out = [];
    const push = (cls, t) => out.push([cls, t]);
    if (lang === "xml") {
      const re = /(<!--[\s\S]*?-->)|(<\/?[\w:.-]+)|(\s[\w:.-]+)(=)|("[^"]*")|(\/?>)|([^<"]+|.)/g;
      let m;
      while ((m = re.exec(code))) {
        if (m[1]) push("com", m[1]);
        else if (m[2]) push("tag", m[2]);
        else if (m[3]) { push("attr", m[3]); push("", m[4]); }
        else if (m[5]) push("str", m[5]);
        else if (m[6]) push("tag", m[6]);
        else push("", m[7]);
      }
      return out;
    }
    if (lang === "bash" || lang === "shell" || lang === "powershell") {
      code.split("\n").forEach((line, li) => {
        if (li) push("", "\n");
        const pm = line.match(/^(\s*(?:\$|PS>|>|#)\s)(.*)$/);
        let rest = line;
        if (pm && !/^\s*#\s/.test(line)) { push("prompt", pm[1]); rest = pm[2]; }
        const re = /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\s--?[\w-]+)|(\$\{?\w+\}?|%\w+%|\$env:\w+)|([^#"'$%\s-]+|\s+|.)/g;
        let m;
        while ((m = re.exec(rest))) {
          if (m[1]) push("com", m[1]);
          else if (m[2]) push("str", m[2]);
          else if (m[3]) push("attr", m[3]);
          else if (m[4]) push("tmpl", m[4]);
          else push("", m[5]);
        }
      });
      return out;
    }
    if (lang === "toml" || lang === "properties") {
      const re = /(#.*$)|(^\s*\[[^\]]*\])|("(?:[^"\\]|\\.)*")|(^\s*[\w.-]+(?=\s*=))|(\b\d[\w.]*\b|\btrue\b|\bfalse\b)|([\s\S])/gm;
      let m;
      while ((m = re.exec(code))) {
        if (m[1]) push("com", m[1]);
        else if (m[2]) push("kw", m[2]);
        else if (m[3]) push("str", m[3]);
        else if (m[4]) push("attr", m[4]);
        else if (m[5]) push("num", m[5]);
        else push("", m[6]);
      }
      return out;
    }
    if (lang === "json") {
      const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d[\d.eE+-]*\b|\btrue\b|\bfalse\b|\bnull\b)|([\s\S])/g;
      let m;
      while ((m = re.exec(code))) {
        if (m[1]) { push(m[2] ? "attr" : "str", m[1]); if (m[2]) push("", m[2]); }
        else if (m[3]) push("num", m[3]);
        else push("", m[4]);
      }
      return out;
    }
    if (lang === "text") { push("", code); return out; }
    // Kotlin / KTS / Java / Groovy / ProGuard (C-like)
    const kw = lang === "java" ? JAVA_KW : KT_KW;
    const re = /(\/\*[\s\S]*?\*\/|\/\/.*$)|("""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@[\w.]+)|(\b0[xX][\da-fA-F_]+[uUL]*\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?[fFLuU]*\b)|(`[^`]+`|[A-Za-z_][\w]*)|(\s+)|([\s\S])/gm;
    let m, prevWord = "";
    while ((m = re.exec(code))) {
      if (m[1]) push("com", m[1]);
      else if (m[2]) {
        if (lang !== "java" && m[2][0] === '"') pushTemplate(out, m[2]);
        else push("str", m[2]);
      } else if (m[3]) push("ann", m[3]);
      else if (m[4]) push("num", m[4]);
      else if (m[5]) {
        const w = m[5];
        const after = code.slice(re.lastIndex).match(/^\s*(\(|<[\w<>, ?*.]*>\s*\()/);
        if (kw.has(w)) push("kw", w);
        else if (prevWord === "fun" || (after && /^[a-z_]/.test(w))) push("fn", w);
        else if (/^[A-Z][A-Za-z0-9_]*$/.test(w) && /[a-z]/.test(w)) push("type", w);
        else push("", w);
        prevWord = w;
        continue;
      } else if (m[6]) { push("", m[6]); continue; }
      else push("", m[7]);
      prevWord = "";
    }
    return out;
  }
  /* "Hello, $name and ${user.age}" -> string pieces + template pieces */
  function pushTemplate(out, s) {
    const re = /(\$\{[^}]*\}|\$[A-Za-z_]\w*)|([^$]+|\$)/g;
    let m;
    while ((m = re.exec(s))) out.push(m[1] ? ["tmpl", m[1]] : ["str", m[2]]);
  }
  function toLines(tokens) {
    const lines = [[]];
    tokens.forEach(([cls, t]) => {
      t.split("\n").forEach((part, i) => {
        if (i) lines.push([]);
        if (part) lines[lines.length - 1].push(cls ? `<span class="tk-${cls}">${esc(part)}</span>` : esc(part));
      });
    });
    return lines.map((l) => l.join(""));
  }
  function dedent(src) {
    const lines = src.replace(/^\s*\n/, "").replace(/\s+$/, "").split("\n");
    const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => l.slice(ind)).join("\n");
  }
  /* Line markers: "//+" add, "//-" del, "//!" highlight — at the end of a line, stripped from output. */
  function parseMarks(code) {
    const marks = {};
    const clean = code.split("\n").map((l, i) => {
      const m = l.match(/\s*\/\/([+\-!])\s*$/) || l.match(/\s*#([+\-!])\s*$/);
      if (m) { marks[i] = { "+": "add", "-": "del", "!": "hl" }[m[1]]; return l.slice(0, m.index); }
      return l;
    }).join("\n");
    return { code: clean, marks };
  }
  function codeBlockHTML({ code, lang, file, marks = {}, numbered, run }) {
    const lines = toLines(tokenize(code, lang));
    const body = lines.map((l, i) => `<span class="ln${marks[i] ? " " + marks[i] : ""}" data-n="${i + 1}">${l}</span>`).join("");
    return `<div class="code-head"><span class="dots"><i></i><i></i><i></i></span>${file ? `<span class="fname">${esc(file)}</span>` : ""}<span class="lang">${esc(LANG_NAMES[lang] || lang)}</span>${run ? `<button class="code-btn run" type="button" data-run title="Run this code in the official Kotlin Playground">▶ Run</button>` : ""}<button class="code-btn" type="button" data-copy>Copy</button></div><pre><code>${body}</code></pre>`;
  }
  /* <script type="text/plain" data-code="kotlin" data-file="Main.kt" data-run data-numbered data-output="…">  */
  function renderCode(root = document) {
    $$('script[type="text/plain"][data-code]', root).forEach((s) => {
      const lang = s.dataset.code || "kotlin";
      const raw = dedent(s.textContent).replace(/<\\\/script>/g, "</script>");
      const { code, marks } = parseMarks(raw);
      const wrap = document.createElement("div");
      const hasOut = s.nextElementSibling && s.nextElementSibling.matches("script[data-output]");
      wrap.className = "code-block" + ("numbered" in s.dataset ? " numbered" : "") + (hasOut ? " has-output" : "");
      wrap._code = code;
      wrap.innerHTML = codeBlockHTML({ code, lang, file: s.dataset.file, marks, run: "run" in s.dataset });
      s.replaceWith(wrap);
    });
    $$("script[data-output]", root).forEach((s) => {
      const d = document.createElement("div");
      d.className = "code-output";
      d.innerHTML = `<div class="oh">▸ ${esc(s.dataset.output || "Output")}</div><pre>${esc(dedent(s.textContent))}</pre>`;
      s.replaceWith(d);
    });
  }
  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    ta.remove();
  }

  /* ---------------------------------------------- Kotlin Playground (Run) */
  /* Loaded lazily from the official JetBrains package the first time a learner
     presses ▶ Run, then the block is swapped for an editable, runnable editor. */
  const PLAYGROUND_SRC = "https://unpkg.com/kotlin-playground@1.34.0/dist/playground.min.js";
  let pgPromise = null;
  function loadPlayground() {
    if (window.KotlinPlayground) return Promise.resolve(window.KotlinPlayground);
    if (pgPromise) return pgPromise;
    pgPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PLAYGROUND_SRC;
      s.async = true;
      s.onload = () => (window.KotlinPlayground ? resolve(window.KotlinPlayground) : reject(new Error("no playground")));
      s.onerror = () => { pgPromise = null; reject(new Error("offline")); };
      document.head.appendChild(s);
    });
    return pgPromise;
  }
  function runBlock(block, btn) {
    btn.disabled = true;
    btn.textContent = "Loading…";
    loadPlayground().then((KP) => {
      const host = document.createElement("div");
      host.className = "playground-host";
      const code = document.createElement("code");
      code.textContent = block._code;
      code.setAttribute("theme", document.documentElement.getAttribute("data-theme") === "light" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: light)").matches) ? "idea" : "darcula");
      code.setAttribute("auto-indent", "true");
      code.setAttribute("match-brackets", "true");
      if (/kotlinx\.coroutines/.test(block._code)) code.setAttribute("data-target-platform", "java");
      host.appendChild(code);
      const out = block.nextElementSibling && block.nextElementSibling.classList.contains("code-output") ? block.nextElementSibling : null;
      block.replaceWith(host);
      if (out) out.remove();
      KP(code, { onChange: () => {} });
    }).catch(() => {
      btn.disabled = false;
      btn.textContent = "Offline — copy instead";
      setTimeout(() => (btn.textContent = "▶ Run"), 2500);
    });
  }
  function wireCodeButtons() {
    document.addEventListener("click", (e) => {
      const copy = e.target.closest("[data-copy]");
      if (copy) {
        const block = copy.closest(".code-block");
        copyText(block._code || $("pre", block).textContent, () => {
          copy.textContent = "Copied ✓"; copy.classList.add("ok");
          setTimeout(() => { copy.textContent = "Copy"; copy.classList.remove("ok"); }, 1600);
        });
        return;
      }
      const run = e.target.closest("[data-run]");
      if (run && run.classList.contains("code-btn")) runBlock(run.closest(".code-block"), run);
    });
  }

  /* ----------------------------------------------------------------- Quiz */
  /* <script type="application/json" data-quiz>[{"q":"…","options":["…"],"answer":1,"explain":"…"}]</script>
     Options/explanations may contain `backticks` for inline code. */
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  function renderQuizzes() {
    $$("script[data-quiz]").forEach((s, qi) => {
      let data;
      try { data = JSON.parse(s.textContent); } catch (e) { console.error("Bad quiz JSON", e); return; }
      const host = document.createElement("div");
      host.className = "quiz";
      const key = `ka-quiz-${pageId}-${qi}`;
      host.innerHTML = data.map((q, i) => `
        <div class="quiz-q" data-i="${i}">
          <h4><span class="qn">Q${i + 1}</span><span>${inline(q.q)}</span></h4>
          ${q.code ? codeBlockHTMLWrapped(q.code) : ""}
          <div class="quiz-opts">${q.options.map((o, j) => `<button type="button" data-j="${j}">${inline(o)}</button>`).join("")}</div>
          <div class="quiz-explain" hidden></div>
        </div>`).join("") + `<div class="quiz-score"><span class="muted">Score</span><b data-score>0 / ${data.length}</b><button class="btn sm" type="button" data-reset>Reset quiz</button></div>`;
      s.replaceWith(host);
      const answers = {};
      const paintScore = () => {
        const right = Object.entries(answers).filter(([i, j]) => data[i].answer === j).length;
        $("[data-score]", host).textContent = `${right} / ${data.length}`;
        store.set(key, answers);
      };
      const choose = (i, j) => {
        const box = $(`.quiz-q[data-i="${i}"]`, host);
        answers[i] = j;
        $$("button", box).forEach((b) => {
          b.disabled = true;
          const bj = +b.dataset.j;
          if (bj === data[i].answer) b.classList.add("right");
          else if (bj === j) b.classList.add("wrong");
        });
        const ex = $(".quiz-explain", box);
        ex.innerHTML = (j === data[i].answer ? "✅ <b>Correct.</b> " : "❌ <b>Not quite.</b> ") + inline(data[i].explain || "");
        ex.hidden = false;
        paintScore();
      };
      host.addEventListener("click", (e) => {
        const b = e.target.closest(".quiz-opts button");
        if (b) choose(+b.closest(".quiz-q").dataset.i, +b.dataset.j);
        if (e.target.closest("[data-reset]")) {
          Object.keys(answers).forEach((k) => delete answers[k]);
          $$(".quiz-opts button", host).forEach((b) => { b.disabled = false; b.className = ""; });
          $$(".quiz-explain", host).forEach((x) => (x.hidden = true));
          paintScore();
        }
      });
      const saved = store.get(key, {});
      Object.entries(saved).forEach(([i, j]) => data[i] && choose(+i, j));
    });
  }
  function codeBlockHTMLWrapped(code) {
    return `<div class="code-block">${codeBlockHTML({ code: dedent(code), lang: "kotlin" })}</div>`;
  }

  /* ------------------------------------------------------------- Landing */
  function renderModuleGrid() {
    const host = $("#module-grid");
    if (!host) return;
    const done = doneSet();
    const groups = {};
    SITE.forEach((p) => (groups[p.group] = groups[p.group] || []).push(p));
    const lvl = { Beginner: "green", Intermediate: "blue", Advanced: "amber", Master: "red", All: "" };
    host.innerHTML = Object.entries(groups).map(([g, pages]) => `
      <div class="mod-group-title"><h3>${esc(g)}</h3></div>
      <div class="grid grid-3">${pages.map((p) => `
        <a class="module-card glass ${done.has(p.id) ? "is-done" : ""}" href="${p.file}" style="--accent:${p.accent}">
          <div class="mc-top"><div class="mc-icon">${p.icon}</div><span class="badge ${lvl[p.level]}">${p.num === "A" ? "Ref" : p.num}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="mc-foot"><span>⏱ ${p.minutes >= 120 ? Math.round(p.minutes / 60) + " h" : p.minutes + " min"}</span><span>· ${esc(p.level)}</span><span class="mc-go">Open →</span></div>
        </a>`).join("")}</div>`).join("");
    const cont = $("#continue-btn");
    if (cont) {
      const next = LESSONS.find((p) => !done.has(p.id));
      if (done.size && next) { cont.href = next.file; cont.textContent = `Continue: ${next.num} ${next.short} →`; }
    }
  }

  /* ------------------------------------------------------------------ Boot */
  function boot() {
    renderHeader();
    renderSidebar();
    renderFooter();
    initTheme();
    initGlobalSearch();
    renderCode();
    wireCodeButtons();
    renderQuizzes();
    initTabs();
    decorateSections();
    renderPager();
    renderModuleGrid();
    paintCourseProgress();
    initScrollspy();
    document.addEventListener("ka:progress", paintCourseProgress);
    if (location.hash) {
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) setTimeout(() => t.scrollIntoView(), 0);
    }
  }

  window.KA = { SITE, LESSONS, esc, $, $$, store, setDone, doneSet };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
