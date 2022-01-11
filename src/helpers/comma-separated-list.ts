export function commaSeparatedList(items: string[], finalWord = "and"): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]!
  if (items.length === 2) return `${items[0]} ${finalWord} ${items[1]}`

  const head = items.slice(0, -1).join(", ")
  const tail = items.slice(-1)[0]
  return `${head}, ${finalWord} ${tail}`
}
