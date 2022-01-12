import { Choice } from "./choice.js"

export function getWinner(firstChoice: Choice, secondChoice: Choice) {
  if (firstChoice === secondChoice) {
    return "tie"
  }
  if (firstChoice === "rock") {
    return secondChoice === "scissors" ? "player1" : "player2"
  }
  if (firstChoice === "paper") {
    return secondChoice === "rock" ? "player1" : "player2"
  }
  return secondChoice === "paper" ? "player1" : "player2"
}
