import { Button, ButtonClickEvent, ButtonProps, useInstance } from "reacord"
import React from "react"
import { setTimeout } from "timers/promises"
import { mention } from "../helpers/mention"
import { Choice, choiceEmoji, choices } from "./choice.js"
import { getWinner } from "./get-winner.js"

type State =
  | { type: "pregame" }
  | { type: "denied" }
  | {
      type: "game"
      player1Choice: Choice | undefined
      player2Choice: Choice | undefined
    }

export function RpsView({
  player1,
  player2,
  isSelf,
}: {
  player1: { id: string }
  player2: { id: string }
  isSelf: boolean
}) {
  const instance = useInstance()

  const [state, setState] = React.useState<Readonly<State>>(() => {
    if (!isSelf) return { type: "pregame" }
    return {
      type: "game",
      player1Choice: undefined,
      player2Choice: choices[Math.floor(Math.random() * choices.length)],
    }
  })

  function handleAccept(event: ButtonClickEvent) {
    if (event.user.id === player2.id) {
      setState({
        type: "game",
        player1Choice: undefined,
        player2Choice: undefined,
      })
    } else {
      event
        .ephemeralReply(`Only the challenged player can click this.`)
        .deactivate()
    }
  }

  async function handleDeny(event: ButtonClickEvent) {
    if (event.user.id === player2.id) {
      setState({ type: "denied" })
      await setTimeout(1000) // workaround for reacord bug
      instance.deactivate()
    } else {
      event
        .ephemeralReply(`Only the challenged player can click this.`)
        .deactivate()
    }
  }

  function choiceButtonProps(label: string, choice: Choice): ButtonProps {
    return {
      label,
      emoji: choiceEmoji[choice],
      style: "primary",
      onClick: (event) => {
        if (state.type !== "game") return

        if (event.user.id === player1.id) {
          setState({ ...state, player1Choice: choice })
          return
        }

        if (event.user.id === player2.id) {
          setState({ ...state, player2Choice: choice })
          return
        }

        event.ephemeralReply(`You're not playing. Start your own game!`)
      },
    }
  }

  if (state.type === "pregame") {
    return (
      <>
        {mention(player1)} challenged {mention(player2)} to rock, paper,
        scissors. Do you accept?
        <Button label="accept" style="primary" onClick={handleAccept} />
        <Button label="deny" style="secondary" onClick={handleDeny} />
      </>
    )
  }

  if (state.type === "denied") {
    return <>{mention(player2)} has denied the challenge. no balls</>
  }

  if (state.type === "game") {
    if (state.player1Choice && state.player2Choice) {
      const winner = getWinner(state.player1Choice, state.player2Choice)

      const winMessage =
        winner === "tie"
          ? "it's a tie lol"
          : winner === "player1"
          ? isSelf
            ? `You win! Nice job.`
            : `${mention(player1)} wins!`
          : isSelf
          ? `I win! Better luck next time.`
          : `${mention(player2)} wins!`

      return (
        <>
          {mention(player1)} picked {choiceEmoji[state.player1Choice]}{" "}
          {state.player1Choice}
          {"\n"}
          {mention(player2)} picked {choiceEmoji[state.player2Choice]}{" "}
          {state.player2Choice}
          {"\n"}
          {"\n"}
          {winMessage}
        </>
      )
    }

    return (
      <>
        {isSelf ? `I accept! Choose wisely.` : `Choose your weapons.`}
        {"\n"}
        {"\n"}
        {mention(player1)}: {state.player1Choice ? "✅" : "💭"}
        {"\n"}
        {mention(player2)}: {state.player2Choice ? "✅" : "💭"}
        <Button {...choiceButtonProps("rock", "rock")} />
        <Button {...choiceButtonProps("paper", "paper")} />
        <Button {...choiceButtonProps("scissors", "scissors")} />
      </>
    )
  }

  return <>oops, something broke</>
}
