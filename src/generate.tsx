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
import { minify, Options } from "html-minifier-terser";
import { render } from "preact-render-to-string";
import { Calculator } from "./Calculator.js";

const IN_DIR = "pages";
const OUT_DIR = "dist";

const fsp = fs.promises;

main().catch(console.error);

async function main() {
  const [jsFile, cssFile] = await fsp.readdir(OUT_DIR);

  const files = await fsp.readdir(IN_DIR);

  const promises = files.map((f) => convertMdToHtml(f, cssFile));
  promises.push(renderCalculator(cssFile, jsFile));
  await Promise.all(promises);
}

const processor = unified()
  .use(markdown)
  .use(toc, { maxDepth: 2 })
  .use(gfm)
  .use(remark2rehype)
  .use(urls, rewriteUrls)
  .use(slug)
  .use(html);

const htmlMinifierOpts: Options = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeEmptyElements: true,
  removeRedundantAttributes: true,
};

async function convertMdToHtml(filename: string, cssFile: string) {
  if (path.extname(filename) !== ".md") return; // LICENSE

  const filepath = path.join(IN_DIR, filename);

  const buff = await fsp.readFile(filepath);
  const vfile = await processor.process(buff);

  const template = htmlTemplate(formatTitle(filename), String(vfile), cssFile);
  const html = await minify(template, htmlMinifierOpts);

  await fsp.writeFile(
    path.join(OUT_DIR, filename.replace(".md", ".html")),
    html
  );

  console.log(`✓ ${filepath}`);
}

function htmlTemplate(
  title: string,
  html: string,
  cssFile: string,
  jsFile?: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Taxes - ${title}</title>
        <link rel="stylesheet" href="/${cssFile}" />
        ${jsFile ? `<script src="/${jsFile}" defer></script>` : ""}
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
        <main>${html}</main>
      </body>
    </html>
  `;
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

async function renderCalculator(
  cssFile: string,
  jsFile: string,
  filename = "example-calculations.html" // this page used to be in Markdown
) {
  const jsxStr = render(<Calculator />);

  const template = htmlTemplate(formatTitle(filename), jsxStr, cssFile, jsFile);

  const html = await minify(template, htmlMinifierOpts);

  await fsp.writeFile(path.join(OUT_DIR, filename), html);
}
