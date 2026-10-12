/* =========================================================================
   Kotlin Academy — step-by-step simulations for advanced topics
   Usage in a page:  <div class="sim" data-sim="coroutine-suspend"></div>
   A simulation = code (with the active line highlighted) + an animated view
   of the program's state + narration + console output, with play/step
   controls. Each spec lists explicit steps so the view is always exact.
   ========================================================================= */
(function () {
  "use strict";
  const KA = window.KA;
  if (!KA) return;
  const { esc, $, $$ } = KA;
  const SIMS = {};

  /* ------------------------------------------------------------ Renderers */
  const R = {
    clock(t, unit = "ms", label = "virtual time") {
      return `<div class="sv-clock"><span>${label}</span><b>t = ${t} ${unit}</b></div>`;
    },
    note(html) { return html ? `<div class="sv-note">${html}</div>` : ""; },
    chips(list) {
      return `<div class="sv-chips">${list.map((c) => `<span class="sv-chip st-${c.status}"><i></i>${esc(c.name)} <small>${esc(c.label || c.status)}</small></span>`).join("")}</div>`;
    },
    /* lanes: [{label, sub, segs:[{from,to,cls,label}], marks:[{t,label,cls}]}] — clipped at time t */
    gantt({ t, tMax, lanes, unit = "ms" }) {
      const pct = (v) => `${(Math.min(v, tMax) / tMax) * 100}%`;
      const rows = lanes.map((ln) => {
        const segs = (ln.segs || []).filter((s) => s.from < t).map((s) => {
          const end = Math.min(s.to, t);
          return `<div class="sv-seg ${s.cls || "seg-run"}" style="left:${pct(s.from)};width:calc(${pct(end)} - ${pct(s.from)})" title="${esc(s.label || "")}"${s.short ? ` data-short="${esc(s.short)}"` : ""}>${esc(s.label || "")}</div>`;
        }).join("");
        const marks = (ln.marks || []).filter((m) => m.t <= t).map((m) =>
          `<div class="sv-mark ${m.cls || ""}" style="left:${pct(m.t)}"><span>${esc(m.label)}</span></div>`).join("");
        return `<div class="lane-label">${esc(ln.label)}${ln.sub ? `<small>${esc(ln.sub)}</small>` : ""}</div>
          <div class="sv-track">${segs}${marks}<div class="sv-cursor" style="left:${pct(t)}"></div></div>`;
      }).join("");
      const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => `<span>${Math.round(tMax * f)}${f === 1 ? " " + unit : ""}</span>`).join("");
      return `<div class="sv-gantt">${rows}<div></div><div class="sv-axis">${ticks}</div></div>`;
    },
    /* nodes: {id: {label, sub, parent, status, sig}} */
    tree(nodes, rootId) {
      const kids = (id) => Object.entries(nodes).filter(([, n]) => n.parent === id).map(([k]) => k);
      const li = (id) => {
        const n = nodes[id];
        const ch = kids(id);
        return `<li><div class="sv-node st-${n.status}">${n.sig ? `<span class="sig">${n.sig}</span>` : ""}<b>${esc(n.label)}</b><small>${esc(n.sub || n.status)}</small></div>${ch.length ? `<ul>${ch.map(li).join("")}</ul>` : ""}</li>`;
      };
      return `<ul class="sv-tree">${li(rootId)}</ul>`;
    },
    /* pools: [{name, sub, threads:[name]}], token: {pool, thread, label}, free: [thread names shown as free] */
    pools(pools, token, free = []) {
      return `<div class="sv-pools">${pools.map((p) => `<div class="sv-pool"><b>${esc(p.name)}<small>${esc(p.sub || "")}</small></b><div class="sv-threads">${p.threads.map((th) => {
        const here = token && token.pool === p.name && token.thread === th;
        const isFree = free.includes(th);
        return `<div class="sv-thread">${esc(th)}${here ? `<span class="tok">${esc(token.label)}</span>` : isFree ? `<span class="tok free">free ✓</span>` : ""}</div>`;
      }).join("")}</div></div>`).join("")}</div>`;
    },
    machine({ labels, active, fields, changed = [], stack, status }) {
      return `<div class="sv-sm">
        <div class="sv-card"><h5>Continuation object (heap)</h5>
          <div class="sv-labels">${labels.map((l, i) => `<span class="${i === active ? "on" : ""}">${esc(l)}</span>`).join("")}</div>
          <dl class="sv-kv" style="margin-top:8px">${fields.map(([k, v]) => `<dt>${esc(k)}</dt><dd class="${changed.includes(k) ? "chg" : ""}">${esc(v)}</dd>`).join("")}</dl>
        </div>
        <div class="sv-card"><h5>Thread call stack</h5>
          <div class="sv-stack">${stack.length ? stack.map((f) => `<div class="sv-frame">${esc(f)}</div>`).join("") : `<div class="sv-empty">(empty — thread free)</div>`}</div>
          <div class="small muted" style="margin-top:8px">${esc(status || "")}</div>
        </div></div>`;
    },
    marble(v, cls = "") {
      const c = typeof v === "number" ? `mc-${(Math.floor(v / 10) || v) % 5 + 1}` : "mc-1";
      return `<span class="sv-marble ${c} ${cls}">${esc(String(v))}</span>`;
    },
    /* rows: [{name, items:[{v, cls}]}] */
    marbles(rows) {
      return `<div class="sv-marbles">${rows.map((r) => `<div class="sv-mrow"><b>${esc(r.name)}</b><div class="sv-mtrack">${r.items.map((i) => R.marble(i.v, i.cls)).join("")}</div></div>`).join("")}</div>`;
    },
    /* producers/consumers: [{name, sub, items:[{v,cls}], on}] hub: {title, sub} */
    broadcast({ producers, hub, consumers }) {
      const box = (b) => `<div class="sv-box ${b.on === false ? "off" : b.on ? "on" : ""}"><b>${esc(b.name)}${b.sub ? `<small>${esc(b.sub)}</small>` : ""}</b><div class="sv-mtrack">${(b.items || []).map((i) => R.marble(i.v, i.cls)).join("")}</div></div>`;
      return `<div class="sv-bc"><div class="sv-col">${producers.map(box).join("") || `<div class="sv-empty">no producer running</div>`}</div>
        <div class="sv-col">${hub ? `<div class="sv-hub">${esc(hub.title)}<small>${esc(hub.sub || "")}</small></div>` : `<div class="sv-arrow">→</div>`}</div>
        <div class="sv-col">${consumers.map(box).join("")}</div></div>`;
    },
    receivers(stack, build, blockedBelow = false) {
      return `<div class="sv-rx"><div class="sv-card"><h5>Implicit receivers (this)</h5><div class="sv-rxstack">${stack.map((s, i) => {
        const top = i === stack.length - 1;
        return `<div class="sv-rxitem ${top ? "top" : blockedBelow ? "blocked" : ""}">${top ? "this → " : ""}${esc(s)}</div>`;
      }).join("") || `<div class="sv-empty">(none)</div>`}</div></div>
        <div class="sv-card"><h5>What has been built</h5><div class="sv-build">${build}</div></div></div>`;
    },
  };

  /* A label that doesn't fit its bar falls back to its short form, then to
     nothing (the full text stays in the tooltip) — never a cut-off word. */
  function fitLabels(root) {
    $$(".sv-seg", root).forEach((el) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      if (el.dataset.short) el.textContent = el.dataset.short;
      if (el.scrollWidth > el.clientWidth + 1) el.textContent = "";
    });
    // Event marks: flip labels near the right edge inward, and when two labels
    // collide keep only the later one (the earlier stays in its tooltip).
    $$(".sv-track", root).forEach((track) => {
      const right = track.getBoundingClientRect().right;
      let prev = null;
      $$(".sv-mark span", track).forEach((sp) => {
        sp.parentElement.title = sp.textContent;
        if (sp.getBoundingClientRect().right > right - 1) sp.parentElement.classList.add("end");
        if (prev && prev.getBoundingClientRect().right > sp.getBoundingClientRect().left - 2) prev.style.visibility = "hidden";
        prev = sp;
      });
    });
  }

  /* --------------------------------------------------------------- Engine */
  function register(id, spec) { SIMS[id] = spec; }

  function mount(host) {
    const spec = SIMS[host.dataset.sim];
    if (!spec) return;
    let modeIdx = 0, step = 0, timer = null, speed = 1;
    host.innerHTML = `
      <div class="sim-head"><span class="sim-badge">Simulation</span><h4>${esc(spec.title)}</h4>
        ${spec.modes.length > 1 ? `<div class="sim-modes" role="group" aria-label="Scenario">${spec.modes.map((m, i) => `<button type="button" data-mode="${i}" aria-pressed="${i === 0}">${esc(m.label)}</button>`).join("")}</div>` : ""}
      </div>
      <div class="sim-body"><div class="sim-code" aria-label="Code"></div><div class="sim-view" aria-live="polite"></div></div>
      <div class="sim-say" aria-live="polite"></div>
      <pre class="sim-out"></pre>
      <div class="sim-ctrl">
        <button type="button" data-act="reset" aria-label="Restart">⟲</button>
        <button type="button" data-act="prev" aria-label="Previous step">◀ Back</button>
        <button type="button" class="sim-play" data-act="play">▶ Play</button>
        <button type="button" data-act="next" aria-label="Next step">Next ▶</button>
        <div class="sim-prog"><div></div></div>
        <span class="sim-count"></span>
        <select aria-label="Speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select>
      </div>`;
    const codeEl = $(".sim-code", host), viewEl = $(".sim-view", host), sayEl = $(".sim-say", host), outEl = $(".sim-out", host);
    const playBtn = $(".sim-play", host), prevBtn = $('[data-act="prev"]', host), nextBtn = $('[data-act="next"]', host);
    const mode = () => spec.modes[modeIdx];

    const drawCode = () => {
      const lines = KA.highlightLines(mode().code, mode().lang || "kotlin");
      codeEl.innerHTML = `<div class="sim-lines">${lines.map((l, i) => `<span class="ln" data-n="${i + 1}">${l || " "}</span>`).join("")}</div>`;
    };
    const draw = () => {
      const steps = mode().steps;
      const s = steps[step];
      const active = [].concat(s.line || []);
      $$(".ln", codeEl).forEach((el, i) => el.classList.toggle("cur", active.includes(i + 1)));
      const cur = $(".ln.cur", codeEl);
      if (cur) {
        const top = cur.offsetTop - codeEl.offsetTop;
        if (top < codeEl.scrollTop || top > codeEl.scrollTop + codeEl.clientHeight - 30) codeEl.scrollTop = Math.max(0, top - 60);
      }
      viewEl.innerHTML = (spec.render || mode().render)(s.state || {}, mode(), step);
      fitLabels(viewEl);
      sayEl.innerHTML = `<span class="sim-stepno">${step + 1}/${steps.length}</span>${s.say}`;
      if (KA.addBreaks) KA.addBreaks(sayEl);
      const outs = [];
      steps.slice(0, step + 1).forEach((st, i) => [].concat(st.out || []).forEach((o) => outs.push([o, i === step])));
      outEl.innerHTML = outs.map(([o, fresh]) => `<span class="${fresh ? "new" : ""}">${esc(o)}</span>`).join("\n");
      outEl.scrollTop = outEl.scrollHeight;
      outEl.hidden = !steps.some((st) => st.out);
      $(".sim-prog div", host).style.width = `${((step + 1) / steps.length) * 100}%`;
      $(".sim-count", host).textContent = `step ${step + 1} of ${steps.length}`;
      prevBtn.disabled = step === 0;
      nextBtn.disabled = step === steps.length - 1;
    };
    const stop = () => { clearInterval(timer); timer = null; playBtn.textContent = step === mode().steps.length - 1 ? "↻ Replay" : "▶ Play"; };
    const go = (n) => { step = Math.max(0, Math.min(mode().steps.length - 1, n)); draw(); };
    const play = () => {
      if (timer) return stop();
      if (step === mode().steps.length - 1) go(0);
      playBtn.textContent = "❚❚ Pause";
      timer = setInterval(() => {
        if (step >= mode().steps.length - 1) return stop();
        go(step + 1);
        if (step >= mode().steps.length - 1) stop();
      }, 2300 / speed);
    };
    host.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.mode) {
        stop(); modeIdx = +b.dataset.mode; step = 0;
        $$("[data-mode]", host).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        drawCode(); draw(); return;
      }
      const act = b.dataset.act;
      if (act === "play") play();
      else { stop(); if (act === "next") go(step + 1); if (act === "prev") go(step - 1); if (act === "reset") go(0); }
    });
    $("select", host).addEventListener("change", (e) => { speed = +e.target.value; if (timer) { stop(); play(); } });
    host.tabIndex = 0;
    host.addEventListener("keydown", (e) => {
      if (e.target.closest("select")) return;
      if (e.key === "ArrowRight") { stop(); go(step + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { stop(); go(step - 1); e.preventDefault(); }
    });
    drawCode(); draw();
    // Bar widths are in %, so re-fit labels when the simulation's width changes.
    let lastW = host.clientWidth, rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (host.clientWidth !== lastW) { lastW = host.clientWidth; draw(); } }, 150);
    });
  }

  /* ===================================================================== */
  /* 1. Suspend vs block                                                   */
  /* ===================================================================== */
  const suspendCode = (blocking) => `
    fun main() = runBlocking {        // one thread: "main"
        launch {                      // coroutine A
            println("A: start")
            ${blocking ? "Thread.sleep(1000)      // BLOCKS the thread" : "delay(1000)             // suspends A"}
            println("A: done")
        }
        launch {                      // coroutine B
            println("B: start")
            ${blocking ? "Thread.sleep(500)       // BLOCKS the thread" : "delay(500)              // suspends B"}
            println("B: done")
        }
    }                                 // waits for A and B`;
  const ganttView = (lanesFor) => (s, m) =>
    R.clock(s.t) + R.gantt({ t: s.t, tMax: m.tMax, lanes: lanesFor(m) }) + R.chips(s.chips) + R.note(s.note);
  const ch = (main, a, b) => [
    { name: "main coroutine", status: main[0], label: main[1] },
    { name: "A", status: a[0], label: a[1] },
    { name: "B", status: b[0], label: b[1] },
  ].filter((c) => c.status);
  register("coroutine-suspend", {
    title: "Suspending vs blocking: two coroutines on ONE thread",
    render: ganttView((m) => m.lanes),
    modes: [
      {
        label: "delay() — suspends", tMax: 1800, code: suspendCode(false),
        lanes: [
          { label: "Thread main", sub: "what it executes", segs: [
            { from: 0, to: 40, cls: "seg-main", label: "main" }, { from: 40, to: 80, cls: "seg-a", label: "A" },
            { from: 80, to: 120, cls: "seg-b", label: "B" }, { from: 120, to: 620, cls: "seg-idle", label: "idle — free for other work", short: "idle" },
            { from: 620, to: 660, cls: "seg-b", label: "B" }, { from: 660, to: 1080, cls: "seg-idle", label: "idle" },
            { from: 1080, to: 1120, cls: "seg-a", label: "A" }, { from: 1120, to: 1160, cls: "seg-main", label: "main" }] },
          { label: "Coroutine A", segs: [{ from: 40, to: 80, cls: "seg-a", label: "run" }, { from: 80, to: 1080, cls: "seg-wait", label: "suspended in delay(1000)", short: "suspended" }, { from: 1080, to: 1120, cls: "seg-a", label: "run" }] },
          { label: "Coroutine B", segs: [{ from: 80, to: 120, cls: "seg-b", label: "run" }, { from: 120, to: 620, cls: "seg-wait", label: "suspended in delay(500)", short: "suspended" }, { from: 620, to: 660, cls: "seg-b", label: "run" }] },
        ],
        steps: [
          { line: 1, say: "<b>runBlocking</b> starts the main coroutine on the program's only thread, <code>main</code>.", state: { t: 40, chips: ch(["running", "running"], [], []) } },
          { line: 2, say: "<b>launch</b> creates coroutine A and <em>schedules</em> it. It doesn't run yet — launch returns immediately.", state: { t: 40, chips: ch(["running", "running"], ["scheduled", "scheduled"], []) } },
          { line: 7, say: "Coroutine B is scheduled too. The main coroutine reaches the end of its block and <b>suspends</b> until its children finish, freeing the thread.", state: { t: 40, chips: ch(["suspended", "waiting for children"], ["scheduled", "scheduled"], ["scheduled", "scheduled"]) } },
          { line: 3, out: "A: start", say: "The free thread picks up A, which prints.", state: { t: 80, chips: ch(["suspended", "waiting for children"], ["running", "running"], ["scheduled", "scheduled"]) } },
          { line: 4, say: "A calls <code>delay(1000)</code>. Instead of blocking, A <b>suspends</b>: its state is saved in a heap object and the thread is released. A timer will resume it.", state: { t: 80, chips: ch(["suspended", "waiting"], ["suspended", "resumes in 1000 ms"], ["scheduled", "scheduled"]), note: "No thread is waiting for A — only a timer entry." } },
          { line: 8, out: "B: start", say: "Because the thread is free, it immediately runs B.", state: { t: 120, chips: ch(["suspended", "waiting"], ["suspended", "delay"], ["running", "running"]) } },
          { line: 9, say: "B suspends in <code>delay(500)</code> too. Both coroutines wait, and the thread is <b>idle, not blocked</b> — it could run thousands of other coroutines meanwhile.", state: { t: 380, chips: ch(["suspended", "waiting"], ["suspended", "delay"], ["suspended", "resumes in 500 ms"]) } },
          { line: 10, out: "B: done", say: "After 500 ms B's timer fires. B <b>resumes</b> on the thread exactly where it left off and finishes.", state: { t: 660, chips: ch(["suspended", "waiting"], ["suspended", "delay"], ["done", "completed"]) } },
          { line: 5, out: "A: done", say: "At ≈1000 ms A resumes and finishes.", state: { t: 1120, chips: ch(["suspended", "waiting"], ["done", "completed"], ["done", "completed"]) } },
          { line: 12, say: "Both children completed, so runBlocking returns. <b>Total ≈ 1 s</b>: the two waits overlapped on a single thread.", state: { t: 1160, chips: ch(["done", "completed"], ["done", "completed"], ["done", "completed"]), note: "<b>Takeaway:</b> suspension frees the thread while waiting. Switch to <b>Thread.sleep() — blocks</b> to compare." } },
        ],
      },
      {
        label: "Thread.sleep() — blocks", tMax: 1800, code: suspendCode(true),
        lanes: [
          { label: "Thread main", sub: "what it executes", segs: [
            { from: 0, to: 40, cls: "seg-main", label: "main" }, { from: 40, to: 80, cls: "seg-a", label: "A" },
            { from: 80, to: 1080, cls: "seg-block", label: "A: Thread.sleep(1000) — BLOCKED", short: "A: BLOCKED" }, { from: 1080, to: 1120, cls: "seg-a", label: "A" },
            { from: 1120, to: 1160, cls: "seg-b", label: "B" }, { from: 1160, to: 1660, cls: "seg-block", label: "B: sleep — BLOCKED", short: "B: BLOCKED" },
            { from: 1660, to: 1700, cls: "seg-b", label: "B" }, { from: 1700, to: 1740, cls: "seg-main", label: "main" }] },
          { label: "Coroutine A", segs: [{ from: 40, to: 80, cls: "seg-a", label: "run" }, { from: 80, to: 1080, cls: "seg-block", label: "holding the thread", short: "blocking" }, { from: 1080, to: 1120, cls: "seg-a", label: "run" }] },
          { label: "Coroutine B", segs: [{ from: 40, to: 1120, cls: "seg-idle", label: "ready, but no free thread", short: "ready" }, { from: 1120, to: 1160, cls: "seg-b", label: "run" }, { from: 1160, to: 1660, cls: "seg-block", label: "holding the thread", short: "blocking" }, { from: 1660, to: 1700, cls: "seg-b", label: "run" }] },
        ],
        steps: [
          { line: 1, say: "Same program, but the coroutines call <code>Thread.sleep</code> instead of <code>delay</code>.", state: { t: 40, chips: ch(["running", "running"], [], []) } },
          { line: [2, 7], say: "A and B are scheduled; the main coroutine waits for its children.", state: { t: 40, chips: ch(["suspended", "waiting"], ["scheduled", "scheduled"], ["scheduled", "scheduled"]) } },
          { line: 3, out: "A: start", say: "A starts and prints.", state: { t: 80, chips: ch(["suspended", "waiting"], ["running", "running"], ["scheduled", "scheduled"]) } },
          { line: 4, say: "<code>Thread.sleep(1000)</code> <b>blocks the thread itself</b>. B is ready to run but there is no thread to run it. On Android's main thread, this is exactly what freezes the UI and causes ANRs.", state: { t: 600, chips: ch(["suspended", "waiting"], ["blocked", "BLOCKING the thread"], ["scheduled", "waiting for a thread"]), note: "Detekt rule <b>SleepInsteadOfDelay</b> flags this mistake." } },
          { line: 5, out: "A: done", say: "Only after a full second can A continue and finish.", state: { t: 1120, chips: ch(["suspended", "waiting"], ["done", "completed"], ["scheduled", "waiting for a thread"]) } },
          { line: 8, out: "B: start", say: "Now B finally gets the thread.", state: { t: 1160, chips: ch(["suspended", "waiting"], ["done", "completed"], ["running", "running"]) } },
          { line: 9, say: "B blocks the thread for another 500 ms.", state: { t: 1500, chips: ch(["suspended", "waiting"], ["done", "completed"], ["blocked", "BLOCKING the thread"]) } },
          { line: 10, out: "B: done", say: "B finishes.", state: { t: 1700, chips: ch(["suspended", "waiting"], ["done", "completed"], ["done", "completed"]) } },
          { line: 12, say: "<b>Total ≈ 1.5 s</b> and the output order changed: blocking serialised everything. Use <code>delay</code> in coroutines, and <code>withContext(Dispatchers.IO)</code> for unavoidable blocking calls.", state: { t: 1740, chips: ch(["done", "completed"], ["done", "completed"], ["done", "completed"]) } },
        ],
      },
    ],
  });

  /* ===================================================================== */
  /* 2. Under the hood: the suspend state machine                          */
  /* ===================================================================== */
  const smFields = (label, id, user, posts) => [["label", String(label)], ["id", id], ["user", user], ["posts", posts]];
  register("suspend-state-machine", {
    title: "Under the hood: how a suspend function pauses and resumes",
    render: (s) => R.machine(s),
    modes: [{
      label: "loadProfile", code: `
        suspend fun loadProfile(id: Int): Profile {
            val user = fetchUser(id)       // suspension point #1
            val posts = fetchPosts(user)   // suspension point #2
            return Profile(user, posts)
        }

        // What the compiler generates, roughly:
        // fun loadProfile(id: Int, cont: Continuation<Profile>): Any? {
        //     when (cont.label) { 0 -> …; 1 -> …; 2 -> … }
        // }`,
      steps: [
        { line: 1, say: "The compiler adds a hidden <code>Continuation</code> parameter and turns the body into a <b>state machine</b> with one state per suspension point.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 0, fields: smFields(0, "7", "—", "—"), changed: ["id"], stack: ["main event loop", "loadProfile(7, cont)"], status: "Running on the main thread" } },
        { line: 2, say: "State L0 runs until <code>fetchUser(id)</code>. Before calling it, the function stores <code>label = 1</code> (where to continue) in the continuation.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 0, fields: smFields(1, "7", "—", "—"), changed: ["label"], stack: ["main event loop", "loadProfile(7, cont)", "fetchUser(7, cont)"], status: "Network request sent" } },
        { line: 2, say: "<code>fetchUser</code> can't answer yet, so it returns the special marker <code>COROUTINE_SUSPENDED</code>. Every frame returns it up the chain, and the <b>stack unwinds</b>. The thread is free; all state lives in the continuation object on the heap.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 1, fields: smFields(1, "7", "—", "—"), stack: ["main event loop"], status: "Suspended: the thread draws frames, handles taps…" } },
        { line: 2, say: "The response arrives. The library calls <code>cont.resumeWith(user)</code>. <code>loadProfile</code> is invoked again with the same continuation; <code>when(label)</code> jumps straight to <b>L1</b> and the result is stored.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 1, fields: smFields(1, "7", "User(Ada)", "—"), changed: ["user"], stack: ["main event loop", "resumeWith(User(Ada))", "loadProfile(cont) @L1"], status: "Resumed on the main thread" } },
        { line: 3, say: "L1 continues to <code>fetchPosts(user)</code>, sets <code>label = 2</code> and suspends again — stack unwinds once more.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 2, fields: smFields(2, "7", "User(Ada)", "—"), changed: ["label"], stack: ["main event loop"], status: "Suspended again" } },
        { line: 3, say: "Posts arrive: resume at <b>L2</b> with the result.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 2, fields: smFields(2, "7", "User(Ada)", "[3 posts]"), changed: ["posts"], stack: ["main event loop", "resumeWith([3 posts])", "loadProfile(cont) @L2"], status: "Resumed" } },
        { line: 4, out: "Profile(user=Ada, posts=3)", say: "L2 builds the <code>Profile</code> and returns it. The continuation passes the value to <b>its</b> caller's continuation — so the whole chain of suspend functions resumes like normal sequential code.", state: { labels: ["L0 start", "L1 after fetchUser", "L2 after fetchPosts"], active: 2, fields: [["label", "done"], ["id", "7"], ["user", "User(Ada)"], ["posts", "[3 posts]"]], stack: ["main event loop", "caller resumes with Profile"], status: "Completed" } },
      ],
    }],
  });

  /* ===================================================================== */
  /* 3. launch/async: sequential vs parallel                               */
  /* ===================================================================== */
  const priceCode = (par) => `
    suspend fun loadPrice(item: String): Int {
        delay(1000)                       // pretend network call
        return item.length * 100
    }

    fun main() = runBlocking {
    ${par ? `    val a = async { loadPrice("coffee") }
        val b = async { loadPrice("tea") }
        println("total \${a.await() + b.await()}")` : `    val a = loadPrice("coffee")
        val b = loadPrice("tea")
        println("total \${a + b}")`}
    }`;
  register("launch-async", {
    title: "Sequential calls vs async: where does the time go?",
    render: ganttView((m) => m.lanes),
    modes: [
      {
        label: "Sequential", tMax: 2200, code: priceCode(false),
        lanes: [
          { label: "main coroutine", short: "main", segs: [{ from: 0, to: 40, cls: "seg-main", label: "run" }, { from: 40, to: 1040, cls: "seg-wait", label: "suspended: waiting for coffee", short: "waiting" }, { from: 1040, to: 2040, cls: "seg-wait", label: "suspended: waiting for tea", short: "waiting" }, { from: 2040, to: 2080, cls: "seg-main", label: "print" }] },
          { label: "loadPrice(coffee)", short: "coffee", segs: [{ from: 40, to: 1040, cls: "seg-a", label: "delay(1000)", short: "delay" }] },
          { label: "loadPrice(tea)", short: "tea", segs: [{ from: 1040, to: 2040, cls: "seg-b", label: "delay(1000)", short: "delay" }] },
        ],
        steps: [
          { line: 6, say: "The main coroutine starts.", state: { t: 40, chips: [{ name: "main", status: "running" }] } },
          { line: 7, say: "It calls <code>loadPrice(\"coffee\")</code> directly. A suspend call is <b>sequential</b>: main suspends until it returns.", state: { t: 40, chips: [{ name: "main", status: "suspended", label: "in loadPrice(coffee)", short: "coffee" }] } },
          { line: 2, say: "One second of network time…", state: { t: 600, chips: [{ name: "main", status: "suspended", label: "in loadPrice(coffee)", short: "coffee" }] } },
          { line: [3, 8], say: "Coffee returns 600. <b>Only now</b> does the tea request start — even though it never depended on coffee.", state: { t: 1040, chips: [{ name: "main", status: "suspended", label: "in loadPrice(tea)", short: "tea" }] } },
          { line: 2, say: "Another full second.", state: { t: 1600, chips: [{ name: "main", status: "suspended", label: "in loadPrice(tea)", short: "tea" }] } },
          { line: 9, out: "total 900", say: "<b>≈ 2 s total</b>. Fine when the second call needs the first result; wasteful when the calls are independent.", state: { t: 2080, chips: [{ name: "main", status: "done" }], note: "Switch to the <b>async</b> scenario ↑" } },
        ],
      },
      {
        label: "async (parallel)", tMax: 2200, code: priceCode(true),
        lanes: [
          { label: "main coroutine", short: "main", segs: [{ from: 0, to: 40, cls: "seg-main", label: "run" }, { from: 40, to: 1040, cls: "seg-wait", label: "suspended in await()", short: "await" }, { from: 1040, to: 1080, cls: "seg-main", label: "print" }] },
          { label: "async { coffee }", segs: [{ from: 40, to: 1040, cls: "seg-a", label: "delay(1000)", short: "delay" }] },
          { label: "async { tea }", segs: [{ from: 40, to: 1040, cls: "seg-b", label: "delay(1000)", short: "delay" }] },
        ],
        steps: [
          { line: 7, say: "<code>async</code> starts a <b>child coroutine</b> for coffee and immediately returns a <code>Deferred&lt;Int&gt;</code> — a promise of a future value.", state: { t: 40, chips: [{ name: "main", status: "running" }, { name: "coffee", status: "running" }] } },
          { line: 8, say: "Tea starts right away as a second child. Both requests are now in flight.", state: { t: 40, chips: [{ name: "main", status: "running" }, { name: "coffee", status: "running" }, { name: "tea", status: "running" }] } },
          { line: 9, say: "<code>a.await()</code> suspends main until coffee is ready.", state: { t: 40, chips: [{ name: "main", status: "suspended", label: "in await()" }, { name: "coffee", status: "suspended", label: "delay" }, { name: "tea", status: "suspended", label: "delay" }] } },
          { line: 2, say: "Both delays run <b>at the same time</b>.", state: { t: 600, chips: [{ name: "main", status: "suspended", label: "in await()" }, { name: "coffee", status: "suspended", label: "delay" }, { name: "tea", status: "suspended", label: "delay" }] } },
          { line: 3, say: "After ≈1 s both children complete. <code>b.await()</code> returns immediately because tea is already done.", state: { t: 1040, chips: [{ name: "main", status: "running" }, { name: "coffee", status: "done", label: "600" }, { name: "tea", status: "done", label: "300" }] } },
          { line: 9, out: "total 900", say: "<b>≈ 1 s total</b> — half the time. Because the children belong to main's scope, if one fails the other is cancelled automatically (structured concurrency).", state: { t: 1080, chips: [{ name: "main", status: "done" }, { name: "coffee", status: "done" }, { name: "tea", status: "done" }] } },
        ],
      },
    ],
  });

  /* ===================================================================== */
  /* 4. Structured concurrency: cancellation and failure                   */
  /* ===================================================================== */
  const T = (rootLabel, rootSub, st) => ({
    root: { label: rootLabel, sub: st.root[1] || rootSub, status: st.root[0], sig: st.root[2] },
    r: { label: "launch: refresh", parent: "root", status: st.r[0], sub: st.r[1], sig: st.r[2] },
    u: { label: "async: users", parent: "r", status: st.u[0], sub: st.u[1], sig: st.u[2] },
    t: { label: "async: tasks", parent: "r", status: st.t[0], sub: st.t[1], sig: st.t[2] },
    o: { label: "launch: observe", parent: "root", status: st.o[0], sub: st.o[1], sig: st.o[2] },
  });
  const all = (status, sub = status) => ({ root: [status, sub], r: [status, sub], u: [status, sub], t: [status, sub], o: [status, sub] });
  register("structured-concurrency", {
    title: "Structured concurrency: a tree that cancels and fails together",
    render: (s) => R.tree(s.nodes, "root") + R.note(s.note),
    modes: [
      {
        label: "Cancel the scope", code: `
          class DashboardViewModel : ViewModel() {
              init {
                  viewModelScope.launch {                  // refresh
                      val users = async { api.users() }
                      val tasks = async { api.tasks() }
                      show(users.await(), tasks.await())
                  }
                  viewModelScope.launch {                  // observe
                      repo.updates().collect { render(it) }
                  }
              }
              // user leaves the screen → onCleared()
              // → viewModelScope.cancel()
          }`,
        steps: [
          { line: 3, say: "<code>viewModelScope.launch</code> creates <b>refresh</b> as a child of the ViewModel's scope.", state: { nodes: T("viewModelScope", "SupervisorJob", { root: ["active"], r: ["active", "running"], u: ["waiting", "not started"], t: ["waiting", "not started"], o: ["waiting", "not started"] }) } },
          { line: [4, 5], say: "<code>async</code> inside refresh creates <b>grandchildren</b>. Every coroutine knows its parent: the result is a tree.", state: { nodes: T("viewModelScope", "SupervisorJob", { root: ["active"], r: ["active", "awaiting"], u: ["active", "loading"], t: ["active", "loading"], o: ["waiting", "not started"] }) } },
          { line: [8, 9], say: "A second child, <b>observe</b>, collects a Flow forever.", state: { nodes: T("viewModelScope", "SupervisorJob", { root: ["active"], r: ["active", "awaiting"], u: ["active", "loading"], t: ["active", "loading"], o: ["active", "collecting"] }) } },
          { line: [12, 13], say: "The user leaves the screen. The ViewModel is cleared and <code>viewModelScope.cancel()</code> is called.", state: { nodes: T("viewModelScope", "SupervisorJob", { root: ["cancelling", "cancel()", "⛔"], r: ["active", "awaiting"], u: ["active", "loading"], t: ["active", "loading"], o: ["active", "collecting"] }) } },
          { line: [12, 13], say: "Cancellation flows <b>down</b> the tree: both children are cancelled…", state: { nodes: T("viewModelScope", "SupervisorJob", { root: ["cancelling", "cancelling"], r: ["cancelling", "cancelling", "⬇"], u: ["active", "loading"], t: ["active", "loading"], o: ["cancelling", "cancelling", "⬇"] }) } },
          { line: [12, 13], say: "…and their children too.", state: { nodes: T("viewModelScope", "SupervisorJob", { root: ["cancelling", "cancelling"], r: ["cancelling", "cancelling"], u: ["cancelling", "cancelling", "⬇"], t: ["cancelling", "cancelling", "⬇"], o: ["cancelling", "cancelling"] }) } },
          { line: [12, 13], say: "Each coroutine stops at its next suspension point (<code>await</code>, <code>collect</code>, <code>delay</code>), runs its <code>finally</code> blocks and completes as cancelled. <b>Nothing leaks</b>: no request keeps running for a screen that's gone.", state: { nodes: T("viewModelScope", "SupervisorJob", all("cancelled")), note: "This is why you never need to remember to stop work manually in a ViewModel." } },
        ],
      },
      {
        label: "Child fails (Job)", code: `
          suspend fun loadDashboard() = coroutineScope { // regular Job
              launch {                                     // refresh
                  val users = async { api.users() }        // throws!
                  val tasks = async { api.tasks() }
                  show(users.await(), tasks.await())
              }
              launch {                                     // observe
                  repo.updates().collect { render(it) }
              }
          }`,
        steps: [
          { line: [2, 3, 4, 7], say: "Same tree, but inside <code>coroutineScope</code>, whose job is a regular <code>Job</code>.", state: { nodes: T("coroutineScope", "Job", { root: ["active"], r: ["active", "awaiting"], u: ["active", "loading"], t: ["active", "loading"], o: ["active", "collecting"] }) } },
          { line: 3, say: "<code>api.users()</code> throws an <code>IOException</code>. The <b>users</b> coroutine fails.", state: { nodes: T("coroutineScope", "Job", { root: ["active"], r: ["active", "awaiting"], u: ["failed", "IOException", "💥"], t: ["active", "loading"], o: ["active", "collecting"] }) } },
          { line: 2, say: "A failure propagates <b>up</b> to the parent. <b>refresh</b> starts cancelling and cancels its other child, <b>tasks</b> — its result is useless now.", state: { nodes: T("coroutineScope", "Job", { root: ["active"], r: ["cancelling", "child failed", "⬆"], u: ["failed", "IOException"], t: ["cancelling", "cancelled by parent", "⬇"], o: ["active", "collecting"] }) } },
          { line: 1, say: "refresh fails too, so the failure reaches <code>coroutineScope</code>, which cancels <b>all</b> its remaining children, including <b>observe</b>.", state: { nodes: T("coroutineScope", "Job", { root: ["cancelling", "child failed", "⬆"], r: ["failed", "failed"], u: ["failed", "IOException"], t: ["cancelled"], o: ["cancelling", "cancelled by parent", "⬇"] }) } },
          { line: 1, out: "loadDashboard() threw IOException", say: "When everything has stopped, <code>coroutineScope</code> rethrows the exception to its caller, where a normal <code>try/catch</code> can handle it. All-or-nothing: no half-finished work survives.", state: { nodes: T("coroutineScope", "Job", { root: ["failed", "rethrows"], r: ["failed"], u: ["failed", "IOException"], t: ["cancelled"], o: ["cancelled"] }), note: "Want independent children? Switch to the <b>SupervisorJob</b> scenario ↑" } },
        ],
      },
      {
        label: "Child fails (supervisor)", code: `
          suspend fun loadDashboard() = supervisorScope {
              launch(handler) {                            // refresh
                  val users = async { api.users() }        // throws!
                  val tasks = async { api.tasks() }
                  show(users.await(), tasks.await())
              }
              launch {                                     // observe
                  repo.updates().collect { render(it) }
              }
          }`,
        steps: [
          { line: [1, 2, 7], say: "Now the root is <code>supervisorScope</code> (same as <code>viewModelScope</code>'s <code>SupervisorJob</code>).", state: { nodes: T("supervisorScope", "SupervisorJob", { root: ["active"], r: ["active", "awaiting"], u: ["active", "loading"], t: ["active", "loading"], o: ["active", "collecting"] }) } },
          { line: 3, say: "<b>users</b> fails with <code>IOException</code>.", state: { nodes: T("supervisorScope", "SupervisorJob", { root: ["active"], r: ["active", "awaiting"], u: ["failed", "IOException", "💥"], t: ["active", "loading"], o: ["active", "collecting"] }) } },
          { line: 2, say: "<b>refresh</b> is a <em>regular</em> coroutine, so inside it the usual rule applies: it cancels <b>tasks</b> and fails. A supervisor only protects its <b>direct</b> children from each other.", state: { nodes: T("supervisorScope", "SupervisorJob", { root: ["active"], r: ["failed", "child failed", "⬆"], u: ["failed", "IOException"], t: ["cancelled", "cancelled by parent", "⬇"], o: ["active", "collecting"] }) } },
          { line: 2, out: "handler: IOException", say: "The supervisor does <b>not</b> cancel itself or its other children. The failure goes to the <code>CoroutineExceptionHandler</code> installed on refresh.", state: { nodes: T("supervisorScope", "SupervisorJob", { root: ["active", "unaffected"], r: ["failed", "reported to handler"], u: ["failed"], t: ["cancelled"], o: ["active", "still collecting", "✅"] }) } },
          { line: [7, 8], say: "<b>observe</b> keeps running. Use supervisors when children are independent features (several widgets on a dashboard); use a regular scope when results only make sense together.", state: { nodes: T("supervisorScope", "SupervisorJob", { root: ["active"], r: ["failed"], u: ["failed"], t: ["cancelled"], o: ["active", "still collecting"] }), note: "Either way, catch expected exceptions with <code>try/catch</code> inside the coroutine — that is the right tool 90% of the time." } },
        ],
      },
    ],
  });

  /* ===================================================================== */
  /* 5. Dispatchers and withContext                                        */
  /* ===================================================================== */
  const POOLS = [
    { name: "Main", sub: "UI thread", threads: ["main"] },
    { name: "IO", sub: "up to 64 threads", threads: ["worker-1", "worker-2", "worker-3"] },
    { name: "Default", sub: "1 per CPU core", threads: ["worker-1 ", "worker-2 ", "worker-3 "] },
  ];
  register("dispatchers", {
    title: "Dispatchers & withContext: one coroutine hopping between threads",
    render: (s) => R.pools(POOLS, s.token, s.free || []) + R.note(s.note),
    modes: [{
      label: "refresh", short: "ref", code: `
        fun onRefreshClicked() {
            viewModelScope.launch {                    // Dispatchers.Main
                showLoading()
                val config = withContext(Dispatchers.IO) {
                    readConfigFile()                   // blocking I/O
                }
                val stats = withContext(Dispatchers.Default) {
                    computeStats(config)               // CPU-heavy work
                }
                render(stats)                          // back on Main
            }
        }`,
      steps: [
        { line: 2, say: "<code>viewModelScope</code> launches on <b>Dispatchers.Main</b> — the UI thread.", state: { token: { pool: "Main", thread: "main", label: "refresh", short: "ref" } } },
        { line: 3, say: "<code>showLoading()</code> updates UI state on the main thread. Quick and safe.", state: { token: { pool: "Main", thread: "main", label: "refresh", short: "ref" } } },
        { line: 4, say: "<code>withContext(Dispatchers.IO)</code> <b>suspends</b> the coroutine on Main and <b>resumes it on an IO thread</b>.", state: { token: { pool: "IO", thread: "worker-2", label: "refresh", short: "ref" }, free: ["main"] } },
        { line: 5, say: "The blocking file read happens on <code>worker-2</code>. Meanwhile the main thread is <b>free</b> to draw frames and handle touches — no jank, no ANR.", state: { token: { pool: "IO", thread: "worker-2", label: "refresh", short: "ref" }, free: ["main"], note: "IO allows many threads because they mostly sit waiting on disks and networks." } },
        { line: 7, say: "The block returns <code>config</code>; the next <code>withContext</code> hops to <b>Dispatchers.Default</b> for CPU work.", state: { token: { pool: "Default", thread: "worker-1 ", label: "refresh", short: "ref" }, free: ["main"], note: "IO and Default share the same underlying thread pool (<code>DefaultDispatcher-worker-N</code>), so this switch is cheap — often no real thread change at all." } },
        { line: 8, say: "Number crunching runs on a CPU-sized pool, so parallel work doesn't oversubscribe the cores.", state: { token: { pool: "Default", thread: "worker-1 ", label: "refresh", short: "ref" }, free: ["main"] } },
        { line: 10, say: "<code>withContext</code> returns the result and the coroutine <b>resumes on Main</b> — the dispatcher it started on — to render. The caller never had to think about threads: each function is <b>main-safe</b>.", state: { token: { pool: "Main", thread: "main", label: "refresh", short: "ref" }, note: "Room and Retrofit suspend functions do this switching for you internally." } },
      ],
    }],
  });

  /* ===================================================================== */
  /* 6. Flow: cold vs SharedFlow vs StateFlow                               */
  /* ===================================================================== */
  const mk = (...vals) => vals.map((v) => ({ v }));
  const fresh = (items) => items.map((it, i) => (i === items.length - 1 ? { ...it, cls: "hot" } : it));
  register("flow-cold-hot", {
    title: "Cold Flow vs hot SharedFlow vs StateFlow",
    render: (s) => R.broadcast(s) + R.note(s.note),
    modes: [
      {
        label: "Cold flow", code: `
          val numbers = flow {
              println("producer started")
              for (i in 1..3) { delay(100); emit(i) }
          }

          launch { numbers.collect { println("C1 got $it") } }
          delay(150)
          launch { numbers.collect { println("C2 got $it") } }`,
        steps: [
          { line: 1, say: "Defining a flow runs <b>nothing</b>. It's a recipe, not a running process.", state: { producers: [], consumers: [{ name: "C1", on: false }, { name: "C2", on: false }] } },
          { line: [6, 2], out: "producer started", say: "C1 calls <code>collect</code>: the flow body starts running <b>for C1</b>.", state: { producers: [{ name: "run #1", sub: "for C1", on: true }], consumers: [{ name: "C1", on: true }, { name: "C2", on: false }] } },
          { line: 3, out: "C1 got 1", say: "t=100: run #1 emits 1 to C1.", state: { producers: [{ name: "run #1", sub: "for C1", on: true, items: fresh(mk(1)) }], consumers: [{ name: "C1", on: true, items: fresh(mk(1)) }, { name: "C2", on: false }] } },
          { line: [8, 2], out: "producer started", say: "t=150: C2 starts collecting — and the producer runs <b>again, from the beginning</b>, just for C2.", state: { producers: [{ name: "run #1", sub: "for C1", on: true, items: mk(1) }, { name: "run #2", sub: "for C2", on: true }], consumers: [{ name: "C1", on: true, items: mk(1) }, { name: "C2", on: true }] } },
          { line: 3, out: ["C1 got 2", "C2 got 1"], say: "t=200–250: each run emits to its own collector.", state: { producers: [{ name: "run #1", sub: "for C1", on: true, items: fresh(mk(1, 2)) }, { name: "run #2", sub: "for C2", on: true, items: fresh(mk(1)) }], consumers: [{ name: "C1", on: true, items: fresh(mk(1, 2)) }, { name: "C2", on: true, items: fresh(mk(1)) }] } },
          { line: 3, out: ["C1 got 3", "C2 got 2", "C2 got 3"], say: "Both collectors receive <b>all</b> values 1, 2, 3 — from <b>separate</b> producer runs. Cold flows are per-collector, like calling a function twice.", state: { producers: [{ name: "run #1", sub: "done", on: false, items: mk(1, 2, 3) }, { name: "run #2", sub: "done", on: false, items: mk(1, 2, 3) }], consumers: [{ name: "C1", on: false, items: mk(1, 2, 3) }, { name: "C2", on: false, items: mk(1, 2, 3) }], note: "Two collectors of a Room query Flow = two queries. To share one upstream, make it hot →" } },
        ],
      },
      {
        label: "SharedFlow (hot)", code: `
          val numbers = flow {
              println("producer started")
              for (i in 1..3) { delay(100); emit(i) }
          }.shareIn(scope, SharingStarted.Eagerly, replay = 0)

          launch { numbers.collect { println("C1 got $it") } }
          delay(150)
          launch { numbers.collect { println("C2 got $it") } }`,
        steps: [
          { line: 4, out: "producer started", say: "<code>shareIn(…, Eagerly)</code> starts <b>one</b> producer immediately, in <code>scope</code>.", state: { producers: [{ name: "single run", on: true }], hub: { title: "SharedFlow", sub: "replay = 0" }, consumers: [{ name: "C1", on: false }, { name: "C2", on: false }] } },
          { line: [6, 3], out: "C1 got 1", say: "C1 subscribes; at t=100 the value 1 is broadcast to current subscribers — only C1.", state: { producers: [{ name: "single run", on: true, items: fresh(mk(1)) }], hub: { title: "SharedFlow", sub: "replay = 0" }, consumers: [{ name: "C1", on: true, items: fresh(mk(1)) }, { name: "C2", on: false }] } },
          { line: 8, say: "t=150: C2 subscribes. It <b>missed</b> 1 — hot flows don't replay past values unless <code>replay &gt; 0</code>. The producer is <b>not</b> restarted.", state: { producers: [{ name: "single run", on: true, items: mk(1) }], hub: { title: "SharedFlow", sub: "replay = 0" }, consumers: [{ name: "C1", on: true, items: mk(1) }, { name: "C2", on: true }] } },
          { line: 3, out: ["C1 got 2", "C2 got 2"], say: "t=200: 2 goes to <b>both</b> subscribers.", state: { producers: [{ name: "single run", on: true, items: fresh(mk(1, 2)) }], hub: { title: "SharedFlow", sub: "replay = 0" }, consumers: [{ name: "C1", on: true, items: fresh(mk(1, 2)) }, { name: "C2", on: true, items: fresh(mk(2)) }] } },
          { line: 3, out: ["C1 got 3", "C2 got 3"], say: "One upstream, many subscribers — ideal for events and for sharing expensive work.", state: { producers: [{ name: "single run", on: false, items: mk(1, 2, 3) }], hub: { title: "SharedFlow", sub: "replay = 0" }, consumers: [{ name: "C1", on: true, items: mk(1, 2, 3) }, { name: "C2", on: true, items: mk(2, 3) }] } },
        ],
      },
      {
        label: "StateFlow (state)", code: `
          val count = MutableStateFlow(0)

          launch { count.collect { println("C1 sees $it") } }
          count.value = 1
          count.value = 1                 // same value again
          launch { count.collect { println("C2 sees $it") } }
          count.value = 2`,
        steps: [
          { line: 1, say: "A <code>StateFlow</code> <b>always has a current value</b>, here 0.", state: { producers: [{ name: "count.value", items: mk(0) }], hub: { title: "StateFlow", sub: "value = 0" }, consumers: [{ name: "C1", on: false }, { name: "C2", on: false }] } },
          { line: 3, out: "C1 sees 0", say: "C1 subscribes and <b>immediately</b> receives the current value.", state: { producers: [{ name: "count.value", items: mk(0) }], hub: { title: "StateFlow", sub: "value = 0" }, consumers: [{ name: "C1", on: true, items: fresh(mk(0)) }, { name: "C2", on: false }] } },
          { line: 4, out: "C1 sees 1", say: "Setting the value emits to collectors.", state: { producers: [{ name: "count.value", items: fresh(mk(0, 1)) }], hub: { title: "StateFlow", sub: "value = 1" }, consumers: [{ name: "C1", on: true, items: fresh(mk(0, 1)) }, { name: "C2", on: false }] } },
          { line: 5, say: "Setting <b>the same value</b> again emits nothing: StateFlow compares with <code>equals</code> and skips duplicates. (That's why UI state should be an immutable data class.)", state: { producers: [{ name: "count.value", items: [{ v: 0 }, { v: 1 }, { v: 1, cls: "drop" }] }], hub: { title: "StateFlow", sub: "value = 1" }, consumers: [{ name: "C1", on: true, items: mk(0, 1) }, { name: "C2", on: false }] } },
          { line: 6, out: "C2 sees 1", say: "A late subscriber gets the <b>current</b> value at once — exactly what a screen recreated after rotation needs.", state: { producers: [{ name: "count.value", items: mk(0, 1) }], hub: { title: "StateFlow", sub: "value = 1" }, consumers: [{ name: "C1", on: true, items: mk(0, 1) }, { name: "C2", on: true, items: fresh(mk(1)) }] } },
          { line: 7, out: ["C1 sees 2", "C2 sees 2"], say: "New values go to everyone. Fast successive updates may be <b>conflated</b>: slow collectors only see the latest value — fine for state, wrong for one-off events.", state: { producers: [{ name: "count.value", items: fresh(mk(0, 1, 2)) }], hub: { title: "StateFlow", sub: "value = 2" }, consumers: [{ name: "C1", on: true, items: fresh(mk(0, 1, 2)) }, { name: "C2", on: true, items: fresh(mk(1, 2)) }] } },
        ],
      },
    ],
  });

  /* ===================================================================== */
  /* 7. Flow operators: one element through the whole chain                 */
  /* ===================================================================== */
  const opSteps = (() => {
    const rows = () => [{ name: "asFlow()", items: [] }, { name: "map {×10}", items: [] }, { name: "filter {>15}", items: [] }, { name: "collect", items: [] }];
    const state = rows();
    const steps = [];
    const snap = () => JSON.parse(JSON.stringify({ rows: state }));
    const unhot = () => state.forEach((r) => r.items.forEach((i) => { if (i.cls === "hot") delete i.cls; }));
    [1, 2, 3, 4].forEach((n) => {
      unhot(); state[0].items.push({ v: n, cls: "hot" });
      steps.push({ line: 1, say: `The source emits <b>${n}</b>. Nothing else is produced until this element has gone all the way down the chain.`, state: snap() });
      unhot(); state[1].items.push({ v: n * 10, cls: "hot" });
      steps.push({ line: 2, say: `<code>map</code> turns ${n} into <b>${n * 10}</b> and passes it on immediately.`, state: snap() });
      unhot();
      if (n * 10 > 15) {
        state[2].items.push({ v: n * 10, cls: "hot" });
        steps.push({ line: 3, say: `${n * 10} &gt; 15, so <code>filter</code> lets it through.`, state: snap() });
        unhot(); state[3].items.push({ v: n * 10, cls: "hot" });
        steps.push({ line: 4, out: `got ${n * 10}`, say: `The collector receives <b>${n * 10}</b>.`, state: snap() });
      } else {
        state[2].items.push({ v: n * 10, cls: "drop" });
        steps.push({ line: 3, say: `${n * 10} is not &gt; 15: <code>filter</code> drops it. The collector never sees it.`, state: snap() });
      }
    });
    unhot();
    steps.push({ line: [1, 2, 3, 4], say: "Done. Flows are <b>sequential</b> by default: each element travels through every operator before the next is emitted — just like <code>Sequence</code>. Operators such as <code>buffer()</code> or <code>flowOn()</code> change this by adding a channel between stages.", state: snap() });
    return steps;
  })();
  register("flow-operators", {
    title: "Flow operators: follow each element down the chain",
    render: (s) => R.marbles(s.rows),
    modes: [{
      label: "map + filter", short: "map", code: `
        (1..4).asFlow()
            .map { it * 10 }
            .filter { it > 15 }
            .collect { println("got $it") }`,
      steps: opSteps,
    }],
  });

  /* ===================================================================== */
  /* 8. Time operators: debounce and flatMapLatest                          */
  /* ===================================================================== */
  register("flow-time-operators", {
    title: "debounce & flatMapLatest on a search box",
    render: (s, m) => R.clock(s.t) + R.gantt({ t: s.t, tMax: m.tMax, lanes: m.lanes }) + R.note(s.note),
    modes: [
      {
        label: "debounce(300)", tMax: 1300, code: `
          queryFlow                       // emits on every keystroke
              .debounce(300)              // wait for 300 ms of silence
              .collect { search(it) }`,
        lanes: [
          { label: "keystrokes", marks: [{ t: 0, label: "k", cls: "m-in" }, { t: 100, label: "ko", cls: "m-in" }, { t: 200, label: "kot", cls: "m-in" }, { t: 600, label: "kotl", cls: "m-in" }, { t: 700, label: "kotli", cls: "m-in" }, { t: 800, label: "kotlin", cls: "m-in" }] },
          { label: "300 ms timer", segs: [{ from: 0, to: 100, cls: "seg-cancel", label: "✗" }, { from: 100, to: 200, cls: "seg-cancel", label: "✗" }, { from: 200, to: 500, cls: "seg-a", label: "quiet ✓", short: "✓" }, { from: 600, to: 700, cls: "seg-cancel", label: "✗" }, { from: 700, to: 800, cls: "seg-cancel", label: "✗" }, { from: 800, to: 1100, cls: "seg-a", label: "quiet ✓", short: "✓" }] },
          { label: "search()", marks: [{ t: 500, label: "kot", cls: "m-out" }, { t: 1100, label: "kotlin", cls: "m-out" }] },
        ],
        steps: [
          { line: 1, say: "The user types <b>k</b>. debounce starts a 300 ms timer instead of emitting.", state: { t: 50 } },
          { line: 2, say: "<b>ko</b> arrives after 100 ms: the timer restarts. Fast typing keeps resetting it.", state: { t: 150 } },
          { line: 2, say: "<b>kot</b> — timer restarts again.", state: { t: 250 } },
          { line: 3, out: "search(kot)", say: "The user pauses. After 300 ms of silence, debounce emits the <b>latest</b> value, <code>kot</code>.", state: { t: 520 } },
          { line: 2, say: "Typing resumes: <b>kotl</b>, <b>kotli</b>, <b>kotlin</b> — each resets the timer.", state: { t: 820 } },
          { line: 3, out: "search(kotlin)", say: "300 ms after the last keystroke, <code>kotlin</code> is emitted. <b>6 keystrokes → 2 searches.</b>", state: { t: 1150, note: "Use debounce for search boxes, auto-save and sensor noise." } },
        ],
      },
      {
        label: "flatMapLatest", tMax: 900, code: `
          queryFlow
              .flatMapLatest { q ->      // a new query cancels the previous search
                  flow { emit(search(q)) }   // each search takes 400 ms
              }
              .collect { show(it) }`,
        lanes: [
          { label: "queries", marks: [{ t: 0, label: "ko", cls: "m-in" }, { t: 150, label: "kot", cls: "m-in" }, { t: 300, label: "kotlin", cls: "m-in" }] },
          { label: "search(ko)", short: "ko", segs: [{ from: 0, to: 150, cls: "seg-cancel", label: "cancelled" }] },
          { label: "search(kot)", short: "kot", segs: [{ from: 150, to: 300, cls: "seg-cancel", label: "cancelled" }] },
          { label: "search(kotlin)", short: "kotlin", segs: [{ from: 300, to: 700, cls: "seg-a", label: "running…", short: "run" }] },
          { label: "show()", marks: [{ t: 700, label: "results: kotlin", short: "results", cls: "m-out" }] },
        ],
        steps: [
          { line: [1, 2], say: "Query <b>ko</b> arrives; <code>flatMapLatest</code> starts an inner flow that runs the 400 ms search.", state: { t: 80 } },
          { line: 2, say: "<b>kot</b> arrives after 150 ms. The search for <code>ko</code> is still running — it's <b>cancelled</b>, and a new one starts.", state: { t: 220 } },
          { line: 2, say: "<b>kotlin</b> arrives: the <code>kot</code> search is cancelled too.", state: { t: 380 } },
          { line: 3, say: "Only the latest search keeps running.", state: { t: 560 } },
          { line: 5, out: "show(results for kotlin)", say: "Results for <b>kotlin</b> appear. Outdated results can never overwrite newer ones, and no work is wasted on stale queries.", state: { t: 720, note: "Combine both in real apps: <code>query.debounce(300).flatMapLatest { search(it) }</code>." } },
        ],
      },
    ],
  });

  /* ===================================================================== */
  /* 9. Channel fan-out vs SharedFlow broadcast                             */
  /* ===================================================================== */
  register("channel-vs-sharedflow", {
    title: "Channel (each item once) vs SharedFlow (every item to everyone)",
    render: (s) => R.broadcast(s) + R.note(s.note),
    modes: [
      {
        label: "Channel", code: `
          val jobs = Channel<Int>()
          repeat(2) { w ->
              launch { for (job in jobs) println("worker $w: $job") }
          }
          for (i in 1..4) jobs.send(i)`,
        steps: [
          { line: [1, 2, 3], say: "Two workers wait to receive from the same <code>Channel</code>.", state: { producers: [{ name: "sender", on: true }], hub: { title: "Channel", sub: "rendezvous queue" }, consumers: [{ name: "worker 0", on: true }, { name: "worker 1", on: true }] } },
          { line: 5, out: "worker 0: 1", say: "<code>send(1)</code>: the item goes to <b>one</b> waiting receiver.", state: { producers: [{ name: "sender", on: true, items: fresh(mk(1)) }], hub: { title: "Channel", sub: "1 → worker 0" }, consumers: [{ name: "worker 0", on: true, items: fresh(mk(1)) }, { name: "worker 1", on: true }] } },
          { line: 5, out: "worker 1: 2", say: "<code>send(2)</code> goes to the other worker.", state: { producers: [{ name: "sender", on: true, items: fresh(mk(1, 2)) }], hub: { title: "Channel", sub: "2 → worker 1" }, consumers: [{ name: "worker 0", on: true, items: mk(1) }, { name: "worker 1", on: true, items: fresh(mk(2)) }] } },
          { line: 5, out: ["worker 0: 3", "worker 1: 4"], say: "Items are <b>distributed</b>: each is processed exactly once. Perfect for work queues (fan-out).", state: { producers: [{ name: "sender", on: false, items: mk(1, 2, 3, 4) }], hub: { title: "Channel", sub: "fan-out" }, consumers: [{ name: "worker 0", on: true, items: mk(1, 3) }, { name: "worker 1", on: true, items: mk(2, 4) }] } },
        ],
      },
      {
        label: "SharedFlow", code: `
          val events = MutableSharedFlow<Int>()
          repeat(2) { s ->
              launch { events.collect { println("screen $s: $it") } }
          }
          for (i in 1..2) events.emit(i)`,
        steps: [
          { line: [1, 2, 3], say: "Two collectors subscribe to the same <code>SharedFlow</code>.", state: { producers: [{ name: "emitter", on: true }], hub: { title: "SharedFlow", sub: "broadcast" }, consumers: [{ name: "screen 0", on: true }, { name: "screen 1", on: true }] } },
          { line: 5, out: ["screen 0: 1", "screen 1: 1"], say: "<code>emit(1)</code> delivers the value to <b>every</b> subscriber.", state: { producers: [{ name: "emitter", on: true, items: fresh(mk(1)) }], hub: { title: "SharedFlow", sub: "broadcast" }, consumers: [{ name: "screen 0", on: true, items: fresh(mk(1)) }, { name: "screen 1", on: true, items: fresh(mk(1)) }] } },
          { line: 5, out: ["screen 0: 2", "screen 1: 2"], say: "Same for 2. Use SharedFlow for app-wide events many parts of the UI must react to; use a Channel when exactly one consumer should handle each item.", state: { producers: [{ name: "emitter", on: false, items: mk(1, 2) }], hub: { title: "SharedFlow", sub: "broadcast" }, consumers: [{ name: "screen 0", on: true, items: mk(1, 2) }, { name: "screen 1", on: true, items: mk(1, 2) }] } },
        ],
      },
    ],
  });

  /* ===================================================================== */
  /* 10. DSL: lambdas with receivers                                       */
  /* ===================================================================== */
  const W = (lines) => lines.join("\n");
  register("dsl-receivers", {
    title: "Inside a type-safe builder: who is `this`?",
    render: (s) => R.receivers(s.stack, s.build, s.blocked) + R.note(s.note),
    modes: [
      {
        label: "Building a workout", code: `
          val legDay = workout("Leg day") {     // this: WorkoutBuilder
              exercise("Squat") {               // this: ExerciseBuilder
                  sets = 5
                  reps = 5
              }
              exercise("Lunge") { reps = 12 }
              +"Calf raise"
          }`,
        steps: [
          { line: 1, say: "<code>workout()</code> creates a <code>WorkoutBuilder</code> and calls your lambda <b>with it as the receiver</b> (<code>WorkoutBuilder.() -&gt; Unit</code>).", state: { stack: ["WorkoutBuilder(\"Leg day\")"], build: W(["Workout(\"Leg day\") {", "}"]) } },
          { line: 2, say: "<code>exercise(…)</code> resolves to <code>this.exercise</code> on the WorkoutBuilder. It creates an <code>ExerciseBuilder</code>, which becomes the new innermost <code>this</code>.", state: { stack: ["WorkoutBuilder(\"Leg day\")", "ExerciseBuilder(\"Squat\")"], build: W(["Workout(\"Leg day\") {", "  <span class=\"fresh\">Squat (building…)</span>", "}"]) } },
          { line: 3, say: "<code>sets = 5</code> means <code>this.sets = 5</code> — the innermost receiver that has a <code>sets</code> property.", state: { stack: ["WorkoutBuilder(\"Leg day\")", "ExerciseBuilder(\"Squat\")"], build: W(["Workout(\"Leg day\") {", "  Squat <span class=\"fresh\">sets=5</span>", "}"]) } },
          { line: 4, say: "<code>reps = 5</code> likewise.", state: { stack: ["WorkoutBuilder(\"Leg day\")", "ExerciseBuilder(\"Squat\")"], build: W(["Workout(\"Leg day\") {", "  Squat sets=5 <span class=\"fresh\">reps=5</span>", "}"]) } },
          { line: 5, say: "The inner lambda ends: <code>build()</code> turns the builder into an immutable <code>Exercise</code>, which is added to the workout. The receiver stack pops.", state: { stack: ["WorkoutBuilder(\"Leg day\")"], build: W(["Workout(\"Leg day\") {", "  <span class=\"fresh\">Exercise(Squat, 5×5, rest 60)</span>", "}"]) } },
          { line: 6, say: "Another exercise; unspecified properties keep their defaults (sets = 3).", state: { stack: ["WorkoutBuilder(\"Leg day\")"], build: W(["Workout(\"Leg day\") {", "  Exercise(Squat, 5×5, rest 60)", "  <span class=\"fresh\">Exercise(Lunge, 3×12, rest 60)</span>", "}"]) } },
          { line: 7, say: "<code>+\"Calf raise\"</code> calls <code>String.unaryPlus()</code> — an extension <b>declared inside</b> WorkoutBuilder, so it only works in this scope.", state: { stack: ["WorkoutBuilder(\"Leg day\")"], build: W(["Workout(\"Leg day\") {", "  Exercise(Squat, 5×5, rest 60)", "  Exercise(Lunge, 3×12, rest 60)", "  <span class=\"fresh\">Exercise(Calf raise, 3×10, rest 60)</span>", "}"]) } },
          { line: 8, out: "Workout(title=Leg day, exercises=[3 items])", say: "The outer lambda ends; <code>workout()</code> calls <code>build()</code> and returns an immutable <code>Workout</code>. Builders are mutable; results are not.", state: { stack: [], build: W(["<span class=\"fresh\">Workout(\"Leg day\", totalSets = 11)</span>"]) } },
        ],
      },
      {
        label: "Why @DslMarker", code: `
          workout("Leg day") {
              exercise("Squat") {
                  sets = 5
                  exercise("Nested?") { }   // which receiver?
              }
          }`,
        steps: [
          { line: [1, 2], say: "Inside <code>exercise { }</code> there are <b>two</b> implicit receivers: the ExerciseBuilder (innermost) and the outer WorkoutBuilder.", state: { stack: ["WorkoutBuilder", "ExerciseBuilder"], build: "Squat (building…)" } },
          { line: 4, say: "<code>ExerciseBuilder</code> has no <code>exercise()</code> function, so <b>without</b> a DSL marker Kotlin silently resolves it on the <b>outer</b> WorkoutBuilder — adding a sibling exercise by accident.", state: { stack: ["WorkoutBuilder", "ExerciseBuilder"], build: "Squat (building…)\n<span class=\"fresh\">+ Nested? added to the WORKOUT (surprise!)</span>" } },
          { line: 4, out: "error: 'fun exercise(...)' can't be called in this context by implicit receiver. Use the explicit one if necessary", say: "With both builders annotated <code>@WorkoutDsl</code> (a <code>@DslMarker</code>), outer receivers of the same DSL are hidden in nested blocks. The mistake becomes a <b>compile error</b>; you'd have to write <code>this@workout.exercise(…)</code> to mean it.", state: { stack: ["WorkoutBuilder", "ExerciseBuilder"], blocked: true, build: "Squat (building…)\n<span class=\"fresh\">✗ compile error — scope leak prevented</span>", note: "This is why Compose, Ktor and Gradle DSLs feel safe: you can only call what belongs to the current block." } },
        ],
      },
    ],
  });

  /* ---------------------------------------------------------------- Boot */
  function boot() { $$(".sim[data-sim]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.KASim = { register, R };
})();
