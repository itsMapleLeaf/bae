import type { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { buttonComponent } from "@itsmapleleaf/gatekeeper"
import type { Client, EmojiResolvable, User } from "discord.js"
import { setTimeout } from "node:timers/promises"

type Choice = typeof choices[number]
const choices = ["rock", "paper", "scissors"] as const

type State =
  | { type: "pregame" }
  | { type: "denied" }
  | {
      type: "game"
      player1Choice: Choice | undefined
      player2Choice: Choice | undefined
    }

const mention = (user: User) => `<@${user.id}>`

function getWinner(firstChoice: Choice, secondChoice: Choice) {
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

const choiceEmoji: Record<Choice, EmojiResolvable> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
}

export const rpsCommand = (gatekeeper: Gatekeeper, client: Client) =>
  gatekeeper.addUserCommand({
    name: "Rock, Paper, Scissors!",
    run(context) {
      const player1 = context.user
      const player2 = context.targetUser

      if (player1.id === player2.id) {
        context.ephemeralReply(() => `You can't challenge yourself, silly.`)
        return
      }

      const selfChallenge = player2.id === client.user?.id

      if (player2.bot && !selfChallenge) {
        context.ephemeralReply(
          () =>
            `You can't challenge another bot, the tech isn't there yet. But try challenging me!`,
        )
        return
      }

      let state: State = { type: "pregame" }

      if (selfChallenge) {
        state = {
          type: "game",
          player1Choice: undefined,
          player2Choice: choices[Math.floor(Math.random() * choices.length)],
        }
      }

      function choiceButtonComponent(props: { label: string; choice: Choice }) {
        return buttonComponent({
          label: props.label,
          emoji: choiceEmoji[props.choice],
          style: "PRIMARY",
          onClick: (buttonContext) => {
            if (state.type !== "game") return

            if (buttonContext.user.id === player1.id) {
              state.player1Choice = props.choice
              return
            }

            if (buttonContext.user.id === player2.id) {
              state.player2Choice = props.choice
              return
            }

            buttonContext.ephemeralReply(
              () => `You're not playing. Start your own game!`,
            )
          },
        })
      }

      const reply = context.reply(() => {
        if (state.type === "pregame") {
          return [
            `${mention(player1)} challenged ${mention(
              player2,
            )} to rock, paper scissors. Do you accept?`,

            buttonComponent({
              label: "accept",
              style: "PRIMARY",
              onClick: (buttonContext) => {
                if (buttonContext.user.id === player2.id) {
                  state = {
                    type: "game",
                    player1Choice: undefined,
                    player2Choice: undefined,
                  }
                } else {
                  buttonContext.ephemeralReply(
                    () => `Only the challenged player can click this.`,
                  )
                }
              },
            }),

            buttonComponent({
              label: "deny",
              style: "SECONDARY",
              onClick: async (buttonContext) => {
                if (buttonContext.user.id === player2.id) {
                  state = { type: "denied" }
                  await setTimeout(3000)
                  reply.delete()
                } else {
                  buttonContext.ephemeralReply(
                    () => `Only the challenged player can click this.`,
                  )
                }
              },
            }),
          ]
        }

        if (state.type === "denied") {
          return `${mention(player2)} has denied the challenge. no balls`
        }

        if (state.type === "game") {
          if (state.player1Choice && state.player2Choice) {
            const winner = getWinner(state.player1Choice, state.player2Choice)

            const winMessage =
              winner === "tie"
                ? "it's a tie lol"
                : winner === "player1"
                ? selfChallenge
                  ? `You win! Nice job.`
                  : `${mention(player1)} wins!`
                : selfChallenge
                ? `I win! Better luck next time.`
                : `${mention(player2)} wins!`

            return [
              `${mention(player1)} picked ${choiceEmoji[state.player1Choice]} ${
                state.player1Choice
              }`,
              `${mention(player2)} picked ${choiceEmoji[state.player2Choice]} ${
                state.player2Choice
              }`,
              "",
              winMessage,
            ]
          }

          return [
            selfChallenge ? `I accept! Choose wisely.` : `Choose your weapons.`,
            ``,
            `${mention(player1)}: ${state.player1Choice ? "✅" : "💭"}`,
            `${mention(player2)}: ${state.player2Choice ? "✅" : "💭"}`,
            choiceButtonComponent({
              label: "rock",
              choice: "rock",
            }),
            choiceButtonComponent({
              label: "paper",
              choice: "paper",
            }),
            choiceButtonComponent({
              label: "scissors",
              choice: "scissors",
            }),
          ]
        }

        return "oops, something broke"
      })
    },
  })
