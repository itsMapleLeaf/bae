import {
  ApplicationCommandDataResolvable,
  ApplicationCommandOptionData,
  Client,
  CommandInteraction,
  MessageContextMenuInteraction,
  UserContextMenuInteraction,
} from "discord.js"
import { pick } from "./pick.js"

type CommandBase<Type extends string, Interaction> = {
  type: Type
  name: string
  run: (interaction: Interaction) => unknown
}

export type Command =
  | (CommandBase<"CHAT_INPUT", CommandInteraction> & {
      description: string
      options?: ApplicationCommandOptionData[]
    })
  | CommandBase<"USER", UserContextMenuInteraction>
  | CommandBase<"MESSAGE", MessageContextMenuInteraction>

export function useCommands(client: Client<true>, commands: Command[]) {
  client.on("ready", async () => {
    const guilds = await client.guilds.fetch()

    for (const guild of guilds.values()) {
      client.application.commands.set(
        commands.map(getApplicationCommandOptions),
        guild.id,
      )
    }
  })

  client.on("interactionCreate", (interaction) => {
    if (!interaction.isApplicationCommand()) return

    commands
      .find(
        (command) =>
          command.name === interaction.commandName &&
          command.type === interaction.command?.type,
      )
      ?.run(interaction as any)
  })
}

function getApplicationCommandOptions(
  command: Command,
): ApplicationCommandDataResolvable {
  if (command.type === "USER" || command.type === "MESSAGE") {
    return { ...pick(command, ["name"]), type: command.type }
  }

  return {
    ...pick(command, ["name", "description", "options"]),
    type: "CHAT_INPUT",
  }
}
