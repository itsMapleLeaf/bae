import {
  ApplicationCommandOptionData,
  Client,
  CommandInteraction,
} from "discord.js"
import { pick } from "./pick.js"

export type Command = {
  name: string
  description: string
  options?: ApplicationCommandOptionData[]
  run: (interaction: CommandInteraction) => unknown
}

export function useCommands(client: Client<true>, commands: Command[]) {
  client.on("ready", async () => {
    const guilds = await client.guilds.fetch()

    for (const guild of guilds.values()) {
      client.application.commands.set(
        commands.map((command) =>
          pick(command, ["name", "description", "options"]),
        ),
        guild.id,
      )
    }
  })

  client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return
    commands
      .find((command) => command.name === interaction.commandName)
      ?.run(interaction)
  })
}
