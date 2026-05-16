import { expect, test } from "bun:test"

import { formatExecutedCommand } from "./lib/format"

test("formats executed command before command output", () => {
  const output = formatExecutedCommand("bun upgrade --stable", { dim: "", reset: "" })

  expect(output).toContain("Command:")
  expect(output).toContain("bun upgrade --stable")
})
