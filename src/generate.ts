import fs from "fs";
import path from "path";
import { unified } from "unified";
import markdown from "remark-parse";
import toc from "remark-toc";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
// @ts-expect-error
import { template, html as h, doctype } from "rehype-template";
import { Node as DefaultNode, Literal } from "unist";
// @ts-expect-error
import urls from "rehype-urls";
import { UrlWithStringQuery } from "url";
import slug from "rehype-slug";
import minify from "rehype-preset-minify";
import html from "rehype-stringify";
import CleanCSS from "clean-css";

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

  const files = await fsp.readdir(IN_DIR);

  const promises = files.map(convertMdToHtml);

  promises.push(emitMinifiedCss());

  await Promise.all(promises);
}

const processor = unified()
  .use(markdown)
  .use(toc, { maxDepth: 2 })
  .use(gfm)
  .use(remark2rehype)
  .use(template, {
    template: (nodes: Node[]) => h`
      ${doctype}
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Taxes - ${extractTitle(nodes)}</title>
          <link rel="stylesheet" href="/style.css" />
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
          <main>${nodes}</main>
        </body>
      </html>
    `,
  })
  .use(urls, rewriteUrls)
  .use(slug)
  .use(minify)
  .use(html);

async function convertMdToHtml(filename: string) {
  if (path.extname(filename) !== ".md") return; // LICENSE

  const filepath = path.join(IN_DIR, filename);
  const buff = await fsp.readFile(filepath);

  const vfile = await processor.process(buff);
  console.log(`✓ ${filepath}`);

  await fsp.writeFile(
    `${OUT_DIR}/${filename.replace(".md", ".html")}`,
    String(vfile)
  );
}

interface Node extends DefaultNode {
  tagName: string;
  children: Literal[];
  properties: Record<string, any>;
}

function extractTitle(nodes: Node[]) {
  const h1 = nodes.find(({ tagName }) => tagName === "h1") as Node;
  const h1Text = h1.children[0].value as string;
  return h1Text.replace(
    /International taxes for freelancers and digital nomads/,
    "Homepage"
  );
}

function rewriteUrls(url: UrlWithStringQuery, node: Node) {
  if (node.tagName !== "a") {
    return; // link
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
  src = `./${SRC_DIR}/style.css`,
  dest = `./${OUT_DIR}/style.css`
) {
  const simpleCss = await fsp.readFile(
    "./node_modules/simpledotcss/simple.min.css",
    "utf8"
  );
  const custom = await fsp.readFile(src, "utf8");

  const { styles, errors, warnings } = new CleanCSS().minify(
    `${simpleCss}${custom}`
  );

  errors.forEach(console.error);
  warnings.forEach(console.warn);

  await fsp.writeFile(dest, styles, "utf8");
}
