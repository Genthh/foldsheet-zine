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

  const defaultCover = Object.freeze({ motif: "rings", ink: "raspberry" });
  const motifs = ["rings", "fan", "ribbon", "none"];
  const inks = ["raspberry", "indigo", "forest"];

  function readCover(value) {
    if (
      !hasKeys(value, ["motif", "ink"]) ||
      !motifs.includes(value.motif) ||
      !inks.includes(value.ink)
    ) {
      throw new Error("Choose a supported cover motif and ink.");
    }
    return { motif: value.motif, ink: value.ink };
  }

  function draftFile(pages, cover = defaultCover) {
    const design = readCover(cover);
    const book = { format: "foldsheet", version: 1, pages };
    if (design.motif !== defaultCover.motif || design.ink !== defaultCover.ink)
      book.cover = design;
    return JSON.stringify(book, null, 2);
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

  function parseBook(raw) {
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
      !(
        hasKeys(doc, ["format", "version", "pages"]) ||
        hasKeys(doc, ["format", "version", "pages", "cover"])
      ) ||
      doc.format !== "foldsheet" ||
      doc.version !== 1
    ) {
      throw new Error("Choose a version 1 Foldsheet draft.");
    }
    if (!Array.isArray(doc.pages) || doc.pages.length !== 8) {
      throw new Error("A Foldsheet draft needs exactly eight pages.");
    }
    const cover = Object.hasOwn(doc, "cover")
      ? readCover(doc.cover)
      : { ...defaultCover };
    const pages = doc.pages.map((page, index) => {
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
    return { pages, cover };
  }

  function parseFile(raw) {
    return parseBook(raw).pages;
  }

  function restore(raw) {
    try {
      return parseBook(raw);
    } catch {
      return { pages: readDraft(raw), cover: { ...defaultCover } };
    }
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
    parseBook,
    restore,
    defaultCover,
  };
})();

if (typeof module !== "undefined") module.exports = Foldsheet;
