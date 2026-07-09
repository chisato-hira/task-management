export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}
