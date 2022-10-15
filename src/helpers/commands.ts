import type {
  ApplicationCommandDataResolvable,
  ApplicationCommandOptionData,
  ChatInputCommandInteraction,
  Client,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js"
import { ApplicationCommandType } from "discord.js"
import { pick } from "./pick.js"

type CommandBase<Type extends ApplicationCommandType, Interaction> = {
  type: Type
  name: string
  run: (interaction: Interaction) => unknown
}

export type Command =
  | (CommandBase<
      ApplicationCommandType.ChatInput,
      ChatInputCommandInteraction
    > & {
      description: string
      options?: ApplicationCommandOptionData[]
    })
  | CommandBase<ApplicationCommandType.User, UserContextMenuCommandInteraction>
  | CommandBase<
      ApplicationCommandType.Message,
      MessageContextMenuCommandInteraction
    >

export function usingCommands(client: Client<true>, commands: Command[]) {
  client.on("ready", () => {
    client.application.commands
      .set(commands.map(getApplicationCommandOptions))
      .catch(console.error)
  })

  client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return

    commands
      .find(
        (command) =>
          command.name === interaction.commandName &&
          command.type === interaction.commandType,
      )
      ?.run(interaction as any)
  })
}

function getApplicationCommandOptions(
  command: Command,
): ApplicationCommandDataResolvable {
  if (
    command.type === ApplicationCommandType.User ||
    command.type === ApplicationCommandType.Message
  ) {
    return { ...pick(command, ["name"]), type: command.type }
  }

  return {
    ...pick(command, ["name", "description", "options"]),
    type: ApplicationCommandType.ChatInput,
  }
}
