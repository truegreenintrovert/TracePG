import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const assetsDir = path.join(distDir, "assets");
const htmlPath = path.join(distDir, "index.html");
const cssFiles = readdirSync(assetsDir).filter((fileName) => fileName.endsWith(".css"));

if (!cssFiles.length) throw new Error("No compiled CSS asset was found.");

const html = readFileSync(htmlPath, "utf8");
const css = cssFiles.map((fileName) => readFileSync(path.join(assetsDir, fileName), "utf8")).join("\n");
const inlined = html.replace(/<link\s+rel="stylesheet"[^>]*href="[^"]+\.css(?:\?[^\"]*)?"[^>]*>/g, `<style>${css}</style>`);

if (inlined === html) throw new Error("The generated HTML did not contain a stylesheet link to inline.");
writeFileSync(htmlPath, inlined);
