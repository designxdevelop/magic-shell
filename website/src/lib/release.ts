import pkg from "../../../package.json";
import changelog from "../content/docs/reference/changelog.mdx?raw";

export const currentVersion = pkg.version;

const section = changelog
  .split(/^## /m)
  .find((entry) => entry.startsWith(`v${currentVersion} - `));

if (!section) {
  throw new Error(`Missing changelog entry for Magic Shell ${currentVersion}`);
}

const [heading, ...content] = section.split("\n");
export const releaseTitle = heading.replace(`v${currentVersion} - `, "");
export const releaseSummary = content
  .join("\n")
  .trim()
  .split(/\n\s*\n/)[0]
  .replace(/`([^`]+)`/g, "$1");
