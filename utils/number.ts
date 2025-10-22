export function roundDecimal(value: number, decimals: number = 2): number {
  if (isNaN(value) || value === null) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
