// Prevent tree-shaking from removing Vue's `h` and `Fragment`,
// which are required at runtime for TSX to work.
export function keepAlive(..._args: unknown[]) {}
