import fs from "fs";
import path from "path";
import { unified } from "unified";
import markdown from "remark-parse";
import toc from "remark-toc";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import { Node as DefaultNode, Literal } from "unist";
// @ts-expect-error
import urls from "rehype-urls";
import { UrlWithStringQuery } from "url";
import slug from "rehype-slug";
import html from "rehype-stringify";
import { minify } from "html-minifier-terser";
import CleanCSS from "clean-css";
import revisionHash from "rev-hash";

const IN_DIR = "pages";
const OUT_DIR = "dist";
const SRC_DIR = "src";

const fsp = fs.promises;

main().catch(console.error);

async function main() {
  if (fs.existsSync(OUT_DIR)) {
    await fsp.rm(OUT_DIR, { recursive: true });
  }

  await fsp.mkdir(OUT_DIR);

  const cssFilename = await emitMinifiedCss();

  const files = await fsp.readdir(IN_DIR);

  await Promise.all(files.map((f) => convertMdToHtml(f, cssFilename)));
}

const processor = unified()
  .use(markdown)
  .use(toc, { maxDepth: 2 })
  .use(gfm)
  .use(remark2rehype)
  .use(urls, rewriteUrls)
  .use(slug)
  .use(html);

async function convertMdToHtml(filename: string, cssFilename: string) {
  if (path.extname(filename) !== ".md") return; // LICENSE

  const filepath = path.join(IN_DIR, filename);

  const buff = await fsp.readFile(filepath);
  const vfile = await processor.process(buff);

  const template = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Taxes - ${formatTitle(filename)}</title>
        <link rel="stylesheet" href="/${cssFilename}" />
      </head>
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/basics-of-taxation">Basics</a>
            <a href="/glossary">Glossary</a>
            <a href="/resources">Resources</a>
          </nav>
        </header>
        <main>${String(vfile)}</main>
      </body>
    </html>
  `;
  const html = await minify(template, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeRedundantAttributes: true,
  });

  await fsp.writeFile(
    path.join(OUT_DIR, filename.replace(".md", ".html")),
    html
  );

  console.log(`✓ ${filepath}`);
}

function formatTitle(filename: string) {
  const page = filename.slice(0, filename.indexOf("."));
  if (page === "index") return "Homepage";
  return capitalize(page).replaceAll("-", " ").replace("canada", "Canada");
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

interface Node extends DefaultNode {
  tagName: string;
  children: Literal[];
  properties: Record<string, any>;
}

function rewriteUrls(url: UrlWithStringQuery, node: Node) {
  if (node.tagName !== "a") {
    return;
  }

  // Decorate external links
  if (url.protocol && /https?:/.test(url.protocol)) {
    (node.properties as any).rel = "nofollow noopener noreferrer";
    (node.properties as any).target = "_blank";
    return url;
  }

  // Fix relative links
  return url.href.replace(/^\.\/(.+)\.md/, "/$1");
}

async function emitMinifiedCss(
  srcFile = path.join(SRC_DIR, "style.css"),
  destDir = OUT_DIR
) {
  const simpleCss = await fsp.readFile(
    "./node_modules/simpledotcss/simple.min.css",
    "utf8"
  );
  const customCss = await fsp.readFile(srcFile, "utf8");

  const { styles, errors, warnings } = new CleanCSS().minify(
    `${simpleCss}${customCss}`
  );

  errors.forEach(console.error);
  warnings.forEach(console.warn);

  const filename = `style.${revisionHash(styles)}.css`;

  await fsp.writeFile(path.join(destDir, filename), styles, "utf8");

  return filename;
}
