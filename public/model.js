const Foldsheet = (() => {
  const order = [5, 4, 3, 2, 6, 7, 8, 1];
  const maxTitle = 28;
  const maxBody = 160;
  const sample = [
    [
      "Small hours",
      "A pocket field guide to noticing more on an ordinary walk.",
    ],
    ["Start slow", "Leave five minutes earlier. Let the street set the pace."],
    [
      "Look up",
      "Find a window, a weather vane or a line of birds you have walked past before.",
    ],
    [
      "Listen in",
      "Stand still for ten breaths. Which sound travels the farthest?",
    ],
    [
      "Find a pattern",
      "Count the different shapes a shadow can make along one block.",
    ],
    ["Take a detour", "Turn down a familiar street in the opposite direction."],
    ["Bring it back", "Choose one tiny detail you want to remember tomorrow."],
    ["Colophon", "A small edition for anyone taking the long way home."],
  ];

  function starter() {
    return sample.map(([title, body]) => ({ title, body }));
  }

  function readDraft(raw) {
    try {
      const value = JSON.parse(raw);
      if (
        Array.isArray(value) &&
        value.length === 8 &&
        value.every(
          (page) =>
            page &&
            typeof page.title === "string" &&
            typeof page.body === "string",
        )
      ) {
        return value.map((page) => ({
          title: page.title.slice(0, maxTitle),
          body: page.body.slice(0, maxBody),
        }));
      }
    } catch {
      return starter();
    }
    return starter();
  }

  const maxFileBytes = 24 * 1024;

  function draftFile(pages) {
    return JSON.stringify({ format: "foldsheet", version: 1, pages }, null, 2);
  }

  function draftFilename(title) {
    const slug = title
      .normalize("NFKD")
      .replace(/\p{M}+/gu, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    return (slug || "untitled") + "-foldsheet.json";
  }

  function hasKeys(value, keys) {
    return (
      value !== null &&
      typeof value === "object" &&
      Object.keys(value).length === keys.length &&
      keys.every((key) => Object.hasOwn(value, key))
    );
  }

  function parseFile(raw) {
    if (
      typeof raw !== "string" ||
      new TextEncoder().encode(raw).length > maxFileBytes
    ) {
      throw new RangeError("Choose a draft smaller than 24 KB.");
    }
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch {
      throw new Error("This file contains invalid JSON.");
    }
    if (
      !hasKeys(doc, ["format", "version", "pages"]) ||
      doc.format !== "foldsheet" ||
      doc.version !== 1
    ) {
      throw new Error("Choose a version 1 Foldsheet draft.");
    }
    if (!Array.isArray(doc.pages) || doc.pages.length !== 8) {
      throw new Error("A Foldsheet draft needs exactly eight pages.");
    }
    return doc.pages.map((page, index) => {
      if (
        !hasKeys(page, ["title", "body"]) ||
        typeof page.title !== "string" ||
        typeof page.body !== "string" ||
        page.title.length > maxTitle ||
        page.body.length > maxBody
      ) {
        throw new Error(
          "Check the title and body lengths on page " + (index + 1) + ".",
        );
      }
      return { title: page.title, body: page.body };
    });
  }

  function impose(pages) {
    return order.map((number, position) => ({
      ...pages[number - 1],
      number,
      rotation: position < 4 ? 180 : 0,
    }));
  }

  return {
    starter,
    readDraft,
    impose,
    maxTitle,
    maxBody,
    maxFileBytes,
    draftFile,
    draftFilename,
    parseFile,
  };
})();

if (typeof module !== "undefined") module.exports = Foldsheet;
