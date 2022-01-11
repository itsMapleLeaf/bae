import { Client, Intents } from "discord.js"
import "dotenv/config.js"
import { ReacordDiscordJs } from "reacord"
import React from "react"
import { RollResultView } from "./dice/roll-result.js"
import { useCommands } from "./helpers/commands.js"
import { Logger } from "./helpers/logger.js"

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const reacord = new ReacordDiscordJs(client)
const logger = new Logger("[bae]")

useCommands(client, [
  {
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
])

await client
  .on("ready", () => logger.info("ready"))
  .login(process.env.BOT_TOKEN)
