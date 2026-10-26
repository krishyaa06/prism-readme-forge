/* Prism README Forge · core logic (browser + Node) */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Core = api;
})(typeof self !== "undefined" ? self : this, function () {
  /* Tiny Markdown renderer (headings, lists, code, tables, quotes, links, images, html passthrough for <p>/<img>) */
  function md(src) {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" />')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>");
    const lines = src.replace(/\r\n/g, "\n").split("\n"), out = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`); continue; }
      if (/^<(p|img|div|h\d|a|br|table|picture)\b/i.test(l.trim())) { const buf = [l]; while (i + 1 < lines.length && lines[i + 1].trim() && !/^#/.test(lines[i + 1])) buf.push(lines[++i]); out.push(`<div class="raw">${buf.join("\n").replace(/<script/gi, "&lt;script").replace(/ on\w+=/gi, " data-x=")}</div>`); continue; }
      let m;
      if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
      if (/^(-{3,}|\*{3,})$/.test(l.trim())) { out.push("<hr />"); continue; }
      if (/^>\s?/.test(l)) { const buf = []; while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, "")); i--; out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`); continue; }
      if (/^\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\|?\s*:?-+/.test(lines[i + 1])) {
        const row = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        const head = row(l); i += 2; const body = [];
        while (i < lines.length && /^\|/.test(lines[i])) body.push(row(lines[i++])); i--;
        out.push(`<table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`); continue;
      }
      if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
        const ordered = /^\s*\d+\./.test(l), buf = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, "")); i--;
        const tag = ordered ? "ol" : "ul";
        out.push(`<${tag}>${buf.map((b) => `<li>${inline(b).replace(/^\[ \]\s/, '<input type="checkbox" disabled /> ').replace(/^\[x\]\s/i, '<input type="checkbox" checked disabled /> ')}</li>`).join("")}</${tag}>`); continue;
      }
      if (!l.trim()) continue;
      const buf = [l]; while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|```|>|\||\s*([-*+]|\d+\.)\s|<)/.test(lines[i + 1])) buf.push(lines[++i]);
      out.push(`<p>${inline(buf.join(" "))}</p>`);
    }
    return out.join("\n");
  }
  const enc = encodeURIComponent;
  const BADGE_COLORS = { JavaScript: "F7DF1E", TypeScript: "3178C6", React: "61DAFB", "Next.js": "000000", "Node.js": "339933", Python: "3776AB", Tailwind: "06B6D4", Vite: "646CFF", Express: "000000", MongoDB: "47A248", PostgreSQL: "4169E1", Docker: "2496ED", Firebase: "FFCA28", Supabase: "3FCF8E", "Discord.js": "5865F2", Go: "00ADD8", Rust: "000000", Flutter: "02569B", Vue: "4FC08D", Svelte: "FF3E00" };
  const LOGOS = { JavaScript: "javascript", TypeScript: "typescript", React: "react", "Next.js": "nextdotjs", "Node.js": "nodedotjs", Python: "python", Tailwind: "tailwindcss", Vite: "vite", Express: "express", MongoDB: "mongodb", PostgreSQL: "postgresql", Docker: "docker", Firebase: "firebase", Supabase: "supabase", "Discord.js": "discord", Go: "go", Rust: "rust", Flutter: "flutter", Vue: "vuedotjs", Svelte: "svelte" };
  const badge = (t) => { const c = BADGE_COLORS[t] || "6C63FF"; const dark = ["F7DF1E", "61DAFB", "FFCA28", "3FCF8E"].includes(c); return `<img src="https://img.shields.io/badge/${enc(t.replace(/-/g, "--"))}-${c}?style=for-the-badge${LOGOS[t] ? `&logo=${LOGOS[t]}` : ""}&logoColor=${dark ? "black" : "white"}" alt="${t}" />`; };
  const slug = (s) => String(s || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  function generate(d) {
    const name = d.name || "my-project", repo = d.user && d.repo ? `${d.user}/${d.repo}` : null;
    const S = [], toc = [];
    const sec = (title, body, emoji) => { if (!body || !String(body).trim()) return; const t = (d.emoji !== false && emoji ? emoji + " " : "") + title; toc.push(`- [${title}](#${slug(t)})`); S.push(`## ${t}\n\n${body.trim()}\n`); };
    const head = [];
    if (d.header) head.push(`<p align="center">\n  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:${(d.color || "00d2ff").replace("#", "")},100:${(d.color2 || "6c63ff").replace("#", "")}&height=180&section=header&text=${enc(name)}&fontSize=44&fontColor=ffffff&desc=${enc(d.tagline || "")}&descAlignY=62&animation=fadeIn" width="100%" />\n</p>\n`);
    else head.push(`<h1 align="center">${d.logo ? `<img src="${d.logo}" width="72" /><br>` : ""}${name}</h1>\n\n<p align="center">${d.tagline || ""}</p>\n`);
    const badges = [];
    if (repo && d.badges?.includes("stars")) badges.push(`<img src="https://img.shields.io/github/stars/${repo}?style=for-the-badge&color=f5c561" alt="Stars" />`);
    if (repo && d.badges?.includes("license")) badges.push(`<img src="https://img.shields.io/github/license/${repo}?style=for-the-badge&color=6c63ff" alt="License" />`);
    if (repo && d.badges?.includes("issues")) badges.push(`<img src="https://img.shields.io/github/issues/${repo}?style=for-the-badge&color=ff6b8a" alt="Issues" />`);
    if (repo && d.badges?.includes("commit")) badges.push(`<img src="https://img.shields.io/github/last-commit/${repo}?style=for-the-badge&color=3ee69a" alt="Last commit" />`);
    (d.stack || []).forEach((t) => badges.push(badge(t)));
    if (badges.length) head.push(`<p align="center">\n  ${badges.join("\n  ")}\n</p>\n`);
    if (d.demo || d.screenshot) head.push(`<p align="center">\n  ${d.demo ? `<a href="${d.demo}"><b>Live demo →</b></a>` : ""}${d.demo && d.screenshot ? "<br><br>\n  " : ""}${d.screenshot ? `<img src="${d.screenshot}" width="85%" alt="Screenshot" />` : ""}\n</p>\n`);
    sec("About", d.about, "⚡");
    sec("Features", (d.features || "").split("\n").filter((x) => x.trim()).map((f) => `- ${f.replace(/^[-*]\s*/, "")}`).join("\n"), "✨");
    if (d.stack?.length) sec("Tech Stack", d.stack.map((t) => `- **${t}**`).join("\n"), "🧰");
    const install = d.install || (repo ? `\`\`\`bash\ngit clone https://github.com/${repo}.git\ncd ${d.repo}\n${d.pm || "npm"} install\n${d.pm === "yarn" ? "yarn dev" : d.pm === "pnpm" ? "pnpm dev" : "npm run dev"}\n\`\`\`` : "");
    sec("Getting Started", install, "🚀");
    sec("Usage", d.usage, "🛠️");
    if (d.env) sec("Environment Variables", "| Variable | Description |\n| --- | --- |\n" + d.env.split("\n").filter((x) => x.trim()).map((l) => { const [k, ...r] = l.split(/[=:]/); return `| \`${k.trim()}\` | ${r.join(":").trim()} |`; }).join("\n"), "🔑");
    if (d.roadmap) sec("Roadmap", d.roadmap.split("\n").filter((x) => x.trim()).map((l) => `- [${/^\s*\[x\]/i.test(l) ? "x" : " "}] ${l.replace(/^\s*(-\s*)?\[[ x]\]\s*/i, "")}`).join("\n"), "🗺️");
    if (d.contributing) sec("Contributing", "Contributions are welcome.\n\n1. Fork the project\n2. Create your branch: `git checkout -b feature/amazing`\n3. Commit: `git commit -m \"feat: add amazing\"`\n4. Push and open a Pull Request", "🤝");
    if (d.author) sec("Author", `**${d.author}**${d.user ? ` · [@${d.user}](https://github.com/${d.user})` : ""}${d.twitter ? ` · [X](https://x.com/${d.twitter.replace("@", "")})` : ""}`, "👤");
    if (d.license) sec("License", `Distributed under the ${d.license} License. See \`LICENSE\` for details.`, "📄");
    const tocBlock = d.toc && toc.length > 3 ? `## Table of Contents\n\n${toc.join("\n")}\n` : "";
    return [head.join("\n"), tocBlock, S.join("\n"), d.star ? `<p align="center">If this project helped you, give it a ⭐</p>\n` : ""].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
  }
  function score(d) {
    const checks = [["Tagline", !!d.tagline], ["About section", (d.about || "").length > 40], ["3+ features", (d.features || "").split("\n").filter((x) => x.trim()).length >= 3], ["Screenshot or demo", !!(d.screenshot || d.demo)], ["Install steps", !!(d.install || (d.user && d.repo))], ["Usage", !!d.usage], ["Tech stack", (d.stack || []).length > 0], ["License", !!d.license]];
    return { checks, value: Math.round((checks.filter((c) => c[1]).length / checks.length) * 100) };
  }
  return { md, generate, score, badge, STACK: Object.keys(BADGE_COLORS) };
});
