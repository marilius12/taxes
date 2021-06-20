import fs from "fs";
import path from "path";
import unified from "unified";
import markdown from "remark-parse";
import gfm from "remark-gfm";
import externalLinks from "remark-external-links";
import remark2rehype from "remark-rehype";
import doc from "rehype-document";
import urls from "rehype-urls";
import { UrlWithStringQuery } from "url";
import slug from "rehype-slug";
import html from "rehype-stringify";
import minify from "rehype-preset-minify";
import vfile from "to-vfile";

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
  .use(doc, { title: "Taxes" })
  .use(urls, fixRelativeUrls)
  .use(slug)
  .use(html)
  .use(minify);

// TODO waiting on unifiedjs/unified#121 to land. Currently, stuck on vfile v4.
async function convertMdToHtml(filename: string) {
  if (path.extname(filename) !== ".md") return; // LICENSE

  const vFile = await vfile.read(`${IN_DIR}/${filename}`);

  const newVFile = await processor.process(vFile);
  newVFile.extname = ".html";
  newVFile.dirname = OUT_DIR;

  await vfile.write(newVFile);
}

function fixRelativeUrls(url: UrlWithStringQuery) {
  return url.href.replace(/^\.\/(.+)\.md/, "/$1");
}
