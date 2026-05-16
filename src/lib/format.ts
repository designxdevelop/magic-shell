export interface CommandFormatColors {
  dim: string
  reset: string
}

export function formatExecutedCommand(command: string, colors: CommandFormatColors): string {
  return `${colors.dim}Command:${colors.reset} ${command}`
}
