import { readFile, writeFile } from "fs/promises";
import { join, resolve, basename } from "path";

const INCLUDE_BLOCK = /<!--#include\((.*)\)-->([^]*?)<!--#\/include-->/g;
const CONTENT_BLOCK = /<!--#content-->([^]*?)<!--#\/content-->/;

const ROOT_DIR = resolve(
  join(basename(new URL(import.meta.url).pathname), "..")
);

const MAIN_README = join(ROOT_DIR, "README.md");

let mainReadme = await readFile(MAIN_README, "utf-8");

for (const [match, path] of mainReadme.matchAll(INCLUDE_BLOCK)) {
  const source = await readFile(join(ROOT_DIR, path), "utf-8");
  const [, content] = source.match(CONTENT_BLOCK)!;
  mainReadme = mainReadme.replace(
    match,
    `<!--#include(${path})-->${content}<!--#/include-->`
  );
}

await writeFile(MAIN_README, mainReadme, "utf-8");

console.log("Readme updated");
