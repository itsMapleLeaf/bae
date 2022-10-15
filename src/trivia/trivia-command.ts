// @ts-nocheck
import type {
  ButtonInteractionContext,
  Gatekeeper,
  InteractionContext,
} from "@itsmapleleaf/gatekeeper"
import { buttonComponent, selectMenuComponent } from "@itsmapleleaf/gatekeeper"
import { commaSeparatedList } from "../helpers/comma-separated-list.js"
import type { TriviaCategory, TriviaQuestion } from "./trivia-api.js"
import { fetchCategories, fetchQuestions } from "./trivia-api.js"

export const triviaCommand = (gatekeeper: Gatekeeper) =>
  gatekeeper.addSlashCommand({
    name: "trivia",
    description: "Start a trivia game",
    async run(context) {
      context.defer()

      const categories = await fetchCategories()
      const categoryIds = categories.map((category) => category.id).map(String)

      const admin = context.user
      let state: "lobby" | "categorySelect" | "fetchingQuestions" | "question" =
        "lobby"
      let playerIds = new Set<string>([admin.id])
      let selectedCategoryId = randomItem(categoryIds)
      let questions: TriviaQuestion[] = []

      const reply = context.reply(() => {
        switch (state) {
          case "lobby": {
            return lobbyComponent({
              playerIds,
              onJoin: (playerId) => {
                playerIds.add(playerId)
              },
              onLeave: (playerId) => {
                if (playerId === admin.id) {
                  return context.ephemeralReply(() => {
                    return "You can't leave the game you started!"
                  })
                }
                playerIds.delete(playerId)
              },
              onStart: withPermission([admin.id], () => {
                state = "categorySelect"
              }),
            })
          }

          case "categorySelect": {
            return categorySelectComponent({
              categories,
              selectedCategoryId,
              onChange: withPermission([admin.id], (_, selected) => {
                selectedCategoryId = selected
              }),
              onConfirm: withPermission([admin.id], async () => {
                state = "fetchingQuestions"
                questions = await fetchQuestions({
                  categoryId: selectedCategoryId,
                })

                state = "question"
                reply.refresh()
              }),
            })
          }

          case "fetchingQuestions": {
            return "Fetching questions..."
          }

          case "question": {
            return ["a"]
          }
        }

        return `lol wtf this shouldn't happen oops?`
      })
    },
  })

function lobbyComponent({
  playerIds,
  onJoin,
  onLeave,
  onStart,
}: {
  playerIds: Iterable<string>
  onJoin: (playerId: string) => void
  onLeave: (playerId: string) => void
  onStart: (context: ButtonInteractionContext) => void
}) {
  return [
    `players: ${[...playerIds].map((id) => `<@${id}>`)}`,
    buttonComponent({
      label: "Join",
      style: "SECONDARY",
      onClick: (buttonContext) => {
        onJoin(buttonContext.user.id)
      },
    }),
    buttonComponent({
      label: "Leave",
      style: "SECONDARY",
      onClick: (buttonContext) => {
        onLeave(buttonContext.user.id)
      },
    }),
    buttonComponent({
      label: "Start",
      style: "PRIMARY",
      onClick: onStart,
    }),
  ]
}

function categorySelectComponent({
  categories,
  selectedCategoryId,
  onChange,
  onConfirm,
}: {
  categories: TriviaCategory[]
  selectedCategoryId: string | undefined
  onChange: (
    context: InteractionContext,
    selectedCategoryId: string | undefined,
  ) => void
  onConfirm: (context: ButtonInteractionContext) => void
}) {
  const categoryIds = categories.map((category) => category.id).map(String)

  return [
    selectMenuComponent({
      options: categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
      selected: selectedCategoryId,
      onSelect: (context) => {
        if (context.values[0]) {
          onChange(context, context.values[0])
        }
      },
    }),

    buttonComponent({
      label: "rAnDoM",
      emoji: "🎲",
      style: "SECONDARY",
      onClick: (context) => {
        onChange(context, randomItem(categoryIds))
      },
    }),

    buttonComponent({
      label: "Confirm",
      style: "PRIMARY",
      disabled: !selectedCategoryId,
      onClick: onConfirm,
    }),
  ]
}

function randomItem<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)]
}

function withPermission<
  Context extends InteractionContext,
  Args extends unknown[],
>(
  allowedUserIds: string[],
  callback: (context: Context, ...args: Args) => void,
): typeof callback {
  return (context, ...args) => {
    if (!allowedUserIds.includes(context.user.id)) {
      const allowedUserMentions = commaSeparatedList(
        allowedUserIds.map((id) => `<@${id}>`),
        "or",
      )

      context.ephemeralReply(() => {
        return `Sorry, only ${allowedUserMentions} can do that`
      })

      return
    }

    callback(context, ...args)
  }
}
