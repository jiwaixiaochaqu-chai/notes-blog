#!/usr/bin/env node
// Cross-platform build (Windows / Linux / macOS) — replaces scripts/build.ps1
// Usage: node scripts/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

// 1. clean + recreate dist
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 2. copy static assets
const copyFile = (name) => {
  const from = path.join(root, name);
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(dist, name));
};
const copyDir = (name) => {
  const from = path.join(root, name);
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, path.join(dist, name), { recursive: true });
};

copyFile("styles.css");
copyFile("app.js");
copyDir("content");
copyDir("assets");
copyDir("src");

// 3. .openai/hosting.json
const openaiDir = path.join(dist, ".openai");
fs.mkdirSync(openaiDir, { recursive: true });
const hosting = path.join(root, ".openai", "hosting.json");
if (fs.existsSync(hosting)) fs.copyFileSync(hosting, path.join(openaiDir, "hosting.json"));

// 4. index.html template: absolute paths -> relative (root "./", sub routes "../")
const template = fs.readFileSync(path.join(root, "index.html"), "utf8");
const rootHtml = template.replace(/(href|src)="\//g, '$1="');
fs.writeFileSync(path.join(dist, "index.html"), rootHtml, "utf8");

const routes = ["guides", "rag", "toumanfen", "ml-dl-nlp"];
for (const route of routes) {
  const dir = path.join(dist, route);
  fs.mkdirSync(dir, { recursive: true });
  const html = template.replace(/(href|src)="\//g, '$1="../');
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

// 5. RAG tab: full mkdocs courseware site -> dist/rag/ (overwrites the SPA page)
const courseware = path.join(root, "courseware");
if (fs.existsSync(courseware)) {
  fs.cpSync(courseware, path.join(dist, "rag"), { recursive: true, force: true });
}

// 6. report
const count = (dir) => {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? count(path.join(dir, e.name)) : 1;
  }
  return n;
};
console.log(`build ok -> ${dist} (${count(dist)} files)`);
