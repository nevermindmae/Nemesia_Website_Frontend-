
/**
 * Shared UI helpers + page initialisers
 * Uses: Bootstrap 5, GSAP + ScrollTrigger, Lenis for smooth scrolling
 */

function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

function fmtCurrency(n, currency = "NOK") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.floor(h / 24);
  return `${days} d ago`;
}

function initLenis() {
  if (!window.Lenis) return;
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

function initSharedAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { y: 18, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  // Navbar subtle elevation on scroll
  const nav = qs(".navbar");
  if (nav) {
    ScrollTrigger.create({
      start: 0, end: 99999,
      onUpdate: (self) => {
        nav.style.boxShadow = self.scroll() > 12 ? "0 10px 30px rgba(0,0,0,.06)" : "none";
      }
    });
  }
}

// Flower rain canvas (homepage hero)
function initFlowerRain(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext("2d");
  let w, h, dpr;

  const flowers = Array.from({ length: 50 }).map(() => spawn());
  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = c.clientWidth; h = c.clientHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn() {
    const x = Math.random();
    return {
      x: x,
      y: -0.2 - Math.random() * 0.8,
      s: 8 + Math.random() * 16,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      vy: 0.002 + Math.random() * 0.006,
      vx: (Math.random() - 0.5) * 0.001,
      hue: 270 + Math.random() * 40, // lilac-ish
      alpha: 0.35 + Math.random() * 0.35
    };
  }
  function drawFlower(f) {
    const px = f.x * w;
    const py = f.y * h;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(f.r);
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = `hsla(${f.hue}, 25%, 70%, 1)`;
    // simple 5-petal
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -f.s * 0.35, f.s * 0.22, f.s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(247,244,239,.9)";
    ctx.beginPath();
    ctx.arc(0, 0, f.s * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flowers) {
      f.y += f.vy;
      f.x += f.vx;
      f.r += f.vr;
      drawFlower(f);
      if (f.y > 1.2) {
        Object.assign(f, spawn());
      }
    }
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  tick();
}

function initHomepage() {
  initFlowerRain("flowerRain");
  if (window.gsap) {
    gsap.from(".hero-title", { y: 16, opacity: 0, duration: 0.9, ease: "power2.out" });
    gsap.from(".hero-sub", { y: 10, opacity: 0, duration: 0.9, delay: 0.15, ease: "power2.out" });
    gsap.from(".hero-cta", { y: 10, opacity: 0, duration: 0.9, delay: 0.25, ease: "power2.out" });
  }
}

// Catalogue page
async function initCatalogue() {
  const grid = qs("#catalogueGrid");
  const filterSel = qs("#filterCategory");
  const searchInput = qs("#searchInput");
  const skeleton = qs("#catalogueSkeleton");
  const empty = qs("#catalogueEmpty");

  const catalogue = await MockAPI.getCatalogue();

  const categories = ["All", ...Array.from(new Set(catalogue.map(x => x.category)))];
  filterSel.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");

  function render(items) {
    grid.innerHTML = items.map(p => {
      const [low, high] = p.priceRange;
      return `
        <div class="col-md-6 col-lg-4" data-reveal>
          <div class="card-glass p-3 h-100">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="badge-soft mb-2">${p.category}</div>
                <h5 class="mb-1" style="letter-spacing:-0.02em;font-weight:700">${p.name}</h5>
                <div class="small text-muted">${p.durationMin} min · ${p.downtimeDays} d downtime · Risk: ${p.riskLevel}</div>
              </div>
              <button class="btn btn-outline-primary btn-sm" data-proc="${p.id}" data-bs-toggle="modal" data-bs-target="#procModal">View</button>
            </div>
            <hr class="my-3" style="opacity:.08">
            <div class="d-flex justify-content-between align-items-end">
              <div class="small" style="color:rgba(46,46,46,.75)">Typical price</div>
              <div style="font-weight:800">${fmtCurrency(low)}–${fmtCurrency(high)}</div>
            </div>
          </div>
        </div>
      `;
    }).join("");
    empty.classList.toggle("d-none", items.length !== 0);
    initSharedAnimations();
  }

  function apply() {
    const cat = filterSel.value;
    const q = searchInput.value.trim().toLowerCase();
    let items = [...catalogue];
    if (cat !== "All") items = items.filter(x => x.category === cat);
    if (q) items = items.filter(x => (x.name + " " + x.overview).toLowerCase().includes(q));
    render(items);
  }

  filterSel.addEventListener("change", apply);
  searchInput.addEventListener("input", apply);

  // Modal details
  const modalEl = qs("#procModal");
  modalEl.addEventListener("show.bs.modal", async (ev) => {
    const btn = ev.relatedTarget;
    const id = btn?.getAttribute("data-proc");
    const proc = await MockAPI.getProcedure(id);
    qs("#procTitle").textContent = proc.name;
    qs("#procMeta").textContent = `${proc.durationMin} min · ${proc.downtimeDays} d downtime · Repeat ~ every ${proc.repeatEveryMonths} months · Risk: ${proc.riskLevel}`;
    qs("#procOverview").textContent = proc.overview;

    qs("#procMisconceptions").innerHTML = proc.misconceptions.map(x => `<li>${x}</li>`).join("");
    qs("#procAftercare").innerHTML = proc.aftercare.map(x => `<li>${x}</li>`).join("");

    const [low, high] = proc.priceRange;
    qs("#procPrice").textContent = `${fmtCurrency(low)}–${fmtCurrency(high)} (typical)`;

    qs("#addToPlanBtn").onclick = () => {
      // Pre-fill Visualise with selected procedure
      localStorage.setItem("nemesia_prefill_proc", proc.id);
      window.location.href = "visualise.html";
    };
  });

  skeleton.classList.add("d-none");
  apply();
}

// Visualise page (planner)
async function initVisualise() {
  const catalogue = await MockAPI.getCatalogue();
  const entries = await MockAPI.getPlan();

  const procSel = qs("#procSelect");
  const tableBody = qs("#planTableBody");
  const totalEl = qs("#totalSpend");
  const forecastEl = qs("#forecast");
  const currencySel = qs("#currencySelect");

  procSel.innerHTML = catalogue.map(p => `<option value="${p.id}">${p.name}</option>`).join("");

  const prefill = localStorage.getItem("nemesia_prefill_proc");
  if (prefill) {
    procSel.value = prefill;
    localStorage.removeItem("nemesia_prefill_proc");
  }

  function calcTotals(list) {
    const total = list.reduce((s, e) => s + (Number(e.cost) || 0), 0);
    totalEl.textContent = fmtCurrency(total, currencySel.value);
  }

  function forecast(list) {
    // Simple forecast: for each unique procedure, assume repeat cadence from catalogue for next 24 months
    const now = new Date();
    const horizonMonths = 24;
    const end = new Date(now);
    end.setMonth(end.getMonth() + horizonMonths);

    const lastByProc = {};
    for (const e of list) {
      const d = new Date(e.date);
      if (!lastByProc[e.procedureId] || d > new Date(lastByProc[e.procedureId].date)) {
        lastByProc[e.procedureId] = e;
      }
    }

    let projected = 0;
    const lines = [];
    for (const [procId, last] of Object.entries(lastByProc)) {
      const proc = catalogue.find(p => p.id === procId);
      if (!proc) continue;
      const cadence = proc.repeatEveryMonths || 0;
      if (!cadence) continue;

      let next = new Date(last.date);
      while (true) {
        next.setMonth(next.getMonth() + cadence);
        if (next > end) break;
        projected += Number(last.cost) || 0;
      }
      lines.push({ name: proc.name, cadence, base: Number(last.cost) || 0 });
    }

    forecastEl.innerHTML = `
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${lines.slice(0,4).map(x => `<span class="pill">${x.name.split("–")[0].trim()} · every ${x.cadence} mo</span>`).join("")}
      </div>
      <div class="d-flex justify-content-between align-items-end">
        <div class="small text-muted">Projected repeat-procedure cost (next ${horizonMonths} months)</div>
        <div style="font-weight:800">${fmtCurrency(projected, currencySel.value)}</div>
      </div>
      <div class="small text-muted mt-2">This is a simplified estimate using your last recorded cost as the repeat cost.</div>
    `;
  }

  function render(list) {
    tableBody.innerHTML = list.map(e => {
      const p = catalogue.find(x => x.id === e.procedureId);
      const d = new Date(e.date);
      const ds = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
      return `
        <tr>
          <td>${ds}</td>
          <td>${p ? p.name : e.procedureId}</td>
          <td class="text-muted">${e.clinic || "—"}</td>
          <td class="text-end">${fmtCurrency(Number(e.cost) || 0, currencySel.value)}</td>
          <td class="text-end">
            <button class="btn btn-outline-primary btn-sm" data-del="${e.id}">Remove</button>
          </td>
        </tr>
      `;
    }).join("");

    qsa("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await MockAPI.deletePlanEntry(btn.getAttribute("data-del"));
        const fresh = await MockAPI.getPlan();
        render(fresh);
        calcTotals(fresh);
        forecast(fresh);
      });
    });

    calcTotals(list);
    forecast(list);
  }

  render(entries);

  currencySel.addEventListener("change", async () => {
    const fresh = await MockAPI.getPlan();
    render(fresh);
  });

  qs("#addEntryForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const procId = procSel.value;
    const date = qs("#dateInput").value;
    const clinic = qs("#clinicInput").value;
    const cost = qs("#costInput").value;
    const notes = qs("#notesInput").value;

    // "Backend" validation simulated
    if (!date || !cost) {
      qs("#formError").textContent = "Date and cost are required.";
      qs("#formError").classList.remove("d-none");
      return;
    }
    qs("#formError").classList.add("d-none");

    await MockAPI.addPlanEntry({
      procedureId: procId,
      date: new Date(date).toISOString(),
      clinic,
      cost: Number(cost),
      notes,
    });

    // Refresh view
    const fresh = await MockAPI.getPlan();
    render(fresh);

    // Reset inputs
    ev.target.reset();
    qs("#clinicInput").value = "Demo Clinic Oslo";
  });

  // Reset demo DB
  qs("#resetDemoBtn").addEventListener("click", async () => {
    await MockAPI.reset();
    const fresh = await MockAPI.getPlan();
    render(fresh);
  });
}

// Forum page
async function initForum() {
  const listEl = qs("#threadList");
  const detailEl = qs("#threadDetail");
  const threads = await MockAPI.getForumThreads();

  function threadCard(t) {
    return `
      <button class="list-group-item list-group-item-action card-glass mb-2 p-3" data-open="${t.id}">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="badge-soft mb-2">${t.tag}</div>
            <div style="font-weight:800; letter-spacing:-0.02em">${t.title}</div>
            <div class="small text-muted">by ${t.author} · ${timeAgo(t.createdAt)} · ${t.posts.length} replies</div>
          </div>
          <div class="text-end">
            <div class="pill">♥ ${t.likes}</div>
          </div>
        </div>
      </button>
    `;
  }

  function renderList(items) {
    listEl.innerHTML = items.map(threadCard).join("");
    qsa("[data-open]").forEach(btn => btn.addEventListener("click", () => openThread(btn.getAttribute("data-open"))));
  }

  function renderDetail(t) {
    detailEl.innerHTML = `
      <div class="card-glass p-4">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="badge-soft mb-2">${t.tag}</div>
            <h3 class="mb-1" style="letter-spacing:-0.02em;font-weight:800">${t.title}</h3>
            <div class="small text-muted">by ${t.author} · ${timeAgo(t.createdAt)}</div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" id="likeThreadBtn">♥ Like (${t.likes})</button>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#replyModal">Reply</button>
          </div>
        </div>
        <hr class="my-3" style="opacity:.08">
        <p class="mb-0" style="color:rgba(46,46,46,.82)">${t.body}</p>
      </div>

      <div class="mt-3">
        <div class="d-flex justify-content-between align-items-end mb-2">
          <div class="small text-muted">${t.posts.length} replies</div>
        </div>
        ${t.posts.map(p => `
          <div class="card-glass p-3 mb-2">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div style="font-weight:700">${p.author}</div>
                <div class="small text-muted">${timeAgo(p.createdAt)}</div>
              </div>
              <button class="btn btn-outline-primary btn-sm" data-likepost="${p.id}">♥ ${p.likes}</button>
            </div>
            <div class="mt-2">${p.body}</div>
          </div>
        `).join("")}
      </div>
    `;

    qs("#likeThreadBtn").addEventListener("click", async () => {
      const likes = await MockAPI.likeThread(t.id);
      const fresh = await MockAPI.getForumThreads();
      const updated = fresh.find(x => x.id === t.id);
      renderList(fresh);
      renderDetail(updated);
    });

    qsa("[data-likepost]").forEach(btn => btn.addEventListener("click", async () => {
      await MockAPI.likePost(t.id, btn.getAttribute("data-likepost"));
      const fresh = await MockAPI.getForumThreads();
      const updated = fresh.find(x => x.id === t.id);
      renderList(fresh);
      renderDetail(updated);
    }));

    // Reply modal submit
    const form = qs("#replyForm");
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      const body = qs("#replyBody").value.trim();
      if (!body) return;
      await MockAPI.addPost(t.id, { body, author: "Guest" });
      const modal = bootstrap.Modal.getOrCreateInstance(qs("#replyModal"));
      modal.hide();
      qs("#replyBody").value = "";
      const fresh = await MockAPI.getForumThreads();
      const updated = fresh.find(x => x.id === t.id);
      renderList(fresh);
      renderDetail(updated);
    };
  }

  function openThread(id) {
    const t = threads.find(x => x.id === id) || threads[0];
    if (!t) return;
    renderDetail(t);
  }

  // Search/filter
  const search = qs("#forumSearch");
  search.addEventListener("input", async () => {
    const q = search.value.trim().toLowerCase();
    const fresh = await MockAPI.getForumThreads();
    const filtered = !q ? fresh : fresh.filter(t => (t.title + " " + t.tag + " " + t.body).toLowerCase().includes(q));
    renderList(filtered);
    if (filtered[0]) renderDetail(filtered[0]);
  });

  // Create thread
  qs("#newThreadForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const title = qs("#newTitle").value.trim();
    const tag = qs("#newTag").value;
    const body = qs("#newBody").value.trim();
    if (!title || !body) return;

    await MockAPI.createThread({ title, tag, body, author: "Guest" });
    const modal = bootstrap.Modal.getOrCreateInstance(qs("#newThreadModal"));
    modal.hide();
    ev.target.reset();

    const fresh = await MockAPI.getForumThreads();
    renderList(fresh);
    renderDetail(fresh[0]);
  });

  renderList(threads);
  openThread(threads[0]?.id);
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initSharedAnimations();

  const page = document.body.getAttribute("data-page");
  if (page === "home") initHomepage();
  if (page === "catalogue") initCatalogue();
  if (page === "visualise") initVisualise();
  if (page === "forum") initForum();
});
