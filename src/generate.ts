import MarkdownIt from "markdown-it";
import fs from "fs";
import path from "path";

main().catch(console.error);

async function main() {
  const IN_DIR = "pages";
  const OUT_DIR = "dist";

  const fsp = fs.promises;

  if (fs.existsSync(OUT_DIR)) {
    await fsp.rm(OUT_DIR, { recursive: true });
  }

  await fsp.mkdir(OUT_DIR);

  const files = await fsp.readdir(IN_DIR);
  const md = new MarkdownIt();

  const promises = files.map(async (file) => {
    const { name, ext } = path.parse(file);

    if (ext !== ".md") return; // LICENSE

    const contents = await fsp.readFile(`${IN_DIR}/${file}`, "utf8");

    const rawHtml = md.render(contents);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Taxes</title>
      </head>
      <body>
        ${rawHtml}
      </body>
      </html>
    `.trim();

    await fsp.writeFile(`${OUT_DIR}/${name}.html`, html);
  });

  await Promise.all(promises);
}
