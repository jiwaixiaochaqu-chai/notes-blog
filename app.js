const ROUTE_NAMES = ["guides", "rag", "toumanfen", "ml-dl-nlp"];

// 根据当前页面地址自动推导站点根路径，兼容任意部署子路径
// 例如 "/"、"/repo/"、"/repo/rag/" 都能正确得到站点根
function computeSiteBase() {
  let path = location.pathname;
  if (!path.endsWith("/")) path += "/";
  const segs = path.split("/").filter(Boolean);
  if (segs.length && ROUTE_NAMES.includes(segs[segs.length - 1])) segs.pop();
  return "/" + segs.join("/") + (segs.length ? "/" : "");
}
const BASE = computeSiteBase();

const state = {
  guides: [],
  activeId: "",
  query: "",
  route: "guides"
};

const guideList = document.querySelector("#guideList");
const noteEl = document.querySelector("#note");
const headerEl = document.querySelector("#guideHeader");
const tocEl = document.querySelector("#toc");
const searchInput = document.querySelector("#searchInput");
const shellEl = document.querySelector(".shell");

// rag 栏目已替换为完整课件站（courseware/，构建时铺到 /rag/），不再是 SPA 路由
const routeById = {
  toumanfen: `${BASE}toumanfen/`,
  "ml-dl-nlp": `${BASE}ml-dl-nlp/`
};

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const slugify = (text, index) => `h-${index}-${text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")}`;

function inlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  return html;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let inCode = false;
  let code = [];
  let inList = false;
  let quote = [];
  let headingIndex = 0;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      html.push(`<blockquote>${quote.map(line => `<p>${inlineMarkdown(line)}</p>`).join("")}</blockquote>`);
      quote = [];
    }
  };

  for (const line of lines) {
    if (/^~~~|^```/.test(line.trim())) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        closeList();
        flushQuote();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeList();
      flushQuote();
      const level = Math.min(6, heading[1].length);
      const text = heading[2].trim();
      const id = slugify(text, headingIndex++);
      if (level <= 3) toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      closeList();
      quote.push(line.replace(/^\s*>\s?/, ""));
      continue;
    }
    flushQuote();

    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
      continue;
    }
    closeList();

    if (/^\s*$/.test(line)) continue;
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  closeList();
  flushQuote();
  return { html: html.join("\n"), toc };
}

function setActiveNav() {
  document.querySelectorAll("nav a").forEach(link => {
    link.classList.toggle("active", link.pathname === location.pathname || (link.pathname === `${BASE}guides/` && state.route === "guides"));
  });
}

function scrollToCurrentHash() {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGuideList() {
  const q = state.query.trim().toLowerCase();
  const filtered = state.guides.filter(guide => {
    const haystack = [guide.title, guide.category, guide.level, guide.description, ...guide.headings.map(h => h.text)].join(" ").toLowerCase();
    return haystack.includes(q);
  });
  guideList.innerHTML = filtered.map(guide => `
    <a class="guide-card ${guide.id === state.activeId ? "active" : ""}" href="${routeById[guide.id]}" style="--accent:${guide.accent};--accent-soft:${guide.accent}18">
      <strong>${guide.title}</strong>
      <small>${guide.category} · ${guide.level}<br>${guide.description}</small>
    </a>
  `).join("");
}

function renderDirectoryCards(guides) {
  return `
    <div class="guide-grid">
      ${guides.map(guide => `
        <a class="directory-card" href="${routeById[guide.id]}" style="--accent:${guide.accent};--accent-soft:${guide.accent}22">
          <div>
            <span>${guide.category}</span>
            <h2>${guide.title}</h2>
            <p>${guide.description}</p>
          </div>
          <small>${guide.level} · ${guide.headings.length} 个核心章节</small>
        </a>
      `).join("")}
    </div>
  `;
}

function renderGuidesIndex() {
  state.activeId = "";
  state.route = "guides";
  shellEl.classList.remove("detail-layout");
  document.documentElement.style.setProperty("--accent", "#2f6fed");
  document.documentElement.style.setProperty("--accent-soft", "#e9f0ff");
  renderGuideList();
  setActiveNav();

  headerEl.innerHTML = `
    <p class="kicker">Guides</p>
    <h1>Welcome to StudyPeak</h1>
    <p>整理 RAG、Agent、工程实践、机器学习、深度学习和 NLP 的知识站点。这里不是零散笔记堆放处，而是持续沉淀的学习入口。</p>
    <div class="chips">
      <span class="chip">Written: 2026.09</span>
      <span class="chip">${state.guides.length} 个主题</span>
      <span class="chip">Guides directory</span>
    </div>
  `;

  noteEl.innerHTML = `
    <h2 id="get-started">Get started</h2>
    ${renderDirectoryCards(state.guides)}

    <h2 id="current-focus">Current focus</h2>
    <div class="focus-steps">
      <section class="focus-step">
        <h3>RAG</h3>
        <p>继续整理检索增强生成、向量数据库、混合检索、重排、在线链路和离线入库流程。</p>
      </section>
      <section class="focus-step">
        <h3>Agent</h3>
        <p>后续可把 Agent 理论、框架实践、LangChain、LangGraph 和评测相关内容接入 Guides。</p>
      </section>
      <section class="focus-step">
        <h3>ML / DL / NLP</h3>
        <p>把机器学习基础、深度学习实现、NLP 文本表示和项目应用变成可回看的系统页面。</p>
      </section>
    </div>

    <h2 id="explore-the-docs">Explore the docs</h2>
    ${renderDirectoryCards(state.guides)}
  `;
  tocEl.innerHTML = `
    <a href="#get-started">Get started</a>
    <a href="#current-focus">Current focus</a>
    <a href="#explore-the-docs">Explore the docs</a>
  `;
}

async function openGuide(id) {
  const guide = state.guides.find(item => item.id === id);
  if (!guide) {
    history.replaceState(null, "", `${BASE}guides/`);
    renderGuidesIndex();
    return;
  }

  state.activeId = guide.id;
  state.route = guide.id;
  shellEl.classList.add("detail-layout");
  document.documentElement.style.setProperty("--accent", guide.accent);
  document.documentElement.style.setProperty("--accent-soft", `${guide.accent}18`);
  renderGuideList();
  setActiveNav();

  headerEl.innerHTML = `
    <p class="kicker">Guides / ${guide.category}</p>
    <h1>${guide.title}</h1>
    <p>${guide.description}</p>
    <div class="chips">
      <span class="chip">${guide.level}</span>
      <span class="chip">${guide.headings.length} 个核心章节</span>
      <span class="chip"><a href="${BASE}guides/">返回 Guides</a></span>
    </div>
  `;

  const response = await fetch(`${BASE}${guide.file}`);
  const markdown = await response.text();
  const rendered = renderMarkdown(markdown);
  noteEl.innerHTML = rendered.html;
  tocEl.innerHTML = rendered.toc.map(item => `<a class="level-${item.level}" href="#${item.id}">${item.text}</a>`).join("");
  requestAnimationFrame(scrollToCurrentHash);
}

function resolveRoute() {
  const rel = location.pathname.startsWith(BASE)
    ? location.pathname.slice(BASE.length).replace(/\/+$/, "")
    : "";
  if (!rel || rel === "guides") return { type: "index" };
  const id = ROUTE_NAMES.includes(rel) ? rel : null;
  return id ? { type: "guide", id } : { type: "index" };
}

function route() {
  const current = resolveRoute();
  if (current.type === "guide") {
    openGuide(current.id);
  } else {
    renderGuidesIndex();
  }
}

async function boot() {
  const response = await fetch(`${BASE}src/guides.json`);
  state.guides = await response.json();
  searchInput.addEventListener("input", event => {
    state.query = event.target.value;
    renderGuideList();
  });
  window.addEventListener("popstate", route);
  document.body.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link || link.origin !== location.origin) return;
    if (link.hash && link.pathname === location.pathname) {
      event.preventDefault();
      history.pushState(null, "", link.pathname + link.hash);
      scrollToCurrentHash();
      return;
    }
    event.preventDefault();
    history.pushState(null, "", link.pathname + link.hash);
    route();
    if (!link.hash) window.scrollTo({ top: 0, behavior: "smooth" });
  });
  route();
}

boot().catch(error => {
  noteEl.innerHTML = `<p>笔记加载失败：${escapeHtml(error.message)}</p>`;
});
