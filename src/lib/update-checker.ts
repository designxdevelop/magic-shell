import { spawn } from "child_process"
import { homedir } from "os"
import { join, dirname, posix } from "path"
import { existsSync, readFileSync, writeFileSync, mkdirSync, realpathSync } from "fs"
import packageMetadata from "../../package.json"

const PACKAGE_NAME = "@austinthesing/magic-shell"
const NPM_REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours
const CONFIG_DIR = join(homedir(), ".magic-shell")
const UPDATE_CHECK_FILE = join(CONFIG_DIR, ".update-check")

interface UpdateCheckState {
  lastCheck: number
  latestVersion: string | null
  dismissed: string | null // Version that was dismissed
}

interface UpdateCheckConfig {
  checkForUpdates: boolean
  autoUpdate: boolean
}

export interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string | null
  updateCommand: string
}

export type UpdateFlowResult =
  | { action: "none" }
  | { action: "up-to-date"; currentVersion: string }
  | { action: "notified"; update: UpdateInfo }
  | { action: "updated"; update: UpdateInfo; success: boolean; output: string }

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

function loadUpdateState(): UpdateCheckState {
  ensureConfigDir()
  try {
    if (existsSync(UPDATE_CHECK_FILE)) {
      return JSON.parse(readFileSync(UPDATE_CHECK_FILE, "utf-8"))
    }
  } catch {
    // Ignore errors
  }
  return { lastCheck: 0, latestVersion: null, dismissed: null }
}

function saveUpdateState(state: UpdateCheckState): void {
  ensureConfigDir()
  try {
    writeFileSync(UPDATE_CHECK_FILE, JSON.stringify(state))
  } catch {
    // Ignore errors
  }
}

function getCurrentVersion(): string {
  // Bundle our own metadata; runtime paths and the caller's cwd are unrelated.
  return packageMetadata.version
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number)
  const partsB = b.split(".").map(Number)

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    if (numA > numB) return 1
    if (numA < numB) return -1
  }
  return 0
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(NPM_REGISTRY_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })

    clearTimeout(timeout)

    if (!response.ok) return null

    const data = (await response.json()) as { version?: string }
    return data.version || null
  } catch {
    return null
  }
}

interface UpdateTarget {
  command: string
  args: string[]
  env?: Record<string, string>
}

export function getUpdateTarget(packageRoot: string, version = "latest"): UpdateTarget | null {
  const normalized = packageRoot.replaceAll("\\", "/")
  const packageSpec = `${PACKAGE_NAME}@${version}`
  if (/\/pnpm\/global\//.test(normalized)) {
    // pnpm's current global-dir may differ from this versioned installation.
    // Require a manual update rather than risk creating another global copy.
    return null
  }
  if (/\/install\/global\/node_modules\//.test(normalized)) {
    // Preserve custom BUN_INSTALL roots as well as ~/.bun.
    const globalRoot = posix.dirname(posix.dirname(posix.dirname(normalized)))
    return { command: "bun", args: ["add", "-g", packageSpec], env: { BUN_INSTALL: posix.dirname(posix.dirname(globalRoot)) } }
  }
  if (normalized.endsWith(`/node_modules/${PACKAGE_NAME}`)) {
    const parent = posix.dirname(posix.dirname(posix.dirname(normalized)))
    const prefix = posix.basename(parent) === "lib" ? posix.dirname(parent) : parent
    return { command: "npm", args: ["install", "-g", "--prefix", prefix, packageSpec] }
  }
  return null
}

function resolveUpdateTarget(version = "latest"): UpdateTarget | null {
  try {
    let directory = dirname(realpathSync(process.argv[1]))
    while (dirname(directory) !== directory) {
      const metadata = join(directory, "package.json")
      if (existsSync(metadata)) {
        const pkg = JSON.parse(readFileSync(metadata, "utf8"))
        if (pkg.name === PACKAGE_NAME) return getUpdateTarget(directory, version)
      }
      directory = dirname(directory)
    }
  } catch {
    // An unknown/local installation must not update an unrelated global copy.
  }
  return null
}

function formatUpdateCommand(target: UpdateTarget | null): string {
  if (!target) return "Update this installation manually with its package manager."
  return [target.command, ...target.args].map((arg) =>
    /^[\w@./:=+-]+$/.test(arg) ? arg : JSON.stringify(arg),
  ).join(" ")
}

async function buildUpdateInfo(latestVersion: string): Promise<UpdateInfo> {
  return {
    hasUpdate: true,
    currentVersion: getCurrentVersion(),
    latestVersion,
    updateCommand: formatUpdateCommand(resolveUpdateTarget(latestVersion)),
  }
}

/**
 * Check for updates (non-blocking, respects check interval)
 * Returns update info if there's a new version, null otherwise
 */
export async function checkForUpdates(): Promise<UpdateInfo | null> {
  const state = loadUpdateState()
  const currentVersion = getCurrentVersion()
  const now = Date.now()

  if (now - state.lastCheck < CHECK_INTERVAL_MS && (!state.latestVersion || compareVersions(state.latestVersion, currentVersion) >= 0)) {
    if (state.latestVersion && compareVersions(state.latestVersion, currentVersion) > 0) {
      if (state.dismissed === state.latestVersion) {
        return null
      }
      return await buildUpdateInfo(state.latestVersion)
    }
    return null
  }

  const latestVersion = await fetchLatestVersion()

  state.lastCheck = now
  if (latestVersion) {
    state.latestVersion = latestVersion
  }
  saveUpdateState(state)

  if (latestVersion && compareVersions(latestVersion, currentVersion) > 0) {
    if (state.dismissed === latestVersion) {
      return null
    }
    return await buildUpdateInfo(latestVersion)
  }

  return null
}

/**
 * Dismiss the update notification for the specified version
 */
export function dismissUpdate(version: string): void {
  const state = loadUpdateState()
  state.dismissed = version
  saveUpdateState(state)
}

/**
 * Force a fresh update check (ignores cache)
 */
export async function forceCheckForUpdates(): Promise<UpdateInfo | null> {
  const state = loadUpdateState()
  state.lastCheck = 0
  saveUpdateState(state)
  return checkForUpdates()
}

export async function performUpdate(version = "latest"): Promise<{ success: boolean; output: string }> {
  const target = resolveUpdateTarget(version)
  if (!target) return { success: false, output: "Cannot identify this installation's package manager; update it manually." }
  const updateCommand = formatUpdateCommand(target)

  return new Promise((resolve) => {
    const child = process.platform === "win32" ? spawn(updateCommand, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...target.env },
    }) : spawn(target.command, target.args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...target.env },
    })

    let stdout = ""
    let stderr = ""

    child.stdout?.on("data", (data) => {
      stdout += data.toString()
    })

    child.stderr?.on("data", (data) => {
      stderr += data.toString()
    })

    child.on("error", (error) => {
      resolve({
        success: false,
        output: error instanceof Error ? error.message : String(error),
      })
    })

    child.on("close", (code) => {
      const output = (stdout + stderr).trim() || updateCommand
      resolve({
        success: code === 0,
        output,
      })
    })
  })
}

export function formatUpdateBannerLines(update: UpdateInfo): string[] {
  return [
    `Update available! ${update.currentVersion} → ${update.latestVersion}`,
    `Run: ${update.updateCommand}`,
  ]
}

export function formatUpdateMessageForTui(update: UpdateInfo, autoUpdate: boolean): string {
  if (autoUpdate) {
    return `Update available (${update.currentVersion} → ${update.latestVersion}). Installing...`
  }

  return [
    `Update available: ${update.currentVersion} → ${update.latestVersion}`,
    `Run /update to install, or /auto-update to enable automatic updates.`,
  ].join("\n")
}

export async function processUpdateCheck(options: {
  checkForUpdates: boolean
  autoUpdate: boolean
  force?: boolean
  install?: boolean
}): Promise<UpdateFlowResult> {
  const { checkForUpdates: updatesEnabled, autoUpdate, force = false, install = false } = options

  if (!updatesEnabled && !force && !install) {
    return { action: "none" }
  }

  const update = force || install ? await forceCheckForUpdates() : await checkForUpdates()

  if (!update?.hasUpdate || !update.latestVersion) {
    if (force || install) {
      return { action: "up-to-date", currentVersion: getCurrentVersion() }
    }
    return { action: "none" }
  }

  if (install || autoUpdate) {
    const result = await performUpdate(update.latestVersion)
    if (result.success) {
      dismissUpdate(update.latestVersion)
    }
    return {
      action: "updated",
      update,
      success: result.success,
      output: result.output,
    }
  }

  return { action: "notified", update }
}

export function shouldRunStartupUpdateCheck(args: string[]): boolean {
  if (args.length === 0) return false

  const skipFlags = new Set([
    "--version",
    "-v",
    "--check-update",
    "--auto-update",
    "--no-auto-update",
    "--no-update-check",
    "--enable-update-check",
  ])

  return !skipFlags.has(args[0])
}

export { getCurrentVersion, PACKAGE_NAME }

export type { UpdateCheckConfig }
