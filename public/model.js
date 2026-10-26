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

  function impose(pages) {
    return order.map((number, position) => ({
      ...pages[number - 1],
      number,
      rotation: position < 4 ? 180 : 0,
    }));
  }

  return { starter, readDraft, impose, maxTitle, maxBody };
})();

if (typeof module !== "undefined") module.exports = Foldsheet;
