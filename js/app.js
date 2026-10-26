(() => {
  const { $, $$, copy, download, store, debounce, tabs } = Prism;
  const form = $("#form");
  let stack = new Set(), view = "preview";
  const EXAMPLE = { name: "Prism Arena", tagline: "Real-time coding battles for young builders", user: "krishyaa06", repo: "prism-arena", about: "Prism Arena lets developers compete in timed coding challenges, climb a live leaderboard and level up together. Built for the Prism Protocol community.", features: "Live 1v1 and squad battles\nAuto-graded challenges in 5 languages\nRealtime leaderboard and XP\nDiscord login and bot integration", usage: "Create a room, share the invite code, and hit **Start**.\n\n```bash\nnpm run seed   # load sample challenges\n```", env: "DATABASE_URL=Postgres connection string\nDISCORD_CLIENT_ID=OAuth app id", roadmap: "[x] Realtime rooms\n[x] Leaderboard\nTournament brackets\nMobile app", author: "Soumya Bhandare", demo: "https://krishyaa06.github.io/prism-arena/", stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"] };
  $("#stack").innerHTML = Core.STACK.map((t) => `<button type="button" data-t="${t}">${t}</button>`).join("");
  $("#stack").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; stack.has(b.dataset.t) ? stack.delete(b.dataset.t) : stack.add(b.dataset.t); b.classList.toggle("on"); render(); };
  function data() {
    const d = {};
    for (const el of form.elements) if (el.name) d[el.name] = el.type === "checkbox" ? el.checked : el.value.trim();
    d.badges = ["stars", "license", "issues", "commit"].filter((b) => d["b-" + b]);
    d.stack = [...stack]; return d;
  }
  function fill(d) {
    for (const el of form.elements) if (el.name && d[el.name] != null) el.type === "checkbox" ? (el.checked = !!d[el.name]) : (el.value = d[el.name]);
    stack = new Set(d.stack || []); $$("#stack button").forEach((b) => b.classList.toggle("on", stack.has(b.dataset.t)));
  }
  function render() {
    const d = data(); store.set("readme:data", d);
    const md = Core.generate(d);
    $("#raw").textContent = md; $("#preview").innerHTML = Core.md(md);
    const s = Core.score(d);
    $("#score").className = "pill " + (s.value >= 80 ? "ok" : s.value >= 50 ? "warn" : "bad"); $("#score").textContent = `Score ${s.value}%`;
    $("#checks").innerHTML = s.checks.map(([n, ok]) => `<span class="pill ${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${n}</span>`).join("");
  }
  form.addEventListener("input", debounce(render, 150));
  tabs($("#view"), (v) => { view = v; $("#preview").hidden = v !== "preview"; $("#raw").hidden = v !== "md"; });
  $("#example").onclick = () => { fill(EXAMPLE); render(); };
  $("#reset").onclick = () => { form.reset(); fill({ stack: [] }); render(); };
  $("#copy").onclick = () => copy($("#raw").textContent, "Markdown copied");
  $("#dl").onclick = () => download("README.md", $("#raw").textContent, "text/markdown");
  fill(store.get("readme:data", EXAMPLE)); render();
})();
