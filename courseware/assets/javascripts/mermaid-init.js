// Mermaid initialization for mkdocs-material with instant navigation
document$.subscribe(function () {
  if (typeof mermaid === "undefined") {
    return;
  }
  mermaid.initialize({ startOnLoad: false, theme: "default" });
  mermaid.run({ querySelector: ".mermaid" });
});
