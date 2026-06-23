import { spawn } from "child_process"
import { homedir } from "os"
import { join } from "path"
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"

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
  try {
    const packagePaths = [
      join(__dirname, "../../package.json"),
      join(__dirname, "../../../package.json"),
      join(process.cwd(), "package.json"),
    ]

    for (const path of packagePaths) {
      if (existsSync(path)) {
        const pkg = JSON.parse(readFileSync(path, "utf-8"))
        if (pkg.name === PACKAGE_NAME || pkg.name === "magic-shell") {
          return pkg.version
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return "0.0.0"
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

function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const checker =
      process.platform === "win32"
        ? spawn("where", [command], { stdio: "ignore" })
        : spawn("command", ["-v", command], { stdio: "ignore", shell: true })

    checker.on("close", (code) => resolve(code === 0))
    checker.on("error", () => resolve(false))
  })
}

async function resolveUpdateCommand(): Promise<string> {
  if (await commandExists("bun")) {
    return `bun update -g ${PACKAGE_NAME}`
  }
  if (await commandExists("npm")) {
    return `npm install -g ${PACKAGE_NAME}@latest`
  }
  return `bun update -g ${PACKAGE_NAME}`
}

async function buildUpdateInfo(latestVersion: string): Promise<UpdateInfo> {
  return {
    hasUpdate: true,
    currentVersion: getCurrentVersion(),
    latestVersion,
    updateCommand: await resolveUpdateCommand(),
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

  if (now - state.lastCheck < CHECK_INTERVAL_MS) {
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

export async function performUpdate(): Promise<{ success: boolean; output: string }> {
  const updateCommand = await resolveUpdateCommand()

  return new Promise((resolve) => {
    const child = spawn(updateCommand, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
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
    const result = await performUpdate()
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
