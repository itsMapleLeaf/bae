import { Client, Intents } from "discord.js"
import "dotenv/config.js"
import { ReacordDiscordJs } from "reacord"
import React from "react"
import { RollResultView } from "./dice/roll-result.js"
import { useCommands } from "./helpers/commands.js"
import { Logger } from "./helpers/logger.js"
import { RpsView } from "./rps/rps-view.js"

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const reacord = new ReacordDiscordJs(client)
const logger = new Logger("[bae]")

useCommands(client, [
  {
    type: "CHAT_INPUT",
    name: "roll",
    description: "rolls a dice",
    options: [
      {
        name: "dice",
        description: "dice to roll",
        type: "STRING",
        required: true,
      },
    ],
    run(interaction) {
      reacord.reply(
        interaction,
        <RollResultView
          diceString={interaction.options.getString("dice") || "1d6"}
          userId={interaction.user.id}
          isReroll={false}
        />,
      )
    },
  },
  {
    type: "USER",
    name: "Rock, Paper, Scissors",
    run(interaction) {
      const challenger = interaction.user
      const challenged = interaction.targetUser

      if (challenger.id === challenged.id) {
        return interaction.reply(`You can't challenge yourself, silly.`)
      }

      const isSelf = challenged.id === client.user?.id
      if (challenged.bot && !isSelf) {
        return interaction.reply(
          `You can't challenge another bot, the tech isn't there yet. But try challenging me!`,
        )
      }

      reacord.reply(
        interaction as any,
        <RpsView player1={challenger} player2={challenged} isSelf={isSelf} />,
      )
    },
  },
])

await client
  .on("ready", () => logger.info("ready"))
  .login(process.env.BOT_TOKEN)
