import fs from "fs";
import path from "path";
import unified from "unified";
import markdown from "remark-parse";
import gfm from "remark-gfm";
import externalLinks from "remark-external-links";
import remark2rehype from "remark-rehype";
import { template, html as h, doctype } from "rehype-template";
import { Node } from "unist";
import urls from "rehype-urls";
import { UrlWithStringQuery } from "url";
import slug from "rehype-slug";
import html from "rehype-stringify";
import minify from "rehype-preset-minify";
import vfile from "to-vfile";
import report from "vfile-reporter";

const IN_DIR = "pages";
const OUT_DIR = "dist";

main().catch(console.error);

async function main() {
  const fsp = fs.promises;

  if (fs.existsSync(OUT_DIR)) {
    await fsp.rm(OUT_DIR, { recursive: true });
  }

  await fsp.mkdir(OUT_DIR);

  const files = await fsp.readdir(IN_DIR);

  const promises = files.map(convertMdToHtml);

  await Promise.all(promises);
}

const processor = unified()
  .use(markdown)
  .use(gfm)
  .use(externalLinks)
  .use(remark2rehype)
  .use(template, {
    template: (node: Node) => h`
      ${doctype}
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Taxes</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spcss@0.7.0"></link>
          <style>
            body { color: #000; margin: 1em auto 2em }
            a:link { color: #0070F3 }
            header nav a { padding: 0 0.5em }
            header nav a:first-child { padding-left: 0 }
          </style>
        </head>
        <body>
          <header>
            <nav>
              <a href="/">Home</a>/
              <a href="/basics-of-taxation">Basics</a>/
              <a href="/glossary">Glossary</a>/
              <a href="/resources">Resources</a>/
              <a href="https://github.com/marilius12/taxes" rel="nofollow noopener noreferrer" target="_blank">GitHub</a>
            </nav>
          </header>
          <main>${node}</main>
        </body>
      </html>
    `,
  })
  .use(urls, fixRelativeUrls)
  .use(slug)
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

function fixRelativeUrls(url: UrlWithStringQuery) {
  return url.href.replace(/^\.\/(.+)\.md/, "/$1");
}
