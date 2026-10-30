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
  let reading = 0;
  let pending;
  let request = 0;
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
    renderReader();
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
      save();
    });
  }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(pages));
      el("save-status").textContent = "Draft saved on this device.";
    } catch {
      el("save-status").textContent =
        "Storage is unavailable. Download your draft before closing this tab.";
    }
  }

  function renderReader() {
    el("reader-position").textContent = "Page " + (reading + 1) + " of 8";
    el("reader-title").textContent = pages[reading].title;
    el("reader-body").textContent = pages[reading].body;
    el("reader-prev").disabled = reading === 0;
    el("reader-next").disabled = reading === 7;
  }

  el("reader-prev").addEventListener("click", () => {
    reading--;
    renderReader();
  });
  el("reader-next").addEventListener("click", () => {
    reading++;
    renderReader();
  });

  el("export-draft").addEventListener("click", () => {
    const blob = new Blob([Foldsheet.draftFile(pages)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const download = document.createElement("a");
    download.href = url;
    download.download = Foldsheet.draftFilename(pages[0].title);
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  function clearImport() {
    pending = undefined;
    el("import-actions").hidden = true;
    el("import-draft").value = "";
  }

  el("import-draft").addEventListener("change", async () => {
    const id = ++request;
    const file = el("import-draft").files[0];
    clearImport();
    el("import-status").textContent = "";
    if (!file) return;
    if (file.size > Foldsheet.maxFileBytes) {
      el("import-status").textContent = "Choose a draft smaller than 24 KB.";
      return;
    }
    let raw;
    try {
      raw = await file.text();
    } catch {
      if (id === request)
        el("import-status").textContent =
          "The file could not be read. Choose it again.";
      return;
    }
    if (id !== request) return;
    try {
      pending = Foldsheet.parseFile(raw);
      el("import-status").textContent =
        "Ready to replace all eight pages with “" +
        (pending[0].title || "Untitled") +
        "”.";
      el("import-actions").hidden = false;
    } catch (error) {
      el("import-status").textContent = error.message;
    }
  });

  el("apply-import").addEventListener("click", () => {
    if (!pending) return;
    pages = pending;
    current = 0;
    reading = 0;
    clearImport();
    render();
    save();
    el("import-status").textContent = "Eight pages imported.";
    el("title").focus();
  });
  el("cancel-import").addEventListener("click", () => {
    clearImport();
    el("import-status").textContent = "Import cancelled.";
    el("import-draft").focus();
  });

  el("print").addEventListener("click", () => window.print());
  render();
})();
