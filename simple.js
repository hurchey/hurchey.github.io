(function () {
  const CONTENT = window.PORTFOLIO_CONTENT || {};
  const PROFILE = CONTENT.profile || {};
  const EDUCATION = CONTENT.education || [];
  const NOW = CONTENT.now || {};
  const ABOUT = CONTENT.about || {};
  const SKILLS = CONTENT.skills || [];
  const PROJECTS = CONTENT.projects || [];
  const EXPERIENCE = CONTENT.experience || [];
  const CONTACT = CONTENT.contact || {};
  const SIMPLE = CONTENT.simpleSite || {};

  const NAME = PROFILE.name || "Eric Hurchey";
  const RESUME = PROFILE.resumeUrl || "Eric_Hurchey_Resume.pdf";
  const LOGO_COLORS = ["c-blue", "c-red", "c-yellow", "c-blue", "c-green", "c-red"];
  // Twice the body text's 1.5px font pixel, so photos read as part of the same screen.
  const PHOTO_PIXEL_SIZE = 3;
  // Small frames shrink their blocks instead of dropping below this many pixels across.
  const PHOTO_MIN_PIXELS = 120;

  const PAGE_LABELS = {
    home: "Home",
    now: "What's New",
    experience: "Work History",
    projects: "Projects",
    education: "Technical Details",
    about: "About Eric",
    photos: "Photographs",
    contact: "Contact",
    sitemap: "Site Map",
    search: "Search"
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function pageHref(page, extra) {
    const params = new URLSearchParams();
    params.set("page", page);
    Object.entries(extra || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, value);
    });
    return `simple.html?${params.toString()}`;
  }

  function navLink(page, label, extra) {
    return `<a href="${pageHref(page, extra)}" data-nav>${esc(label)}</a>`;
  }

  function extLink(url, label) {
    return `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(label)}</a>`;
  }

  function roleHref(exp) {
    return pageHref("role", { slug: slugify(exp.company) });
  }

  function projectHref(proj) {
    return pageHref("project", { slug: slugify(proj.title) });
  }

  function logoHtml(className, asLink) {
    let colorIndex = 0;
    const letters = `${NAME}!`
      .split("")
      .map((ch) => {
        if (ch === " ") return " ";
        const cls = LOGO_COLORS[colorIndex % LOGO_COLORS.length];
        colorIndex += 1;
        return `<span class="${cls}">${esc(ch)}</span>`;
      })
      .join("");

    return asLink
      ? `<a class="logo ${className}" href="${pageHref("home")}" data-nav aria-label="${esc(NAME)} home">${letters}</a>`
      : `<div class="logo ${className}" role="img" aria-label="${esc(NAME)}">${letters}</div>`;
  }

  function hasPhoto(slot) {
    return Boolean(slot && (slot.src || "").trim());
  }

  function imageSlot(slot, shape, fallbackTitle) {
    if (!hasPhoto(slot)) return "";
    const alt = slot.alt || slot.placeholderTitle || fallbackTitle || "Image";
    return `<div class="slot slot-${shape}"><img src="${esc(slot.src.trim())}" alt="${esc(alt)}" loading="lazy" data-slot></div>`;
  }

  function pixelate(img) {
    if (img.dataset.pixelated) return;
    img.dataset.pixelated = "true";

    const box = img.parentElement.getBoundingClientRect();
    const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const shortSide = Math.min(img.naturalWidth, img.naturalHeight) * scale;
    const blockSize = Math.min(PHOTO_PIXEL_SIZE, shortSide / PHOTO_MIN_PIXELS);
    const cols = Math.max(1, Math.round((img.naturalWidth * scale) / blockSize));
    const rows = Math.max(1, Math.round((img.naturalHeight * scale) / blockSize));

    try {
      const canvas = document.createElement("canvas");
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, cols, rows);
      img.addEventListener("load", () => img.classList.add("pixelated"), { once: true });
      img.src = canvas.toDataURL("image/png");
    } catch (error) {
      // Cross-origin images can't be read back from a canvas; show them unprocessed.
      img.classList.add("pixelated");
    }
  }

  function bindSlotImages() {
    document.querySelectorAll("img[data-slot]").forEach((img) => {
      img.addEventListener("error", () => {
        const holder = img.closest(".feature, .project-shot, .portrait, .photo-cell, .slot");
        if (holder) holder.remove();
      });

      if (img.complete && img.naturalWidth) {
        pixelate(img);
      } else {
        img.addEventListener("load", () => pixelate(img), { once: true });
      }
    });
  }

  function photoEntries() {
    const entries = [];
    const add = (id, kind, slot, fallbackTitle, related) => {
      if (!hasPhoto(slot)) return;
      entries.push({
        id,
        kind,
        slot,
        title: slot.placeholderTitle || fallbackTitle,
        caption: slot.caption || "",
        related
      });
    };

    add("banner", "Banner", SIMPLE.banner, "Banner photograph");
    add("headshot", "Portrait", SIMPLE.avatar, "Headshot");
    add("workspace", "Workspace", SIMPLE.introPhoto, "Workspace photograph");
    (SIMPLE.photos || []).forEach((photo, idx) => {
      add(`photo-${idx + 1}`, "Personal", photo, `Photograph ${idx + 1}`);
    });
    PROJECTS.forEach((proj) => {
      add(`project-${slugify(proj.title)}`, "Project", proj.image, `${proj.title} screenshot`, {
        href: projectHref(proj),
        label: proj.title
      });
    });
    return entries;
  }

  function searchSite(rawQuery) {
    const needle = String(rawQuery || "").trim().toLowerCase();
    if (!needle) return [];
    const hits = [];
    const matches = (parts) => parts.join(" ").toLowerCase().includes(needle);

    EXPERIENCE.forEach((exp) => {
      if (matches([exp.title, exp.company, exp.location, exp.dates, exp.summary, ...(exp.bullets || []), ...(exp.tech || [])])) {
        hits.push({ title: `${exp.title}, ${exp.company}`, snippet: exp.summary, href: roleHref(exp) });
      }
    });

    PROJECTS.forEach((proj) => {
      if (matches([proj.title, proj.badge, proj.status, proj.summary, proj.description, ...(proj.bullets || []), ...(proj.tech || [])])) {
        hits.push({ title: `${proj.title} - ${proj.badge}`, snippet: proj.summary, href: projectHref(proj) });
      }
    });

    SKILLS.forEach((group) => {
      if (matches([group.title, ...(group.items || [])])) {
        hits.push({ title: `Skills: ${group.title}`, snippet: (group.items || []).join(", "), href: pageHref("education") });
      }
    });

    EDUCATION.forEach((edu) => {
      if (matches([edu.school, edu.degree, edu.honors, ...(edu.bullets || [])])) {
        hits.push({ title: `${edu.school} - ${edu.degree}`, snippet: (edu.bullets || [])[0] || "", href: pageHref("education") });
      }
    });

    const aboutParts = [
      ABOUT.intro,
      ...(ABOUT.interests || []),
      ...(ABOUT.cards || []).map((card) => `${card.title} ${card.body}`),
      ...(ABOUT.values || []).map((value) => `${value.title} ${value.body}`)
    ];
    if (matches(aboutParts)) {
      hits.push({ title: "About Eric", snippet: ABOUT.intro, href: pageHref("about") });
    }

    return hits;
  }

  function luckyHref(query) {
    const hits = searchSite(query);
    if (hits.length) return hits[0].href;
    if (String(query || "").trim()) return pageHref("search", { q: query });

    const destinations = [
      ...PROJECTS.map(projectHref),
      ...EXPERIENCE.map(roleHref),
      pageHref("about"),
      pageHref("photos"),
      pageHref("now")
    ];
    return destinations[Math.floor(Math.random() * destinations.length)];
  }

  function searchFormHtml(query, compact) {
    const value = esc(query || "");
    if (compact) {
      return `
        <form class="search-form" role="search">
          <input class="search-input" type="text" name="q" value="${value}" aria-label="Search Eric's home page">
          <button class="btn98" type="submit">Eric Search</button>
          <button class="btn98" type="button" data-lucky>I'm Feeling Lucky</button>
        </form>
      `;
    }
    return `
      <form class="search-form" role="search">
        <label for="homeSearch">Search Eric's home page:</label><br>
        <input class="search-input" id="homeSearch" type="text" name="q" value="${value}">
        <div class="search-buttons">
          <button class="btn98" type="submit">Eric Search</button>
          <button class="btn98" type="button" data-lucky>I'm Feeling Lucky</button>
        </div>
      </form>
    `;
  }

  function renderMasthead(page, query) {
    const mast = document.getElementById("masthead");
    if (!mast) return;

    if (page === "home") {
      mast.innerHTML = `
        <div class="home-mast">
          ${logoHtml("logo-big", false)}
          <p class="mast-sub">${esc(PROFILE.subtitle || PROFILE.role || "")}</p>
          ${searchFormHtml(query, false)}
          <p class="mast-links">
            ${navLink("about", "About Eric!")} -
            <a href="${esc(RESUME)}" target="_blank" rel="noreferrer">Resume (PDF)</a> -
            ${extLink(PROFILE.github || "https://github.com/hurchey", "GitHub")} -
            ${extLink(PROFILE.linkedin || "https://linkedin.com/in/eric-hurchey", "LinkedIn")} -
            <a href="index.html">Terminal Version</a>
          </p>
        </div>
      `;
      return;
    }

    mast.innerHTML = `
      <div class="compact-mast">
        ${logoHtml("logo-small", true)}
        ${searchFormHtml(query, true)}
      </div>
    `;
  }

  function renderResultsBar(page, slug, query) {
    const bar = document.getElementById("resultsBar");
    if (!bar) return;

    if (page === "home") {
      bar.innerHTML = "";
      return;
    }

    let left = "";
    let right = "";

    if (page === "search") {
      const hits = searchSite(query);
      left = query
        ? `Searched Eric's home page for <b>${esc(query)}</b>.`
        : "Search Eric's home page.";
      right = query ? `Results <b>1 - ${hits.length}</b> of <b>${hits.length}</b>.` : "";
    } else {
      const crumbs = [navLink("home", "Top")];
      if (page === "role") {
        crumbs.push(navLink("experience", "Work History"));
        const idx = Math.max(0, EXPERIENCE.findIndex((exp) => slugify(exp.company) === slug));
        if (EXPERIENCE[idx]) crumbs.push(`<b>${esc(EXPERIENCE[idx].company)}</b>`);
        right = `Record <b>${idx + 1}</b> of <b>${EXPERIENCE.length}</b>`;
      } else if (page === "project") {
        crumbs.push(navLink("projects", "Projects"));
        const idx = Math.max(0, PROJECTS.findIndex((proj) => slugify(proj.title) === slug));
        if (PROJECTS[idx]) crumbs.push(`<b>${esc(PROJECTS[idx].title)}</b>`);
        right = `Record <b>${idx + 1}</b> of <b>${PROJECTS.length}</b>`;
      } else {
        crumbs.push(`<b>${esc(PAGE_LABELS[page] || "Page")}</b>`);
      }
      left = crumbs.join(" &gt; ");
    }

    bar.innerHTML = `<div class="results-bar"><span>${left}</span><span>${right}</span></div>`;
  }

  function simplePager(prev, next) {
    const parts = [];
    if (prev) parts.push(`&laquo; ${navLink(prev.page, prev.label, prev.extra)}`);
    parts.push(navLink("home", "Main Index"));
    if (next) parts.push(`${navLink(next.page, next.label, next.extra)} &raquo;`);
    return `<p class="pager">${parts.join(" | ")}</p>`;
  }

  function sequencePager(items, currentIdx, hrefFor, indexPage, indexLabel) {
    const numbers = items
      .map((item, idx) =>
        idx === currentIdx ? `<span class="current">${idx + 1}</span>` : `<a href="${hrefFor(item)}" data-nav>${idx + 1}</a>`
      )
      .join(" ");
    const prev = items[currentIdx - 1];
    const next = items[currentIdx + 1];

    return `
      <p class="pager">
        Result Page:
        ${prev ? `<a href="${hrefFor(prev)}" data-nav>Previous</a>` : ""}
        ${numbers}
        ${next ? `<a href="${hrefFor(next)}" data-nav>Next</a>` : ""}
        <br>
        ${navLink(indexPage, `Back to ${indexLabel}`)} | ${navLink("home", "Main Index")}
      </p>
    `;
  }

  function renderHome() {
    const banner = SIMPLE.banner || {};
    const nowLinks = (NOW.cards || []).map((card) => navLink("now", card.title)).join(", ");
    const roleLinks = EXPERIENCE.map((exp) => `<a href="${roleHref(exp)}" data-nav>${esc(exp.company)}</a>`).join(", ");
    const projectLinks = PROJECTS.map((proj) => `<a href="${projectHref(proj)}" data-nav>${esc(proj.title)}</a>`).join(", ");

    return `
      ${hasPhoto(banner) ? `
        <div class="feature">
          ${imageSlot(banner, "wide", "Banner photograph")}
          ${banner.caption ? `<p class="caption">${esc(banner.caption)}</p>` : ""}
        </div>
      ` : ""}

      <h1>The Eric Hurchey Web</h1>
      <p>
        The Eric Hurchey Web (EHW) is a wide-area hypermedia information retrieval initiative
        aiming to give universal access to one engineer's work.
      </p>
      <p>
        Everything there is online about Eric is linked directly or indirectly to this document,
        including a <a href="${esc(RESUME)}" target="_blank" rel="noreferrer">printable resume</a>,
        ${navLink("now", "current work")}, ${navLink("projects", "projects")},
        ${navLink("photos", "photographs")}, and ${navLink("contact", "how to get in touch")}.
      </p>
      <p class="plain-note">
        <b>In plain English:</b> I'm ${esc(NAME)}, ${esc(PROFILE.subtitle || PROFILE.role || "")}.
        Click any underlined blue words to read more, or use the search box above.
      </p>

      <dl>
        <dt>${navLink("now", "What's new?")} <span class="new-flag">NEW!</span></dt>
        <dd>What Eric is building right now: ${nowLinks}.</dd>

        <dt>${navLink("experience", "Work history")}</dt>
        <dd>Founding, co-founding and engineering roles at ${roleLinks}.</dd>

        <dt>${navLink("projects", "Software products")}</dt>
        <dd>A list of things Eric has built and their current state. (e.g. ${projectLinks})</dd>

        <dt>${navLink("education", "Technical details")}</dt>
        <dd>Education at ${esc((EDUCATION[0] && EDUCATION[0].school) || "Brandeis University")}, plus languages, frameworks, infrastructure and tools.</dd>

        <dt><a href="${esc(RESUME)}" target="_blank" rel="noreferrer">Bibliography</a></dt>
        <dd>Paper documentation: Eric's one-page resume (PDF).</dd>

        <dt>${navLink("about", "People")}</dt>
        <dd>About Eric: how he builds software, what he values, and life outside code.</dd>

        <dt>${navLink("photos", "Photographs")}</dt>
        <dd>Pictures of Eric, his work and the places he builds.</dd>

        <dt>${navLink("contact", "How can I help?")}</dt>
        <dd>Hiring, collaborating or just saying hello: email, phone and LinkedIn.</dd>

        <dt>${extLink(PROFILE.github || "https://github.com/hurchey", "Getting code")}</dt>
        <dd>Source code for Eric's projects on GitHub.</dd>

        <dt><a href="index.html">Line mode</a></dt>
        <dd>The interactive terminal version of this site, for people who prefer a command line.</dd>

        <dt>${navLink("sitemap", "Site map")}</dt>
        <dd>Every page on this site in one list.</dd>
      </dl>
    `;
  }

  function renderNow() {
    const cards = (NOW.cards || [])
      .map(
        (card) => `
          <h2>${esc(card.title)}</h2>
          <p class="meta-line">${esc(card.eyebrow)}</p>
          <p>${esc(card.body)}</p>
          ${(card.list || []).length ? `<ul>${card.list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}
          ${card.link ? `<p>Visit: ${extLink(card.link.url, card.link.label)}</p>` : ""}
        `
      )
      .join("");

    const focus = (NOW.focus || []).map((item) => `<li>${esc(item)}</li>`).join("");

    return `
      <h1>What's new</h1>
      <p>${esc(NOW.intro || "")}</p>
      ${cards}
      <h2 id="focus">Current focus</h2>
      <ul>${focus}</ul>
      ${simplePager({ page: "home", label: "Home" }, { page: "experience", label: "Work History" })}
    `;
  }

  function renderExperience() {
    const entries = EXPERIENCE.map(
      (exp) => `
        <dt><a href="${roleHref(exp)}" data-nav><b>${esc(exp.title)}, ${esc(exp.company)}</b></a></dt>
        <dd>
          <span class="meta-line">${esc(exp.dates)} - ${esc(exp.location || "")}</span><br>
          ${esc(exp.summary || "")}
        </dd>
      `
    ).join("");

    return `
      <h1>Work history</h1>
      <p>Each entry below opens its own page with the full details.</p>
      <dl>${entries}</dl>
      <p>The same history is on the <a href="${esc(RESUME)}" target="_blank" rel="noreferrer">printable resume (PDF)</a>.</p>
      ${simplePager({ page: "now", label: "What's New" }, { page: "projects", label: "Projects" })}
    `;
  }

  function renderRole(slug) {
    const idx = Math.max(0, EXPERIENCE.findIndex((exp) => slugify(exp.company) === slug));
    const exp = EXPERIENCE[idx];
    if (!exp) return renderExperience();

    const keywords = (exp.tech || []).map((tech) => navLink("search", tech, { q: tech })).join(", ");

    return `
      <h1>${esc(exp.title)}, ${esc(exp.company)}</h1>
      <dl class="facts">
        <dt>Organization</dt>
        <dd>${exp.companyUrl ? extLink(exp.companyUrl, exp.company) : esc(exp.company)}</dd>
        <dt>Dates</dt>
        <dd>${esc(exp.dates)}</dd>
        <dt>Location</dt>
        <dd>${esc(exp.location || "")}</dd>
        ${keywords ? `<dt>Keywords</dt><dd>${keywords}</dd>` : ""}
      </dl>
      <h2>Summary</h2>
      <p>${esc(exp.summary || "")}</p>
      <ul>${(exp.bullets || []).map((bullet) => `<li>${esc(bullet)}</li>`).join("")}</ul>
      ${sequencePager(EXPERIENCE, idx, roleHref, "experience", "Work History")}
    `;
  }

  function renderProjects() {
    const entries = PROJECTS.map((proj) => {
      const slug = slugify(proj.title);
      return `
        <dt><a href="${projectHref(proj)}" data-nav><b>${esc(proj.title)}</b></a> - ${esc(proj.badge || "")} [${esc(proj.status || "")}]</dt>
        <dd>
          ${hasPhoto(proj.image) ? `<div class="project-shot">${imageSlot(proj.image, "screen", `${proj.title} screenshot`)}</div>` : ""}
          ${esc(proj.summary || "")}<br>
          ${navLink("project", "Read more", { slug })}
          ${proj.link ? ` | ${extLink(proj.link, proj.linkLabel || "Open project")}` : ""}
        </dd>
      `;
    }).join("");

    return `
      <h1>Software products</h1>
      <p>A list of things Eric has built and their current state. Click a name for the full write-up.</p>
      <dl>${entries}</dl>
      <p>More code lives on ${extLink(PROFILE.github || "https://github.com/hurchey", "GitHub")}.</p>
      ${simplePager({ page: "experience", label: "Work History" }, { page: "education", label: "Technical Details" })}
    `;
  }

  function renderProject(slug) {
    const idx = Math.max(0, PROJECTS.findIndex((proj) => slugify(proj.title) === slug));
    const proj = PROJECTS[idx];
    if (!proj) return renderProjects();

    const stack = (proj.tech || []).map((tech) => navLink("search", tech, { q: tech })).join(", ");

    return `
      <h1>${esc(proj.title)}</h1>
      ${hasPhoto(proj.image) ? `
        <div class="project-shot">
          ${imageSlot(proj.image, "screen", `${proj.title} screenshot`)}
          ${proj.image.caption ? `<p class="caption">${esc(proj.image.caption)}</p>` : ""}
        </div>
      ` : ""}
      <dl class="facts">
        <dt>What it is</dt>
        <dd>${esc(proj.badge || "")}</dd>
        <dt>Status</dt>
        <dd>${esc(proj.status || "")}</dd>
        <dt>Built with</dt>
        <dd>${stack}</dd>
        ${proj.link ? `<dt>Link</dt><dd>${extLink(proj.link, proj.link)}</dd>` : ""}
      </dl>
      <h2>Overview</h2>
      <p>${esc(proj.summary || "")}</p>
      ${proj.description ? `<p>${esc(proj.description)}</p>` : ""}
      <h2>Highlights</h2>
      <ul>${(proj.bullets || []).map((bullet) => `<li>${esc(bullet)}</li>`).join("")}</ul>
      ${sequencePager(PROJECTS, idx, projectHref, "projects", "Projects")}
    `;
  }

  function renderEducation() {
    const schools = EDUCATION.map(
      (edu) => `
        <dl class="facts">
          <dt>School</dt>
          <dd>${esc(edu.school)}, ${esc(edu.location || "")}</dd>
          <dt>Degree</dt>
          <dd>${esc(edu.degree)}</dd>
          <dt>Honors</dt>
          <dd>${esc(edu.honors || "")}</dd>
          <dt>Dates</dt>
          <dd>${esc(edu.dates || "")}</dd>
        </dl>
        ${(edu.bullets || []).length ? `<ul>${edu.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join("")}</ul>` : ""}
      `
    ).join("");

    const skills = SKILLS.map(
      (group) => `
        <dt id="${slugify(group.title)}"><b>${esc(group.title)}</b></dt>
        <dd>${(group.items || []).map((item) => navLink("search", item, { q: item })).join(", ")}</dd>
      `
    ).join("");

    return `
      <h1>Technical details</h1>
      <h2>Education</h2>
      ${schools}
      <h2>Skills</h2>
      <p>Click any skill to find the jobs and projects that use it.</p>
      <dl>${skills}</dl>
      ${simplePager({ page: "projects", label: "Projects" }, { page: "about", label: "About Eric" })}
    `;
  }

  function renderAbout() {
    const howIBuild = (ABOUT.cards || [])
      .map((card) => `<dt><b>${esc(card.title)}</b></dt><dd>${esc(card.body)}</dd>`)
      .join("");
    const values = (ABOUT.values || [])
      .map((value) => `<li><b>${esc(value.title)}:</b> ${esc(value.body)}</li>`)
      .join("");
    const interests = (ABOUT.interests || []).map((item) => `<li>${esc(item)}</li>`).join("");

    return `
      <h1>About Eric</h1>
      <div class="clearfix">
        ${hasPhoto(SIMPLE.avatar) ? `
          <div class="portrait">
            ${imageSlot(SIMPLE.avatar, "square", "Headshot")}
            <p class="caption">${esc(NAME)}</p>
          </div>
        ` : ""}
        <p>${esc(ABOUT.intro || "")}</p>
        <p>${esc(PROFILE.tagline || "")}</p>
      </div>
      <h2>How I build software</h2>
      <dl>${howIBuild}</dl>
      <h2 id="principles">Principles</h2>
      <ul>${values}</ul>
      <h2 id="interests">Outside of code</h2>
      <ul>${interests}</ul>
      ${simplePager({ page: "education", label: "Technical Details" }, { page: "photos", label: "Photographs" })}
    `;
  }

  function renderPhotos(viewId) {
    const entries = photoEntries();
    const focused = viewId ? entries.find((entry) => entry.id === viewId) : null;

    const enlarged = focused
      ? `
        <h2>${esc(focused.title)}</h2>
        <div class="enlarged">${imageSlot(focused.slot, focused.slot.shape || "screen", focused.title)}</div>
        <p class="caption">
          ${esc(focused.kind)}${focused.caption ? `: ${esc(focused.caption)}` : ""}
          ${focused.related ? ` | <a href="${focused.related.href}" data-nav>${esc(focused.related.label)} page</a>` : ""}
          | ${navLink("photos", "Close")}
        </p>
        <hr>
      `
      : "";

    const grid = entries
      .map(
        (entry) => `
          <div class="photo-cell">
            <a href="${pageHref("photos", { view: entry.id })}" data-nav aria-label="Enlarge ${esc(entry.title)}">
              ${imageSlot(entry.slot, entry.slot.shape || "photo", entry.title)}
            </a>
            <p class="caption">
              ${navLink("photos", entry.title, { view: entry.id })}<br>
              ${esc(entry.caption)}
            </p>
          </div>
        `
      )
      .join("");

    return `
      <h1>Photographs</h1>
      <p>Click any picture to enlarge it.</p>
      ${enlarged}
      <div class="photo-grid">${grid}</div>
      ${simplePager({ page: "about", label: "About Eric" }, { page: "contact", label: "Contact" })}
    `;
  }

  function renderContact() {
    const methods = (CONTACT.methods || [])
      .map((method) => {
        const external = /^https?:/i.test(method.href || "");
        const link = external
          ? extLink(method.href, method.value)
          : `<a href="${esc(method.href)}">${esc(method.value)}</a>`;
        return `<dt><b>${esc(method.label)}</b></dt><dd>${link}</dd>`;
      })
      .join("");

    return `
      <h1>How can I help?</h1>
      <p>${esc(CONTACT.intro || "")}</p>
      <dl>
        ${methods}
        <dt><b>Resume</b></dt>
        <dd><a href="${esc(RESUME)}" target="_blank" rel="noreferrer">Eric_Hurchey_Resume.pdf</a></dd>
      </dl>
      ${simplePager({ page: "photos", label: "Photographs" }, { page: "sitemap", label: "Site Map" })}
    `;
  }

  function renderSitemap() {
    const pages = ["home", "now", "experience", "projects", "education", "about", "photos", "contact"]
      .map((page) => `<li>${navLink(page, PAGE_LABELS[page])}</li>`)
      .join("");
    const roles = EXPERIENCE.map(
      (exp) => `<li><a href="${roleHref(exp)}" data-nav>${esc(exp.title)}, ${esc(exp.company)}</a> (${esc(exp.dates)})</li>`
    ).join("");
    const projects = PROJECTS.map(
      (proj) => `<li><a href="${projectHref(proj)}" data-nav>${esc(proj.title)}</a> - ${esc(proj.badge || "")}</li>`
    ).join("");

    return `
      <h1>Site map</h1>
      <h2>Pages</h2>
      <ul>
        ${pages}
        <li><a href="${esc(RESUME)}" target="_blank" rel="noreferrer">Resume (PDF)</a></li>
        <li><a href="index.html">Terminal version</a></li>
        <li><a href="1994.html">1994 plain HTML version</a></li>
      </ul>
      <h2>Work history</h2>
      <ul>${roles}</ul>
      <h2>Projects</h2>
      <ul>${projects}</ul>
      ${simplePager({ page: "contact", label: "Contact" }, null)}
    `;
  }

  function renderSearch(query) {
    const q = String(query || "").trim();
    if (!q) {
      const examples = ["Jetson", "Founding", "TypeScript", "Python", "PostgreSQL"]
        .map((term) => navLink("search", term, { q: term }))
        .join(", ");
      return `
        <h1>Search</h1>
        <p>Type a word into the box above, or try: ${examples}.</p>
      `;
    }

    const hits = searchSite(q);
    if (!hits.length) {
      return `
        <p>Your search - <b>${esc(q)}</b> - did not match any documents.</p>
        <p>Suggestions: try different words, or browse the ${navLink("sitemap", "site map")}.</p>
      `;
    }

    const results = hits
      .map(
        (hit) => `
          <div class="result">
            <a class="result-title" href="${hit.href}" data-nav>${esc(hit.title)}</a><br>
            ${esc(hit.snippet || "")}<br>
            <span class="green-url">hurchey.github.io/${esc(hit.href)}</span>
          </div>
        `
      )
      .join("");

    return `<div class="results">${results}</div>`;
  }

  function updateChrome(page, slug) {
    const activeTab = page === "role" ? "experience" : page === "project" ? "projects" : page;
    document.querySelectorAll(".tab[data-page]").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-page") === activeTab);
    });

    document.querySelectorAll(".resume-link").forEach((link) => {
      link.href = RESUME;
    });

    const year = document.getElementById("footerYear");
    if (year) year.textContent = String(new Date().getFullYear());

    let label = PAGE_LABELS[page];
    if (page === "role") {
      const exp = EXPERIENCE.find((item) => slugify(item.company) === slug) || EXPERIENCE[0];
      label = exp ? exp.company : "Work History";
    } else if (page === "project") {
      const proj = PROJECTS.find((item) => slugify(item.title) === slug) || PROJECTS[0];
      label = proj ? proj.title : "Projects";
    }
    document.title = page === "home" ? `${NAME}!` : `${label} - ${NAME}!`;
  }

  const RENDERERS = {
    home: () => renderHome(),
    now: () => renderNow(),
    experience: () => renderExperience(),
    role: ({ slug }) => renderRole(slug),
    projects: () => renderProjects(),
    project: ({ slug }) => renderProject(slug),
    education: () => renderEducation(),
    about: () => renderAbout(),
    photos: ({ view }) => renderPhotos(view),
    contact: () => renderContact(),
    sitemap: () => renderSitemap(),
    search: ({ query }) => renderSearch(query)
  };

  function render() {
    const params = new URLSearchParams(window.location.search);
    let page = (params.get("page") || "home").toLowerCase();
    if (!RENDERERS[page]) page = "home";
    const slug = (params.get("slug") || "").toLowerCase();
    const view = params.get("view") || "";
    const query = params.get("q") || "";

    renderMasthead(page, page === "search" ? query : "");
    renderResultsBar(page, slug, query);
    updateChrome(page, slug);

    const main = document.getElementById("main");
    if (main) main.innerHTML = RENDERERS[page]({ slug, view, query });
    bindSlotImages();

    const hashTarget = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (hashTarget) {
      hashTarget.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

  function navigate(url) {
    window.history.pushState({}, "", url);
    render();
  }

  function currentQuery(fromElement) {
    const form = fromElement.closest(".search-form");
    const input = form && form.querySelector("input[name='q']");
    return input ? input.value.trim() : "";
  }

  document.addEventListener("click", (event) => {
    const lucky = event.target.closest("[data-lucky]");
    if (lucky) {
      event.preventDefault();
      navigate(luckyHref(currentQuery(lucky)));
      return;
    }

    const link = event.target.closest("a[data-nav]");
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(link.getAttribute("href"));
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest(".search-form");
    if (!form) return;
    event.preventDefault();
    navigate(pageHref("search", { q: currentQuery(form) }));
  });

  window.addEventListener("popstate", render);
  document.addEventListener("DOMContentLoaded", render);
})();
