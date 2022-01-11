import fetch from "node-fetch"

export async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url)
  return await response.json()
}
