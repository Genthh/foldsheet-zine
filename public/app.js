(() => {
  const key = "foldsheet.draft.v1";
  const el = (id) => document.getElementById(id);
  let pages;
  try {
    pages = Foldsheet.readDraft(localStorage.getItem(key));
  } catch {
    pages = Foldsheet.starter();
  }
  let current = 0;
  const select = el("page");

  function makePanel(page, interactive) {
    const panel = document.createElement(interactive ? "button" : "div");
    panel.className = "panel";
    if (interactive) {
      panel.type = "button";
      panel.dataset.page = String(page.number);
    }
    const content = document.createElement("span");
    content.className = "page-content" + (page.rotation ? " flipped" : "");
    const title = document.createElement("strong");
    title.className = "page-title";
    const body = document.createElement("span");
    body.className = "page-body";
    const folio = document.createElement("span");
    folio.className = "folio";
    folio.textContent = String(page.number).padStart(2, "0");
    if (page.number === 1) content.classList.add("cover");
    content.append(title, body, folio);
    panel.append(content);
    return panel;
  }

  const layout = Foldsheet.impose(pages);
  const panels = layout.map((page) => {
    const screen = makePanel(page, true);
    const print = makePanel(page, false);
    el("proof").append(screen);
    el("print-sheet").append(print);
    screen.addEventListener("click", () => {
      current = page.number - 1;
      render();
      el("title").focus();
    });
    return { number: page.number, screen, print };
  });
  pages.forEach((_, index) => select.add(new Option("", String(index))));

  function render() {
    pages.forEach((page, index) => {
      select.options[index].text =
        String(index + 1) + " — " + (page.title || "Untitled");
    });
    select.value = String(current);
    el("position").textContent = String(current + 1).padStart(2, "0") + " / 08";
    el("title").value = pages[current].title;
    el("body").value = pages[current].body;
    el("count").textContent =
      String(pages[current].body.length) + " / 160 characters";
    for (const { number, screen, print } of panels) {
      const page = pages[number - 1];
      screen.setAttribute("aria-pressed", String(number === current + 1));
      for (const panel of [screen, print]) {
        panel.querySelector(".page-title").textContent = page.title;
        panel.querySelector(".page-body").textContent = page.body;
      }
    }
  }

  select.addEventListener("change", () => {
    current = Number(select.value);
    render();
  });
  for (const field of ["title", "body"]) {
    el(field).addEventListener("input", () => {
      pages[current][field] = el(field).value;
      render();
      try {
        localStorage.setItem(key, JSON.stringify(pages));
        el("save-status").textContent = "Draft saved on this device.";
      } catch {
        el("save-status").textContent =
          "Storage is unavailable. Print before closing this tab.";
      }
    });
  }
  el("print").addEventListener("click", () => window.print());
  render();
})();
