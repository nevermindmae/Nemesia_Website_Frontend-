
/**
 * Nemesia "mock backend" – simple in-browser persistence via localStorage.
 * This simulates network latency and CRUD operations without any backend.
 */

const MockAPI = (() => {
  const KEY = "nemesia_db_v1";

  const defaultDB = {
    profile: {
      name: "Guest",
      currency: "NOK",
      createdAt: new Date().toISOString(),
    },
    catalogue: [
      {
        id: "botox-brow",
        name: "Neuromodulator – Brow Lift (non-surgical)",
        category: "Injectables",
        durationMin: 15,
        downtimeDays: 0,
        priceRange: [2500, 4500],
        repeatEveryMonths: 3,
        riskLevel: "Low",
        overview:
          "Targets muscle activity to subtly elevate the brow area. Results vary with anatomy and dosing.",
        aftercare: [
          "Avoid rubbing the area for 24h",
          "Stay upright for 4h",
          "Delay intense exercise for 24h",
        ],
        misconceptions: [
          "“It freezes your whole face” – dosing and placement are targeted",
          "“Results are instant” – peak effect typically develops over days",
        ],
      },
      {
        id: "filler-lips",
        name: "Dermal Filler – Lips",
        category: "Injectables",
        durationMin: 30,
        downtimeDays: 2,
        priceRange: [3500, 6500],
        repeatEveryMonths: 9,
        riskLevel: "Medium",
        overview:
          "Adds volume and shape. Technique and product selection matter for natural results.",
        aftercare: [
          "Expect swelling/bruising for 24–72h",
          "Avoid alcohol for 24h",
          "Use cold compresses if needed",
        ],
        misconceptions: [
          "“All fillers look the same” – outcomes depend heavily on technique",
          "“Bigger is better” – balance and proportion are key",
        ],
      },
      {
        id: "skin-needling",
        name: "Microneedling (Skin Needling)",
        category: "Skin",
        durationMin: 45,
        downtimeDays: 3,
        priceRange: [1800, 3500],
        repeatEveryMonths: 1,
        riskLevel: "Low",
        overview:
          "Creates microchannels to support skin renewal. Often performed as a series for cumulative effect.",
        aftercare: [
          "Skip actives (retinoids/acids) for 48–72h",
          "Use gentle cleanser + moisturiser",
          "SPF daily",
        ],
        misconceptions: [
          "“More depth is always better” – too aggressive can inflame and harm",
        ],
      },
      {
        id: "laser-pigment",
        name: "Laser – Pigment Correction",
        category: "Energy-based",
        durationMin: 30,
        downtimeDays: 5,
        priceRange: [2200, 5200],
        repeatEveryMonths: 2,
        riskLevel: "Medium",
        overview:
          "Targets pigment with light energy. Requires clinician assessment for skin type and pigment origin.",
        aftercare: [
          "Strict sun avoidance + SPF",
          "Do not pick flaking skin",
          "Follow clinic-specific guidance",
        ],
        misconceptions: [
          "“One session fixes everything” – series often recommended",
          "“Sun is fine after” – sun exposure increases risk of rebound pigmentation",
        ],
      },
      {
        id: "rf-tighten",
        name: "Radiofrequency (RF) Skin Tightening",
        category: "Energy-based",
        durationMin: 60,
        downtimeDays: 0,
        priceRange: [2500, 7000],
        repeatEveryMonths: 6,
        riskLevel: "Low",
        overview:
          "Heats tissue to stimulate collagen remodelling over time. Results are gradual.",
        aftercare: [
          "Hydrate well",
          "Use gentle skincare for 24h",
          "Avoid hot sauna same day",
        ],
        misconceptions: [
          "“Instant lift” – improvements develop over weeks/months",
        ],
      },
    ],
    plan: {
      entries: [
        {
          id: "e1",
          procedureId: "skin-needling",
          date: new Date(Date.now() - 86400000 * 28).toISOString(),
          clinic: "Demo Clinic Oslo",
          cost: 2600,
          notes: "Patch test done prior. Mild redness for 2 days.",
        },
        {
          id: "e2",
          procedureId: "botox-brow",
          date: new Date(Date.now() - 86400000 * 95).toISOString(),
          clinic: "Demo Clinic Oslo",
          cost: 3900,
          notes: "Subtle lift; will reassess in 3 months.",
        },
      ],
    },
    forum: {
      threads: [
        {
          id: "t1",
          title: "Post-treatment care: what actually matters?",
          tag: "Aftercare",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          author: "MushiMaster",
          body:
            "Share the single most important aftercare tip you wish you knew earlier. Keep it practical and evidence-minded.",
          likes: 18,
          posts: [
            {
              id: "p1",
              author: "Guest",
              createdAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
              body:
                "SPF. Always. I underestimated how much it influences outcomes after pigment-focused treatments.",
              likes: 6,
            },
          ],
        },
        {
          id: "t2",
          title: "How do you evaluate risk vs. marketing hype?",
          tag: "Decision-making",
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          author: "EquilibriumSeeker",
          body:
            "What questions do you ask a clinic to separate facts from sales? Any red flags you’ve noticed?",
          likes: 31,
          posts: [],
        },
      ],
    },
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaultDB);
      return JSON.parse(raw);
    } catch (e) {
      console.warn("DB load failed, using defaults", e);
      return structuredClone(defaultDB);
    }
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  // Public API (mock networked)
  return {
    async getCatalogue() {
      await sleep(220);
      return load().catalogue;
    },
    async getProcedure(id) {
      await sleep(180);
      return load().catalogue.find((p) => p.id === id);
    },
    async getPlan() {
      await sleep(220);
      return load().plan.entries;
    },
    async addPlanEntry(entry) {
      await sleep(260);
      const db = load();
      const e = { id: uid("e"), ...entry };
      db.plan.entries.unshift(e);
      save(db);
      return e;
    },
    async deletePlanEntry(entryId) {
      await sleep(220);
      const db = load();
      db.plan.entries = db.plan.entries.filter((e) => e.id !== entryId);
      save(db);
      return true;
    },
    async getForumThreads() {
      await sleep(240);
      return load().forum.threads;
    },
    async createThread({ title, tag, body, author }) {
      await sleep(280);
      const db = load();
      const t = {
        id: uid("t"),
        title,
        tag,
        body,
        author: author || "Guest",
        createdAt: new Date().toISOString(),
        likes: 0,
        posts: [],
      };
      db.forum.threads.unshift(t);
      save(db);
      return t;
    },
    async addPost(threadId, { body, author }) {
      await sleep(260);
      const db = load();
      const t = db.forum.threads.find((x) => x.id === threadId);
      if (!t) throw new Error("Thread not found");
      const p = {
        id: uid("p"),
        author: author || "Guest",
        createdAt: new Date().toISOString(),
        body,
        likes: 0,
      };
      t.posts.push(p);
      save(db);
      return p;
    },
    async likeThread(threadId) {
      await sleep(160);
      const db = load();
      const t = db.forum.threads.find((x) => x.id === threadId);
      if (!t) throw new Error("Thread not found");
      t.likes += 1;
      save(db);
      return t.likes;
    },
    async likePost(threadId, postId) {
      await sleep(160);
      const db = load();
      const t = db.forum.threads.find((x) => x.id === threadId);
      if (!t) throw new Error("Thread not found");
      const p = t.posts.find((x) => x.id === postId);
      if (!p) throw new Error("Post not found");
      p.likes += 1;
      save(db);
      return p.likes;
    },
    async reset() {
      await sleep(120);
      save(structuredClone(defaultDB));
      return true;
    },
  };
})();
