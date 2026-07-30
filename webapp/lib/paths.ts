// webapp/lib/paths.ts
import path from "path";
export const REPO_ROOT = path.resolve(process.cwd(), "..");
export const RUNS_DIR = process.env.RUNS_DIR ?? path.join(REPO_ROOT, "runs");
export const PROMPTS_DIR = path.join(REPO_ROOT, "prompts");
export const REFERENCES_DIR = path.join(REPO_ROOT, "references");
export const TECTONIC = process.env.TECTONIC_PATH ?? path.join(REPO_ROOT, "tools", "tectonic.exe");
