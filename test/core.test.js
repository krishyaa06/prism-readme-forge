const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/core.js");

test("generates sections in order", () => {
  const md = C.generate({ name: "Demo", tagline: "t", about: "About text", features: "One\nTwo", user: "u", repo: "r", license: "MIT", stack: ["React"], toc: false });
  assert.match(md, /<h1 align="center">Demo<\/h1>/);
  assert.ok(md.indexOf("About") < md.indexOf("Features") && md.indexOf("Features") < md.indexOf("License"));
  assert.match(md, /- One\n- Two/);
  assert.match(md, /git clone https:\/\/github.com\/u\/r.git/);
  assert.match(md, /logo=react/);
});
test("table of contents when enough sections", () => {
  const md = C.generate({ name: "x", about: "a", features: "f", usage: "u", license: "MIT", toc: true, emoji: false });
  assert.match(md, /- \[About\]\(#about\)/);
});
test("roadmap checkboxes and env table", () => {
  const md = C.generate({ roadmap: "[x] done\ntodo", env: "API_KEY=Your key" });
  assert.match(md, /- \[x\] done\n- \[ \] todo/);
  assert.match(md, /\| `API_KEY` \| Your key \|/);
});
test("markdown renderer", () => {
  const h = C.md("# Hi\n\n- **a**\n- `b`\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```js\nx<y\n```");
  assert.match(h, /<h1>Hi<\/h1>/); assert.match(h, /<li><strong>a<\/strong><\/li>/);
  assert.match(h, /<td>2<\/td>/); assert.match(h, /x&lt;y/);
});
test("score", () => {
  assert.equal(C.score({}).value, 0);
  assert.ok(C.score({ tagline: "x", about: "x".repeat(50), license: "MIT" }).value > 30);
});
