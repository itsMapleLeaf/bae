import { Button, useInstance } from "reacord"
import React from "react"
import { isPositiveInteger } from "../helpers/is-positive-integer.js"

type RollResult = {
  input: string
  interpreted: string
  rolls: number[]
}

const maxDice = 100

export function RollResultView({
  diceString,
  userId,
  isReroll,
}: {
  diceString: string
  userId: string
  isReroll: boolean
}) {
  const instance = useInstance()
  const results = rollDice(diceString)
  const allRolls = results.flatMap((result) => result.rolls)

  if (allRolls.length > maxDice) {
    return <>You're rolling too many dice! (max {maxDice})</>
  }

  const total = allRolls.reduce((total, value) => total + value, 0)

  return (
    <>
      {isReroll && `(rerolled by <@${userId}>)`}
      {"\n"}
      {"\n"}
      {formatRollResults(results).join("\n")}
      {"\n"}
      {allRolls.length > 1 && `**Total:** ${total}`}
      <Button
        emoji="🎲"
        style="primary"
        onClick={(event) => {
          event.reply(
            <RollResultView
              diceString={diceString}
              userId={event.user.id}
              isReroll
            />,
          )
        }}
      />
      <Button
        emoji="❌"
        style="secondary"
        onClick={(event) => {
          if (event.user.id === userId) {
            instance.destroy()
          } else {
            event
              .ephemeralReply(
                `Sorry, only the owner of the roll can delete this!`,
              )
              .deactivate()
          }
        }}
      />
    </>
  )
}

function rollDice(diceString: string) {
  const results: RollResult[] = []

  for (const input of diceString.split(/\s+/)) {
    const [countInput, sizeInput] = input.split("d").map(Number)
    const count = isPositiveInteger(countInput) ? countInput : 1
    const size = isPositiveInteger(sizeInput) ? sizeInput : 6
    const interpreted = `${count}d${size}`

    const rolls = Array.from({ length: Math.min(count, 9999999) })
      .fill(0)
      .map(() => Math.floor(Math.random() * size) + 1)

    results.push({ input, interpreted, rolls })
  }

  return results
}

function formatRollResults(results: RollResult[]) {
  return results.map((result) =>
    [
      `:game_die: **${result.input}** `,
      result.interpreted !== result.input ? `(${result.interpreted}) ` : "",
      `⇒ ${result.rolls.join(", ")}`,
    ].join(""),
  )
}
