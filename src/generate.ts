import fs from "fs";
import path from "path";
import unified from "unified";
import markdown from "remark-parse";
import toc from "remark-toc";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import { template, html as h, doctype } from "rehype-template";
import CleanCSS from "clean-css";
import { Node } from "unist";
import urls from "rehype-urls";
import { UrlWithStringQuery } from "url";
import slug from "rehype-slug";
import wrap from "rehype-wrap-all";
import minify from "rehype-preset-minify";
import html from "rehype-stringify";
import vfile from "to-vfile";
import report from "vfile-reporter";

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

  promises.push(emitMinifedCss());

  await Promise.all(promises);
}

const processor = unified()
  .use(markdown)
  .use(toc, { maxDepth: 2 })
  .use(gfm)
  .use(remark2rehype)
  .use(template, {
    template: (node: Node) => h`
      ${doctype}
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Taxes</title>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <header>
            <nav>
              <a href="/">Home</a>/
              <a href="/basics-of-taxation">Basics</a>/
              <a href="/common-mistakes">Myths</a>/
              <a href="/glossary">Glossary</a>/
              <a href="https://github.com/marilius12/taxes">GitHub</a>
            </nav>
          </header>
          <main>${node}</main>
        </body>
      </html>
    `,
  })
  .use(urls, rewriteUrls)
  .use(slug)
  .use(wrap, { selector: "table", wrapper: ".table-container" })
  .use(minify)
  .use(html);

// TODO waiting on unifiedjs/unified#121 to land. Currently, stuck on vfile v4.
async function convertMdToHtml(filename: string) {
  if (path.extname(filename) !== ".md") return; // LICENSE

  const vFile = await vfile.read(`${IN_DIR}/${filename}`);

  const newVFile = await processor.process(vFile);
  console.error(report(newVFile));

  newVFile.extname = ".html";
  newVFile.dirname = OUT_DIR;

  await vfile.write(newVFile);
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

async function emitMinifedCss(
  src = `./${SRC_DIR}/sp.css`,
  dest = `./${OUT_DIR}/style.css`
) {
  const original = await fsp.readFile(src, "utf8");

  const { styles, errors, warnings } = new CleanCSS().minify(original);

  errors.forEach(console.error);
  warnings.forEach(console.warn);

  await fsp.writeFile(dest, styles, "utf8");
}
