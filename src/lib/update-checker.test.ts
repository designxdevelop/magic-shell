import { expect, test } from "bun:test"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, realpathSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { spawnSync } from "child_process"
import { getCurrentVersion, getUpdateTarget, PACKAGE_NAME } from "./update-checker"
import packageMetadata from "../../package.json"

test("updates target the running npm prefix even when Bun is available", () => {
  for (const prefix of ["/Users/austin/.local", "/Users/austin/.nvm/versions/node/v26.7.0", "/tmp/prefix with spaces"]) {
    expect(getUpdateTarget(`${prefix}/lib/node_modules/${PACKAGE_NAME}`, "1.1.9")).toEqual({
      command: "npm", args: ["install", "-g", "--prefix", prefix, `${PACKAGE_NAME}@1.1.9`],
    })
  }
})

test("Windows npm and Bun roots are recognized; ambiguous installations require manual updates", () => {
  expect(getUpdateTarget(`C:\\Users\\austin\\AppData\\Roaming\\npm\\node_modules\\@austinthesing\\magic-shell`)?.args).toEqual([
    "install", "-g", "--prefix", "C:/Users/austin/AppData/Roaming/npm", `${PACKAGE_NAME}@latest`,
  ])
  expect(getUpdateTarget(`/Users/austin/.local/share/pnpm/global/v11/example/node_modules/${PACKAGE_NAME}`)).toBeNull()
  expect(getUpdateTarget(`/custom-bun/install/global/node_modules/${PACKAGE_NAME}`)).toEqual({
    command: "bun", args: ["add", "-g", `${PACKAGE_NAME}@latest`], env: { BUN_INSTALL: "/custom-bun" },
  })
  expect(getUpdateTarget("/tmp/magic-shell-checkout")).toBeNull()
})

test("bundled version is independent of cwd and build-machine paths", async () => {
  const dir = mkdtempSync(join(tmpdir(), "magic-shell-version-"))
  try {
    const entry = join(dir, "entry.ts")
    const output = join(dir, "bundle.js")
    writeFileSync(entry, `import { getCurrentVersion } from ${JSON.stringify(import.meta.dir + "/update-checker.ts")}; console.log(getCurrentVersion());`)
    const result = await Bun.build({ entrypoints: [entry], target: "node", outdir: dir, naming: "bundle.js" })
    expect(result.success).toBe(true)
    const run = () => spawnSync(process.execPath, [output], { cwd: dir, encoding: "utf8" })
    expect(run().stdout.trim()).toBe(packageMetadata.version)
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: PACKAGE_NAME, version: "99.99.99" }))
    expect(run().stdout.trim()).toBe(packageMetadata.version)
    expect(getCurrentVersion()).toBe(packageMetadata.version)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("updater resolves symlinked launchers and passes prefix as one argument", () => {
  if (process.platform === "win32") return
  const dir = mkdtempSync(join(tmpdir(), "magic-shell-update-"))
  try {
    const prefix = join(dir, "prefix with spaces")
    const packageRoot = join(prefix, "lib/node_modules", PACKAGE_NAME)
    const bin = join(dir, "bin")
    mkdirSync(join(packageRoot, "dist"), { recursive: true })
    mkdirSync(bin)
    writeFileSync(join(packageRoot, "package.json"), JSON.stringify({ name: PACKAGE_NAME }))
    writeFileSync(join(packageRoot, "dist/index.js"), "")
    const launcher = join(bin, "msh")
    symlinkSync(join(packageRoot, "dist/index.js"), launcher)
    writeFileSync(join(bin, "npm"), `#!${process.execPath}\nconsole.log(JSON.stringify(process.argv.slice(2)));`, { mode: 0o755 })
    writeFileSync(join(bin, "bun"), "#!/bin/sh\nexit 99\n", { mode: 0o755 })
    const script = `
      import { performUpdate } from ${JSON.stringify(import.meta.dir + "/update-checker.ts")};
      process.argv[1] = ${JSON.stringify(launcher)};
      console.log(JSON.stringify(await performUpdate("1.1.9")));
    `
    const result = spawnSync(process.execPath, ["--eval", script], {
      cwd: dir, env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, encoding: "utf8",
    })
    expect(result.status).toBe(0)
    const update = JSON.parse(result.stdout)
    expect(update.success).toBe(true)
    expect(JSON.parse(update.output)).toEqual(["install", "-g", "--prefix", realpathSync(prefix), `${PACKAGE_NAME}@1.1.9`])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("a cache older than the installed version refreshes instead of prompting a downgrade", () => {
  const dir = mkdtempSync(join(tmpdir(), "magic-shell-update-cache-"))
  try {
    mkdirSync(join(dir, ".magic-shell"))
    writeFileSync(join(dir, ".magic-shell/.update-check"), JSON.stringify({ lastCheck: Date.now(), latestVersion: "1.1.7", dismissed: null }))
    const script = `
      import { checkForUpdates, getCurrentVersion } from ${JSON.stringify(import.meta.dir + "/update-checker.ts")};
      let requests = 0;
      globalThis.fetch = async () => { requests++; return Response.json({ version: getCurrentVersion() }); };
      console.log(JSON.stringify({ update: await checkForUpdates(), requests }));
    `
    const result = spawnSync(process.execPath, ["--eval", script], {
      cwd: dir, env: { ...process.env, HOME: dir, USERPROFILE: dir }, encoding: "utf8",
    })
    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({ update: null, requests: 1 })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
