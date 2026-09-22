import { access, copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guidesPath = path.join(root, "src", "guides.json");
const sources = [
  {
    id: "rag",
    source: "D:\\hm\\my\\zhengshi\\10.rag\\笔记.md",
    category: "RAG",
    accent: "#2f6fed",
    description: "检索增强生成的基础概念、Milvus、LangChain、在线链路、离线入库和生产化治理。",
    level: "工程链路",
    title: "RAG 知识库"
  },
  {
    id: "toumanfen",
    source: "D:\\hm\\my\\zhengshi\\8.send_full_score\\笔记\\投满分\\文本分类项目.md"
  },
  {
    id: "ml-dl-nlp",
    source: "D:\\hm\\my\\zhengshi\\总结.md"
  }
];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function resolveImage(sourceFile, rawPath) {
  let value = rawPath.trim().replace(/^<|>$/g, "");
  if (/^file:\/\//i.test(value)) {
    value = decodeURIComponent(value.replace(/^file:\/\/\/?/i, ""));
  }
  value = value.replaceAll("/", path.sep);
  return path.isAbsolute(value) ? value : path.resolve(path.dirname(sourceFile), value);
}

async function localImageUrl(source, rawPath) {
    const imagePath = resolveImage(source.source, rawPath);
    const parsed = path.parse(imagePath);
    const webpName = `${source.id}-${parsed.name}.webp`;
    const copiedName = `${source.id}-${parsed.base}`;
    const webpPath = path.join(root, "assets", webpName);
    const copiedPath = path.join(root, "assets", copiedName);
    let publicName;
    if (await exists(webpPath)) {
      publicName = webpName;
    } else if (await exists(imagePath)) {
      await copyFile(imagePath, copiedPath);
      publicName = copiedName;
    } else {
      throw new Error(`图片不存在: ${imagePath}`);
    }
    return `../assets/${publicName}`;
}

async function localizeImages(markdown, source) {
  let output = markdown;
  const markdownImages = [...output.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  for (const match of markdownImages) {
    const publicUrl = await localImageUrl(source, match[2]);
    output = output.replace(match[0], `![${match[1]}](${publicUrl})`);
  }

  const htmlImages = [...output.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)];
  for (const match of htmlImages) {
    const publicUrl = await localImageUrl(source, match[1]);
    const alt = match[0].match(/alt=["']([^"']*)["']/i)?.[1] ?? "";
    output = output.replace(match[0], `![${alt}](${publicUrl})`);
  }

  output = output.replaceAll(
    "file:///D:/hm/teather/7_rag/01_课件/site/",
    "../courseware/"
  );
  return output;
}

function extractHeadings(markdown) {
  return markdown.split(/\r?\n/)
    .map(line => line.match(/^(#{1,3})\s+(.+)$/))
    .filter(Boolean)
    .map(match => ({ level: match[1].length, text: match[2].trim() }))
    .slice(0, 40);
}

const guides = JSON.parse(await readFile(guidesPath, "utf8"));
for (const source of sources) {
  if (!(await exists(source.source))) {
    const generated = path.join(root, "content", `${source.id}.md`);
    if (!(await exists(generated))) throw new Error(`源文档和已同步内容均不存在: ${source.source}`);
    console.warn(`跳过本机源文档（云端构建将使用已同步内容）: ${source.source}`);
    continue;
  }
  const current = guides.find(guide => guide.id === source.id) ?? {};
  const guide = { ...current, ...source };
  delete guide.source;
  const original = await readFile(source.source, "utf8");
  const localized = (await localizeImages(original, source))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "");
  await writeFile(path.join(root, "content", `${source.id}.md`), localized, "utf8");
  guide.file = `content/${source.id}.md`;
  guide.headings = extractHeadings(original);
  const index = guides.findIndex(item => item.id === source.id);
  if (index === -1) guides.push(guide);
  else guides[index] = guide;
}

const order = new Map(sources.map((source, index) => [source.id, index]));
guides.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
await writeFile(guidesPath, `${JSON.stringify(guides, null, 2)}\n`, "utf8");
console.log(`已同步 ${sources.length} 份文档。`);
