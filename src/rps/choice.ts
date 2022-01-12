export type Choice = typeof choices[number]
export const choices = ["rock", "paper", "scissors"] as const

export const choiceEmoji: Record<Choice, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
}
