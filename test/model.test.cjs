const test = require("node:test");
const assert = require("node:assert/strict");
const {
  starter,
  readDraft,
  impose,
  maxTitle,
  maxBody,
} = require("../public/model.js");

test("a single sheet places the cover on the bottom right and inverts the upper row", () => {
  const pages = starter();
  pages[0].title = "My cover";
  const result = impose(pages);
  assert.deepEqual(
    result.map((page) => page.number),
    [5, 4, 3, 2, 6, 7, 8, 1],
  );
  assert.deepEqual(
    result.map((page) => page.rotation),
    [180, 180, 180, 180, 0, 0, 0, 0],
  );
  assert.equal(result[7].title, "My cover");
});

test("drafts restore empty pages, limit text and recover from malformed storage", () => {
  const pages = starter();
  pages[0] = { title: "", body: "" };
  pages[5] = { title: "A".repeat(100), body: "B".repeat(300) };
  const restored = readDraft(JSON.stringify(pages));
  assert.deepEqual(restored[0], pages[0]);
  assert.equal(restored[5].title.length, maxTitle);
  assert.equal(restored[5].body.length, maxBody);
  assert.deepEqual(readDraft("broken"), starter());
  assert.deepEqual(readDraft(JSON.stringify([null])), starter());
});
