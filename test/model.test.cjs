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

test("versioned draft exports round-trip and produce readable, safe filenames", () => {
  const { draftFile, parseFile, draftFilename } = require("../public/model.js");
  const pages = starter();
  pages[0] = { title: "Élan / café?", body: "<b>Keep these characters</b>" };
  assert.deepEqual(parseFile(draftFile(pages)), pages);
  assert.equal(draftFilename(pages[0].title), "elan-cafe-foldsheet.json");
  assert.equal(draftFilename("../"), "untitled-foldsheet.json");
});
test("invalid files never partially import or coerce data", () => {
  const { draftFile, parseFile, maxFileBytes } = require("../public/model.js");
  const doc = JSON.parse(draftFile(starter()));
  assert.throws(() => parseFile(" ".repeat(maxFileBytes + 1)), /24 KB/);
  assert.throws(() => parseFile("{"), /JSON/);
  assert.throws(
    () => parseFile(JSON.stringify({ ...doc, version: 9 })),
    /version 1/,
  );
  assert.throws(
    () => parseFile(JSON.stringify({ ...doc, pages: [] })),
    /eight pages/,
  );
  doc.pages[0].title = "x".repeat(29);
  assert.throws(() => parseFile(JSON.stringify(doc)), /page 1/);
  doc.pages[0] = JSON.parse('{"title":"","body":"","__proto__":{"flag":true}}');
  assert.throws(() => parseFile(JSON.stringify(doc)), /page 1/);
});

test("custom cover inks and motifs survive export, restore and import without changing page order", () => {
  const {
    draftFile,
    restore,
    parseBook,
    impose,
  } = require("../public/model.js");
  const pages = starter();
  for (const motif of ["rings", "fan", "ribbon", "none"]) {
    const cover = { motif, ink: "indigo" };
    const file = draftFile(pages, cover);
    const restored = restore(file);
    assert.deepEqual(restored, { pages, cover });
    assert.deepEqual(parseBook(file), restored);
    assert.equal(impose(restored.pages)[7].number, 1);
  }
});
test("legacy exports and array storage use original cover; invalid styles are rejected", () => {
  const {
    draftFile,
    restore,
    parseBook,
    defaultCover,
  } = require("../public/model.js");
  const pages = starter();
  const legacy = JSON.stringify({ format: "foldsheet", version: 1, pages });
  assert.deepEqual(restore(JSON.stringify(pages)), {
    pages,
    cover: defaultCover,
  });
  assert.deepEqual(parseBook(legacy), { pages, cover: defaultCover });
  assert.deepEqual(JSON.parse(draftFile(pages)), JSON.parse(legacy));
  for (const bad of [
    null,
    { ink: "red", motif: "fan" },
    { ink: "forest", motif: "<script>" },
    { ink: "indigo", motif: "rings", style: "url(x)" },
  ]) {
    assert.throws(
      () => parseBook(JSON.stringify({ ...JSON.parse(legacy), cover: bad })),
      /cover/,
    );
  }
});
